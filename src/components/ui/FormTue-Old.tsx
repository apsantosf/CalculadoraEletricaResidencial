// src/components/ui/FormTue.tsx
import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useData } from "../../context/DataContext"; // 👈 Importa os dados globais
import SeletorBotoes from "./SeletorBotoes";

interface FormTueProps {
  onCalcular: (dados: {
    watts: number;
    tipo: "chuveiro" | "arConditioned";
    tensao: 127 | 220;
  }) => void;
}

export default function FormTue({ onCalcular }: FormTueProps) {
  const { tokenReset } = useData(); // 👈 Puxa o alarme de reset do projeto

  const [potenciaTue, setPotenciaTue] = useState("");
  const [tipoTue, setTipoTue] = useState<"chuveiro" | "arConditioned">(
    "chuveiro",
  );
  const [tensaoTue, setTensaoTue] = useState<127 | 220>(220);

  // Monitora o reset geral para esvaziar a caixa de Watts
  useEffect(() => {
    setPotenciaTue("");
    setTipoTue("chuveiro");
    setTensaoTue(220);
  }, [tokenReset]);

  const handleSubmeter = () => {
    const watts = parseFloat(potenciaTue);
    if (isNaN(watts) || watts <= 0) {
      alert("Por favor, insira uma potência válida em Watts para a TUE.");
      return;
    }

    onCalcular({ watts, tipo: tipoTue, tensao: tensaoTue });
  };

  return (
    <View style={styles.cardForm}>
      <Text style={styles.label}>Potência do Equipamento (Watts)</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 5500 (Chuveiro), 1500 (Ar)"
        keyboardType="numeric"
        value={potenciaTue}
        onChangeText={setPotenciaTue}
      />

      <SeletorBotoes
        label="Tipo de Equipamento Especial"
        valorSelecionado={tipoTue}
        onSelecionar={setTipoTue}
        opcoes={[
          { id: "chuveiro", label: "🚿 Chuveiro / Torneira" },
          { id: "arConditioned", label: "❄️ Ar-Condicionado" },
        ]}
      />

      <SeletorBotoes
        label="Tensão do Equipamento"
        valorSelecionado={tensaoTue}
        onSelecionar={setTensaoTue}
        opcoes={[
          { id: 127, label: "127 V" },
          { id: 220, label: "220 V" },
        ]}
      />

      <TouchableOpacity
        style={[styles.botaoCalcular, { backgroundColor: "#7c3aed" }]}
        onPress={handleSubmeter}
      >
        <Text style={styles.textoBotaoCalcular}>
          Dimensionar e Adicionar TUE
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  cardForm: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 10,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
    marginBottom: 6,
    marginTop: 6,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: "#1f2937",
    marginBottom: 6,
  },
  botaoCalcular: {
    backgroundColor: "#10b981",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  textoBotaoCalcular: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});
