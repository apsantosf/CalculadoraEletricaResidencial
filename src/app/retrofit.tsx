import { FontAwesome5 } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import CustomHeader from "../components/ui/CustomHeader";

export default function RetrofitQuadro() {
  return (
    <View style={styles.wrapperWeb}>
      <CustomHeader title="Soluções de Campo" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerTitle}>
          <FontAwesome5 name="tools" size={24} color="#208AEF" />
          <Text style={styles.title}>Retrofit de Quadro de Madeira</Text>
        </View>
        <Text style={styles.subtitle}>
          Como modernizar quadros antigos de embutir utilizando caixa de
          sobrepor e espuma expansiva (PU corta-fogo), sem quebrar a parede do
          cliente.
        </Text>

        {/* PASSO 1 */}
        <View style={styles.stepContainer}>
          <View style={styles.iconColumn}>
            <View
              style={[styles.stepNumberBox, { backgroundColor: "#ef4444" }]}
            >
              <Text style={styles.stepNumberText}>1</Text>
            </View>
            <View style={styles.line} />
          </View>
          <View style={styles.contentColumn}>
            <Text style={styles.stepTitle}>Desenergização e Limpeza</Text>
            <Text style={styles.stepDesc}>
              Desligue o padrão de entrada. Remova a tampa de madeira antiga,
              retire os fusíveis de rolha ou disjuntores NEMA antigos e isole as
              pontas dos fios existentes.
            </Text>
            <View style={styles.iconPlaceholder}>
              <FontAwesome5 name="power-off" size={32} color="#ef4444" />
            </View>
          </View>
        </View>

        {/* PASSO 2 */}
        <View style={styles.stepContainer}>
          <View style={styles.iconColumn}>
            <View
              style={[styles.stepNumberBox, { backgroundColor: "#f59e0b" }]}
            >
              <Text style={styles.stepNumberText}>2</Text>
            </View>
            <View style={styles.line} />
          </View>
          <View style={styles.contentColumn}>
            <Text style={styles.stepTitle}>Preparo da Nova Caixa</Text>
            <Text style={styles.stepDesc}>
              Pegue uma caixa de distribuição de SOBREPOR em PVC. Usando uma
              microrretífica ou arco de serra, recorte o fundo plástico da caixa
              o suficiente para a passagem dos fios antigos.
            </Text>
            <View style={styles.iconPlaceholder}>
              <FontAwesome5 name="cut" size={32} color="#f59e0b" />
            </View>
          </View>
        </View>

        {/* PASSO 3 */}
        <View style={styles.stepContainer}>
          <View style={styles.iconColumn}>
            <View
              style={[styles.stepNumberBox, { backgroundColor: "#10b981" }]}
            >
              <Text style={styles.stepNumberText}>3</Text>
            </View>
            <View style={styles.line} />
          </View>
          <View style={styles.contentColumn}>
            <Text style={styles.stepTitle}>Fixação com Espuma PU</Text>
            <Text style={styles.stepDesc}>
              Posicione a nova caixa sobre o buraco antigo de madeira. Aplique a
              Espuma Expansiva de Poliuretano (obrigatoriamente do tipo
              Corta-Fogo / Retardante de Chamas) nas frestas para chumbar a
              caixa na parede.
            </Text>
            <View style={styles.iconPlaceholder}>
              <FontAwesome5 name="spray-can" size={32} color="#10b981" />
            </View>
          </View>
        </View>

        {/* PASSO 4 */}
        <View style={styles.stepContainer}>
          <View style={styles.iconColumn}>
            <View
              style={[styles.stepNumberBox, { backgroundColor: "#208AEF" }]}
            >
              <Text style={styles.stepNumberText}>4</Text>
            </View>
            {/* Sem linha no último passo */}
          </View>
          <View style={styles.contentColumn}>
            <Text style={styles.stepTitle}>Acabamento e Montagem</Text>
            <Text style={styles.stepDesc}>
              Após a secagem (aprox. 2 horas), corte o excesso da espuma com um
              estilete. Monte o trilho DIN, os novos disjuntores e faça o
              fechamento dos circuitos. A instalação fica com visual de nova!
            </Text>
            <View style={styles.iconPlaceholder}>
              <FontAwesome5 name="check-circle" size={32} color="#208AEF" />
            </View>
          </View>
        </View>

        {/* ALERTA TÉCNICO */}
        <View style={styles.alertBox}>
          <FontAwesome5 name="exclamation-triangle" size={20} color="#b91c1c" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.alertTitle}>Alerta Normativo</Text>
            <Text style={styles.alertText}>
              Nunca utilize espuma expansiva comum em instalações elétricas. Em
              caso de curto-circuito, ela propaga fogo. Exija sempre a espuma PU
              classificada como corta-fogo (geralmente de cor avermelhada ou
              rosada).
            </Text>
          </View>
        </View>
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
  headerTitle: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  title: { fontSize: 22, fontWeight: "bold", color: "#1f2937", marginLeft: 10 },
  subtitle: { fontSize: 14, color: "#6b7280", marginBottom: 28 },

  stepContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  iconColumn: {
    alignItems: "center",
    width: 40,
    marginRight: 12,
  },
  stepNumberBox: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 2,
  },
  stepNumberText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  line: {
    width: 2,
    flex: 1,
    backgroundColor: "#e5e7eb",
    marginTop: 4,
    marginBottom: 4,
  },
  contentColumn: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 6,
  },
  stepDesc: {
    fontSize: 14,
    color: "#6b7280",
    lineHeight: 20,
    marginBottom: 16,
  },
  iconPlaceholder: {
    width: "100%",
    height: 100,
    backgroundColor: "#f8fafc",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    alignItems: "center",
    justifyContent: "center",
  },
  alertBox: {
    flexDirection: "row",
    backgroundColor: "#fef2f2",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#fca5a5",
    marginTop: 10,
  },
  alertTitle: {
    color: "#b91c1c",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 4,
  },
  alertText: {
    color: "#991b1b",
    fontSize: 13,
    lineHeight: 18,
  },
});
