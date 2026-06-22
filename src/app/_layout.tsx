//  src/app/_layout.tsx
import { Tabs } from "expo-router";
import { LogBox, Platform, StyleSheet, View } from "react-native";
import { DataProvider } from "../context/DataContext";

LogBox.ignoreLogs(["The Flipper native module is not available"]);

export default function RootLayout() {
  return (
    <DataProvider>
      {/* Container Principal que centraliza todo o conteúdo na Web */}
      <View style={styles.wrapperWeb}>
        <Tabs
          screenOptions={{
            headerShown: false, // Desligamos o cabeçalho nativo para usar o nosso customizado em cada tela
            tabBarActiveTintColor: "#208AEF",
            tabBarLabelStyle: { fontSize: 12, fontWeight: "bold" },
            tabBarStyle: {
              maxWidth: 450,
              width: "100%",
              alignSelf: "center",
              backgroundColor: "#ffffff",
              // --- ADIÇÕES PARA LEVANTAR A BARRA DO RODAPÉ ---
              height: 60, // Aumenta ligeiramente a altura da barra
              paddingBottom: 8, // Afasta os rótulos e ícones do fundo da barra
              marginBottom: 16, // Levanta toda a barra para cima, descolando da barra de tarefas do Windows
              borderRadius: 16, // Opcional: dá um aspeto moderno e flutuante
            },
          }}
        >
          {/* Nomes alterados para corresponder aos ficheiros corretos na pasta app/ */}
          <Tabs.Screen name="index" options={{ title: "Cômodos" }} />
          <Tabs.Screen name="tue" options={{ title: "TUEs" }} />
          <Tabs.Screen name="quadro" options={{ title: "Quadro Geral" }} />
          {/* Oculta arquivos extras/rascunhos */}
          <Tabs.Screen name="explore" options={{ href: null }} />
          <Tabs.Screen name="layout" options={{ href: null }} />
        </Tabs>
      </View>
    </DataProvider>
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
});
