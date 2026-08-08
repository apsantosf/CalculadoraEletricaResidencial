// src/app/index.tsx
import { FontAwesome5 } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Alert,
  FlatList,
  Linking,
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

export default function ScreenInicio() {
  const router = useRouter();
  const {
    projetosSalvos,
    carregarProjeto,
    excluirProjeto,
    idProjetoAtual,
    zerarProjeto,
  } = useData();

  const [modalProjetosVisivel, setModalProjetosVisivel] = useState(false);
  const [busca, setBusca] = useState("");

  const abrirManual = () => {
    // Coloque aqui o link real do manual do Residencial
    const urlManual = "https://drive.google.com/sua-url-aqui";
    Linking.openURL(urlManual).catch(() => {
      Alert.alert("Erro", "Não foi possível abrir o link do manual.");
    });
  };

  const handleNovoProjeto = () => {
    zerarProjeto(); // Limpa a mesa de trabalho
    router.push("/carga"); // Envia para a tela de preenchimento
  };

  const handleAbrirProjeto = (id: string) => {
    carregarProjeto(id);
    setModalProjetosVisivel(false);
    router.push("/carga"); // Abre o projeto e vai para a tela inicial de dados
  };

  const confirmarExclusao = (id: string, nome: string) => {
    const msg = `Deseja excluir permanentemente o projeto "${nome}"?`;
    if (Platform.OS === "web") {
      if (window.confirm(msg)) excluirProjeto(id);
    } else {
      Alert.alert("Excluir Projeto", msg, [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: () => excluirProjeto(id),
        },
      ]);
    }
  };

  const projetosFiltrados = [...projetosSalvos]
    .filter((p) => {
      const nome = p.nome || "Projeto Sem Nome";
      return nome.toLowerCase().includes(busca.toLowerCase());
    })
    .sort((a, b) => {
      const nomeA = a.nome || "Projeto Sem Nome";
      const nomeB = b.nome || "Projeto Sem Nome";
      return nomeA.localeCompare(nomeB, "pt-BR", { sensitivity: "accent" });
    });

  return (
    <View style={styles.container}>
      <CustomHeader title="Gerenciador de Projetos" />

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* BOTÃO DO MANUAL (DESTAQUE) */}
        <TouchableOpacity
          style={styles.btnManual}
          onPress={abrirManual}
          activeOpacity={0.8}
        >
          <FontAwesome5
            name="book"
            size={18}
            color="#ffffff"
            style={{ marginRight: 12 }}
          />
          <Text style={styles.btnManualText}>Ler Manual do Usuário</Text>
        </TouchableOpacity>

        {/* ÁREA DE AÇÃO PRINCIPAL */}
        <View style={styles.cardAcao}>
          <Text style={styles.cardTitle}>
            Bem-vindo ao Elétrica Residencial!
          </Text>
          <Text style={styles.cardSubtitle}>
            Escolha uma opção abaixo para começar a dimensionar.
          </Text>

          <TouchableOpacity
            style={styles.btnNovoProjeto}
            onPress={handleNovoProjeto}
            activeOpacity={0.8}
          >
            <FontAwesome5
              name="plus-circle"
              size={20}
              color="#ffffff"
              style={{ marginRight: 12 }}
            />
            <Text style={styles.btnNovoProjetoText}>Iniciar Novo Projeto</Text>
          </TouchableOpacity>
        </View>

        {/* GERENCIAMENTO DE PROJETOS SALVOS */}
        <Text style={styles.sectionTitle}>Histórico de Projetos</Text>
        <Text style={styles.labelSecundario}>
          Resgate ou gerencie projetos salvos no dispositivo:
        </Text>

        <TouchableOpacity
          style={[
            styles.pickerButton,
            projetosSalvos.length === 0 && styles.pickerButtonDisabled,
          ]}
          onPress={() => {
            setBusca("");
            setModalProjetosVisivel(true);
          }}
          disabled={projetosSalvos.length === 0}
          activeOpacity={0.8}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <FontAwesome5
              name="folder-open"
              size={18}
              color={projetosSalvos.length === 0 ? "#9ca3af" : "#2563eb"}
              style={{ marginRight: 12 }}
            />
            <Text
              style={[
                styles.pickerButtonText,
                projetosSalvos.length === 0 && { color: "#9ca3af" },
              ]}
            >
              {projetosSalvos.length === 0
                ? "Nenhum projeto salvo ainda"
                : "Pesquisar e carregar projeto..."}
            </Text>
          </View>
          <FontAwesome5 name="chevron-down" size={14} color="#6b7280" />
        </TouchableOpacity>
      </ScrollView>

      {/* MODAL COM BUSCA E LISTA FORMATADA (IGUAL AO PREDIAL) */}
      <Modal visible={modalProjetosVisivel} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Projetos Salvos</Text>
              <TouchableOpacity
                onPress={() => setModalProjetosVisivel(false)}
                style={styles.modalClose}
              >
                <FontAwesome5 name="times" size={20} color="#6b7280" />
              </TouchableOpacity>
            </View>

            <View style={styles.buscaContainer}>
              <FontAwesome5 name="search" size={14} color="#9ca3af" />
              <TextInput
                style={styles.buscaInput}
                placeholder="Pesquisar por nome..."
                placeholderTextColor="#9ca3af"
                value={busca}
                onChangeText={setBusca}
                autoFocus={Platform.OS === "web"}
              />
              {busca.length > 0 && (
                <TouchableOpacity
                  onPress={() => setBusca("")}
                  style={{ padding: 4 }}
                >
                  <FontAwesome5 name="times-circle" size={16} color="#9ca3af" />
                </TouchableOpacity>
              )}
            </View>

            <FlatList
              data={projetosFiltrados}
              keyExtractor={(item) => item.id}
              showsVerticalScrollIndicator={true}
              contentContainerStyle={{ paddingBottom: 20 }}
              ListEmptyComponent={
                <Text style={styles.textoListaVazia}>
                  Nenhum projeto encontrado para "{busca}".
                </Text>
              }
              renderItem={({ item }) => {
                const isAtivo = item.id === idProjetoAtual;
                const nomeDisplay = item.nome || "Projeto Sem Nome";
                const infoExtra = item.dados
                  ? `${item.dados.tensaoGeral}V - ${item.dados.tipoImovel}`
                  : "";

                return (
                  <View
                    style={[
                      styles.modalItemContainer,
                      isAtivo && styles.modalItemAtivo,
                    ]}
                  >
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        paddingRight: 10,
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                      onPress={() => handleAbrirProjeto(item.id)}
                    >
                      <Text
                        style={[
                          styles.modalItemTextoUnico,
                          isAtivo && styles.modalItemTextoAtivo,
                        ]}
                      >
                        {nomeDisplay}{" "}
                        <Text style={{ fontWeight: "400", fontSize: 13 }}>
                          ({infoExtra})
                        </Text>
                      </Text>
                      {isAtivo && (
                        <View style={styles.badgeAtivo}>
                          <Text style={styles.badgeText}>Atual</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.botaoLixeiraModal}
                      onPress={() => confirmarExclusao(item.id, nomeDisplay)}
                    >
                      <FontAwesome5 name="trash" size={14} color="#ef4444" />
                    </TouchableOpacity>
                  </View>
                );
              }}
            />
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
    maxWidth: 450,
    width: "100%",
    alignSelf: "center",
    paddingBottom: 100,
  },

  btnManual: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#8b5cf6",
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
    ...Platform.select({
      web: { boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" },
      default: { elevation: 2 },
    }),
  },
  btnManualText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },

  cardAcao: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 12,
    marginBottom: 30,
    alignItems: "center",
    ...Platform.select({
      web: { boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" },
      default: { elevation: 3 },
    }),
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 8,
    textAlign: "center",
  },
  cardSubtitle: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 20,
    textAlign: "center",
    lineHeight: 20,
  },

  btnNovoProjeto: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    backgroundColor: "#10b981",
    borderRadius: 8,
    padding: 16,
  },
  btnNovoProjetoText: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 4,
  },
  labelSecundario: { fontSize: 13, color: "#6b7280", marginBottom: 12 },

  pickerButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 16,
    ...Platform.select({
      web: { boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.05)" },
      default: { elevation: 2 },
    }),
  },
  pickerButtonDisabled: {
    backgroundColor: "#f3f4f6",
    borderColor: "#e5e7eb",
    elevation: 0,
    boxShadow: "none" as any,
  },
  pickerButtonText: { fontSize: 15, color: "#1f2937", fontWeight: "600" },

  // Modal Styles (Iguais ao Predial)
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#ffffff",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    maxHeight: "85%",
    paddingBottom: 20,
    ...Platform.select({
      web: { maxWidth: 450, width: "100%", alignSelf: "center" },
    }),
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  modalTitle: { fontSize: 18, fontWeight: "bold", color: "#1f2937" },
  modalClose: { padding: 5 },
  buscaContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === "ios" ? 12 : 8,
    margin: 16,
  },
  buscaInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 15,
    color: "#1f2937",
    ...Platform.select({ web: { outlineStyle: "none" } as any }),
  },
  textoListaVazia: {
    textAlign: "center",
    color: "#6b7280",
    marginTop: 20,
    fontStyle: "italic",
  },
  modalItemContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  modalItemAtivo: { backgroundColor: "#eff6ff" },
  modalItemTextoUnico: { fontSize: 15, fontWeight: "500", color: "#374151" },
  modalItemTextoAtivo: { color: "#1d4ed8", fontWeight: "bold" },
  badgeAtivo: {
    backgroundColor: "#dbeafe",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 8,
  },
  badgeText: { color: "#1e40af", fontSize: 10, fontWeight: "bold" },
  botaoLixeiraModal: {
    padding: 10,
    backgroundColor: "#fef2f2",
    borderRadius: 8,
  },
});
