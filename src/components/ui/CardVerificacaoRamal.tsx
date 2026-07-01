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
  potenciaBase: number;
  tensaoGeral: number;
  onCalcularRamal: (resultados: any) => void;
}

export function CardVerificacaoRamal({
  potenciaBase,
  tensaoGeral,
  onCalcularRamal,
}: CardVerificacaoRamalProps) {
  const { sistemaDistribuicao } = useData();
  const [distanciaExterna, setDistanciaExterna] = useState("");
  const [distanciaInterna, setDistanciaInterna] = useState("");
  const [potenciaEditavel, setPotenciaEditavel] = useState("");
  const [resultadosLocal, setResultadosLocal] = useState<any>(null);
  const [reservaAplicada, setReservaAplicada] = useState(false);

  // 💡 Identifica em tempo real se a potência inserida já exige o sistema Trifásico obrigatoriamente
  const potAtual = parseFloat(potenciaEditavel) || 0;
  const obrigatorioTrifasico = potAtual >= 25000;

  useEffect(() => {
    if (potenciaBase > 0) {
      setPotenciaEditavel(potenciaBase.toString());
      setReservaAplicada(false);
    } else {
      setPotenciaEditavel("");
      setResultadosLocal(null);
      setReservaAplicada(false);
      onCalcularRamal(null);
    }
  }, [potenciaBase]);

  useEffect(() => {
    if (resultadosLocal) {
      handleCalcular();
    }
  }, [sistemaDistribuicao, tensaoGeral]);

  const handleCalcular = () => {
    const potBrutaAlvo = parseFloat(potenciaEditavel);
    const distExt = parseFloat(distanciaExterna.replace(",", "."));
    const distInt = parseFloat(distanciaInterna.replace(",", "."));

    if (isNaN(potBrutaAlvo) || potBrutaAlvo <= 0) {
      if (Platform.OS === "web")
        window.alert("Informe uma potência total válida.");
      else Alert.alert("Atenção", "Informe uma potência total válida.");
      return;
    }

    if (isNaN(distExt) || isNaN(distInt)) {
      if (Platform.OS === "web")
        window.alert(
          "Preencha as distâncias corretamente antes de dimensionar.",
        );
      else Alert.alert("Atenção", "Preencha as distâncias corretamente.");
      return;
    }

    const correnteDemanda = potBrutaAlvo / tensaoGeral;
    const caboMinimoRua = 10;
    const caboMinimoInterno = 4;

    const trecho1 = processarTrechoRamal(
      distExt,
      correnteDemanda,
      tensaoGeral,
      caboMinimoRua,
      sistemaDistribuicao,
    );
    const trecho2 = processarTrechoRamal(
      distInt,
      correnteDemanda,
      tensaoGeral,
      caboMinimoInterno,
      sistemaDistribuicao,
    );

    let fornecimentoCalculado = determinarTipoFornecimento(
      trecho1.disjuntor,
      tensaoGeral,
      sistemaDistribuicao,
    );

    if (potBrutaAlvo >= 25000) {
      fornecimentoCalculado = "Trifásico (3 Polos)";
    }

    const resumoResultados = {
      cargaInstaladaConsiderada: Math.round(potBrutaAlvo),
      potenciaDemanda: Math.round(potBrutaAlvo),
      correnteDemanda: Number(correnteDemanda.toFixed(1)),
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
      "Se planeja instalar novos equipamentos nos próximos anos, aumente este valor em cerca de 30% para garantir a folga dos cabos e disjuntores principais.";

    if (Platform.OS === "web") window.alert(mensagem);
    else Alert.alert("Reserva de Carga", mensagem);
  };

  const aplicarReserva = () => {
    if (obrigatorioTrifasico) return;
    const novaPotencia = Math.round(potenciaBase * 1.3);
    setPotenciaEditavel(novaPotencia.toString());
    setReservaAplicada(true);
  };

  const removerReserva = () => {
    if (obrigatorioTrifasico) return;
    setPotenciaEditavel(potenciaBase.toString());
    setReservaAplicada(false);
  };

  return (
    <View style={styles.cardEntrada}>
      <Text style={styles.tituloSecao}>
        Análise de Queda de Tensão nos Ramais
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
        style={[styles.input, { marginBottom: 4 }]}
        keyboardType="numeric"
        value={potenciaEditavel}
        onChangeText={(txt) => {
          setPotenciaEditavel(txt);
          setReservaAplicada(false);
        }}
        placeholder="Ex: 15000"
      />

      {/* 💡 MENSAGEM DE BLOQUEIO SE JÁ FOR TRIFÁSICO OBRIGATÓRIO */}
      {obrigatorioTrifasico && (
        <View style={styles.alertaBloqueioBotoes}>
          <Text style={styles.textoAlertaBloqueio}>
            ⚠️ Sistema travado em modo Trifásico. A carga instalada atual já
            atingiu ou superou o limite regulamentar de 25.000 VA,
            impossibilitando o uso de redes bifásicas ou monofásicas. Os botões
            de modificação de reserva foram desativados.
          </Text>
        </View>
      )}

      {potenciaBase > 0 && (
        <View style={styles.containerReservaAcao}>
          {!reservaAplicada ? (
            <TouchableOpacity
              style={[
                styles.botaoAcaoReserva,
                obrigatorioTrifasico && styles.botaoDesativado,
              ]}
              onPress={aplicarReserva}
              disabled={obrigatorioTrifasico}
            >
              <Text
                style={[
                  styles.textoBotaoAcaoReserva,
                  obrigatorioTrifasico && styles.textoDesativado,
                ]}
              >
                ⚡ Adicionar +30% de Reserva Futura
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[
                styles.botaoAcaoRemover,
                obrigatorioTrifasico && styles.botaoDesativado,
              ]}
              onPress={removerReserva}
              disabled={obrigatorioTrifasico}
            >
              <Text
                style={[
                  styles.textoBotaoAcaoRemover,
                  obrigatorioTrifasico && styles.textoDesativado,
                ]}
              >
                ↩️ Remover Reserva (Voltar a {potenciaBase} VA)
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}

      <View style={styles.row}>
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
        <View style={styles.col}>
          <Text style={styles.labelInput}>Medidor → QDC (m)</Text>
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
        <Text style={styles.textoBotao}>Dimensionar Ramais</Text>
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

          {resultadosLocal.cargaInstaladaConsiderada >= 25000 && (
            <View style={styles.alertaTrifasico}>
              <Text style={styles.alertaTrifasicoTitulo}>
                ⚠️ ATENÇÃO: LIMITE BIFÁSICO EXCEDIDO
              </Text>
              <Text style={styles.alertaTrifasicoTexto}>
                A Carga Instalada (Potência Bruta) do projeto atingiu{" "}
                {resultadosLocal.cargaInstaladaConsiderada} VA, ultrapassando o
                limite de 25.000 VA. Pelas normas da concessionária, torna-se
                obrigatória a transição para um fornecimento Trifásico. O
                sistema não pode operar sob rede Bifásica neste nível de
                potência.
              </Text>
            </View>
          )}

          <View style={styles.linhaTrecho}>
            <Text style={styles.lblTrecho}>📍 Conexão da Rua ao Medidor:</Text>
            <Text style={styles.valTrecho}>
              Cabo {resultadosLocal.trecho1.bitola} mm² | Disj:{" "}
              {resultadosLocal.trecho1.disjuntor} A
            </Text>
          </View>
          <View style={styles.linhaTrecho}>
            <Text style={styles.lblTrecho}>🏠 Entrada do Medidor ao QDC:</Text>
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

  // 💡 NOVOS ESTILOS PARA TRAVAMENTO E ALERTAS
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
