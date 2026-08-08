// src/components/ui/CustomHeader.tsx
import Constants from "expo-constants";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import {
  Alert,
  BackHandler,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useData } from "../../context/DataContext";

interface CustomHeaderProps {
  title: string;
}

type FluxoModal = "fechado" | "perguntar_salvar" | "pedir_nome";

export default function CustomHeader({ title }: CustomHeaderProps) {
  const { zerarProjeto, tensaoGeral, salvarProjetoAtual, nomeProjetoAtual } =
    useData();
  const appVersion = Constants.expoConfig?.version || "1.0.0";

  const [etapaModal, setEtapaModal] = useState<FluxoModal>("fechado");
  const [nomeInput, setNomeInput] = useState("");

  // Preenche o input automaticamente se já houver um nome salvo
  useEffect(() => {
    if (etapaModal === "pedir_nome") {
      setNomeInput(nomeProjetoAtual || "");
    }
  }, [etapaModal, nomeProjetoAtual]);

  const executarAcaoFinal = (acao: "novo" | "sair") => {
    zerarProjeto();
    setEtapaModal("fechado");

    if (acao === "novo") {
      router.replace("/");
    } else {
      if (Platform.OS === "android") {
        BackHandler.exitApp();
      } else if (Platform.OS === "web") {
        window.close();
      } else {
        router.replace("/");
      }
    }
  };

  const handleSalvarEContinuar = async () => {
    if (nomeInput.trim() === "") {
      Platform.OS === "web"
        ? window.alert("Por favor, digite um nome para o projeto.")
        : Alert.alert("Atenção", "Por favor, digite um nome para o projeto.");
      return;
    }

    // 1. Salva o projeto
    await salvarProjetoAtual(nomeInput);

    // 2. Alerta de sucesso
    Platform.OS === "web"
      ? window.alert(`Projeto "${nomeInput}" salvo com sucesso!`)
      : Alert.alert("Sucesso", `Projeto "${nomeInput}" salvo com sucesso!`);

    // 3. 💡 CORREÇÃO: Fecha o modal completamente para continuar trabalhando
    setEtapaModal("fechado");
  };

  return (
    <View style={styles.headerContainer}>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <Image
          source={require("../../../assets/images/capa-app.png")}
          style={{ width: 32, height: 32, marginRight: 10 }}
          resizeMode="contain"
        />
        <Text style={{ fontSize: 16, fontWeight: "bold", color: "#1f2937" }}>
          {title}
        </Text>
      </View>

      <View style={styles.rightContainer}>
        <View style={styles.badgeTensao}>
          <Text style={styles.textoBadgeTensao}>⚡ {tensaoGeral}V</Text>
        </View>
        <Text style={styles.versionText}>v{appVersion}</Text>
        <TouchableOpacity
          onPress={() => setEtapaModal("perguntar_salvar")}
          style={styles.botaoSair}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#374151" }}>
            X
          </Text>
        </TouchableOpacity>
      </View>

      <Modal
        animationType="fade"
        transparent={true}
        visible={etapaModal !== "fechado"}
        onRequestClose={() => setEtapaModal("fechado")}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {etapaModal === "perguntar_salvar" && (
              <>
                <Text style={styles.modalTitle}>Atenção</Text>
                <Text style={styles.modalText}>
                  Deseja salvar o projeto atual antes de sair ou iniciar um
                  novo?
                </Text>

                <TouchableOpacity
                  style={[styles.btn, styles.btnSalvar]}
                  onPress={() => setEtapaModal("pedir_nome")}
                >
                  <Text style={styles.btnTextBranco}>
                    {nomeProjetoAtual
                      ? "💾 Atualizar Projeto Salvo"
                      : "💾 Sim, Salvar Projeto"}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.btnNovo]}
                  onPress={() => executarAcaoFinal("novo")}
                >
                  <Text style={styles.btnTextBranco}>
                    📄 Novo Projeto (Sem Salvar)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.btnSair]}
                  onPress={() => executarAcaoFinal("sair")}
                >
                  <Text style={styles.btnTextBranco}>
                    🚪 Encerrar App (Sem Salvar)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.btn, styles.btnCancel]}
                  onPress={() => setEtapaModal("fechado")}
                >
                  <Text style={styles.btnTextCancel}>Cancelar</Text>
                </TouchableOpacity>
              </>
            )}

            {etapaModal === "pedir_nome" && (
              <>
                <Text style={styles.modalTitle}>
                  {nomeProjetoAtual
                    ? "Atualizar ou Salvar Como"
                    : "Salvar Projeto"}
                </Text>
                <Text style={styles.modalText}>
                  Dê um nome para identificar este projeto:
                </Text>

                {/* 💡 CORREÇÃO: Remoção do autoFocus para evitar travamento na Web */}
                <TextInput
                  style={styles.inputNome}
                  placeholder="Ex: Casa do Sr. João"
                  value={nomeInput}
                  onChangeText={setNomeInput}
                />

                <View style={styles.rowButtons}>
                  <TouchableOpacity
                    style={[styles.btnHalf, styles.btnCancel]}
                    onPress={() => setEtapaModal("perguntar_salvar")}
                  >
                    <Text style={styles.btnTextCancel}>Voltar</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[styles.btnHalf, styles.btnSalvar]}
                    onPress={handleSalvarEContinuar}
                  >
                    <Text style={styles.btnTextBranco}>Salvar</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  headerContainer: {
    maxWidth: 450,
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#ffffff",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
    marginTop: Platform.OS === "android" ? 24 : 0,
  },
  rightContainer: { flexDirection: "row", alignItems: "center" },
  badgeTensao: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#f59e0b",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 10,
  },
  textoBadgeTensao: { fontSize: 11, fontWeight: "bold", color: "#d97706" },
  versionText: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "600",
    marginRight: 8,
  },
  botaoSair: { padding: 8, borderRadius: 4 },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  modalText: {
    fontSize: 15,
    color: "#4b5563",
    marginBottom: 20,
    lineHeight: 22,
    textAlign: "center",
  },

  inputNome: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: "#f9fafb",
    marginBottom: 20,
    width: "100%",
  },

  btn: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
    paddingHorizontal: 10,
  },
  rowButtons: { flexDirection: "row", justifyContent: "space-between" },
  btnHalf: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    width: "48%",
  },

  btnSalvar: { backgroundColor: "#10b981" },
  btnNovo: { backgroundColor: "#3b82f6" },
  btnSair: { backgroundColor: "#ef4444" },
  btnTextBranco: { color: "#ffffff", fontWeight: "bold", fontSize: 15 },

  btnCancel: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  btnTextCancel: { color: "#4b5563", fontWeight: "bold", fontSize: 15 },
});
