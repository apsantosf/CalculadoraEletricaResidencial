// src/components/ui/CustomTabs.tsx
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { usePathname, useRouter } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

export default function CustomTabs() {
  const router = useRouter();
  const pathname = usePathname();

  // Mapeamento das suas rotas atuais
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
    <View style={styles.tabBarWrapper}>
      <View style={styles.tabBar}>
        {tabs.map((tab) => {
          // Na Web, o pathname pode ser "/comodos" ou "/" dependendo da sua pasta 'app'
          // Verifique se a aba atual está ativa
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

const styles = StyleSheet.create({
  tabBarWrapper: {
    maxWidth: 450,
    width: "100%",
    alignSelf: "center",
    backgroundColor: "#ffffff",
    borderRadius: 16,
    height: 70,
    paddingBottom: 10,
    paddingTop: 8,
    marginBottom: 8,
    // Sombra elegante
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    // Mantém fixo na parte inferior da tela
    justifyContent: "center",
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
