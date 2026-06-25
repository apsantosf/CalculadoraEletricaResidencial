// src/app/(tabs)/_layout.tsx
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import { Platform } from "react-native";

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: "#208AEF",
        tabBarInactiveTintColor: "#6b7280",
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: "bold",
          paddingBottom: 4,
        },
        tabBarStyle: {
          maxWidth: 450,
          alignSelf: "center",
          backgroundColor: "#ffffff",

          ...Platform.select({
            web: {
              width: "100%",
              height: 56,
              paddingTop: 4,
              marginBottom: 0,
              position: "relative",
              borderTopWidth: 1,
              borderColor: "#e5e7eb",
            },
            default: {
              // 🚀 O SEGREDO PARA O ANDROID ESTÁ AQUI:
              position: "absolute",
              bottom: 16, // Descola a barra 16 pixels da base do telemóvel
              left: 16, // Dá uma margem lateral
              right: 16, // Dá uma margem lateral
              borderRadius: 16, // Deixa a barra arredondada e moderna
              height: 70,
              paddingTop: 12,
              paddingBottom: 12,
              borderTopWidth: 0,
              elevation: 8, // Sombra suave para destacar do fundo
            },
          }),
        },
        tabBarIcon: ({ color, size }) => {
          if (route.name === "index") {
            return <FontAwesome5 name="lightbulb" size={size} color={color} />;
          } else if (route.name === "tue") {
            return (
              <MaterialCommunityIcons
                name="lightning-bolt"
                size={size + 4}
                color={color}
              />
            );
          } else if (route.name === "quadro") {
            return (
              <MaterialCommunityIcons
                name="electric-switch"
                size={size}
                color={color}
              />
            );
          }
          return null;
        },
      })}
    >
      <Tabs.Screen name="index" options={{ title: "Cômodos" }} />
      <Tabs.Screen name="tue" options={{ title: "TUEs" }} />
      <Tabs.Screen name="quadro" options={{ title: "Quadro Geral" }} />
    </Tabs>
  );
}
