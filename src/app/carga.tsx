// src/app/carga.tsx
import { Picker } from "@react-native-picker/picker";
import {
    Platform,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import CustomHeader from "../components/ui/CustomHeader";
import { useData } from "../context/DataContext";

export default function ScreenCarga() {
  const {
    tipoImovel,
    setTipoImovel,
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

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* TIPO DE IMÓVEL */}
        <View style={styles.cardBox}>
          <Text style={styles.cardTitle}>Tipo de Imóvel</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.btnToggle,
                tipoImovel === "Casa" && styles.btnToggleAtivo,
              ]}
              onPress={() => setTipoImovel("Casa")}
            >
              <Text
                style={[
                  styles.btnToggleText,
                  tipoImovel === "Casa" && styles.btnToggleTextAtivo,
                ]}
              >
                🏠 Casa
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btnToggle,
                tipoImovel === "Apartamento" && styles.btnToggleAtivo,
              ]}
              onPress={() => setTipoImovel("Apartamento")}
            >
              <Text
                style={[
                  styles.btnToggleText,
                  tipoImovel === "Apartamento" && styles.btnToggleTextAtivo,
                ]}
              >
                🏢 Apartamento
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* TENSÃO INTERNA */}
        <View style={styles.cardBox}>
          <Text style={styles.cardTitle}>Tensão de Trabalho Interna</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.btnToggle,
                tensaoGeral === 127 && styles.btnToggleAtivo,
              ]}
              onPress={() => setTensaoGeral(127)}
            >
              <Text
                style={[
                  styles.btnToggleText,
                  tensaoGeral === 127 && styles.btnToggleTextAtivo,
                ]}
              >
                127 V
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btnToggle,
                tensaoGeral === 220 && styles.btnToggleAtivo,
              ]}
              onPress={() => setTensaoGeral(220)}
            >
              <Text
                style={[
                  styles.btnToggleText,
                  tensaoGeral === 220 && styles.btnToggleTextAtivo,
                ]}
              >
                220 V
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* SISTEMA DE REDE */}
        <View style={styles.cardBox}>
          <Text style={styles.cardTitle}>Sistema de Rede da Região</Text>
          <View style={styles.row}>
            <TouchableOpacity
              style={[
                styles.btnToggle,
                sistemaDistribuicao === "127/220V" && styles.btnToggleAtivo,
              ]}
              onPress={() => setSistemaDistribuicao("127/220V")}
            >
              <Text
                style={[
                  styles.btnToggleText,
                  sistemaDistribuicao === "127/220V" &&
                    styles.btnToggleTextAtivo,
                ]}
              >
                127/220 V (Sul/Sudeste)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.btnToggle,
                sistemaDistribuicao === "220/380V" && styles.btnToggleAtivo,
              ]}
              onPress={() => setSistemaDistribuicao("220/380V")}
            >
              <Text
                style={[
                  styles.btnToggleText,
                  sistemaDistribuicao === "220/380V" &&
                    styles.btnToggleTextAtivo,
                ]}
              >
                220/380 V (Nordeste/DF)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* DISTRIBUIDORA */}
        <View style={styles.cardBox}>
          <Text style={styles.cardTitle}>Distribuidora de Energia (Norma)</Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={distribuidora}
              onValueChange={(itemValue) => setDistribuidora(itemValue)}
              style={styles.pickerStyle}
            >
              <Picker.Item label="CPFL (SP)" value="CPFL" />
              <Picker.Item label="ENEL (SP/RJ/CE)" value="ENEL" />
              <Picker.Item label="CEMIG (MG)" value="CEMIG" />
              <Picker.Item label="COPEL (PR)" value="COPEL" />
              <Picker.Item label="LIGHT (RJ)" value="LIGHT" />
              <Picker.Item label="CELESC (SC)" value="CELESC" />
              <Picker.Item label="EQUATORIAL" value="EQUATORIAL" />
              <Picker.Item label="ENERGISA" value="ENERGISA" />
              <Picker.Item label="NEOENERGIA" value="NEOENERGIA" />
            </Picker>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  content: {
    padding: 16,
    maxWidth: 450,
    width: "100%",
    alignSelf: "center",
    paddingBottom: 120,
  },

  cardBox: {
    backgroundColor: "#ffffff",
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    ...Platform.select({
      web: { boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)" },
      default: { elevation: 2 },
    }),
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },

  row: { flexDirection: "row", justifyContent: "space-between", gap: 10 },

  btnToggle: {
    flex: 1,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  btnToggleAtivo: { backgroundColor: "#2563eb", borderColor: "#2563eb" },

  btnToggleText: { fontSize: 13, fontWeight: "600", color: "#4b5563" },
  btnToggleTextAtivo: { color: "#ffffff" },

  pickerContainer: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    backgroundColor: "#2563eb",
    overflow: "hidden",
  },
  pickerStyle: {
    width: "100%",
    height: 50,
    color: "#ffffff",
    fontWeight: "bold",
    ...Platform.select({
      web: {
        outlineStyle: "none",
        backgroundColor: "transparent",
        border: "none",
      } as any,
    }),
  },
});
