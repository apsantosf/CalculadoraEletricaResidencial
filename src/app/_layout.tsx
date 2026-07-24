// src/app/_layout.tsx
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { Slot, usePathname, useRouter } from "expo-router";
import {
  LogBox,
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
import { DataProvider, useData } from "../context/DataContext"; // 💡 Importamos o useData aqui!

LogBox.ignoreLogs(["The Flipper native module is not available"]);

// Barra customizada flutuante e adaptada à área segura
function BarraInferiorFixa() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // 💡 Puxamos os dados para saber se o projeto tem algum item
  const { comodos, tues } = useData();
  const temProjeto =
    (comodos && comodos.length > 0) || (tues && tues.length > 0);

  // Mede o respiro inferior de forma inteligente
  const bottomOffset =
    Platform.OS === "android" ? Math.max(insets.bottom + 16, 24) : 24;

  // 💡 NOVA ESTRUTURA DE ABAS ATUALIZADA (Agora com Materiais)
  const tabs = [
    { key: "/", title: "Início", icon: "home", pack: "fontawesome" },
    {
      key: "/comodos",
      title: "Cômodos",
      icon: "lightbulb",
      pack: "fontawesome",
    },
    { key: "/tue", title: "TUEs", icon: "lightning-bolt", pack: "material" },
    {
      key: "/quadro",
      title: "Quadro",
      icon: "electric-switch",
      pack: "material",
    },
    // 👇 A NOSSA NOVA ABA (Fica antes do Guia)
    {
      key: "/orcamento",
      title: "Materiais",
      icon: "clipboard-list",
      pack: "fontawesome",
    },
    { key: "/guia", title: "Guia", icon: "tools", pack: "fontawesome" },
  ];

  return (
    <View style={[styles.tabBarWrapper, { bottom: bottomOffset }]}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          const isActive = pathname === tab.key;

          // 💡 Lógica da Trava Inteligente
          const isOrcamento = tab.key === "/orcamento";
          const isBloqueado = isOrcamento && !temProjeto;

          const activeColor = "#208AEF";
          const inactiveColor = isBloqueado ? "#d1d5db" : "#6b7280"; // Fica cinza bem clarinho se bloqueado
          const color = isActive ? activeColor : inactiveColor;

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              activeOpacity={isBloqueado ? 1 : 0.2} // Tira o efeito de clique se estiver bloqueado
              onPress={() => {
                if (isBloqueado) return; // 🔒 Não faz nada se tentar clicar bloqueado
                router.replace(tab.key as any);
              }}
            >
              {tab.pack === "fontawesome" ? (
                <FontAwesome5 name={tab.icon as any} size={20} color={color} />
              ) : (
                <MaterialCommunityIcons
                  name={tab.icon as any}
                  size={24}
                  color={color}
                />
              )}
              <Text style={[styles.tabLabel, { color }]}>{tab.title}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

// Layout principal que abraça todo o projeto
function LayoutRaiz() {
  return (
    <DataProvider>
      <View style={styles.wrapperWeb}>
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
        <BarraInferiorFixa />
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
  wrapperWeb: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    ...Platform.select({
      web: {
        maxWidth: 450,
        width: "100%",
        alignSelf: "center",
      },
      default: {
        width: "100%",
      },
    }),
  },
  tabBarWrapper: {
    maxWidth: 450,
    width: "92%",
    alignSelf: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    height: 70,
    paddingBottom: 10,
    paddingTop: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: "center",
    position: "absolute",
    left: "4%",
    right: "4%",
  },
  tabBar: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    flex: 1,
  },
  tabItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  tabLabel: {
    fontSize: 10, // 💡 Diminuí um pouco a fonte para caber as 6 abas perfeitamente
    fontWeight: "bold",
    marginTop: 4,
  },
});
