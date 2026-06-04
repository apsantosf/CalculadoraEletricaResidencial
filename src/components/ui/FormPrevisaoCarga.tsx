import { useState } from "react";
import {
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useData } from "../../context/DataContext";
import SeletorBotoes from "./SeletorBotoes";

export default function FormPrevisaoCarga({
  onAdicionar,
  onCalcular,
}: {
  onAdicionar?: (data: any) => void;
  onCalcular?: (data: any) => void;
}) {
  const { tensaoGeral } = useData();
  const [nomeComodo, setNomeComodo] = useState("");
  const [area, setArea] = useState("");
  const [perimetro, setPerimetro] = useState("");
  const [tipoComodo, setTipoComodo] = useState<"social" | "servico">("social");

  // ESTADO DA TRAVA: Começa como false (bloqueado)
  const [calcRealizado, setCalcRealizado] = useState(false);

  const handleCalcular = () => {
    const nArea = parseFloat(area.replace(",", "."));
    const nPerim = parseFloat(perimetro.replace(",", "."));
    if (isNaN(nArea) || isNaN(nPerim))
      return alert("Preencha Área e Perímetro corretamente.");

    setCalcRealizado(true); // LIBERA o botão Adicionar

    if (onCalcular) {
      onCalcular({
        nome: nomeComodo,
        area: nArea,
        perimetro: nPerim,
        tipo: tipoComodo,
      });
    }
  };

  const handleAdicionar = () => {
    if (onAdicionar) {
      onAdicionar({
        nome: nomeComodo,
        area: parseFloat(area.replace(",", ".")),
        perimetro: parseFloat(perimetro.replace(",", ".")),
        tipo: tipoComodo,
      });
    }

    // RESET: Limpa os campos e BLOQUEIA o botão novamente
    setCalcRealizado(false);
    setNomeComodo("");
    setArea("");
    setPerimetro("");
  };

  return (
    <View style={styles.cardForm}>
      <Text style={styles.label}>Nome do Cômodo</Text>
      <TextInput
        style={styles.input}
        value={nomeComodo}
        onChangeText={setNomeComodo}
      />
      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Área</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={area}
            onChangeText={setArea}
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Perímetro</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={perimetro}
            onChangeText={setPerimetro}
          />
        </View>
      </View>
      <SeletorBotoes
        label="Tipo"
        valorSelecionado={tipoComodo}
        onSelecionar={setTipoComodo}
        opcoes={[
          { id: "social", label: "Sala/Quarto" },
          { id: "servico", label: "Cozinha/Serviço" },
        ]}
      />

      <View style={styles.containerBotoes}>
        <TouchableOpacity style={styles.botaoCalcular} onPress={handleCalcular}>
          <Text style={styles.textoBotao}>Calcular</Text>
        </TouchableOpacity>

        {/* BOTÃO ADICIONAR COM TRAVA */}
        <TouchableOpacity
          style={[
            styles.botaoAdicionar,
            !calcRealizado && { backgroundColor: "#9ca3af" },
          ]} // Fica cinza se bloqueado
          onPress={handleAdicionar}
          disabled={!calcRealizado} // Trava o clique se não calculou
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
