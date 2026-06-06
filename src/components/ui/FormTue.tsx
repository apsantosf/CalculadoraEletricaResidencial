//  src/componentes/ui/FormTrue.tsx

import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

const LISTA_DISPOSITIVOS = [
  "Chuveiro",
  "Ducha elétrica",
  "Ar-condicionado",
  "Torneira elétrica",
  "Aquecedor de água",
  "Forno elétrico embutido",
  "Micro-ondas",
  "Air-fryer",
  "Lavadora de louças",
  "Máquina de lavar roupas",
  "Secadora de roupas",
  "Bomba de piscina",
  "Motor de portão automático",
];

export default function FormTue({
  onAdicionar,
  onCalcular,
}: {
  onAdicionar: (data: any) => void;
  onCalcular: (data: any) => void;
}) {
  const [equipamento, setEquipamento] = useState(LISTA_DISPOSITIVOS[0]);
  const [potencia, setPotencia] = useState("5500");
  const [tensao, setTensao] = useState("220");
  const [isDimensionado, setIsDimensionado] = useState(false);

  const handleCalcular = () => {
    // Garantimos a conversão para número aqui
    const potenciaNum = parseFloat(potencia.replace(",", "."));
    const tensaoNum = parseInt(tensao);

    if (isNaN(potenciaNum)) {
      alert("Por favor, insira uma potência válida.");
      return;
    }

    onCalcular({
      nome: equipamento,
      potencia: potenciaNum,
      tensao: tensaoNum,
    });

    setIsDimensionado(true);
  };

  const handleAdicionar = () => {
    onAdicionar({
      nome: equipamento,
      potencia: parseFloat(potencia.replace(",", ".")),
      tensao: parseInt(tensao),
    });
    setIsDimensionado(false);
    setPotencia("5500"); // Ou o valor padrão inicial
    setEquipamento(LISTA_DISPOSITIVOS[0]);
  };

  return (
    <View style={styles.cardForm}>
      <Text style={styles.label}>Tipo de Equipamento</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={equipamento}
          onValueChange={setEquipamento}
          style={styles.picker}
        >
          {LISTA_DISPOSITIVOS.map((item, index) => (
            <Picker.Item key={index} label={item} value={item} />
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
          setIsDimensionado(false); // Se mudar o valor, obriga a recalcular
        }}
      />

      <Text style={styles.label}>Tensão (V)</Text>
      <View style={styles.row}>
        {["127", "220"].map((v) => (
          <TouchableOpacity
            key={v}
            style={[styles.btnTensao, tensao === v && styles.btnActive]}
            onPress={() => {
              setTensao(v);
              setIsDimensionado(false);
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
            !isDimensionado && styles.botaoDesativado,
          ]}
          onPress={handleAdicionar}
          disabled={!isDimensionado}
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
  },
  picker: { height: 50, color: "#2563eb" },
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
  btnActive: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
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
