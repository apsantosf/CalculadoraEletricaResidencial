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
import { DataProvider } from "../context/DataContext";

LogBox.ignoreLogs(["The Flipper native module is not available"]);

// Barra customizada flutuante e adaptada à área segura
function BarraInferiorFixa() {
  const router = useRouter();
  const pathname = usePathname();
  const insets = useSafeAreaInsets();

  // Mede o respiro inferior de forma inteligente
  const bottomOffset =
    Platform.OS === "android" ? Math.max(insets.bottom + 16, 24) : 24;

  const tabs = [
    { key: "/", title: "Cômodos", icon: "lightbulb", pack: "fontawesome" },
    { key: "/tue", title: "TUEs", icon: "lightning-bolt", pack: "material" },
    {
      key: "/quadro",
      title: "Quadro Geral",
      icon: "electric-switch",
      pack: "material",
    },
  ];

  return (
    <View style={[styles.tabBarWrapper, { bottom: bottomOffset }]}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          // Ajusta a rota ativa considerando a raiz "/"
          const isActive =
            pathname === tab.key ||
            (tab.key === "/" && pathname === "/comodos");
          const activeColor = "#208AEF";
          const inactiveColor = "#6b7280";
          const color = isActive ? activeColor : inactiveColor;

          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => router.replace(tab.key as any)}
            >
              {tab.pack === "fontawesome" ? (
                <FontAwesome5 name={tab.icon as any} size={22} color={color} />
              ) : (
                <MaterialCommunityIcons
                  name={tab.icon as any}
                  size={26}
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
    fontSize: 12,
    fontWeight: "bold",
    marginTop: 4,
  },
});
