// src/components/ui/CardVerificacaoRamal.tsx
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
  const { sistemaDistribuicao, tipoImovel } = useData();
  const [distanciaExterna, setDistanciaExterna] = useState("");
  const [distanciaInterna, setDistanciaInterna] = useState("");
  const [potenciaEditavel, setPotenciaEditavel] = useState("");
  const [resultadosLocal, setResultadosLocal] = useState<any>(null);

  const potAtual = parseFloat(potenciaEditavel) || 0;

  const obrigatorioTrifasico = potAtual >= 25000;

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

  useEffect(() => {
    if (resultadosLocal) {
      handleCalcular();
    }
  }, [sistemaDistribuicao, tensaoGeral, tipoImovel]);

  const handleCalcular = () => {
    const potBrutaAlvo = parseFloat(potenciaEditavel);
    const distExt =
      tipoImovel === "Casa"
        ? parseFloat(distanciaExterna.replace(",", "."))
        : 0;
    const distInt = parseFloat(distanciaInterna.replace(",", "."));

    if (isNaN(potBrutaAlvo) || potBrutaAlvo <= 0) {
      if (Platform.OS === "web")
        window.alert("Informe uma potência total válida.");
      else Alert.alert("Atenção", "Informe uma potência total válida.");
      return;
    }

    if ((tipoImovel === "Casa" && isNaN(distExt)) || isNaN(distInt)) {
      if (Platform.OS === "web")
        window.alert("Preencha as distâncias corretamente.");
      else Alert.alert("Atenção", "Preencha as distâncias corretamente.");
      return;
    }

    // 💡 PASSO 1: Descobrir o disjuntor base
    const correnteBruta = potBrutaAlvo / tensaoGeral;
    const disjuntoresTeste = [
      10, 16, 20, 25, 32, 40, 50, 63, 70, 80, 100, 125, 150, 175, 200,
    ];
    let disjTeste = disjuntoresTeste.find((d) => d >= correnteBruta) || 200;

    let fornecimentoCalculado = determinarTipoFornecimento(
      disjTeste,
      tensaoGeral,
      sistemaDistribuicao,
    );

    // 💡 REGRA UNIFICADA: Segue o motor do QDC.
    // Passou de 70A ou de 25.000 VA, é Trifásico para TODO MUNDO (Casa ou Apto).
    if (disjTeste > 70 || potBrutaAlvo >= 25000) {
      fornecimentoCalculado = "Trifásico (3 Polos)";
    }

    // 💡 PASSO 2: Dividir a Corrente com base no fornecimento ajustado
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

    // 💡 PASSO 3: Rodar o motor original para os cabos e disjuntores finais
    const trecho1 =
      tipoImovel === "Casa"
        ? processarTrechoRamal(
            distExt,
            correnteReal,
            tensaoGeral,
            10,
            sistemaDistribuicao,
          )
        : null;

    const trecho2 = processarTrechoRamal(
      distInt,
      correnteReal,
      tensaoGeral,
      4,
      sistemaDistribuicao,
    );

    // Força o rótulo visual correto para não confundir o utilizador
    if (trecho1) trecho1.classificacao = fornecimentoCalculado;
    if (trecho2) trecho2.classificacao = fornecimentoCalculado;

    const resumoResultados = {
      cargaInstaladaConsiderada: Math.round(potBrutaAlvo),
      potenciaDemanda: Math.round(potBrutaAlvo),
      correnteDemanda: Number(correnteReal.toFixed(1)),
      fornecimento: fornecimentoCalculado,
      trecho1,
      trecho2,
    };

    setResultadosLocal(resumoResultados);
    onCalcularRamal(resumoResultados);
  };

  const mostrarInfoReserva = () => {
    const mensagem =
      "Dica de Projeto: Reserva para o Futuro\n\n" +
      "Se planeja instalar novos equipamentos nos próximos anos, aumente este valor em cerca de 30% para garantir a folga dos cabos e disjuntores principais em todos os quadros.";

    if (Platform.OS === "web") window.alert(mensagem);
    else Alert.alert("Reserva de Carga", mensagem);
  };

  const aplicarReserva = () => {
    if (obrigatorioTrifasico) return;
    onToggleReserva(true);
  };

  const removerReserva = () => {
    if (obrigatorioTrifasico) return;
    onToggleReserva(false);
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

      <View style={styles.headerInfoContainer}>
        <Text style={styles.labelInputInfo}>
          Potência Bruta Alvo (Watts/VA)
        </Text>
        <TouchableOpacity
          style={styles.botaoInfoIcone}
          onPress={mostrarInfoReserva}
        >
          <Text style={styles.textoInfoIcone}>ℹ️ Dica</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={[
          styles.input,
          { marginBottom: 4 },
          potenciaOriginal > 0 && {
            backgroundColor: "#e5e7eb",
            color: "#6b7280",
          },
        ]}
        keyboardType="numeric"
        value={potenciaEditavel}
        onChangeText={(txt) => {
          setPotenciaEditavel(txt);
          onToggleReserva(false);
        }}
        placeholder="Ex: 15000"
        editable={potenciaOriginal === 0}
      />

      {potenciaOriginal > 0 && (
        <Text
          style={{
            fontSize: 11,
            color: "#ef4444",
            marginBottom: 12,
            marginTop: 2,
            fontStyle: "italic",
          }}
        >
          🔒 Campo bloqueado. O projeto já possui Cômodos/TUEs. O cálculo é
          feito automaticamente pela NBR 5410.
        </Text>
      )}

      {obrigatorioTrifasico && (
        <View style={styles.alertaBloqueioBotoes}>
          <Text style={styles.textoAlertaBloqueio}>
            ⚠️ Sistema travado em modo Trifásico. A carga instalada atual já
            atingiu ou superou o limite regulamentar de 25.000 VA.
          </Text>
        </View>
      )}

      {potenciaOriginal > 0 && (
        <View style={styles.containerReservaAcao}>
          <TouchableOpacity
            style={[
              reservaAplicada
                ? styles.botaoAcaoRemover
                : styles.botaoAcaoReserva,
              obrigatorioTrifasico && styles.botaoDesativado,
            ]}
            onPress={reservaAplicada ? removerReserva : aplicarReserva}
            disabled={obrigatorioTrifasico}
          >
            <Text
              style={[
                reservaAplicada
                  ? styles.textoBotaoAcaoRemover
                  : styles.textoBotaoAcaoReserva,
                obrigatorioTrifasico && styles.textoDesativado,
              ]}
            >
              {reservaAplicada
                ? `↩️ Remover Reserva (Voltar a ${potenciaOriginal} VA)`
                : `⚡ Adicionar +30% de Reserva Futura`}
            </Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.row}>
        {tipoImovel === "Casa" && (
          <View style={styles.col}>
            <Text style={styles.labelInput}>Rua → Medidor (m)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={distanciaExterna}
              onChangeText={setDistanciaExterna}
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
            onChangeText={setDistanciaInterna}
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
          <View style={styles.headerResultado}>
            <Text style={styles.txtFornecimentoDestaque}>
              {resultadosLocal.fornecimento}
            </Text>
          </View>

          <Text style={styles.txtDemandaAplicada}>
            Ramal Dimensionado para: {resultadosLocal.potenciaDemanda} VA (
            {resultadosLocal.correnteDemanda} A)
          </Text>

          {resultadosLocal.cargaInstaladaConsiderada >= 25000 &&
            tipoImovel !== "Apartamento" && (
              <View style={styles.alertaTrifasico}>
                <Text style={styles.alertaTrifasicoTitulo}>
                  ⚠️ ATENÇÃO: LIMITE BIFÁSICO EXCEDIDO
                </Text>
                <Text style={styles.alertaTrifasicoTexto}>
                  A Carga Instalada (Potência Bruta) do projeto atingiu{" "}
                  {resultadosLocal.cargaInstaladaConsiderada} VA, ultrapassando
                  o limite de 25.000 VA. Pelas normas da concessionária,
                  torna-se obrigatória a transição para um fornecimento
                  Trifásico. O sistema não pode operar sob rede Bifásica neste
                  nível de potência.
                </Text>
              </View>
            )}

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
            <Text style={styles.lblTrecho}>
              🏠 {tipoImovel === "Casa" ? "Medidor ao QDC" : "Medidor ao QDC"}:
            </Text>
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
  headerInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  labelInputInfo: { fontSize: 13, fontWeight: "600", color: "#374151" },
  botaoInfoIcone: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  textoInfoIcone: { fontSize: 10, color: "#1e40af", fontWeight: "bold" },
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
  containerReservaAcao: { marginBottom: 16, alignItems: "flex-start" },
  botaoAcaoReserva: {
    backgroundColor: "#f0fdf4",
    borderWidth: 1,
    borderColor: "#bbf7d0",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  textoBotaoAcaoReserva: { color: "#166534", fontSize: 11, fontWeight: "bold" },
  botaoAcaoRemover: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  textoBotaoAcaoRemover: { color: "#991b1b", fontSize: 11, fontWeight: "bold" },

  botaoDesativado: {
    backgroundColor: "#f3f4f6",
    borderColor: "#e5e7eb",
  },
  textoDesativado: {
    color: "#9ca3af",
  },
  alertaBloqueioBotoes: {
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
  },
  textoAlertaBloqueio: {
    color: "#991b1b",
    fontSize: 11,
    lineHeight: 16,
    textAlign: "justify",
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
  headerResultado: {
    flexDirection: "column",
    alignItems: "center",
    marginBottom: 6,
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
  alertaTrifasico: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#f59e0b",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  alertaTrifasicoTitulo: {
    color: "#d97706",
    fontWeight: "bold",
    fontSize: 12,
    marginBottom: 6,
  },
  alertaTrifasicoTexto: {
    color: "#92400e",
    fontSize: 11,
    lineHeight: 16,
    textAlign: "justify",
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
