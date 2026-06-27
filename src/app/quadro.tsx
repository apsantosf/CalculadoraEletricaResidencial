//    src/app/quadro.tsx
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  Modal,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomHeader from "../components/ui/CustomHeader";
import { useData } from "../context/DataContext";
import { calcularAlimentadorGeral } from "../utils/calculations";

// 🚀 Função utilitária para aplicar o fator de demanda da concessionária nos TUEs
// src/app/quadro.tsx

const aplicarDemandaTues = (tueWatts: number[], concessionaria: string): number => {
    if (tueWatts.length === 0) return 0;

    // A tabela progressiva padrão aplica-se muito bem a CPFL, Enel e Neoenergia
    let fator = 1.0;
    if (tueWatts.length === 2) fator = 0.90;
    else if (tueWatts.length >= 3 && tueWatts.length <= 5) fator = 0.80;
    else if (tueWatts.length >= 6) fator = 0.70;

    // Exemplo de ressalva técnica: a norma EDP pode usar coeficientes ligeiramente distintos se desejar customizar
    if (concessionaria === "EDP") {
        // Regra específica da EDP, se houver, ex: carga de aquecimento multiplicada por 0.8 de imediato
    }

    const somaTues = tueWatts.reduce((acc, curr) => acc + curr, 0);
    return somaTues * fator;
};

export default function TelaQuadro() {
  const {
    circuitos,
    tensaoGeral,
    concessionaria,
    removerCircuito,
    zerarProjeto,
  } = useData();
  const [modalVisible, setModalVisible] = useState(false);

  // 1. Dimensionamento Real (Instalado)
  const processarQuadroGeralInstalado = () => {
    const somaIlumTugVA = circuitos
      .filter((c) => c.tipo === "iluminacao" || c.tipo === "tug")
      .reduce((acc, curr) => acc + curr.potenciaVA, 0);
    const listaWattsTue = circuitos
      .filter((c) => c.tipo === "tue" && c.potenciaWatts !== undefined)
      .map((c) => c.potenciaWatts as number);

    return calcularAlimentadorGeral({
      potenciaIlumTugVA: somaIlumTugVA,
      potenciasTueWatts: listaWattsTue,
      tensao: tensaoGeral,
    });
  };

  // 2. Dimensionamento de Demanda (Considerando a concessionária)
  const processarQuadroGeralDemanda = () => {
    const ilumTugInstaladoVA = circuitos
      .filter((c) => c.tipo === "iluminacao" || c.tipo === "tug")
      .reduce((acc, curr) => acc + curr.potenciaVA, 0);

    const listaWattsTue = circuitos
      .filter((c) => c.tipo === "tue" && c.potenciaWatts !== undefined)
      .map((c) => c.potenciaWatts as number);

    // Aplica o fator de demanda da concessionária nos TUEs
    const tueDemandaWatts = aplicarDemandaTues(listaWattsTue, concessionaria);

    // Potência total de demanda (Iluminação/TUGs mantêm 100% + TUEs com demanda)
    const potenciaTotalDemandaVA = ilumTugInstaladoVA + tueDemandaWatts;

    // Recalcula o alimentador geral usando a potência de demanda calculada
    // Assumindo fator de potência unitário ou médio equivalente para a corrente de entrada
    return calcularAlimentadorGeral({
      potenciaIlumTugVA: potenciaTotalDemandaVA,
      potenciasTueWatts: [], // Já somado na potência total
      tensao: tensaoGeral,
    });
  };

  const resultadoQDC =
    circuitos.length > 0 ? processarQuadroGeralInstalado() : null;
  const resultadoDemanda =
    circuitos.length > 0 ? processarQuadroGeralDemanda() : null;

  const handleCompartilharRelatorio = async () => {
    if (!resultadoQDC || !resultadoDemanda) return;

    let texto = `⚡ RELATÓRIO TÉCNICO ELÉTRICO ⚡\n`;
    texto += `📐 Baseado na Norma NBR 5410:2004 e Distribuidora (${concessionaria})\n`;
    texto += `--------------------------------------\n\n`;
    texto += `📋 RELAÇÃO DE CIRCUITOS:\n`;

    circuitos.forEach((c: any) => {
      const detalhe = c.detalhe ? ` (${c.detalhe})` : "";
      const disj = c?.disjuntor ? ` | Disj: ${c.disjuntor}A` : "";
      const cabo = c?.bitola ? ` | Cabo: ${c.bitola}mm²` : "";

      const potenciaValor =
        c.potenciaWatts && c.potenciaWatts > 0 ? c.potenciaWatts : c.potenciaVA;
      const potenciaUnidade =
        c.potenciaWatts && c.potenciaWatts > 0 ? "W" : "VA";

      texto += `• ${c.nome}${detalhe}: ${potenciaValor} ${potenciaUnidade}${disj}${cabo}\n`;
    });

    texto += `\n💡 DIMENSIONAMENTO GERAL (INSTALADO):\nPotência Total: ${resultadoQDC.potenciaTotalVA} VA\nTensão: ${tensaoGeral} V\nCorrente Geral: ${resultadoQDC.correnteGeral} A\nCabo Principal: ${resultadoQDC.caboGeral} mm²\nDisjuntor Geral: ${resultadoQDC.disjuntorGeral} A`;

    texto += `\n\n🏢 PADRÃO DE ENTRADA (CONCESSIONÁRIA - ${concessionaria}):\nDemanda Calculada: ${resultadoDemanda.potenciaTotalVA} VA\nCorrente de Demanda: ${resultadoDemanda.correnteGeral} A\nCabo do Medidor: ${resultadoDemanda.caboGeral} mm²\nDisjuntor Geral (Entrada): ${resultadoDemanda.disjuntorGeral} A`;

    await Share.share({ message: texto });
  };

  const removerCircuitosDoGrupo = (circuitoReferencia: any) => {
    if (circuitoReferencia.grupoId) {
      circuitos.forEach((circ: any) => {
        if (circ.grupoId === circuitoReferencia.grupoId) {
          removerCircuito(circ.id);
        }
      });
    } else {
      removerCircuito(circuitoReferencia.id);
    }
  };

  const handleRemoverCircuitoPar = (circuitoSelecionado: any) => {
    const nomeComodo = circuitoSelecionado.nome.split(" (")[0] || "este cômodo";

    if (Platform.OS === "web") {
      const confirmou = window.confirm(
        `Tem certeza que vai excluir o cômodo "${nomeComodo}"?`,
      );
      if (confirmou) {
        removerCircuitosDoGrupo(circuitoSelecionado);
      }
    } else {
      Alert.alert(
        "Excluir Cômodo",
        `Tem certeza que vai excluir o cômodo "${nomeComodo}"?`,
        [
          { text: "Não", style: "cancel" },
          {
            text: "Sim",
            style: "destructive",
            onPress: () => removerCircuitosDoGrupo(circuitoSelecionado),
          },
        ],
      );
    }
  };

  const executarNovoProjeto = () => {
    zerarProjeto();
    router.replace("/");
  };

  const handleNovoProjeto = () => {
    if (Platform.OS === "web") {
      const confirmou = window.confirm(
        "Quer realmente iniciar um Novo Projeto? Isto apagará todos os dados.",
      );
      if (confirmou) {
        executarNovoProjeto();
      }
    } else {
      setModalVisible(true);
    }
  };

  return (
    <View style={styles.wrapperWeb}>
      <CustomHeader title="Distribuição Geral (QDC)" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 140 }}
      >
        <TouchableOpacity
          style={styles.btnNovoProjeto}
          onPress={handleNovoProjeto}
        >
          <Text style={styles.btnNovoProjetoTexto}>
            ➕ Iniciar Novo Projeto
          </Text>
        </TouchableOpacity>

        {resultadoQDC && resultadoDemanda ? (
          <View style={styles.quadroContainer}>
            <Text style={styles.subtitulo}>📋 RELAÇÃO DE CIRCUITOS</Text>
            <View style={styles.cardLista}>
              {circuitos.map((c: any) => (
                <View key={c.id} style={styles.itemCircuito}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nomeCircuito}>
                      {c.nome} {c.detalhe ? `(${c.detalhe})` : ""}
                    </Text>
                    <View style={styles.detalhesLinha}>
                      {c.disjuntor && (
                        <Text style={styles.textoDetalhe}>
                          Disj: {c.disjuntor}A
                        </Text>
                      )}
                      {c.bitola && (
                        <Text style={styles.textoDetalhe}>
                          Cabo: {c.bitola}mm²
                        </Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemoverCircuitoPar(c)}
                    accessibilityLabel={`Excluir ${c.nome}`}
                  >
                    <Text style={{ fontSize: 18 }}>❌</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {/* 💡 DIMENSIONAMENTO DAS INSTALAÇÕES (INTERNO - QDC) */}
            <View style={styles.cardRelatorio}>
              <Text style={styles.tituloRelatorio}>
                💡 QUADRO DE DISTRIBUIÇÃO (QDC) - INSTALADO:
              </Text>
              <View style={styles.linhaResumo}>
                <Text style={styles.label}>Potência Total Instalada:</Text>
                <Text style={styles.valor}>
                  {resultadoQDC.potenciaTotalVA} VA
                </Text>
              </View>
              <View style={styles.linhaResumo}>
                <Text style={styles.label}>Tensão Nominal:</Text>
                <Text style={styles.valor}>{tensaoGeral} V</Text>
              </View>
              <View style={styles.linhaResumo}>
                <Text style={styles.label}>Corrente Projeto (Ib):</Text>
                <Text style={styles.valor}>{resultadoQDC.correnteGeral} A</Text>
              </View>
              <View style={styles.linhaResumo}>
                <Text style={styles.label}>Seção Cabo Geral (QDC):</Text>
                <Text style={styles.valorDestaque}>
                  {resultadoQDC.caboGeral} mm²
                </Text>
              </View>
              <View style={styles.linhaResumo}>
                <Text style={styles.label}>Disjuntor Geral (QDC):</Text>
                <Text style={styles.valorDestaque}>
                  {resultadoQDC.disjuntorGeral} A
                </Text>
              </View>
            </View>

            {/* 🏢 DIMENSIONAMENTO DE DEMANDA (PADRÃO DE ENTRADA - CONCESSIONÁRIA) */}
            <View
              style={[styles.cardRelatorio, { backgroundColor: "#312e81" }]}
            >
              <Text style={[styles.tituloRelatorio, { color: "#c7d2fe" }]}>
                🏢 PADRÃO DE ENTRADA - DEMANDA ({concessionaria}):
              </Text>
              <View style={styles.linhaResumo}>
                <Text style={styles.label}>Demanda Calculada (S):</Text>
                <Text style={styles.valorDestaqueDemanda}>
                  {resultadoDemanda.potenciaTotalVA} VA
                </Text>
              </View>
              <View style={styles.linhaResumo}>
                <Text style={styles.label}>Corrente de Demanda (In):</Text>
                <Text style={styles.valor}>
                  {resultadoDemanda.correnteGeral} A
                </Text>
              </View>
              <View style={styles.linhaResumo}>
                <Text style={styles.label}>Cabo Ramal de Entrada:</Text>
                <Text style={styles.valorDestaque}>
                  {resultadoDemanda.caboGeral} mm²
                </Text>
              </View>
              <View style={styles.linhaResumo}>
                <Text style={styles.label}>Disjuntor Geral (Medidor):</Text>
                <Text style={styles.valorDestaque}>
                  {resultadoDemanda.disjuntorGeral} A
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.botaoExportar}
              onPress={handleCompartilharRelatorio}
            >
              <Text style={styles.textoBotaoExportar}>🟩 Enviar Relatório</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardAvisoVazio}>
            <Text style={styles.txtAviso}>Nenhum circuito cadastrado.</Text>
          </View>
        )}
      </ScrollView>

      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Atenção</Text>
            <Text style={styles.modalMessage}>
              Quer realmente iniciar um Novo Projeto? Isto apagará todos os
              dados.
            </Text>
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.btnModal, styles.btnCancel]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.btnText}>Não</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.btnModal, styles.btnConfirm]}
                onPress={() => {
                  setModalVisible(false);
                  executarNovoProjeto();
                }}
              >
                <Text style={styles.btnText}>Sim</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapperWeb: { flex: 1, backgroundColor: "#f3f4f6", width: "100%" },
  container: {
    flex: 1,
    padding: 16,
    maxWidth: 450,
    width: "100%",
    alignSelf: "center",
  },
  btnNovoProjeto: {
    backgroundColor: "#E5E7EB",
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  btnNovoProjetoTitle: {
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    fontStyle: "italic",
    marginBottom: 8,
  },
  btnNovoProjetoTexto: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
  },
  subtitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 10,
  },
  cardLista: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  itemCircuito: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  deleteButton: {
    padding: 8,
    marginLeft: 10,
  },
  nomeCircuito: { fontSize: 14, color: "#374151", flex: 1 },
  detalhesLinha: { flexDirection: "row", gap: 10, marginTop: 4 },
  textoDetalhe: { fontSize: 11, color: "#6b7280", fontWeight: "600" },
  cardRelatorio: {
    backgroundColor: "#064e3b",
    padding: 16,
    borderRadius: 12,
    marginTop: 14,
  },
  tituloRelatorio: {
    color: "#fde047",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  linhaResumo: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.2)",
  },
  label: { color: "#ffffff", fontSize: 13 },
  valor: { color: "#ffffff", fontWeight: "600" },
  valorDestaque: { color: "#fde047", fontWeight: "bold", fontSize: 13 },
  valorDestaqueDemanda: { color: "#ca8a04", fontWeight: "bold", fontSize: 14 },
  botaoExportar: {
    backgroundColor: "#10b981",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  textoBotaoExportar: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  cardAvisoVazio: {
    backgroundColor: "#e5e7eb",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
  },
  txtAviso: { color: "#6b7280", fontSize: 14, textAlign: "center" },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: 280,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    elevation: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#111827",
  },
  modalMessage: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    marginBottom: 20,
  },
  modalButtons: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  btnModal: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  btnCancel: { backgroundColor: "#9CA3AF" },
  btnConfirm: { backgroundColor: "#EF4444" },
  btnText: { color: "white", fontWeight: "bold", fontSize: 14 },
});
