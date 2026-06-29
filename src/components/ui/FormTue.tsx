// src/components/ui/FormTue.tsx
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

// Sugestões rápidas de TUEs com potências médias para facilitar a vida do projetista
const OPCOES_TUE = [
  { label: "Ar-Condicionado 9.000 BTU", potencia: 820 },
  { label: "Ar-Condicionado 12.000 BTU", potencia: 1100 },
  { label: "Ar-Condicionado 18.000 BTU", potencia: 1700 },
  { label: "Bomba de Água (1 CV)", potencia: 735 },
  { label: "Chuveiro Elétrico", potencia: 5500 },
  { label: "Forno Elétrico", potencia: 2000 },
  { label: "Máquina de Lavar e Secar", potencia: 2500 },
  { label: "Micro-ondas", potencia: 1500 },
  { label: "Torneira Elétrica", potencia: 4400 },
];

export default function FormTue({
  onAdicionar,
  onCalcular,
  podeAdicionar,
}: {
  onAdicionar: () => void;
  onCalcular: (data: any) => void;
  podeAdicionar: boolean;
}) {
  const [nomeEquipamento, setNomeEquipamento] = useState(OPCOES_TUE[0].label);
  const [potencia, setPotencia] = useState(OPCOES_TUE[0].potencia.toString());

  const handleSelecaoPicker = (itemValue: string) => {
    const selecao = OPCOES_TUE.find((e) => e.label === itemValue);
    if (selecao) {
      setNomeEquipamento(selecao.label);
      setPotencia(selecao.potencia.toString());
    }
  };

  const handleCalcular = () => {
    if (!nomeEquipamento.trim()) {
      return alert("Informe o nome do equipamento.");
    }
    const pot = parseFloat(potencia.replace(",", "."));
    if (isNaN(pot) || pot <= 0) {
      return alert("Informe uma potência válida.");
    }

    onCalcular({
      nome: nomeEquipamento,
      potencia: pot,
    });
  };

  const handleAdicionar = () => {
    onAdicionar();
    // Opcional: Resetar para o padrão após adicionar se desejar
    // setNomeEquipamento(OPCOES_TUE[0].label);
    // setPotencia(OPCOES_TUE[0].potencia.toString());
  };

  return (
    <View style={styles.cardForm}>
      <Text style={styles.label}>Sugestões de Equipamentos (TUEs)</Text>

      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={nomeEquipamento}
          onValueChange={handleSelecaoPicker}
          style={styles.picker}
        >
          {OPCOES_TUE.map((item, index) => (
            <Picker.Item key={index} label={item.label} value={item.label} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Nome do Equipamento (Livre / Editável)</Text>
      <TextInput
        style={styles.inputNome}
        value={nomeEquipamento}
        onChangeText={(text) => {
          setNomeEquipamento(text);
        }}
        placeholder="Ex: Torno CNC 3000W"
      />

      <Text style={styles.label}>Potência (Watts)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={potencia}
        onChangeText={(val) => {
          setPotencia(val);
        }}
        placeholder="0"
      />

      <View style={styles.containerBotoes}>
        <TouchableOpacity style={styles.botaoCalcular} onPress={handleCalcular}>
          <Text style={styles.textoBotao}>Dimensionar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.botaoAdicionar,
            !podeAdicionar && styles.botaoDesativado,
          ]}
          onPress={handleAdicionar}
          disabled={!podeAdicionar}
        >
          <Text style={styles.textoBotao}>Adicionar TUE</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  cardForm: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 16,
  },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 6 },
  pickerContainer: {
    backgroundColor: "#fefce8",
    borderWidth: 2,
    borderColor: "#3b82f6",
    borderRadius: 8,
    marginBottom: 14,
    overflow: "hidden",
  },
  picker: { height: 50, color: "#1e3a8a", backgroundColor: "#fefce8" },
  inputNome: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 15,
    fontWeight: "500",
    color: "#1F2937",
    marginBottom: 14,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 16,
    fontSize: 15,
  },
  containerBotoes: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "space-between",
  },
  botaoCalcular: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
    flex: 0.48,
    alignItems: "center",
  },
  botaoAdicionar: {
    backgroundColor: "#059669",
    padding: 14,
    borderRadius: 8,
    flex: 0.48,
    alignItems: "center",
  },
  botaoDesativado: { backgroundColor: "#9ca3af" },
  textoBotao: { color: "#fff", fontWeight: "bold" },
});
