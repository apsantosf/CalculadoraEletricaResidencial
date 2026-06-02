import { Tabs } from "expo-router";
import { Image, Text, View } from "react-native";
import { DataProvider } from "../context/DataContext";

export default function RootLayout() {
  return (
    <DataProvider>
      <Tabs
        screenOptions={{
          headerTitleAlign: "center",
          tabBarActiveTintColor: "#208AEF",
          tabBarLabelStyle: { fontSize: 12, fontWeight: "bold" },
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
          //         options={{ title: "💡 Cômodos", headerTitle: "Previsão de Carga" }}
          options={{
            title: "💡 Cômodos",
            headerTitle: () => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("../../assets/images/capa-app.png")} // Ajuste o caminho conforme sua pasta
                  style={{ width: 32, height: 32, marginRight: 10 }}
                  onError={(e) =>
                    console.log("Erro ao carregar imagem:", e.nativeEvent.error)
                  }
                />
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  Previsão de Carga
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="tue"
          //          options={{ title: "🚿 TUEs", headerTitle: "Circuitos Específicos" }}
          options={{
            title: "🚿 TUEs",
            headerTitle: () => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("../../assets/images/capa-app.png")} // Ajuste o caminho conforme sua pasta
                  style={{ width: 32, height: 32, marginRight: 10 }}
                  onError={(e) =>
                    console.log("Erro ao carregar imagem:", e.nativeEvent.error)
                  }
                />
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  Circuitos Específicos
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="quadro"
          //          options={{
          //            title: "🏆 Quadro Geral",
          //            headerTitle: "Distribuição Geral (QDC)",
          //          }}
          options={{
            title: "🏆 Quadro Geral",
            headerTitle: () => (
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                }}
              >
                <Image
                  source={require("../../assets/images/capa-app.png")} // Ajuste o caminho conforme sua pasta
                  style={{ width: 32, height: 32, marginRight: 10 }}
                  onError={(e) =>
                    console.log("Erro ao carregar imagem:", e.nativeEvent.error)
                  }
                />
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>
                  Distribuição Geral (QDC)
                </Text>
              </View>
            ),
          }}
        />
        <Tabs.Screen name="explore" options={{ href: null }} />
      </Tabs>
    </DataProvider>
  );
}
