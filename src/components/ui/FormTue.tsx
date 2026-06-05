import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { LISTA_EQUIPAMENTOS } from "../../utils/listaEquipamentos";

export default function FormTue({
  onAdicionar,
  onCalcular,
  podeAdicionar, // <-- 1. RECEBENDO A VARIÁVEL AQUI
}: {
  onAdicionar: (data: any) => void;
  onCalcular: (data: any) => void;
  podeAdicionar: boolean; // <-- 2. DECLARANDO O TIPO DELA
}) {
  const [equipamento, setEquipamento] = useState(LISTA_EQUIPAMENTOS[0]);
  const [potencia, setPotencia] = useState(
    LISTA_EQUIPAMENTOS[0].potencia.toString(),
  );
  const [tensao, setTensao] = useState("220");

  const handleCalcular = () => {
    onCalcular({
      nome: equipamento.nome,
      potencia: parseFloat(potencia),
      tensao: parseInt(tensao),
    });
  };

  const handleAdicionar = () => {
    onAdicionar();
  };

  return (
    <View style={styles.cardForm}>
      <Text style={styles.label}>Tipo de Equipamento</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={equipamento.nome}
          onValueChange={(itemValue) => {
            const itemSelecionado = LISTA_EQUIPAMENTOS.find(
              (e) => e.nome === itemValue,
            );

            if (itemSelecionado) {
              setEquipamento(itemSelecionado);
              setPotencia(itemSelecionado.potencia.toString());
            }
          }}
          style={styles.picker}
        >
          {LISTA_EQUIPAMENTOS.map((item, index) => (
            <Picker.Item key={index} label={item.nome} value={item.nome} />
          ))}
        </Picker>
      </View>

      <Text style={styles.label}>Potência (Watts)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={potencia}
        onChangeText={(val) => {
          setPotencia(val);
        }}
      />

      <Text style={styles.label}>Tensão (V)</Text>
      <View style={styles.row}>
        {["127", "220"].map((v) => (
          <TouchableOpacity
            key={v}
            style={[styles.btnTensao, tensao === v && styles.btnTensaoActive]}
            onPress={() => {
              setTensao(v);
            }}
          >
            <Text style={tensao === v ? styles.txtActive : styles.txt}>
              {v} V
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.containerBotoes}>
        <TouchableOpacity style={styles.botaoCalcular} onPress={handleCalcular}>
          <Text style={styles.textoBotao}>Dimensionar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.botaoAdicionar,
            !podeAdicionar && styles.botaoDesativado, // <-- 3. MUDA A COR SE NÃO PUDER ADICIONAR
          ]}
          onPress={handleAdicionar}
          disabled={!podeAdicionar} // <-- 4. BLOQUEIA O CLIQUE AQUI
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
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 4 },
  pickerContainer: {
    backgroundColor: "#fefce8",
    borderWidth: 1.5,
    borderColor: "#2563eb",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  picker: { height: 50, color: "#2563eb", backgroundColor: "transparent" },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
  },
  row: { flexDirection: "row", gap: 10, marginBottom: 16 },
  btnTensao: {
    flex: 1,
    padding: 12,
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    alignItems: "center",
  },
  btnTensaoActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  txt: { color: "#374151" },
  txtActive: { color: "#fff", fontWeight: "bold" },
  containerBotoes: { flexDirection: "row", gap: 10 },
  botaoCalcular: {
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  botaoAdicionar: {
    backgroundColor: "#059669",
    padding: 14,
    borderRadius: 8,
    flex: 1,
    alignItems: "center",
  },
  botaoDesativado: { backgroundColor: "#9ca3af" },
  textoBotao: { color: "#fff", fontWeight: "bold" },
});
