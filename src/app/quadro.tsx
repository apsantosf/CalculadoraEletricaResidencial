//   src/app/quadro.tsx
import { router } from "expo-router"; // Importado para navegação
import { useState } from "react";
import {
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

export default function TelaQuadro() {
  const { circuitos, tensaoGeral, removerCircuito, zerarProjeto } = useData();
  const [modalVisible, setModalVisible] = useState(false);

  const processarQuadroGeral = () => {
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

  const resultadoQDC = circuitos.length > 0 ? processarQuadroGeral() : null;

  const handleCompartilharRelatorio = async () => {
    if (!resultadoQDC) return;

    let texto = `⚡ RELATÓRIO TÉCNICO ELÉTRICO ⚡\n`;
    texto += `📐 Baseado na Norma NBR 5410:2004\n`;
    texto += `--------------------------------------\n\n`;
    texto += `📋 RELAÇÃO DE CIRCUITOS:\n`;

    circuitos.forEach((c) => {
      const detalhe = c.detalhe ? ` (${c.detalhe})` : "";
      const disj = c.disjuntor ? ` | Disj: ${c.disjuntor}A` : "";
      const cabo = c.bitola ? ` | Cabo: ${c.bitola}mm²` : "";
      texto += `• ${c.nome}${detalhe}: ${c.potenciaWatts || c.potenciaVA} ${c.potenciaWatts ? "W" : "VA"}${disj}${cabo}\n`;
    });

    texto += `\n💡 DIMENSIONAMENTO GERAL (QDC):\nPotência Total: ${resultadoQDC.potenciaTotalVA} VA\nTensão: ${tensaoGeral} V\nCorrente Geral: ${resultadoQDC.correnteGeral} A\nCabo Principal: ${resultadoQDC.caboGeral} mm²\nDisjuntor Geral: ${resultadoQDC.disjuntorGeral} A`;

    await Share.share({ message: texto });
  };

  // Função pura que zera os dados e vai para a página inicial
  const executarNovoProjeto = () => {
    zerarProjeto();
    router.replace("/");
  };

  // Botão unificado com separação segura Web / Celular
  const handleNovoProjeto = () => {
    if (Platform.OS === "web") {
      const confirmou = window.confirm(
        "Quer realmente iniciar um Novo Projeto? Isto apagará todos os dados.",
      );
      if (confirmou) {
        executarNovoProjeto();
      }
    } else {
      // No celular, abre nossa caixinha customizada (Modal)
      setModalVisible(true);
    }
  };

  return (
    <View style={styles.wrapperWeb}>
      {/* Cabeçalho padrão inserido */}
      <CustomHeader title="Distribuição Geral (QDC)" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        {resultadoQDC ? (
          <View style={styles.quadroContainer}>
            <Text style={styles.subtitulo}>📋 RELAÇÃO DE CIRCUITOS</Text>
            <View style={styles.cardLista}>
              {circuitos.map((c) => (
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
                  <TouchableOpacity onPress={() => removerCircuito(c.id)}>
                    <Text style={{ fontSize: 18 }}>❌</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            <View style={styles.cardRelatorio}>
              <Text style={styles.tituloRelatorio}>
                💡 DIMENSIONAMENTO GERAL (QDC):
              </Text>
              <View style={styles.linhaResumo}>
                <Text style={styles.label}>Potência Total:</Text>
                <Text style={styles.valor}>
                  {resultadoQDC.potenciaTotalVA} VA
                </Text>
              </View>
              <View style={styles.linhaResumo}>
                <Text style={styles.label}>Tensão:</Text>
                <Text style={styles.valor}>{tensaoGeral} V</Text>
              </View>
              <View style={styles.linhaResumo}>
                <Text style={styles.label}>Corrente Geral:</Text>
                <Text style={styles.valor}>{resultadoQDC.correnteGeral} A</Text>
              </View>
              <View style={styles.linhaResumo}>
                <Text style={styles.label}>Cabo Principal:</Text>
                <Text style={styles.valorDestaque}>
                  {resultadoQDC.caboGeral} mm²
                </Text>
              </View>
              <View style={styles.linhaResumo}>
                <Text style={styles.label}>Disjuntor Geral:</Text>
                <Text style={styles.valorDestaque}>
                  {resultadoQDC.disjuntorGeral} A
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

      {/* Caixa de diálogo Visual (Modal) para Celular */}
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
  },
  itemCircuito: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  nomeCircuito: { fontSize: 14, color: "#374151" },
  detalhesLinha: { flexDirection: "row", gap: 10, marginTop: 2 },
  textoDetalhe: { fontSize: 11, color: "#6b7280", fontWeight: "600" },
  cardRelatorio: {
    backgroundColor: "#064e3b",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  tituloRelatorio: {
    color: "#fde047",
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  linhaResumo: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "#059669",
  },
  label: { color: "#ffffff", fontSize: 14 },
  valor: { color: "#ffffff", fontWeight: "600" },
  valorDestaque: { color: "#fde047", fontWeight: "bold", fontSize: 14 },
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
  // Estilos puros da caixinha (Modal) do celular
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
