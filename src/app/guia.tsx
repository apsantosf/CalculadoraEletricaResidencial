// src/app/guia.tsx
import { FontAwesome5 } from "@expo/vector-icons";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import { useRouter } from "expo-router";

// 💡 Importando o Cabeçalho Padrão e o Contexto
import CustomHeader from "../components/ui/CustomHeader";
import { useData } from "../context/DataContext";

export default function TelaGuia() {
  const router = useRouter();

  // Puxando os dados reais do seu contexto (mesmo padrão do quadro.tsx)
  const { comodos, tensaoGeral } = useData();

  // Verifica se o usuário já adicionou algo no projeto
  const projetoTemDados = comodos && comodos.length > 0;

  const correnteGeral = projetoTemDados ? 40 : null;
  const voltagem = tensaoGeral || 220;

  return (
    <View style={styles.wrapperWeb}>
      {/* 💡 O MESMO CABEÇALHO DAS OUTRAS TELAS */}
      <CustomHeader title="Guia Prático" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 140 }}
      >
        <Text style={styles.subtitle}>
          Soluções de campo para o eletricista
        </Text>

        {/* SESSÃO 1: Dimensionamento Inteligente */}
        {projetoTemDados && correnteGeral ? (
          <View style={styles.smartCard}>
            <Text style={styles.cardTitle}>
              Recomendação Base ({voltagem}V)
            </Text>
            <Text style={styles.cardText}>
              Disjuntor Geral (Exemplo):{" "}
              <Text style={styles.bold}>{correnteGeral}A</Text>
            </Text>
            <Text style={styles.cardText}>
              IDR Recomendado:{" "}
              <Text style={styles.bold}>≥ {correnteGeral}A</Text>
            </Text>
            <Text style={styles.cardText}>
              DPS Recomendado:{" "}
              <Text style={styles.bold}>
                {voltagem <= 127 ? "175V" : "275V"} (Classe II)
              </Text>
            </Text>
          </View>
        ) : (
          <View style={styles.warningCard}>
            <FontAwesome5
              name="info-circle"
              size={20}
              color="#856404"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.warningText}>
              Adicione os ambientes na aba "Cômodos" e os equipamentos de alta
              potência na aba "TUEs" para ver aqui a recomendação ideal de IDR e
              DPS.
            </Text>
          </View>
        )}

        {/* SESSÃO 2: Manuais Visuais */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Situações do Dia a Dia</Text>

          {/* Botão 1: IDR */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => router.push("/idr")}
          >
            <View style={styles.iconBoxYellow}>
              <FontAwesome5
                name="exclamation-triangle"
                size={14}
                color="#fff"
              />
            </View>
            <Text style={styles.menuButtonText}>
              IDR em instalações sem Fio Terra
            </Text>
          </TouchableOpacity>

          {/* Botão 2: DPS */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => router.push("/dps")}
          >
            <View style={styles.iconBoxRed}>
              <FontAwesome5 name="bolt" size={16} color="#fff" />
            </View>
            <Text style={styles.menuButtonText}>
              DPS sem Aterramento: Alerta Crítico
            </Text>
          </TouchableOpacity>

          {/* Botão 3: Retrofit */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => router.push("/retrofit")}
          >
            <View style={styles.iconBoxBlue}>
              <FontAwesome5 name="tools" size={16} color="#fff" />
            </View>
            <Text style={styles.menuButtonText}>
              Retrofit: Modernizando Quadro de Madeira
            </Text>
          </TouchableOpacity>

          {/* Botão 4: Galeria Visual */}
          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => router.push("/galeria")}
          >
            <View style={[styles.iconBoxBlue, { backgroundColor: "#8b5cf6" }]}>
              <FontAwesome5 name="images" size={14} color="#fff" />
            </View>
            <Text style={styles.menuButtonText}>
              Padrões de Montagem: Galeria de Quadros
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapperWeb: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    width: "100%",
  },
  container: {
    flex: 1,
    padding: 16,
    maxWidth: 450,
    width: "100%",
    alignSelf: "center",
  },
  subtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
  },
  smartCard: {
    backgroundColor: "#e0f2fe",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  warningCard: {
    backgroundColor: "#fef3c7",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#fde68a",
    flexDirection: "row",
    alignItems: "center",
  },
  warningText: {
    color: "#856404",
    fontSize: 14,
    flex: 1,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0369a1",
    marginBottom: 8,
  },
  cardText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  bold: {
    fontWeight: "bold",
  },
  section: {
    marginTop: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  menuButton: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconBoxRed: {
    backgroundColor: "#ef4444",
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconBoxBlue: {
    backgroundColor: "#208AEF",
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconBoxYellow: {
    backgroundColor: "#f59e0b",
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuButtonText: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "600",
    flex: 1,
  },
});
