// src/app/_layout.tsx
import { Tabs } from "expo-router";
import { DataProvider } from "../context/DataContext";

export default function RootLayout() {
  return (
    <DataProvider>
      <Tabs
        screenOptions={{
          headerTitleAlign: "center",
          tabBarActiveTintColor: "#208AEF",
          tabBarLabelStyle: { fontSize: 12, fontWeight: "bold" }, // Aumenta e destaca o texto
          tabBarStyle: {
            maxWidth: 450,
            width: "100%",
            alignSelf: "center",
            backgroundColor: "#ffffff",
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{ title: "💡 Cômodos", headerTitle: "Previsão de Carga" }}
        />
        <Tabs.Screen
          name="tue"
          options={{ title: "🚿 TUEs", headerTitle: "Circuitos Específicos" }}
        />
        <Tabs.Screen
          name="quadro"
          options={{
            title: "🏆 Quadro Geral",
            headerTitle: "Distribuição Geral (QDC)",
          }}
        />
        {/* Esconde a aba padrão do Expo que veio no modelo do projeto */}
        <Tabs.Screen name="explore" options={{ href: null }} />
      </Tabs>
    </DataProvider>
  );
}
