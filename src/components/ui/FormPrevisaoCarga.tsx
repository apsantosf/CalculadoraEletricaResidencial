// src/components/ui/FormPrevisaoCarga.tsx
import { Picker } from "@react-native-picker/picker";
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useData } from "../../context/DataContext";
import { LISTA_COMODOS } from "../../utils/listaComodos";
import { applyPickerStyles } from "./pickerStyles";

export interface AmbientePayload {
  nome: string;
  tipo: string;
  area: number;
  perimetro: number;
}

interface FormProps {
  onAdicionar?: (data: AmbientePayload) => void;
  Calcular?: (data: AmbientePayload) => void;
}

export default function FormPrevisaoCarga({
  onAdicionar,
  onCalcular,
}: FormProps) {
  const { tensaoGeral } = useData();
  const [area, setArea] = useState("");
  const [perimetro, setPerimetro] = useState("");
  const [ambiente, setAmbiente] = useState(LISTA_COMODOS[0]);
  const [calcRealizado, setCalcRealizado] = useState(false);

  useEffect(() => {
    applyPickerStyles();
  }, []);

  const handleCalcular = () => {
    const nArea = parseFloat(area.replace(",", "."));
    const nPerim = parseFloat(perimetro.replace(",", "."));
    if (isNaN(nArea) || isNaN(nPerim))
      return alert("Preencha Área e Perímetro corretamente.");
    setCalcRealizado(true);
    if (onCalcular)
      onCalcular({
        nome: ambiente.nome,
        tipo: ambiente.tipo,
        area: nArea,
        perimetro: nPerim,
      });
  };

  const handleAdicionar = () => {
    if (onAdicionar) {
      onAdicionar({
        nome: ambiente.nome,
        tipo: ambiente.tipo,
        area: parseFloat(area.replace(",", ".")),
        perimetro: parseFloat(perimetro.replace(",", ".")),
      });
    }
    setCalcRealizado(false);
    setArea("");
    setPerimetro("");
  };

  return (
    <View style={styles.cardForm}>
      <Text style={styles.label}>Selecione o Ambiente</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={ambiente.nome}
          onValueChange={(itemValue) => {
            const ambienteSelecionado = LISTA_COMODOS.find(
              (c) => c.nome === itemValue,
            );
            if (ambienteSelecionado) {
              setAmbiente(ambienteSelecionado);
              setCalcRealizado(false);
            }
          }}
          style={styles.picker}
        >
          {LISTA_COMODOS.map((item, index) => (
            <Picker.Item key={index} label={item.nome} value={item.nome} />
          ))}
        </Picker>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Área (m²)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={area}
            onChangeText={setArea}
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Perímetro (m)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={perimetro}
            onChangeText={setPerimetro}
          />
        </View>
      </View>

      <View style={styles.containerBotoes}>
        <TouchableOpacity style={styles.botaoCalcular} onPress={handleCalcular}>
          <Text style={styles.textoBotao}>Calcular</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.botaoAdicionar,
            !calcRealizado && { backgroundColor: "#9ca3af" },
          ]}
          onPress={handleAdicionar}
          disabled={!calcRealizado}
        >
          <Text style={styles.textoBotao}>Adicionar Cômodo</Text>
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
    marginBottom: 10,
    elevation: 2,
  },
  label: { fontSize: 13, fontWeight: "600", color: "#374151", marginBottom: 4 },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },
  pickerContainer: {
    backgroundColor: "#fefce8",
    borderWidth: 2,
    borderColor: "#2563eb",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  picker: { height: 50, color: "#2563eb", backgroundColor: "#fefce8" },
  row: { flexDirection: "row", justifyContent: "space-between" },
  col: { width: "48%" },
  containerBotoes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
  },
  botaoCalcular: {
    backgroundColor: "#2563eb",
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
    alignItems: "center",
  },
  botaoAdicionar: {
    backgroundColor: "#059669",
    padding: 12,
    borderRadius: 8,
    flex: 0.48,
    alignItems: "center",
  },
  textoBotao: { color: "#fff", fontWeight: "bold" },
});
