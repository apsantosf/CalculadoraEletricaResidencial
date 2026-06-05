import {
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useData } from "../context/DataContext";
import { calcularAlimentadorGeral } from "../utils/calculations";

export default function TelaQuadro() {
  const { circuitos, tensaoGeral, removerCircuito, zerarProjeto } = useData();

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
      texto += `• ${c.nome}${detalhe}: ${c.potenciaWatts || c.potenciaVA} ${c.potenciaWatts ? "W" : "VA"}${disj}\n`;
    });

    texto += `\n💡 DIMENSIONAMENTO GERAL (QDC):\nPotência Total: ${resultadoQDC.potenciaTotalVA} VA\nCorrente Geral: ${resultadoQDC.correnteGeral} A\nCabo Principal: ${resultadoQDC.caboGeral} mm²\nDisjuntor Geral: ${resultadoQDC.disjuntorGeral} A`;

    await Share.share({ message: texto });
  };

  return (
    <View style={styles.wrapperWeb}>
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
                    {c.disjuntor && (
                      <Text style={styles.textoDisjuntor}>
                        Disjuntor: {c.disjuntor}A
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity onPress={() => removerCircuito(c.id)}>
                    <Text>❌</Text>
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
            <TouchableOpacity style={styles.botaoLimpar} onPress={zerarProjeto}>
              <Text style={styles.textoBotaoLimpar}>Zerar Projeto</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardAvisoVazio}>
            <Text style={styles.txtAviso}>Nenhum circuito cadastrado.</Text>
          </View>
        )}
      </ScrollView>
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
  textoDisjuntor: { fontSize: 11, color: "#6b7280", marginTop: 2 },
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
  botaoLimpar: {
    backgroundColor: "#ef4444",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 40,
  },
  textoBotaoLimpar: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  cardAvisoVazio: {
    backgroundColor: "#e5e7eb",
    padding: 20,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 30,
  },
  txtAviso: { color: "#6b7280", fontSize: 14, textAlign: "center" },
});
