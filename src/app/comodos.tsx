// src/app/comodos.tsx
import { Picker } from "@react-native-picker/picker";
import { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import CustomHeader from "../components/ui/CustomHeader";
import { useData } from "../context/DataContext";
import {
  calcularIluminacao,
  calcularPotenciaTugs,
  calcularQuantidadeTugs,
} from "../utils/calculations";

const TEMPLATES_COMODOS: Record<string, string> = {
  "Sala de Estar": "sala",
  "Sala de Jantar": "sala",
  Quarto: "quarto",
  "Quarto Suíte": "quarto",
  Cozinha: "cozinha",
  Copa: "copa",
  "Banheiro Social": "banheiro",
  "Banheiro Suíte": "banheiro",
  "Área de Serviço": "área de serviço",
  Escritório: "escritório",
  Corredor: "corredor",
};

export default function ScreenComodos() {
  const { comodos, adicionarComodo, removerComodo } = useData();

  const [tipoAmbiente, setTipoAmbiente] = useState("Sala de Estar");
  const [nomeLivre, setNomeLivre] = useState("Sala de Estar");
  const [area, setArea] = useState("");
  const [perimetro, setPerimetro] = useState("");

  const [resultadoPrevio, setResultadoPrevio] = useState<any>(null);

  const mostrarInfoAreaPerimetro = () => {
    const mensagem =
      "Perímetro é a medida do contorno de uma figura geométrica, medido em metros (m).\n\n" +
      "Área (m²) é a medida da superfície (o espaço interno) de uma figura plana. O metro quadrado (m²) representa um quadrado com 1 metro de largura e 1 metro de altura.\n\n" +
      "1. Uma Sala Quadrada (4m x 4m)\n" +
      "• Perímetro: 4+4+4+4 = 16m (ex: rodapé)\n" +
      "• Área: 4x4 = 16 m² (ex: piso)\n\n" +
      "2. Um Terreno Retangular (10m x 20m)\n" +
      "• Perímetro: 10+10+20+20 = 60m (ex: cerca)\n" +
      "• Área: 10x20 = 200 m² (ex: espaço total)";

    if (Platform.OS === "web") {
      window.alert(mensagem);
    } else {
      Alert.alert("Como calcular Área e Perímetro?", mensagem);
    }
  };

  const gerarDispositivos = () => {
    const numArea = parseFloat(area.replace(",", ".")) || 0;
    const numPerimetro = parseFloat(perimetro.replace(",", ".")) || 0;

    const potIluminacao = calcularIluminacao(numArea);
    const qtdTugs = calcularQuantidadeTugs(tipoAmbiente, numPerimetro);
    const potTugsTotal = calcularPotenciaTugs(tipoAmbiente, qtdTugs);

    const chaveTemplate = TEMPLATES_COMODOS[tipoAmbiente] || "sala";

    const nomeTomada = [
      "cozinha",
      "copa",
      "área de serviço",
      "lavanderia",
    ].includes(chaveTemplate)
      ? "Tomadas de Cozinha/Área"
      : chaveTemplate.includes("banheiro")
        ? "Tomada do Lavatório"
        : "Tomadas Gerais";

    const dispositivos = [];

    if (potIluminacao > 0) {
      dispositivos.push({
        id: Math.random().toString(),
        nome: "Iluminação",
        tipo: "iluminacao",
        potencia: potIluminacao,
        unidade: "VA",
        quantidade: 1,
      });
    }

    if (qtdTugs > 0) {
      dispositivos.push({
        id: Math.random().toString(),
        nome: nomeTomada,
        tipo: "tug",
        potencia: potTugsTotal / qtdTugs,
        unidade: "VA",
        quantidade: qtdTugs,
      });
    }

    return { numArea, numPerimetro, dispositivos };
  };

  const handleDimensionar = () => {
    if (!area || !perimetro) {
      const msg = "Preencha a Área e o Perímetro para dimensionar.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Atenção", msg);
      return;
    }
    const { dispositivos } = gerarDispositivos();
    setResultadoPrevio(dispositivos);
  };

  const executarAdicao = () => {
    if (!area || !perimetro) {
      const msg = "Preencha a Área e o Perímetro antes de adicionar.";
      Platform.OS === "web" ? window.alert(msg) : Alert.alert("Atenção", msg);
      return;
    }

    const { numArea, numPerimetro, dispositivos } = gerarDispositivos();

    adicionarComodo({
      id: Math.random().toString(),
      nome: nomeLivre || tipoAmbiente,
      area: numArea,
      perimetro: numPerimetro,
      dispositivos: dispositivos,
    });

    setArea("");
    setPerimetro("");
    setResultadoPrevio(null);
  };

  const comodosOrdenados = [...comodos].sort((a, b) =>
    a.nome.localeCompare(b.nome),
  );

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#f3f4f6" }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <CustomHeader title="Cadastro de Cômodos" />

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.cardForm}>
          <Text style={styles.labelInput}>
            Sugestões de Ambientes (Normativo NBR 5410)
          </Text>
          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={tipoAmbiente}
              style={styles.picker}
              onValueChange={(itemValue) => {
                setTipoAmbiente(itemValue);
                setNomeLivre(itemValue);
                setResultadoPrevio(null);
              }}
            >
              {Object.keys(TEMPLATES_COMODOS)
                .sort((a, b) => a.localeCompare(b))
                .map((ambiente) => (
                  <Picker.Item
                    key={ambiente}
                    label={ambiente}
                    value={ambiente}
                  />
                ))}
            </Picker>
          </View>

          <Text style={styles.labelInput}>
            Nome do Ambiente (Livre / Editável)
          </Text>
          <TextInput
            style={styles.input}
            value={nomeLivre}
            onChangeText={setNomeLivre}
          />

          <View style={styles.headerDica}>
            <Text style={styles.labelInputDica}>Dimensões do Ambiente</Text>
            <TouchableOpacity
              style={styles.botaoDica}
              onPress={mostrarInfoAreaPerimetro}
            >
              <Text style={styles.textoDica}>ℹ️ Dica de Cálculo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.row}>
            <View style={styles.col}>
              <Text style={styles.labelInput}>Área (m²)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={area}
                onChangeText={(txt) => {
                  setArea(txt);
                  setResultadoPrevio(null);
                }}
                placeholder="Ex: 12.5"
              />
            </View>
            <View style={styles.col}>
              <Text style={styles.labelInput}>Perímetro (m)</Text>
              <TextInput
                style={styles.input}
                keyboardType="numeric"
                value={perimetro}
                onChangeText={(txt) => {
                  setPerimetro(txt);
                  setResultadoPrevio(null);
                }}
                placeholder="Ex: 14.0"
              />
            </View>
          </View>

          {resultadoPrevio && (
            <View style={styles.resultadoBox}>
              <Text style={styles.tituloResultado}>⚡ Previsão de Carga:</Text>
              {resultadoPrevio.map((disp: any) => (
                <Text key={disp.id} style={styles.textoResultado}>
                  ↳ {disp.quantidade}x {disp.nome} (
                  {disp.potencia * disp.quantidade} {disp.unidade})
                </Text>
              ))}
            </View>
          )}

          <View style={styles.rowBotoes}>
            <TouchableOpacity
              style={styles.botaoDimensionar}
              onPress={handleDimensionar}
            >
              <Text style={styles.textoBotaoBranco}>Dimensionar</Text>
            </TouchableOpacity>

            {/* 💡 AQUI: Botão Adicionar recebe estilo verde condicionalmente */}
            <TouchableOpacity
              style={[
                styles.botaoAdicionar,
                resultadoPrevio ? styles.botaoAdicionarPronto : null,
              ]}
              onPress={executarAdicao}
            >
              <Text style={styles.textoBotaoBranco}>Adicionar Cômodo</Text>
            </TouchableOpacity>
          </View>
        </View>

        <Text style={styles.tituloLista}>📋 Relação de Cômodos e TUEs</Text>
        {comodosOrdenados.length === 0 && (
          <Text
            style={{ textAlign: "center", color: "#6b7280", marginTop: 20 }}
          >
            Nenhum cômodo adicionado ainda.
          </Text>
        )}

        {comodosOrdenados.map((comodo: any) => (
          <View key={comodo.id} style={styles.cardComodoItem}>
            <View style={styles.headerComodo}>
              <Text style={styles.nomeComodo}>{comodo.nome}</Text>
              <TouchableOpacity onPress={() => removerComodo(comodo.id)}>
                <Text style={styles.botaoRemover}>❌</Text>
              </TouchableOpacity>
            </View>
            {comodo.dispositivos.map((disp: any) => (
              <Text key={disp.id} style={styles.textoDispositivo}>
                ↳ {disp.quantidade}x {disp.nome} (
                {disp.potencia * disp.quantidade} {disp.unidade})
              </Text>
            ))}
          </View>
        ))}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 16,
    maxWidth: 450,
    width: "100%",
    alignSelf: "center",
    paddingBottom: 100,
  },
  cardForm: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 20,
  },

  labelInput: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 6,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 15,
  },

  pickerContainer: {
    backgroundColor: "#fdfbea",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginBottom: 12,
    overflow: "hidden",
  },
  picker: { height: 50, width: "100%", color: "#374151" },

  headerDica: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
    marginTop: 4,
  },
  labelInputDica: { fontSize: 13, fontWeight: "600", color: "#374151" },
  botaoDica: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 8,
  },
  textoDica: { fontSize: 10, color: "#1e40af", fontWeight: "bold" },

  row: { flexDirection: "row", justifyContent: "space-between" },
  col: { width: "48%" },

  resultadoBox: {
    backgroundColor: "#eff6ff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#bfdbfe",
  },
  tituloResultado: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#1d4ed8",
    marginBottom: 4,
  },
  textoResultado: { fontSize: 12, color: "#1e40af", marginTop: 2 },

  rowBotoes: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  botaoDimensionar: {
    flex: 1,
    backgroundColor: "#2563eb",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 6,
  },
  botaoAdicionar: {
    flex: 1,
    backgroundColor: "#9ca3af",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginLeft: 6,
  },
  // 💡 AQUI: Classe que aplica o verde vibrante quando a simulação está feita
  botaoAdicionarPronto: {
    backgroundColor: "#059669",
  },
  textoBotaoBranco: { color: "#fff", fontWeight: "bold", fontSize: 14 },

  tituloLista: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 10,
  },
  cardComodoItem: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  headerComodo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  nomeComodo: { fontSize: 15, fontWeight: "bold", color: "#374151" },
  botaoRemover: { fontSize: 14 },
  textoDispositivo: { fontSize: 13, color: "#6b7280", marginTop: 2 },
});
