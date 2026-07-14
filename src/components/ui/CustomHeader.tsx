// src/components/ui/CustomHeader.tsx
import Constants from "expo-constants";
import { router } from "expo-router";
import { useState } from "react";
import {
  BackHandler,
  Image,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useData } from "../../context/DataContext";

interface CustomHeaderProps {
  title: string;
}

export default function CustomHeader({ title }: CustomHeaderProps) {
  const { zerarProjeto, tensaoGeral } = useData();
  const appVersion = Constants.expoConfig?.version || "1.0.0";

  // Controle de exibição do nosso Modal Customizado
  const [modalVisible, setModalVisible] = useState(false);

  const handleNovoProjeto = () => {
    zerarProjeto();
    setModalVisible(false);
    router.replace("/");
  };

  const handleSairDoApp = () => {
    zerarProjeto(); // Limpa os dados primeiro
    setModalVisible(false);

    if (Platform.OS === "android") {
      BackHandler.exitApp(); // Fecha o app no celular Android
    } else if (Platform.OS === "web") {
      window.close(); // Tenta fechar a aba no navegador Web
    } else {
      router.replace("/"); // Retorno de segurança
    }
  };

  return (
    <View style={styles.headerContainer}>
      {/* Lado Esquerdo: Imagem e Título */}
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

      {/* Lado Direito: Badge Voltagem, Versão e Botão X */}
      <View style={styles.rightContainer}>
        <View style={styles.badgeTensao}>
          <Text style={styles.textoBadgeTensao}>⚡ {tensaoGeral}V</Text>
        </View>

        <Text style={styles.versionText}>v{appVersion}</Text>

        {/* Aciona o Modal em vez do Alert nativo */}
        <TouchableOpacity
          onPress={() => setModalVisible(true)}
          style={styles.botaoSair}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#374151" }}>
            X
          </Text>
        </TouchableOpacity>
      </View>

      {/* 💡 MODAL CUSTOMIZADO (Funciona igual em Web e Mobile) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Atenção</Text>
            <Text style={styles.modalText}>
              Deseja realmente iniciar um Novo Projeto? Todos os dados atuais
              serão perdidos. Ou deseja encerrar o aplicativo?
            </Text>

            {/* Opção 1: Iniciar Novo Projeto */}
            <TouchableOpacity
              style={[styles.btn, styles.btnNovo]}
              onPress={handleNovoProjeto}
            >
              <Text style={styles.btnTextNovo}>Iniciar Novo Projeto</Text>
            </TouchableOpacity>

            {/* Opção 2: Encerrar Aplicativo */}
            <TouchableOpacity
              style={[styles.btn, styles.btnSair]}
              onPress={handleSairDoApp}
            >
              <Text style={styles.btnTextSair}>Encerrar Aplicativo</Text>
            </TouchableOpacity>

            {/* Opção 3: Cancelar */}
            <TouchableOpacity
              style={[styles.btn, styles.btnCancel]}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.btnTextCancel}>Cancelar</Text>
            </TouchableOpacity>
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
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  badgeTensao: {
    backgroundColor: "#fffbeb",
    borderWidth: 1,
    borderColor: "#f59e0b",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginRight: 10,
  },
  textoBadgeTensao: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#d97706",
  },
  versionText: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "600",
    marginRight: 8,
  },
  botaoSair: {
    padding: 8,
    borderRadius: 4,
  },

  // 💡 ESTILOS DO MODAL CUSTOMIZADO
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)", // Fundo escuro transparente
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    elevation: 5, // Sombra no Android
    shadowColor: "#000", // Sombra no iOS/Web
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
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
    marginBottom: 24,
    lineHeight: 22,
    textAlign: "center",
  },
  btn: {
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 10,
  },
  btnNovo: {
    backgroundColor: "#208AEF",
  },
  btnTextNovo: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  btnSair: {
    backgroundColor: "#ef4444",
  },
  btnTextSair: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 16,
  },
  btnCancel: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  btnTextCancel: {
    color: "#4b5563",
    fontWeight: "bold",
    fontSize: 16,
  },
});
