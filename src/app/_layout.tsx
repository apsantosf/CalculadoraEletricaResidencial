// src/app/_layout.tsx
import { Slot } from "expo-router";
import { LogBox, Platform, StyleSheet, View } from "react-native";
import { DataProvider } from "../context/DataContext";

LogBox.ignoreLogs(["The Flipper native module is not available"]);

export default function RootLayout() {
  return (
    <DataProvider>
      <View style={styles.wrapperWeb}>
        <Slot />
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
