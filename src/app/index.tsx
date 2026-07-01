// src/app/index.tsx
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomHeader from "../components/ui/CustomHeader";
import { useData } from "../context/DataContext";

export default function ScreenInicio() {
  const {
    tensaoGeral,
    setTensaoGeral,
    sistemaDistribuicao,
    setSistemaDistribuicao,
    distribuidora,
    setDistribuidora,
  } = useData();

  return (
    <View style={styles.container}>
      <CustomHeader title="Previsão de Carga" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Bloco 1: Tensão de Trabalho Interna */}
        <View style={styles.cardConfig}>
          <Text style={styles.labelSecao}>Tensão de Trabalho Interna</Text>
          <View style={styles.rowBotoes}>
            <TouchableOpacity
              style={[
                styles.botaoOpcao,
                tensaoGeral === 127 && styles.botaoAtivo,
              ]}
              onPress={() => setTensaoGeral(127)}
            >
              <Text
                style={[
                  styles.textoBotao,
                  tensaoGeral === 127 && styles.textoAtivo,
                ]}
              >
                127 V
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.botaoOpcao,
                tensaoGeral === 220 && styles.botaoAtivo,
              ]}
              onPress={() => setTensaoGeral(220)}
            >
              <Text
                style={[
                  styles.textoBotao,
                  tensaoGeral === 220 && styles.textoAtivo,
                ]}
              >
                220 V
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bloco 2: Sistema de Rede */}
        <View style={styles.cardConfig}>
          <Text style={styles.labelSecao}>Sistema de Rede da Região</Text>
          <View style={styles.rowBotoes}>
            <TouchableOpacity
              style={[
                styles.botaoOpcao,
                sistemaDistribuicao === "127/220V" && styles.botaoAtivo,
              ]}
              onPress={() => setSistemaDistribuicao("127/220V")}
            >
              <Text
                style={[
                  styles.textoBotao,
                  sistemaDistribuicao === "127/220V" && styles.textoAtivo,
                ]}
              >
                127/220 V (Sul/Sudeste)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.botaoOpcao,
                sistemaDistribuicao === "220/380V" && styles.botaoAtivo,
              ]}
              onPress={() => setSistemaDistribuicao("220/380V")}
            >
              <Text
                style={[
                  styles.textoBotao,
                  sistemaDistribuicao === "220/380V" && styles.textoAtivo,
                ]}
              >
                220/380 V (Nordeste/DF)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bloco 3: Distribuidora */}
        <View style={styles.cardConfig}>
          <Text style={styles.labelSecao}>Distribuidora de Energia</Text>
          <View style={styles.rowGrid}>
            {["CPFL", "Enel", "Neoenergia", "EDP"].map((dist) => (
              <TouchableOpacity
                key={dist}
                style={[
                  styles.botaoMini,
                  distribuidora === dist && styles.botaoAtivo,
                ]}
                onPress={() => setDistribuidora(dist)}
              >
                <Text
                  style={[
                    styles.textoBotao,
                    distribuidora === dist && styles.textoAtivo,
                  ]}
                >
                  {dist}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  content: { padding: 16, maxWidth: 450, width: "100%", alignSelf: "center" },
  cardConfig: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  labelSecao: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 12,
    textAlign: "center",
  },
  rowBotoes: { flexDirection: "row", justifyContent: "space-between" },
  rowGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  botaoOpcao: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  botaoMini: {
    width: "23%",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  botaoAtivo: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  textoBotao: { fontSize: 13, fontWeight: "600", color: "#4b5563" },
  textoAtivo: { color: "#fff" },
});
