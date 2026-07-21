// src/app/index.tsx
import { Picker } from "@react-native-picker/picker";
import { useEffect } from "react";
import {
  Linking,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomHeader from "../components/ui/CustomHeader";
import { useData } from "../context/DataContext";
import { checarAtualizacao } from "../utils/UpdateHelper";

export default function ScreenInicio() {
  const {
    tensaoGeral,
    setTensaoGeral,
    sistemaDistribuicao,
    setSistemaDistribuicao,
    distribuidora,
    setDistribuidora,
    tipoImovel,
    setTipoImovel,
  } = useData();

  // 💡 Lista ordenada alfabeticamente de forma automática
  const listaDistribuidoras = [
    "CPFL",
    "ENEL",
    "NEOENERGIA",
    "EDP",
    "CEMIG",
    "COPEL",
    "LIGHT",
    "ENERGISA",
    "CELESC",
    "EQUATORIAL",
  ].sort((a, b) => a.localeCompare(b));

  useEffect(() => {
    checarAtualizacao();
  }, []);

  const handleAbrirManual = () => {
    Linking.openURL(
      "https://drive.google.com/file/d/1aotS8GKZ92lalZR4whRGmYnAYFEB0Yxl/view?usp=sharing",
    );
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Previsão de Carga" />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Bloco 0: Botão do Manual de Instruções */}
        <TouchableOpacity
          style={styles.botaoManual}
          onPress={handleAbrirManual}
        >
          <Text style={styles.textoBotaoManual}>📖 Ler Manual do Usuário</Text>
        </TouchableOpacity>

        {/* Bloco 1: Tipo de Imóvel */}
        <View style={styles.cardConfig}>
          <Text style={styles.labelSecao}>Tipo de Imóvel</Text>
          <View style={styles.rowBotoes}>
            <TouchableOpacity
              style={[
                styles.botaoOpcao,
                tipoImovel === "Casa" && styles.botaoAtivo,
              ]}
              onPress={() => setTipoImovel("Casa")}
            >
              <Text
                style={[
                  styles.textoBotao,
                  tipoImovel === "Casa" && styles.textoAtivo,
                ]}
              >
                🏠 Casa
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.botaoOpcao,
                tipoImovel === "Apartamento" && styles.botaoAtivo,
              ]}
              onPress={() => setTipoImovel("Apartamento")}
            >
              <Text
                style={[
                  styles.textoBotao,
                  tipoImovel === "Apartamento" && styles.textoAtivo,
                ]}
              >
                🏢 Apartamento
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bloco 2: Tensão de Trabalho Interna */}
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

        {/* Bloco 3: Sistema de Rede */}
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

        {/* Bloco 4: Distribuidora */}
        <View style={styles.cardConfig}>
          <Text style={styles.labelSecao}>
            Distribuidora de Energia (Norma)
          </Text>

          {/* 💡 A caixa do Picker agora muda para azul se houver escolha */}
          <View
            style={[
              styles.pickerContainer,
              distribuidora ? styles.botaoAtivo : null,
            ]}
          >
            <Picker
              selectedValue={distribuidora}
              onValueChange={(itemValue) => setDistribuidora(itemValue)}
              style={[
                styles.picker,
                distribuidora ? styles.textoAtivo : null, // 💡 Texto fica branco
              ]}
            >
              <Picker.Item
                label="Selecione uma Distribuidora"
                value=""
                color="#6b7280"
              />
              {listaDistribuidoras.map((dist) => (
                <Picker.Item
                  key={dist}
                  label={dist}
                  value={dist}
                  color="#374151"
                />
              ))}
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
    paddingBottom: 100,
  },

  botaoManual: {
    backgroundColor: "#8b5cf6",
    padding: 14,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    elevation: 2,
  },
  textoBotaoManual: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },

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
  botaoAtivo: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  textoBotao: { fontSize: 13, fontWeight: "600", color: "#4b5563" },
  textoAtivo: { color: "#fff" },

  pickerContainer: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
    backgroundColor: "transparent",
    color: "#4b5563",
    borderWidth: 0,
  },
});
