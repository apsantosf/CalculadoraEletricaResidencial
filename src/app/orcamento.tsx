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
const CHAVE_DISTANCIA_QDC = "@EletricaResidencial_DistanciaQDC";
const CHAVE_DADOS_RAMAL = "@EletricaResidencial_DadosRamal";
const CHAVE_PROTECOES_GERAIS = "@EletricaResidencial_ProtecoesGerais";

export default function ScreenOrcamento() {
  const { comodos, tues } = useData();

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
        setCidade(cidadeSalva || "Padrão Nacional");
        if (!cidadeSalva)
          await AsyncStorage.setItem(CHAVE_CIDADE, "Padrão Nacional");
        return;
      }
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setCidade("Padrão Nacional");
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

        let qtdTug = 0;
        let qtdTue = 0;
        let qtdInterruptores = 0;
        let qtdLampadas = 0;
        let disjuntoresCircuitos: Record<string, number> = {};

        if (comodos && comodos.length > 0) {
          comodos.forEach((comodo) => {
            qtdInterruptores += 1;
            comodo.dispositivos.forEach((disp) => {
              const qtd = disp.quantidade || 1;
              const tipo = disp.tipo?.toLowerCase() || "";
              if (tipo.includes("tug") || tipo.includes("geral")) qtdTug += qtd;
              if (tipo.includes("tue") || tipo.includes("espec")) qtdTue += qtd;
              if (tipo.includes("ilumina") || tipo.includes("luz"))
                qtdLampadas += qtd;
              const amp = disp.disjuntor || (tipo.includes("tug") ? 16 : 10);
              const idDisj = `disjuntor_${amp}a`;
              disjuntoresCircuitos[idDisj] =
                (disjuntoresCircuitos[idDisj] || 0) + 1;
            });
          });
        }

        if (tues && tues.length > 0) {
          tues.forEach((tue) => {
            qtdTue += tue.quantidade || 1;
            const amp = tue.disjuntor || 10;
            const idDisj = `disjuntor_${amp}a`;
            disjuntoresCircuitos[idDisj] =
              (disjuntoresCircuitos[idDisj] || 0) + 1;
          });
        }

        let quantidadesAtuais: Record<string, number> = {};
        const carrinhoSalvo = await AsyncStorage.getItem(CHAVE_CARRINHO);
        if (carrinhoSalvo) quantidadesAtuais = JSON.parse(carrinhoSalvo);

        const prefixosLimpar = [
          "cabo_",
          "idr_",
          "dps_",
          "tomada_",
          "interruptor_",
          "disjuntor_",
          "lampada_",
          "soquete_",
        ];
        Object.keys(quantidadesAtuais).forEach((key) => {
          if (prefixosLimpar.some((prefix) => key.startsWith(prefix))) {
            delete quantidadesAtuais[key];
          }
        });

        if (!quantidadesAtuais["cabo_1_5"]) quantidadesAtuais["cabo_1_5"] = 1;
        if (!quantidadesAtuais["cabo_2_5"]) quantidadesAtuais["cabo_2_5"] = 1;
        if (qtdTug > 0) quantidadesAtuais["tomada_10a"] = qtdTug;
        if (qtdTue > 0) quantidadesAtuais["tomada_20a"] = qtdTue;
        if (qtdInterruptores > 0)
          quantidadesAtuais["interruptor_simples"] = qtdInterruptores;
        if (qtdLampadas > 0) {
          quantidadesAtuais["lampada_led"] = qtdLampadas;
          quantidadesAtuais["soquete_bocal"] = qtdLampadas;
        }

        Object.entries(disjuntoresCircuitos).forEach(([idDisj, qtd]) => {
          quantidadesAtuais[idDisj] = qtd;
        });

        const protecoesStr = await AsyncStorage.getItem(CHAVE_PROTECOES_GERAIS);
        if (protecoesStr) {
          try {
            const parsed = JSON.parse(protecoesStr);
            const vias = parsed.qtdVias || 2;
            const disjGeral = parsed.disjuntorGeral;
            if (disjGeral) quantidadesAtuais[`disjuntor_${disjGeral}a`] = 1;
            quantidadesAtuais["dps_275v"] = vias;
            quantidadesAtuais[vias <= 3 ? "idr_bipolar" : "idr_tetrapolar"] = 1;
          } catch (e) {}
        }

        const distSalva = await AsyncStorage.getItem(CHAVE_DISTANCIA_QDC);
        const distanciaQDC =
          parseFloat(distSalva?.replace(",", ".") || "0") || 0;
        const dadosRamalStr = await AsyncStorage.getItem(CHAVE_DADOS_RAMAL);

        if (distanciaQDC > 0 && dadosRamalStr) {
          try {
            const parsedRamal = JSON.parse(dadosRamalStr);
            const bitolaCalc = parsedRamal.bitola || "10";
            const metragemCalc = parsedRamal.metragem || 0;
            if (metragemCalc > 0) {
              quantidadesAtuais[`cabo_${bitolaCalc.replace(".", "_")}_0`] =
                metragemCalc;
            }
          } catch (e) {}
        }

        setQuantidades(quantidadesAtuais);
        await AsyncStorage.setItem(
          CHAVE_CARRINHO,
          JSON.stringify(quantidadesAtuais),
        );
      };

      inicializarBD();
    }, [comodos, tues]),
  );

  const atualizarQuantidade = async (id: string, valor: string) => {
    const limpo = valor.replace(/[^0-9]/g, "");
    const num = parseInt(limpo) || 0;
    const novasQuantidades = { ...quantidades, [id]: num };
    setQuantidades(novasQuantidades);
    await AsyncStorage.setItem(
      CHAVE_CARRINHO,
      JSON.stringify(novasQuantidades),
    );
  };

  const valorTotal = tabelaPrecos.reduce(
    (acc, item) => acc + (quantidades[item.id] || 0) * item.precoMedio,
    0,
  );

  const materiaisVisiveis = [...tabelaPrecos]
    .filter((item) => mostrarTodos || (quantidades[item.id] || 0) > 0)
    .sort((a, b) => a.nome.localeCompare(b.nome, "pt-BR"));

  const abrirConfiguracaoPrecos = async () => {
    setCidadeEmEdicao(cidade === "Carregando..." ? "Padrão Nacional" : cidade);
    setPrecosEmEdicao([...tabelaPrecos]);
    setModalVisivel(true);
  };

  const atualizarPrecoEditado = (id: string, novoValor: string) => {
    const limpo = novoValor.replace(/[^0-9,]/g, "");
    const valorNumerico = parseFloat(limpo.replace(",", ".")) || 0;
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
    Platform.OS === "web"
      ? window.alert("Tabela atualizada com sucesso!")
      : Alert.alert("Sucesso", "Tabela atualizada com sucesso!");
  };

  return (
    <View style={styles.container}>
      <CustomHeader title="Lista de Materiais" />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.cardAviso}>
          <Text style={styles.textoAviso}>
            📝 Valores de referência média. Ajuste as quantidades conforme a
            necessidade.
          </Text>
        </View>

        <View style={styles.cabecalhoSecao}>
          <Text style={styles.tituloSecao}>
            Ítens do Projeto{"\n"}Preço Médio{" "}
            {cidade === "Padrão Nacional"
              ? "(Padrão Nacional)"
              : `em ${cidade}`}
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

        <TouchableOpacity
          style={
            mostrarTodos ? styles.botaoMostrarMenos : styles.botaoMostrarMais
          }
          onPress={() => setMostrarTodos(!mostrarTodos)}
        >
          <Text style={styles.textoBotaoMostrarMais}>
            {mostrarTodos
              ? "Ocultar itens zerados"
              : "+ Adicionar Material Extra"}
          </Text>
        </TouchableOpacity>
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
          {/* 💡 MODAL COM MEDIDAS TRAVADAS E CENTRALIZADAS NA WEB */}
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

  // 💡 ADAPTAÇÃO DO MODAL PARA WEB E MOBILE
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: Platform.OS === "web" ? "center" : "flex-end",
    alignItems: "center",
  },
  modalContainer: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    height: "65%",
    padding: 20,
    paddingBottom: 30,
    ...Platform.select({
      web: {
        maxWidth: 450,
        width: "100%",
        alignSelf: "center",
        borderRadius: 20, // Na web fica com bordas arredondadas por igual
      },
    }),
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
