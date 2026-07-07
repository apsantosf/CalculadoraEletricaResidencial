// utils/UpdateHelper.ts
import { Platform } from "react-native";
import SpInAppUpdates, { IAUUpdateKind } from "sp-react-native-in-app-updates";

export function checarAtualizacao() {
  if (Platform.OS !== "android") return;

  const inAppUpdates = new SpInAppUpdates(false); // false = modo produção

  inAppUpdates
    .checkNeedsUpdate()
    .then((result: any) => {
      if (result.shouldUpdate) {
        inAppUpdates.startUpdate({ updateType: IAUUpdateKind.IMMEDIATE });
      }
    })
    .catch((error: any) => {
      console.log("Erro ao verificar atualização:", error);
    });
}
