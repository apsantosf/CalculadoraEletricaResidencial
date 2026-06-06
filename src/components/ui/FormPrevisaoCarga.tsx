// src/componentes/ui/FormPrevisaoCarga.tsx
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
import {
  calcularIluminacao,
  calcularPotenciaTugs,
  calcularQuantidadeTugs,
} from "../../utils/calculations";

const LISTA_COMODOS = [
  "Sala de Estar",
  "Sala de Jantar",
  "Varanda / Terraço",
  "Quarto (Dormitório)",
  "Banheiro / Lavabo",
  "Suíte",
  "Closet",
  "Cozinha",
  "Copa",
  "Lavanderia (ou Área de Serviço)",
  "Despensa",
  "Escritório (Home Office)",
  "Garagem",
  "Área de Lazer / Churrasqueira",
];
const COMODOS_SERVICO = [
  "Cozinha",
  "Copa",
  "Lavanderia",
  "Despensa",
  "Banheiro",
];

export default function FormPrevisaoCarga({ onCalcular, onAdicionar }: any) {
  const { tokenReset } = useData();
  const [nomeComodo, setNomeComodo] = useState(LISTA_COMODOS[0]);
  const [area, setArea] = useState("");
  const [perimetro, setPerimetro] = useState("");
  const [calculoPrevio, setCalculoPrevio] = useState<any>(null);
  const [isDimensionado, setIsDimensionado] = useState(false);

  useEffect(() => {
    setIsDimensionado(false);
    setCalculoPrevio(null);
  }, [tokenReset]);

  const processarCalculo = () => {
    const numArea = parseFloat(area.replace(",", "."));
    const numPerimetro = parseFloat(perimetro.replace(",", "."));
    if (isNaN(numArea) || isNaN(numPerimetro))
      return alert("Valores inválidos");

    const tipo = COMODOS_SERVICO.some((c) => nomeComodo.includes(c))
      ? "servico"
      : "social";
    const dados = {
      nome: nomeComodo,
      tipo,
      area: numArea,
      perimetro: numPerimetro,
      potenciaIlum: calcularIluminacao(numArea),
      qtdTugs: calcularQuantidadeTugs(tipo, numPerimetro),
      potenciaTugs: calcularPotenciaTugs(
        tipo,
        calcularQuantidadeTugs(tipo, numPerimetro),
      ),
    };
    setCalculoPrevio(dados);
    onCalcular(dados);
    setIsDimensionado(true);
  };

  return (
    <View style={styles.cardForm}>
      <Text style={styles.label}>Cômodo</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={nomeComodo}
          onValueChange={(v) => {
            setNomeComodo(v);
            setIsDimensionado(false);
          }}
          style={styles.picker}
        >
          {LISTA_COMODOS.map((c) => (
            <Picker.Item key={c} label={c} value={c} />
          ))}
        </Picker>
      </View>
      <TextInput
        style={styles.input}
        placeholder="Área (m²)"
        keyboardType="numeric"
        value={area}
        onChangeText={setArea}
      />
      <TextInput
        style={styles.input}
        placeholder="Perímetro (m)"
        keyboardType="numeric"
        value={perimetro}
        onChangeText={setPerimetro}
      />

      <View style={styles.containerBotoes}>
        <TouchableOpacity
          style={[styles.botao, styles.botaoCalcular]}
          onPress={processarCalculo}
        >
          <Text style={styles.txtBtn}>Dimensionar</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.botao,
            styles.botaoAdicionar,
            !isDimensionado && { backgroundColor: "#ccc" },
          ]}
          disabled={!isDimensionado}
          onPress={() => {
            onAdicionar(calculoPrevio);
            setIsDimensionado(false);
            setArea("");
            setPerimetro("");
          }}
        >
          <Text style={styles.txtBtn}>Adicionar Cômodo</Text>
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
    marginBottom: 10,
  },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 6,
  },
  pickerContainer: {
    borderWidth: 1.5,
    borderColor: "#208AEF",
    borderRadius: 8,
    marginBottom: 12,
    width: "100%",
    flex: 1,
  },
  picker: { width: "100%", height: 50 },
  containerBotoes: { flexDirection: "row", gap: 10, marginTop: 10 },
  botao: { flex: 1, padding: 14, borderRadius: 8, alignItems: "center" },
  botaoCalcular: { backgroundColor: "#208AEF" },
  botaoAdicionar: { backgroundColor: "#10b981" },
  txtBtn: { color: "#fff", fontWeight: "bold" },
});
