// src/components/ui/FormPrevisaoCarga.tsx
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

interface FormPrevisaoCargaProps {
  onCalcular: (dados: {
    nome: string;
    area: number;
    perimetro: number;
    tipo: "social" | "servico";
  }) => void;
}

export default function FormPrevisaoCarga({
  onCalcular,
}: FormPrevisaoCargaProps) {
  const { tokenReset } = useData(); // 👈 Puxa o alarme de reset do projeto

  const [nomeComodo, setNomeComodo] = useState("");
  const [area, setArea] = useState("");
  const [perimetro, setPerimetro] = useState("");
  const [tipoComodo, setTipoComodo] = useState<"social" | "servico">("social");

  // Monitora o reset geral para esvaziar os inputs internos
  useEffect(() => {
    setNomeComodo("");
    setArea("");
    setPerimetro("");
    setTipoComodo("social");
  }, [tokenReset]);

  const handleSubmeter = () => {
    const numArea = parseFloat(area);
    const numPerimetro = parseFloat(perimetro);

    if (
      isNaN(numArea) ||
      isNaN(numPerimetro) ||
      numArea <= 0 ||
      numPerimetro <= 0
    ) {
      alert("Por favor, insira valores válidos para área e perímetro.");
      return;
    }

    onCalcular({
      nome: nomeComodo || "Cômodo Geral",
      area: numArea,
      perimetro: numPerimetro,
      tipo: tipoComodo,
    });
  };

  return (
    <View style={styles.cardForm}>
      <Text style={styles.label}>Nome do Cômodo</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Cozinha, Quarto"
        value={nomeComodo}
        onChangeText={setNomeComodo}
      />

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Área (m²)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            keyboardType="numeric"
            value={area}
            onChangeText={setArea}
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Perímetro (m)</Text>
          <TextInput
            style={styles.input}
            placeholder="0.00"
            keyboardType="numeric"
            value={perimetro}
            onChangeText={setPerimetro}
          />
        </View>
      </View>

      <SeletorBotoes
        label="Tipo do Cômodo"
        valorSelecionado={tipoComodo}
        onSelecionar={setTipoComodo}
        opcoes={[
          { id: "social", label: "Sala / Quarto" },
          { id: "servico", label: "Cozinha / Serviço" },
        ]}
      />

      <TouchableOpacity style={styles.botaoCalcular} onPress={handleSubmeter}>
        <Text style={styles.textoBotaoCalcular}>
          Calcular e Adicionar Cômodo
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
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
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
  row: { flexDirection: "row", justifyContent: "space-between" },
  col: { width: "48%" },
  botaoCalcular: {
    backgroundColor: "#10b981",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 16,
  },
  textoBotaoCalcular: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});
