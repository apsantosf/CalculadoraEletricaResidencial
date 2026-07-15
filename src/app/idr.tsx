import { FontAwesome5 } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import CustomHeader from "../components/ui/CustomHeader";

export default function GuiaIDR() {
  return (
    <View style={styles.wrapperWeb}>
      <CustomHeader title="Soluções de Campo" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.headerTitle}>
          <FontAwesome5 name="exclamation-triangle" size={24} color="#f59e0b" />
          <Text style={styles.title}>IDR sem Fio Terra</Text>
        </View>
        <Text style={styles.subtitle}>
          Quebrando o mito: O dispositivo DR funciona e protege vidas em
          instalações antigas sem aterramento?
        </Text>

        {/* O MITO VS A VERDADE */}
        <View style={styles.truthCard}>
          <Text style={styles.truthTitle}>O Mito vs. A Verdade</Text>
          <Text style={styles.truthText}>
            Muitos eletricistas acreditam que o IDR só funciona se a casa tiver
            aterramento.{" "}
            <Text style={{ fontWeight: "bold", color: "#b45309" }}>
              Isso é FALSO!
            </Text>{" "}
            O IDR não usa o fio terra para medir nada. Ele apenas compara a
            corrente que entra pela Fase com a que volta pelo Neutro.
          </Text>
        </View>

        {/* CENÁRIO 1: COM TERRA */}
        <View style={styles.scenarioCard}>
          <View style={styles.scenarioHeader}>
            <FontAwesome5 name="check-circle" size={20} color="#10b981" />
            <Text style={styles.scenarioTitle}>Cenário Ideal (Com Terra)</Text>
          </View>
          <Text style={styles.scenarioText}>
            Um fio desencapado encosta na carcaça da geladeira. Como a geladeira
            está aterrada, a corrente de fuga desce direto pelo fio terra.
            {"\n\n"}
            <Text style={styles.bold}>O que acontece:</Text> O IDR percebe a
            fuga instantaneamente e desarma{" "}
            <Text style={styles.italic}>ANTES</Text> de qualquer pessoa encostar
            na geladeira.
          </Text>
        </View>

        {/* CENÁRIO 2: SEM TERRA */}
        <View style={styles.scenarioCard}>
          <View style={styles.scenarioHeader}>
            <FontAwesome5 name="exclamation-circle" size={20} color="#f59e0b" />
            <Text style={[styles.scenarioTitle, { color: "#d97706" }]}>
              Cenário Real (Sem Terra)
            </Text>
          </View>
          <Text style={styles.scenarioText}>
            O mesmo fio desencapado encosta na carcaça da geladeira, mas não há
            fio terra. A carcaça fica energizada, esperando alguém tocar.
            {"\n\n"}
            <Text style={styles.bold}>O que acontece:</Text> Quando uma pessoa
            descalça toca na geladeira, a corrente passa pelo corpo dela para o
            chão (a pessoa vira o "fio terra"). O IDR detecta essa fuga pelo
            corpo e desarma em milissegundos,{" "}
            <Text style={styles.highlight}>salvando a vida da pessoa</Text> (ela
            sente um tranco rápido, mas não sofre fibrilação ventricular).
          </Text>
        </View>

        {/* ALERTA NORMATIVO */}
        <View style={styles.alertBox}>
          <FontAwesome5 name="hard-hat" size={20} color="#0369a1" />
          <View style={{ marginLeft: 12, flex: 1 }}>
            <Text style={styles.alertTitle}>Conclusão Profissional</Text>
            <Text style={styles.alertText}>
              Se a casa do cliente é antiga e não tem aterramento nas tomadas,{" "}
              <Text style={{ fontWeight: "bold" }}>
                instale o IDR mesmo assim!
              </Text>{" "}
              Ele é a única barreira que vai salvar a vida da família em caso de
              choque. O aterramento continua sendo obrigatório pela NBR 5410,
              mas a ausência dele não impede a ação do IDR contra choques
              mortais.
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

  truthCard: {
    backgroundColor: "#fffbeb",
    borderLeftWidth: 4,
    borderLeftColor: "#f59e0b",
    padding: 16,
    borderRadius: 8,
    marginBottom: 20,
    elevation: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  truthTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#b45309",
    marginBottom: 6,
  },
  truthText: { fontSize: 14, color: "#78350f", lineHeight: 20 },

  scenarioCard: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  scenarioHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
    paddingBottom: 8,
  },
  scenarioTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#047857",
    marginLeft: 8,
  },
  scenarioText: {
    fontSize: 14,
    color: "#4b5563",
    lineHeight: 20,
  },
  bold: { fontWeight: "bold", color: "#1f2937" },
  italic: { fontStyle: "italic", fontWeight: "bold" },
  highlight: { fontWeight: "bold", color: "#ef4444" },

  alertBox: {
    flexDirection: "row",
    backgroundColor: "#e0f2fe",
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#bae6fd",
    marginTop: 10,
  },
  alertTitle: {
    color: "#0369a1",
    fontWeight: "bold",
    fontSize: 15,
    marginBottom: 4,
  },
  alertText: {
    color: "#0c4a6e",
    fontSize: 13,
    lineHeight: 18,
  },
});
