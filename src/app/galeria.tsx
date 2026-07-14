// src/app/galeria.tsx
import { FontAwesome5 } from "@expo/vector-icons";
import { Image, ScrollView, StyleSheet, Text, View } from "react-native";
import CustomHeader from "../components/ui/CustomHeader";

export default function GaleriaQuadros() {
  return (
    <View style={styles.wrapperWeb}>
      <CustomHeader title="Galeria de Quadros" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 100 }}
      >
        <View style={styles.headerTitle}>
          <FontAwesome5 name="images" size={24} color="#8b5cf6" />
          <Text style={styles.title}>Padrões de Montagem</Text>
        </View>
        <Text style={styles.subtitle}>
          Inspirações e referências visuais de quadros bem estruturados para o
          seu dia a dia.
        </Text>

        {/* CARD 1: Imagem do Painel Laranja */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Quadro com Barramento Vertical</Text>
          <Text style={styles.cardDesc}>
            Montagem robusta focada em QGDs de maior porte. Utiliza painel de
            montagem, canaletas laterais para organização dos cabos e barramento
            central espinha de peixe.
          </Text>

          <Image
            source={require("../../assets/images/quadro-simples.jpg")}
            style={styles.imagemQuadro}
            resizeMode="cover"
          />

          <View style={styles.tipBox}>
            <FontAwesome5 name="lightbulb" size={16} color="#d97706" />
            <Text style={styles.tipText}>
              <Text style={{ fontWeight: "bold" }}>Dica Prática: </Text>O uso de
              canaletas plásticas rasgadas nas laterais facilita futuras
              manutenções e ampliações, além de proteger os condutores contra
              danos mecânicos na tampa.
            </Text>
          </View>
        </View>

        {/* CARD 2: Imagem do Esquema da Cetti */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Esquema de Distribuição Isolada</Text>
          <Text style={styles.cardDesc}>
            Diagrama didático demonstrando a espinha dorsal de um quadro.
            Destaque para o posicionamento do disjuntor geral e a distribuição
            em barramento central isolado.
          </Text>

          <Image
            source={require("../../assets/images/quadro-pente.jpg")}
            style={styles.imagemQuadro}
            resizeMode="contain" // Alterado para 'contain' para não cortar o esquema
          />

          <View style={styles.tipBox}>
            <FontAwesome5 name="lightbulb" size={16} color="#d97706" />
            <Text style={styles.tipText}>
              <Text style={{ fontWeight: "bold" }}>Dica NBR 5410: </Text>
              Preveja espaço de reserva no quadro. Para quadros com até 6
              circuitos, a norma exige no mínimo 2 espaços reservas para futuras
              ampliações.
            </Text>
          </View>
        </View>

        {/* CARD 3: Imagem dos Quadros com Cabeamento */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>QDC Residencial Padrão Ouro</Text>
          <Text style={styles.cardDesc}>
            Exemplo impecável de roteamento de cabos, com os terminais bem
            fixados, curvas suaves e barramentos de neutro/terra bem
            posicionados nas extremidades.
          </Text>

          <Image
            source={require("../../assets/images/quadro-completo.jpg")}
            style={styles.imagemQuadro}
            resizeMode="cover"
          />

          <View style={styles.tipBox}>
            <FontAwesome5 name="lightbulb" size={16} color="#d97706" />
            <Text style={styles.tipText}>
              <Text style={{ fontWeight: "bold" }}>Dica NBR 5410: </Text>A norma
              padroniza as cores dos condutores isolados: Azul Claro
              obrigatoriamente para o Neutro, Verde (ou Verde-Amarelo) para o
              Terra (PE), e outras cores para as Fases.
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
  subtitle: { fontSize: 14, color: "#6b7280", marginBottom: 24 },

  card: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 6,
  },
  cardDesc: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 16,
    lineHeight: 18,
  },
  imagemQuadro: {
    width: "100%",
    height: 220,
    borderRadius: 8,
    marginTop: 8,
    backgroundColor: "#ffffff",
  },
  tipBox: {
    flexDirection: "row",
    backgroundColor: "#fef3c7",
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
    borderWidth: 1,
    borderColor: "#fde68a",
    alignItems: "flex-start",
  },
  tipText: {
    fontSize: 13,
    color: "#92400e",
    marginLeft: 10,
    flex: 1,
    lineHeight: 18,
  },
});
