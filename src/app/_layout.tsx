// src/app/_layout.tsx
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { Slot, usePathname, useRouter } from "expo-router";
import {
  Alert,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaProvider,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { DataProvider, useData } from "../context/DataContext";

function BarraInferiorFixa() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // 💡 Puxamos os cômodos para saber se o projeto está vazio
  const { comodos } = useData();
  const projetoVazio = comodos.length === 0;

  const bottomOffset =
    Platform.OS === "android" ? Math.max(insets.bottom + 16, 24) : 24;

  // 💡 CHAVES ATUALIZADAS (carga.tsx, tue.tsx, orcamento.tsx)
  const tabs = [
    {
      key: "/",
      title: "Início",
      icon: "home",
      pack: "fontawesome",
      alwaysEnabled: true,
    },
    {
      key: "/carga",
      title: "Carga",
      icon: "clipboard-list",
      pack: "fontawesome",
      alwaysEnabled: true,
    },
    {
      key: "/comodos",
      title: "Cômodos",
      icon: "lightbulb",
      pack: "fontawesome",
      alwaysEnabled: true,
    },
    {
      key: "/tue",
      title: "TUEs",
      icon: "bolt",
      pack: "fontawesome",
      alwaysEnabled: false,
    },
    {
      key: "/quadro",
      title: "Quadro",
      icon: "sitemap",
      pack: "fontawesome",
      alwaysEnabled: false,
    },
    {
      key: "/orcamento",
      title: "Materiais",
      icon: "clipboard-check",
      pack: "fontawesome",
      alwaysEnabled: false,
    },
    {
      key: "/guia",
      title: "Guia",
      icon: "tools",
      pack: "fontawesome",
      alwaysEnabled: true,
    },
  ];

  return (
    <View style={[styles.tabBarWrapper, { bottom: bottomOffset }]}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.key;

          // 💡 SE O PROJETO TIVER VAZIO, BLOQUEIA TUE, QUADRO E MATERIAIS
          const isDisabled = projetoVazio && !tab.alwaysEnabled;

          const activeColor = "#2563eb";
          const inactiveColor = "#6b7280";
          const disabledColor = "#d1d5db"; // Cor cinza claro para bloqueado

          const color = isActive
            ? activeColor
            : isDisabled
              ? disabledColor
              : inactiveColor;

          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabItem, isDisabled && { opacity: 0.5 }]}
              onPress={() => {
                if (isDisabled) {
                  const msg =
                    "Adicione ao menos um Cômodo antes de acessar esta aba.";
                  Platform.OS === "web"
                    ? window.alert(msg)
                    : Alert.alert("Aba Bloqueada", msg);
                  return;
                }
                router.replace(tab.key as any);
              }}
              activeOpacity={0.7}
            >
              {tab.pack === "fontawesome" ? (
                <FontAwesome5 name={tab.icon as any} size={20} color={color} />
              ) : (
                <MaterialCommunityIcons
                  name={tab.icon as any}
                  size={22}
                  color={color}
                />
              )}
              {(isActive || Platform.OS === "web") && (
                <Text style={[styles.tabLabel, { color }]} numberOfLines={1}>
                  {tab.title}
                </Text>
              )}
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

function LayoutRaiz() {
  return (
    <DataProvider>
      {/* Container pai absoluto para centralizar tudo */}
      <View style={styles.rootContainer}>
        <View style={styles.wrapperWeb}>
          <View style={{ flex: 1 }}>
            <Slot />
          </View>
          <BarraInferiorFixa />
        </View>
      </View>
    </DataProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LayoutRaiz />
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  rootContainer: {
    flex: 1,
    backgroundColor: "#f3f4f6", // Cor de fundo fora da área principal na web
    alignItems: "center", // Centraliza o wrapperWeb no ecrã
  },
  wrapperWeb: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    ...Platform.select({
      web: {
        maxWidth: 420, // 🚀 AQUI: Alterado de 600 para 420 (Largura padrão de telemóvel)
        width: "100%",
        height: "100vh",
        position: "relative",
      },
      default: { width: "100%" },
    }),
  },

  tabBarWrapper: {
    maxWidth: 420, // 🚀 AQUI: Adicione esta linha para o menu acompanhar a largura
    width: "96%",
    alignSelf: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    height: 65,
    paddingBottom: 6,
    paddingTop: 6,
    elevation: 4,
    ...Platform.select({
      web: { boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)" },
      default: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
    }),
    justifyContent: "center",
    position: "absolute",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    flex: 1,
    paddingHorizontal: 5,
  },
  tabItem: { alignItems: "center", justifyContent: "center", flex: 1 },
  tabLabel: {
    fontSize: 10,
    fontWeight: "bold",
    marginTop: 2,
    textAlign: "center",
  },
});
