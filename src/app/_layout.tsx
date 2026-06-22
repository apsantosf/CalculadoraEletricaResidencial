//  src/app/_layout.tsx
import { Tabs } from "expo-router";
import { LogBox, Platform, StyleSheet, View } from "react-native";
import { DataProvider } from "../context/DataContext";
// Importação dos ícones nativos do Expo
import { FontAwesome5, MaterialCommunityIcons } from "@expo/vector-icons";

LogBox.ignoreLogs(["The Flipper native module is not available"]);

export default function RootLayout() {
  return (
    <DataProvider>
      {/* Container Principal que centraliza todo o conteúdo na Web */}
      <View style={styles.wrapperWeb}>
        <Tabs
          screenOptions={({ route }) => ({
            headerShown: false, // Desligamos o cabeçalho nativo
            tabBarActiveTintColor: "#208AEF",
            tabBarInactiveTintColor: "#6b7280",

            // --- ALTERAÇÕES PARA MODO HORIZONTAL (LADO A LADO) ---
            tabBarLabelStyle: {
              fontSize: 11.5,
              fontWeight: "bold",
              marginLeft: 6, // Cria um respiro entre o ícone e o texto
            },
            tabBarItemStyle: {
              flexDirection: "row", // Força ícone e texto a ficarem na mesma linha
              justifyContent: "center",
              alignItems: "center",
            },
            tabBarStyle: {
              maxWidth: 450,
              width: "100%",
              alignSelf: "center",
              backgroundColor: "#ffffff",
              height: 60, // Altura confortável para o modo horizontal
              paddingBottom: 0,
              paddingTop: 0,
              marginBottom: 16,
              borderRadius: 16,
            },

            // Configuração dinâmica dos ícones de acordo com a aba
            tabBarIcon: ({ color, size }) => {
              if (route.name === "index") {
                return (
                  <FontAwesome5
                    name="lightbulb"
                    size={size - 2}
                    color={color}
                  />
                );
              } else if (route.name === "tue") {
                return (
                  <MaterialCommunityIcons
                    name="lightning-bolt"
                    size={size + 2}
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
