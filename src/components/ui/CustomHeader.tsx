//   src/components/ui/CustomHeader.tsx
import Constants from "expo-constants"; // Importação para ler a versão
import { router } from "expo-router";
import {
  Alert,
  Image,
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
  const { zerarProjeto } = useData();

  // Lê a versão definida no campo 'version' do app.json, com um fallback seguro
  const appVersion = Constants.expoConfig?.version || "1.0.0";

  const handleSairDoSistema = () => {
    if (Platform.OS === "web") {
      const confirmou = window.confirm(
        "Deseja realmente iniciar um Novo Projeto? Todos os dados serão perdidos.",
      );
      if (confirmou) {
        zerarProjeto();
        router.replace("/"); // Volta para a tela inicial na Web
      }
    } else {
      Alert.alert(
        "Novo Projeto",
        "Deseja realmente iniciar um Novo Projeto? Todos os dados serão perdidos.",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Sim",
            style: "destructive",
            onPress: () => {
              zerarProjeto();
              router.replace("/"); // Volta para a tela inicial no Android/iOS
            },
          },
        ],
      );
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

      {/* Lado Direito: Versão e Botão X alinhados */}
      <View style={styles.rightContainer}>
        <Text style={styles.versionText}>v{appVersion}</Text>
        <TouchableOpacity
          onPress={handleSairDoSistema}
          style={styles.botaoSair}
        >
          <Text style={{ fontSize: 18, fontWeight: "bold", color: "#374151" }}>
            X
          </Text>
        </TouchableOpacity>
      </View>
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
    // No Android, damos um espaço para a barra de estado
    marginTop: Platform.OS === "android" ? 24 : 0,
  },
  rightContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  versionText: {
    fontSize: 11,
    color: "#6b7280",
    fontWeight: "600",
    marginRight: 12,
  },
  botaoSair: {
    padding: 8,
    borderRadius: 4,
  },
});
