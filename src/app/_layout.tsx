// src/app/_layout.tsx
import { Slot } from "expo-router";
import { LogBox, Platform, StyleSheet, View } from "react-native";
import CustomTabs from "../components/ui/CustomTabs";
import { DataProvider } from "../context/DataContext";

LogBox.ignoreLogs(["The Flipper native module is not available"]);

export default function RootLayout() {
  return (
    <DataProvider>
      <View style={styles.wrapperWeb}>
        {/* O Slot renderiza a página atual (index, tue, quadro) */}
        <View style={{ flex: 1 }}>
          <Slot />
        </View>

        {/* A nossa barra de abas customizada aparece em todas as telas, perfeitamente dimensionada */}
        <CustomTabs />
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
