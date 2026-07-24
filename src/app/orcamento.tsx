// src/app/orcamento.tsx
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
  Alert,
  Modal,
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
import { MATERIAIS_PADRAO, MaterialBase } from "../data/tabelaMateriais";
import { obterPrecosLocais, salvarPrecosLocais } from "../utils/storagePrecos";

const CHAVE_CARRINHO = "@EletricaResidencial_Carrinho_V1";
const CHAVE_CIDADE = "@EletricaResidencial_Cidade";
// 💡 Lendo a nova chave gravada pelo Quadro
const CHAVE_DADOS_RAMAL = "@EletricaResidencial_DadosRamal";

export default function ScreenOrcamento() {
  const { comodos } = useData();

  const [quantidades, setQuantidades] = useState<Record<string, number>>({});
  const [tabelaPrecos, setTabelaPrecos] =
    useState<MaterialBase[]>(MATERIAIS_PADRAO);
  const [mostrarTodos, setMostrarTodos] = useState(false);
  const [cidade, setCidade] = useState<string>("Carregando...");

  const [modalVisivel, setModalVisivel] = useState(false);
  const [precosEmEdicao, setPrecosEmEdicao] = useState<MaterialBase[]>([]);
  const [cidadeEmEdicao, setCidadeEmEdicao] = useState<string>("");

  const buscarLocalizacao = async (mostrarAlertas = false) => {
    try {
      if (Platform.OS === "web") {
        const cidadeSalva = await AsyncStorage.getItem(CHAVE_CIDADE);
        if (cidadeSalva) {
          setCidade(cidadeSalva);
        } else {
          setCidade("Padrão Nacional");
          await AsyncStorage.setItem(CHAVE_CIDADE, "Padrão Nacional");
        }
        if (mostrarAlertas) {
          Alert.alert(
            "Modo Web",
            "Como está no navegador, utilize o botão 'Configurar' para digitar a cidade manualmente.",
          );
        }
        return;
      }

      let { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        if (mostrarAlertas) {
          Alert.alert(
            "Acesso ao GPS Negado",
            "Não conseguimos acesso ao GPS, então o Preço Médio será de acordo com o Padrão Nacional. Caso queira maior precisão, libere o acesso nas configurações ou digite a cidade manualmente.",
            [{ text: "Entendi" }],
          );
        }
        setCidade("Padrão Nacional");
        await AsyncStorage.setItem(CHAVE_CIDADE, "Padrão Nacional");
        return;
      }

      let location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      let geocode = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      if (geocode && geocode.length > 0) {
        const nomeCidade =
          geocode[0].subregion || geocode[0].city || "Local Desconhecido";
        setCidade(nomeCidade);
        await AsyncStorage.setItem(CHAVE_CIDADE, nomeCidade);
      }
    } catch (error) {
      const cidadeSalva = await AsyncStorage.getItem(CHAVE_CIDADE);
      setCidade(cidadeSalva || "Padrão Nacional");
      if (mostrarAlertas && Platform.OS !== "web") {
        Alert.alert(
          "Modo Offline",
          "Sem sinal de GPS/Internet. Pode digitar a cidade manualmente em Configurar.",
        );
      }
    }
  };

  useFocusEffect(
    useCallback(() => {
      const inicializarBD = async () => {
        const precos = await obterPrecosLocais();
        setTabelaPrecos(precos);

        const cidadeSalva = await AsyncStorage.getItem(CHAVE_CIDADE);
        if (cidadeSalva) setCidade(cidadeSalva);
        else await buscarLocalizacao(false);

        // 💡 Lê diretamente a inteligência e cálculo exato gravado pelo Quadro
        const dadosRamalSalvo = await AsyncStorage.getItem(CHAVE_DADOS_RAMAL);
        let dadosRamal: { idCabo: string; metragem: number } | null = null;
        if (dadosRamalSalvo) {
          dadosRamal = JSON.parse(dadosRamalSalvo);
        }

        let qtdTug = 0;
        let qtdTue = 0;
        let qtdInterruptores = 0;

        comodos.forEach((comodo) => {
          qtdInterruptores += 1;
          comodo.dispositivos.forEach((disp) => {
            const qtd = disp.quantidade || 1;
            const tipo = disp.tipo?.toLowerCase();

            if (tipo === "tug") qtdTug += qtd;
            if (tipo === "tue") qtdTue += qtd;
          });
        });

        let quantidadesAtuais: Record<string, number> = {};
        const carrinhoSalvo = await AsyncStorage.getItem(CHAVE_CARRINHO);

        if (carrinhoSalvo) {
          quantidadesAtuais = JSON.parse(carrinhoSalvo);
        } else {
          quantidadesAtuais = {
            tomada_10a: qtdTug,
            tomada_20a: qtdTue,
            interruptor_simples: qtdInterruptores,
            cabo_2_5: 1,
            cabo_1_5: 1,
          };
        }

        // 💡 Limpeza rigorosa em todos os possíveis tamanhos de cabo geral da nossa tabela
        const possiveisCabos = [
          "cabo_4_0",
          "cabo_6_0",
          "cabo_10_0",
          "cabo_16_0",
          "cabo_25_0",
          "cabo_35_0",
          "cabo_50_0",
        ];
        possiveisCabos.forEach((cabo) => delete quantidadesAtuais[cabo]);

        // 💡 Apenas consome o dado exato do Quadro e insere na lista, sem pensar/calcular!
        if (dadosRamal && dadosRamal.metragem > 0 && dadosRamal.idCabo) {
          quantidadesAtuais[dadosRamal.idCabo] = dadosRamal.metragem;
        }

        setQuantidades(quantidadesAtuais);
        await AsyncStorage.setItem(
          CHAVE_CARRINHO,
          JSON.stringify(quantidadesAtuais),
        );
      };

      inicializarBD();
    }, [comodos]),
  );

  const atualizarQuantidade = async (id: string, valor: string) => {
    const num = parseInt(valor) || 0;
    const novasQuantidades = { ...quantidades, [id]: num };
    setQuantidades(novasQuantidades);
    await AsyncStorage.setItem(
      CHAVE_CARRINHO,
      JSON.stringify(novasQuantidades),
    );
  };

  const valorTotal = tabelaPrecos.reduce((acc, item) => {
    const qtd = quantidades[item.id] || 0;
    return acc + qtd * item.precoMedio;
  }, 0);

  const materiaisVisiveis = tabelaPrecos.filter((item) => {
    if (mostrarTodos) return true;
    return (quantidades[item.id] || 0) > 0;
  });

  const abrirConfiguracaoPrecos = async () => {
    setCidadeEmEdicao(cidade === "Carregando..." ? "Padrão Nacional" : cidade);
    setPrecosEmEdicao([...tabelaPrecos]);
    setModalVisivel(true);
  };

  const atualizarPrecoEditado = (id: string, novoValor: string) => {
    const valorNumerico = parseFloat(novoValor.replace(",", ".")) || 0;
    setPrecosEmEdicao((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, precoMedio: valorNumerico } : item,
      ),
    );
  };

  const salvarNovosPrecos = async () => {
    setTabelaPrecos(precosEmEdicao);
    await salvarPrecosLocais(precosEmEdicao);

    setCidade(cidadeEmEdicao || "Padrão Nacional");
    await AsyncStorage.setItem(
      CHAVE_CIDADE,
      cidadeEmEdicao || "Padrão Nacional",
    );

    setModalVisivel(false);

    if (Platform.OS === "web") {
      window.alert("Tabela de preços e localidade atualizados com sucesso!");
    } else {
      Alert.alert(
        "Sucesso",
        "Tabela de preços e localidade atualizados com sucesso!",
      );
    }
  };

  const textoTituloLocal =
    cidade === "Padrão Nacional" ? "(Padrão Nacional)" : `em ${cidade}`;

  return (
    <View style={styles.container}>
      <CustomHeader title="Lista de Materiais" />

      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.cardAviso}>
          <Text style={styles.textoAviso}>
            📝 Valores de referência média. Os preços reais podem variar
            conforme a região. Ajuste as quantidades conforme a necessidade.
          </Text>
        </View>

        <View style={styles.cabecalhoSecao}>
          <Text style={styles.tituloSecao}>
            Ítens do Projeto{"\n"}Preço Médio {textoTituloLocal}
          </Text>

          <TouchableOpacity
            style={styles.botaoConfig}
            onPress={abrirConfiguracaoPrecos}
          >
            <FontAwesome5 name="cog" size={14} color="#1e3a8a" />
            <Text style={styles.textoBotaoConfig}>Configurar</Text>
          </TouchableOpacity>
        </View>

        {materiaisVisiveis.map((item) => {
          const qtdAtual = quantidades[item.id] || 0;
          const subtotal = qtdAtual * item.precoMedio;
          const sufixo =
            item.medida === "rolo"
              ? "cx"
              : item.medida === "metro"
                ? "m"
                : "un";

          return (
            <View key={item.id} style={styles.cardMaterial}>
              <View style={styles.infoMaterial}>
                <Text style={styles.nomeMaterial}>{item.nome}</Text>
                <Text style={styles.precoUnidade}>
                  R$ {item.precoMedio.toFixed(2).replace(".", ",")} / {sufixo}
                </Text>
              </View>

              <View style={styles.controles}>
                <View style={styles.grupoInput}>
                  <TextInput
                    style={styles.inputQtd}
                    keyboardType="numeric"
                    value={qtdAtual === 0 ? "" : qtdAtual.toString()}
                    onChangeText={(texto) =>
                      atualizarQuantidade(item.id, texto)
                    }
                    placeholder="0"
                  />
                  <Text style={styles.textoSufixoInput}>{sufixo}</Text>
                </View>
                <Text style={styles.textoSubtotal}>
                  R$ {subtotal.toFixed(2).replace(".", ",")}
                </Text>
              </View>
            </View>
          );
        })}

        {!mostrarTodos && (
          <TouchableOpacity
            style={styles.botaoMostrarMais}
            onPress={() => setMostrarTodos(true)}
          >
            <Text style={styles.textoBotaoMostrarMais}>
              + Adicionar Material Extra
            </Text>
          </TouchableOpacity>
        )}

        {mostrarTodos && (
          <TouchableOpacity
            style={styles.botaoMostrarMenos}
            onPress={() => setMostrarTodos(false)}
          >
            <Text style={styles.textoBotaoMostrarMais}>
              Ocultar itens zerados
            </Text>
          </TouchableOpacity>
        )}
      </ScrollView>

      <View style={styles.footerTotal}>
        <Text style={styles.textoTotalLabel}>Valor Estimado:</Text>
        <Text style={styles.textoTotalValor}>
          R$ {valorTotal.toFixed(2).replace(".", ",")}
        </Text>
      </View>

      <Modal
        visible={modalVisivel}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisivel(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <View style={styles.grupoEdicaoCidade}>
                <Text style={styles.labelCidade}>Localidade do Orçamento:</Text>
                <View style={styles.inputCidadeWrapper}>
                  <FontAwesome5
                    name="map-marker-alt"
                    size={14}
                    color="#6b7280"
                  />
                  <TextInput
                    style={styles.inputCidade}
                    value={cidadeEmEdicao}
                    onChangeText={setCidadeEmEdicao}
                    placeholder="Ex: Santos, SP"
                  />
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setModalVisivel(false)}
                style={styles.botaoFecharModal}
              >
                <FontAwesome5 name="times" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll}>
              {precosEmEdicao.map((item) => {
                const sufixo =
                  item.medida === "rolo"
                    ? "cx"
                    : item.medida === "metro"
                      ? "m"
                      : "un";
                return (
                  <View key={item.id} style={styles.modalItemRow}>
                    <Text style={styles.modalItemName}>{item.nome}</Text>
                    <View style={styles.modalInputGroup}>
                      <Text style={styles.modalCurrency}>R$</Text>
                      <TextInput
                        style={styles.modalInputPreco}
                        keyboardType="numeric"
                        value={item.precoMedio.toString().replace(".", ",")}
                        onChangeText={(texto) =>
                          atualizarPrecoEditado(item.id, texto)
                        }
                      />
                      <Text style={styles.modalSufixo}>/ {sufixo}</Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <TouchableOpacity
              style={styles.botaoSalvarModal}
              onPress={salvarNovosPrecos}
            >
              <Text style={styles.textoBotaoSalvar}>Salvar Minha Tabela</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  content: {
    padding: 16,
    paddingBottom: 200,
    maxWidth: 450,
    width: "100%",
    alignSelf: "center",
  },
  cardAviso: {
    backgroundColor: "#fffbeb",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#fde68a",
    marginBottom: 16,
  },
  textoAviso: { fontSize: 13, color: "#92400e", textAlign: "center" },

  cabecalhoSecao: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  tituloSecao: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    flex: 1,
    paddingRight: 10,
  },
  botaoConfig: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e7ff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },
  textoBotaoConfig: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginLeft: 6,
  },

  cardMaterial: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 1,
  },
  infoMaterial: { flex: 1, paddingRight: 10 },
  nomeMaterial: { fontSize: 14, fontWeight: "600", color: "#1f2937" },
  precoUnidade: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  controles: { alignItems: "flex-end" },
  grupoInput: { flexDirection: "row", alignItems: "center", marginBottom: 4 },
  inputQtd: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    width: 50,
    height: 36,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "bold",
    color: "#2563eb",
  },
  textoSufixoInput: {
    marginLeft: 6,
    fontSize: 14,
    fontWeight: "600",
    color: "#4b5563",
    width: 22,
  },
  textoSubtotal: { fontSize: 13, fontWeight: "bold", color: "#059669" },

  botaoMostrarMais: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#e0e7ff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#c7d2fe",
  },
  botaoMostrarMenos: {
    marginTop: 10,
    paddingVertical: 12,
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  textoBotaoMostrarMais: { color: "#4f46e5", fontSize: 15, fontWeight: "bold" },

  footerTotal: {
    backgroundColor: "#1e3a8a",
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    position: "absolute",
    bottom: 115,
    left: 0,
    right: 0,
  },
  textoTotalLabel: { color: "#fff", fontSize: 16, fontWeight: "600" },
  textoTotalValor: { color: "#fff", fontSize: 20, fontWeight: "bold" },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "65%",
    padding: 20,
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    paddingBottom: 15,
    marginBottom: 10,
  },
  grupoEdicaoCidade: { flex: 1, paddingRight: 15 },
  labelCidade: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 4,
    fontWeight: "600",
  },
  inputCidadeWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f3f4f6",
    borderRadius: 6,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#d1d5db",
  },
  inputCidade: {
    flex: 1,
    height: 36,
    marginLeft: 8,
    fontSize: 14,
    color: "#1f2937",
    fontWeight: "bold",
  },
  botaoFecharModal: { padding: 4 },
  modalScroll: { flex: 1 },
  modalItemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalItemName: { flex: 1, fontSize: 14, color: "#374151", paddingRight: 10 },
  modalInputGroup: { flexDirection: "row", alignItems: "center" },
  modalCurrency: { fontSize: 14, color: "#6b7280", marginRight: 4 },
  modalInputPreco: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 6,
    width: 70,
    height: 36,
    textAlign: "center",
    fontSize: 14,
    fontWeight: "bold",
    color: "#111827",
  },
  modalSufixo: { fontSize: 12, color: "#9ca3af", width: 25, marginLeft: 4 },
  botaoSalvarModal: {
    backgroundColor: "#059669",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 15,
  },
  textoBotaoSalvar: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});
