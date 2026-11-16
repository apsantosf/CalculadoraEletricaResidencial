// src/components/ui/FormTue.tsx
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

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
  const [tensaoEscolhida, setTensaoEscolhida] = useState<number>(220);

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
      tensaoEspecifica: tensaoEscolhida,
    });
  };

  const handleAdicionar = () => {
    onAdicionar();
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
        style={styles.input}
        value={nomeEquipamento}
        onChangeText={setNomeEquipamento}
        placeholder="Ex: Torno CNC 3000W"
      />

      <View style={styles.rowInputs}>
        <View style={{ flex: 1, marginRight: 10 }}>
          <Text style={styles.label}>Potência (W)</Text>
          <TextInput
            style={styles.inputHalf}
            keyboardType="numeric"
            value={potencia}
            onChangeText={setPotencia}
            placeholder="0"
          />
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Tensão da Tomada</Text>
          <View style={styles.tensaoContainer}>
            <TouchableOpacity
              style={[
                styles.botaoTensao,
                tensaoEscolhida === 127 && styles.botaoTensaoAtivo,
              ]}
              onPress={() => setTensaoEscolhida(127)}
            >
              <Text
                style={[
                  styles.textoTensao,
                  tensaoEscolhida === 127 && styles.textoTensaoAtivo,
                ]}
              >
                127V
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.botaoTensao,
                tensaoEscolhida === 220 && styles.botaoTensaoAtivo,
              ]}
              onPress={() => setTensaoEscolhida(220)}
            >
              <Text
                style={[
                  styles.textoTensao,
                  tensaoEscolhida === 220 && styles.textoTensaoAtivo,
                ]}
              >
                220V
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

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
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  picker: {
    height: 50,
    width: "100%",
    color: "#1f2937",
    fontWeight: "bold",
    ...Platform.select({
      web: {
        outlineStyle: "none",
        backgroundColor: "transparent",
        border: "none",
      } as any,
    }),
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
  rowInputs: {
    flexDirection: "row",
    marginBottom: 16,
  },
  inputHalf: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    fontSize: 15,
  },
  tensaoContainer: { flexDirection: "row", gap: 6, height: 44 },
  botaoTensao: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  botaoTensaoAtivo: { backgroundColor: "#dbeafe", borderColor: "#2563eb" },
  textoTensao: { fontSize: 14, color: "#4b5563", fontWeight: "600" },
  textoTensaoAtivo: { color: "#1d4ed8" },
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
