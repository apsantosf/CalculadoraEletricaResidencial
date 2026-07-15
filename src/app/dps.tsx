import { FontAwesome5 } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import CustomHeader from "../components/ui/CustomHeader";

export default function GuiaDPS() {
  return (
    <View style={styles.wrapperWeb}>
      <CustomHeader title="Soluções de Campo" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerTitle}>
          <FontAwesome5 name="bolt" size={24} color="#ef4444" />
          <Text style={styles.title}>DPS sem Aterramento</Text>
        </View>
        <Text style={styles.subtitle}>
          O perigo invisível: Entenda por que instalar um Dispositivo de
          Proteção contra Surtos sem conexão com o terra é um erro crítico.
        </Text>

        {/* ALERTA MÁXIMO */}
        <View style={styles.dangerCard}>
          <View style={styles.dangerHeader}>
            <FontAwesome5 name="skull-crossbones" size={20} color="#b91c1c" />
            <Text style={styles.dangerTitle}>Atenção Profissional!</Text>
          </View>
          <Text style={styles.dangerText}>
            Instalar um DPS em um quadro elétrico que{" "}
            <Text style={styles.bold}>não possui barramento de terra</Text> (ou
            aterramento adequado) é criar uma falsa sensação de segurança. O
            dispositivo simplesmente não terá como realizar a sua função.
          </Text>
        </View>

        {/* COMO O DPS FUNCIONA */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Como o DPS atua na prática?</Text>
          <Text style={styles.infoText}>
            O DPS funciona como um "desvio de emergência". Quando um raio ou
            surto atinge a rede da concessionária, a tensão sobe de forma
            violenta.
            {"\n\n"}
            Nesse exato milissegundo, o DPS fecha um curto-circuito interno e{" "}
            <Text style={styles.highlightBlue}>
              desvia essa energia destrutiva diretamente para o fio terra
            </Text>
            , protegendo as TVs, geladeiras e computadores.
          </Text>
        </View>

        {/* O PROBLEMA (SEM TERRA) */}
        <View style={styles.problemCard}>
          <Text style={styles.problemTitle}>
            O que acontece se NÃO tiver terra?
          </Text>
          <Text style={styles.infoText}>
            Sem o fio terra, a energia do surto atmosférico{" "}
            <Text style={styles.highlightRed}>não tem por onde escoar</Text>.
            {"\n\n"}
            1. O DPS recebe a "pancada" de energia.{"\n"}
            2. Procura o caminho para a terra e não encontra.{"\n"}
            3. A energia do surto continua viajando pelos fios da casa e queima
            os aparelhos eletrônicos da mesma forma.{"\n"}
            4. <Text style={styles.bold}>Pior:</Text> O próprio cartucho do DPS
            pode superaquecer severamente, gerando risco de princípio de
            incêndio no quadro.
          </Text>
        </View>

        {/* SOLUÇÃO */}
        <View style={styles.solutionBox}>
          <FontAwesome5 name="tools" size={20} color="#059669" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.solutionTitle}>A Solução de Campo</Text>
            <Text style={styles.solutionText}>
              Antes de vender a instalação de um DPS, avalie a instalação. Se
              não existir aterramento, o seu orçamento deve incluir a instalação
              de hastes (Padrão TT ou TN-S) e a criação do barramento de terra
              no QDC. <Text style={styles.bold}>Sem terra, sem DPS!</Text>
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
  subtitle: { fontSize: 14, color: "#6b7280", marginBottom: 20 },

  dangerCard: {
    backgroundColor: "#fef2f2",
    borderLeftWidth: 4,
    borderLeftColor: "#dc2626",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  dangerHeader: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  dangerTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#b91c1c",
    marginLeft: 8,
  },
  dangerText: { fontSize: 14, color: "#991b1b", lineHeight: 20 },

  infoCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0369a1",
    marginBottom: 8,
  },
  infoText: { fontSize: 14, color: "#4b5563", lineHeight: 20 },

  problemCard: {
    backgroundColor: "#fff5f5",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#fecaca",
  },
  problemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#dc2626",
    marginBottom: 8,
  },

  bold: { fontWeight: "bold", color: "#1f2937" },
  highlightBlue: { fontWeight: "bold", color: "#0369a1" },
  highlightRed: { fontWeight: "bold", color: "#dc2626" },

  solutionBox: {
    flexDirection: "row",
    backgroundColor: "#ecfdf5",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#a7f3d0",
    marginTop: 10,
  },
  solutionTitle: {
    color: "#047857",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 4,
  },
  solutionText: {
    color: "#065f46",
    fontSize: 13,
    lineHeight: 18,
  },
});
