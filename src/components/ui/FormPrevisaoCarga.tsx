import { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useData } from "../../context/DataContext";
import {
  calcularIluminacao,
  calcularPotenciaTugs,
  calcularQuantidadeTugs,
} from "../../utils/calculations";
import SeletorBotoes from "./SeletorBotoes";

interface FormPrevisaoCargaProps {
  onCalcular: (dados: any) => void;
}

export default function FormPrevisaoCarga({
  onCalcular,
}: FormPrevisaoCargaProps) {
  const { tokenReset } = useData();
  const [nomeComodo, setNomeComodo] = useState("");
  const [area, setArea] = useState("");
  const [perimetro, setPerimetro] = useState("");
  const [tipoComodo, setTipoComodo] = useState<"social" | "servico">("social");
  const [calculoPrevio, setCalculoPrevio] = useState<any>(null);

  useEffect(() => {
    setNomeComodo("");
    setArea("");
    setPerimetro("");
    setTipoComodo("social");
    setCalculoPrevio(null);
  }, [tokenReset]);

  const processarCalculoLocal = () => {
    // 1. Limpeza dos inputs: garante que vírgulas virem pontos
    const numArea = parseFloat(area.replace(",", "."));
    const numPerimetro = parseFloat(perimetro.replace(",", "."));

    // 2. Validação rigorosa
    if (
      isNaN(numArea) ||
      isNaN(numPerimetro) ||
      numArea <= 0 ||
      numPerimetro <= 0
    ) {
      alert(
        "Por favor, insira valores numéricos válidos para área e perímetro.",
      );
      return;
    }

    // 3. Cálculos usando as funções reais do seu arquivo calculations.ts
    const potIluminacao = calcularIluminacao(numArea);
    const qtdTugs = calcularQuantidadeTugs(tipoComodo, numPerimetro);
    const potTugs = calcularPotenciaTugs(tipoComodo, qtdTugs);

    // 4. Atualiza estado para pré-visualização (sem salvar no contexto ainda!)
    setCalculoPrevio({
      nome: nomeComodo || "Cômodo Geral",
      tipo: tipoComodo,
      area: numArea,
      perimetro: numPerimetro,
      potenciaIlum: potIluminacao,
      qtdTugs: qtdTugs,
      potenciaTugs: potTugs,
      potenciaTotalVA: potIluminacao + potTugs,
      detalhe: `Ilum: ${potIluminacao}VA + Tomadas (TUGs): ${potTugs}VA (${qtdTugs} pontos)`,
    });
  };

  const handleAdicionar = () => {
    if (calculoPrevio) {
      onCalcular(calculoPrevio); // Salva no contexto
      setCalculoPrevio(null); // Limpa a tela
      setNomeComodo("");
      setArea("");
      setPerimetro("");
    } else {
      alert("Clique em 'Calcular' para gerar os valores antes de adicionar.");
    }
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

      <SeletorBotoes
        label="Tipo do Cômodo"
        valorSelecionado={tipoComodo}
        onSelecionar={setTipoComodo}
        opcoes={[
          { id: "social", label: "Sala / Quarto" },
          { id: "servico", label: "Cozinha / Serviço" },
        ]}
      />

      {/* ÁREA DE PRÉ-VISUALIZAÇÃO SEGURA */}
      {calculoPrevio && (
        <View style={styles.resumoCalculo}>
          <Text style={styles.txtResumo}>
            ⚡ Total da Carga: {calculoPrevio.potenciaTotalVA} VA
          </Text>
          <Text style={{ fontSize: 12 }}>{calculoPrevio.detalhe}</Text>
        </View>
      )}

      <View style={styles.containerBotoes}>
        <TouchableOpacity
          style={[styles.botao, styles.botaoCalcular]}
          onPress={processarCalculoLocal}
        >
          <Text style={styles.textoBotao}>Calcular</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.botao, styles.botaoAdicionar]}
          onPress={handleAdicionar}
        >
          <Text style={styles.textoBotao}>Adicionar Cômodo</Text>
        </TouchableOpacity>
      </View>
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
  },
  label: { fontSize: 14, fontWeight: "600", color: "#4b5563", marginBottom: 6 },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    marginBottom: 6,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  col: { width: "48%" },
  resumoCalculo: {
    backgroundColor: "#f0f9ff",
    padding: 10,
    borderRadius: 8,
    marginTop: 10,
    alignItems: "center",
  },
  txtResumo: { color: "#0369a1", fontWeight: "bold" },
  containerBotoes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 16,
    gap: 10,
  },
  botao: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  botaoCalcular: { backgroundColor: "#208AEF" },
  botaoAdicionar: { backgroundColor: "#10b981" },
  textoBotao: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});
