// src/components/ui/CardVerificacaoRamal.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useData } from "../../context/DataContext";
import {
  determinarTipoFornecimento,
  processarTrechoRamal,
} from "../../utils/calculations";

const CHAVE_DISTANCIA_EXTERNA = "@EletricaResidencial_DistanciaExt";
const CHAVE_DISTANCIA_QDC = "@EletricaResidencial_DistanciaQDC";
const CHAVE_DADOS_RAMAL = "@EletricaResidencial_DadosRamal";
const CHAVE_PROTECOES_GERAIS = "@EletricaResidencial_ProtecoesGerais";

interface CardVerificacaoRamalProps {
  potenciaTotal: number;
  potenciaOriginal: number;
  tensaoGeral: number;
  reservaAplicada: boolean;
  onToggleReserva: (status: boolean) => void;
  onCalcularRamal: (resultados: any) => void;
}

export function CardVerificacaoRamal({
  potenciaTotal,
  potenciaOriginal,
  tensaoGeral,
  reservaAplicada,
  onToggleReserva,
  onCalcularRamal,
}: CardVerificacaoRamalProps) {
  const { sistemaDistribuicao, tipoImovel, distribuidora } = useData();
  const [distanciaExterna, setDistanciaExterna] = useState("");
  const [distanciaInterna, setDistanciaInterna] = useState("");
  const [potenciaEditavel, setPotenciaEditavel] = useState("");
  const [resultadosLocal, setResultadosLocal] = useState<any>(null);

  const distAtual = distribuidora || "CPFL";
  const getLimiteBifasico = (dist: string) =>
    ["CEMIG", "COPEL", "LIGHT", "CELESC"].includes(dist)
      ? 15000
      : ["ENERGISA", "EQUATORIAL"].includes(dist)
        ? 20000
        : 25000;
  const limiteBifasico = getLimiteBifasico(distAtual);
  const obrigatorioTrifasico =
    (parseFloat(potenciaEditavel) || 0) > limiteBifasico;

  // 🛡️ MÁSCARAS DE ENTRADA (Bloqueia letras)
  const handlePotenciaChange = (txt: string) =>
    setPotenciaEditavel(txt.replace(/[^0-9]/g, ""));
  const handleDistanciaChange = (txt: string, setter: (v: string) => void) =>
    setter(txt.replace(/[^0-9.,]/g, ""));

  useEffect(() => {
    if (potenciaTotal > 0) {
      const correnteBruta = potenciaTotal / tensaoGeral;
      const disjuntoresTeste = [
        10, 16, 20, 25, 32, 40, 50, 63, 70, 80, 100, 125, 150, 175, 200,
      ];
      const correnteComPiso = Math.max(correnteBruta, 32);
      let disjTeste = disjuntoresTeste.find((d) => d >= correnteComPiso) || 200;

      let fornecimento = determinarTipoFornecimento(
        disjTeste,
        tensaoGeral,
        sistemaDistribuicao,
        distAtual,
      );
      if (
        fornecimento.includes("Trifásico") ||
        potenciaTotal > limiteBifasico
      ) {
        fornecimento = "Trifásico";
      }

      let qtdV = fornecimento.includes("Bifásico")
        ? 3
        : fornecimento.includes("Trifásico")
          ? 4
          : 2;
      AsyncStorage.setItem(
        CHAVE_PROTECOES_GERAIS,
        JSON.stringify({ disjuntorGeral: disjTeste, qtdVias: qtdV }),
      ).catch(() => {});
    } else {
      AsyncStorage.removeItem(CHAVE_PROTECOES_GERAIS).catch(() => {});
    }
  }, [potenciaTotal, tensaoGeral, sistemaDistribuicao, distAtual]);

  const executarCalculo = (
    valDistExt: string,
    valDistInt: string,
    valPotencia: number,
  ) => {
    const potBrutaAlvo = valPotencia;
    const distExt =
      tipoImovel === "Casa" ? parseFloat(valDistExt.replace(",", ".")) : 0;
    const distInt = parseFloat(valDistInt.replace(",", "."));

    if (
      isNaN(potBrutaAlvo) ||
      potBrutaAlvo <= 0 ||
      isNaN(distInt) ||
      distInt <= 0
    )
      return;

    const correnteBruta = potBrutaAlvo / tensaoGeral;
    const disjuntoresTeste = [
      10, 16, 20, 25, 32, 40, 50, 63, 70, 80, 100, 125, 150, 175, 200,
    ];
    const correnteComPiso = Math.max(correnteBruta, 32);
    let disjTeste = disjuntoresTeste.find((d) => d >= correnteComPiso) || 200;

    let fornecimentoCalculado = determinarTipoFornecimento(
      disjTeste,
      tensaoGeral,
      sistemaDistribuicao,
      distAtual,
    );
    if (
      fornecimentoCalculado.includes("Trifásico") ||
      potBrutaAlvo > limiteBifasico
    ) {
      fornecimentoCalculado = "Trifásico (3 Polos)";
    }

    let correnteReal = correnteBruta;
    const ehTrifasico = fornecimentoCalculado.includes("Trifásico");
    const ehBifasico = fornecimentoCalculado.includes("Bifásico");

    if (ehTrifasico) {
      const tensaoLinha = tensaoGeral === 127 ? 220 : tensaoGeral;
      correnteReal = potBrutaAlvo / (tensaoLinha * Math.sqrt(3));
    } else if (ehBifasico) {
      const divisor =
        tensaoGeral === 127
          ? 254
          : sistemaDistribuicao === "220/380V"
            ? 440
            : 220;
      correnteReal = potBrutaAlvo / divisor;
    }

    const trecho1 =
      tipoImovel === "Casa"
        ? processarTrechoRamal(
            distExt,
            correnteReal,
            tensaoGeral,
            10,
            sistemaDistribuicao,
            distAtual,
          )
        : null;
    const trecho2 = processarTrechoRamal(
      distInt,
      correnteReal,
      tensaoGeral,
      4,
      sistemaDistribuicao,
      distAtual,
    );

    if (trecho1) trecho1.disjuntor = Math.max(trecho1.disjuntor, disjTeste);
    if (trecho2) trecho2.disjuntor = Math.max(trecho2.disjuntor, disjTeste);

    let qtdVias = ehTrifasico ? 4 : ehBifasico ? 3 : 2;
    const metragemTotalVias = Math.ceil(distInt * qtdVias * 1.1);

    const resumo = {
      cargaInstaladaConsiderada: Math.round(potBrutaAlvo),
      potenciaDemanda: Math.round(potBrutaAlvo),
      correnteDemanda: Number(correnteReal.toFixed(1)),
      fornecimento: fornecimentoCalculado,
      trecho1,
      trecho2,
      distanciaMetros: distInt,
      qtdVias,
      metragemTotalVias,
    };

    setResultadosLocal(resumo);
    onCalcularRamal(resumo);
    AsyncStorage.setItem(
      CHAVE_DADOS_RAMAL,
      JSON.stringify({
        bitola: trecho2 ? trecho2.bitola.toString() : "10",
        metragem: metragemTotalVias,
      }),
    ).catch(() => {});
  };

  useEffect(() => {
    const carregar = async () => {
      const distExt =
        (await AsyncStorage.getItem(CHAVE_DISTANCIA_EXTERNA)) || "";
      const distInt = (await AsyncStorage.getItem(CHAVE_DISTANCIA_QDC)) || "";
      setDistanciaExterna(distExt);
      setDistanciaInterna(distInt);
      if (potenciaTotal > 0 && distInt)
        executarCalculo(distExt, distInt, potenciaTotal);
    };
    carregar();
  }, [potenciaTotal, tensaoGeral, tipoImovel, distribuidora]);

  useEffect(() => {
    if (potenciaTotal > 0) {
      setPotenciaEditavel(potenciaTotal.toString());
    } else {
      setPotenciaEditavel("");
      setResultadosLocal(null);
      onToggleReserva(false);
      onCalcularRamal(null);
    }
  }, [potenciaTotal]);

  const handleCalcular = () => {
    const pot = parseFloat(potenciaEditavel);
    const dist = parseFloat(distanciaInterna.replace(",", "."));
    if (isNaN(pot) || pot <= 0) {
      Platform.OS === "web"
        ? window.alert("Informe uma potência total válida.")
        : Alert.alert("Atenção", "Informe uma potência total válida.");
      return;
    }
    if (isNaN(dist) || dist <= 0) {
      setResultadosLocal(null);
      onCalcularRamal(null);
      Platform.OS === "web"
        ? window.alert("Preencha a distância com um valor maior que zero.")
        : Alert.alert(
            "Atenção",
            "Preencha a distância com um valor maior que zero.",
          );
      return;
    }
    executarCalculo(distanciaExterna, distanciaInterna, pot);
  };

  return (
    <View style={styles.cardEntrada}>
      <Text style={styles.tituloSecao}>
        Dimensionamento do Alimentador ({tipoImovel})
      </Text>
      <Text style={styles.textoInstrucao}>
        Preencha as distâncias para avaliar se a queda de tensão exige cabos
        maiores.
      </Text>

      <Text style={styles.labelInput}>Potência Bruta Alvo (Watts/VA)</Text>
      <TextInput
        style={[
          styles.input,
          potenciaOriginal > 0 && {
            backgroundColor: "#e5e7eb",
            color: "#6b7280",
          },
        ]}
        keyboardType="numeric"
        value={potenciaEditavel}
        onChangeText={handlePotenciaChange}
        placeholder="Ex: 15000"
        editable={potenciaOriginal === 0}
      />

      <View style={styles.row}>
        {tipoImovel === "Casa" && (
          <View style={styles.col}>
            <Text style={styles.labelInput}>Rua → Medidor (m)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={distanciaExterna}
              onChangeText={(v) =>
                handleDistanciaChange(v, setDistanciaExterna)
              }
              placeholder="Ex: 15"
            />
          </View>
        )}
        <View style={tipoImovel === "Casa" ? styles.col : { width: "100%" }}>
          <Text style={styles.labelInput}>
            {tipoImovel === "Casa"
              ? "Medidor → QDC (m)"
              : "Medidor/Condomínio → QDC (m)"}
          </Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={distanciaInterna}
            onChangeText={(v) => handleDistanciaChange(v, setDistanciaInterna)}
            placeholder="Ex: 10"
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.botaoCalcularRamal}
        onPress={handleCalcular}
      >
        <Text style={styles.textoBotao}>Dimensionar Alimentação</Text>
      </TouchableOpacity>

      {resultadosLocal && (
        <View style={styles.resultadoRamalBox}>
          <Text style={styles.txtFornecimentoDestaque}>
            {resultadosLocal.fornecimento}
          </Text>
          <Text style={styles.txtDemandaAplicada}>
            Ramal Dimensionado para: {resultadosLocal.potenciaDemanda} VA (
            {resultadosLocal.correnteDemanda} A)
          </Text>
          {resultadosLocal.trecho1 && (
            <View style={styles.linhaTrecho}>
              <Text style={styles.lblTrecho}>
                📍 Conexão da Rua ao Medidor:
              </Text>
              <Text style={styles.valTrecho}>
                Cabo {resultadosLocal.trecho1.bitola} mm² | Disj:{" "}
                {resultadosLocal.trecho1.disjuntor} A
              </Text>
            </View>
          )}
          <View style={styles.linhaTrecho}>
            <Text style={styles.lblTrecho}>🏠 Medidor ao QDC:</Text>
            <Text style={styles.valTrecho}>
              Cabo {resultadosLocal.trecho2.bitola} mm² | Disj:{" "}
              {resultadosLocal.trecho2.disjuntor} A
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardEntrada: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  tituloSecao: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 6,
  },
  textoInstrucao: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 14,
    fontStyle: "italic",
  },
  labelInput: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 15,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  col: { width: "48%" },
  botaoCalcularRamal: {
    backgroundColor: "#0284c7",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  textoBotao: { color: "#ffffff", fontWeight: "bold", fontSize: 14 },
  resultadoRamalBox: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 8,
    padding: 14,
    marginTop: 16,
  },
  txtFornecimentoDestaque: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1d4ed8",
    textAlign: "center",
  },
  txtDemandaAplicada: {
    fontSize: 12,
    color: "#3b82f6",
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "500",
  },
  linhaTrecho: {
    flexDirection: "column",
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: "#dbeafe",
  },
  lblTrecho: { fontSize: 12, fontWeight: "bold", color: "#1e40af" },
  valTrecho: {
    fontSize: 14,
    color: "#1e3a8a",
    marginTop: 2,
    fontWeight: "500",
  },
});
