// src/app/index.tsx
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomHeader from "../components/ui/CustomHeader";
import { useData } from "../context/DataContext";

export default function ScreenInicio() {
  const {
    tensaoGeral,
    setTensaoGeral,
    sistemaDistribuicao,
    setSistemaDistribuicao,
    distribuidora,
    setDistribuidora,
    tipoImovel,
    setTipoImovel,
    comodos,
  } = useData();

  // 💡 VALIDAÇÃO DE SEGURANÇA
  const temItensCadastrados = comodos && comodos.length > 0;

  return (
    <View style={styles.container}>
      <CustomHeader title="Previsão de Carga" />

      <ScrollView contentContainerStyle={styles.content}>
        {temItensCadastrados && (
          <View style={styles.alertaBloqueio}>
            <Text style={styles.tituloAlertaBloqueio}>
              ⚠️ CONFIGURAÇÕES INICIAIS TRAVADAS
            </Text>
            <Text style={styles.textoAlertaBloqueio}>
              Como já existem cômodos ou circuitos específicos cadastrados, a
              alteração dos parâmetros principais foi bloqueada para proteger os
              cálculos atuais. Para modificar estas opções, limpe o projeto
              clicando no "X" no topo da tela.
            </Text>
          </View>
        )}

        {/* Bloco 1: Tipo de Imóvel */}
        <View style={styles.cardConfig}>
          <Text style={styles.labelSecao}>Tipo de Imóvel</Text>
          <View style={styles.rowBotoes}>
            <TouchableOpacity
              style={[
                styles.botaoOpcao,
                tipoImovel === "Casa" && styles.botaoAtivo,
                temItensCadastrados &&
                  tipoImovel !== "Casa" &&
                  styles.botaoDesativado,
              ]}
              onPress={() => setTipoImovel("Casa")}
              disabled={temItensCadastrados}
            >
              <Text
                style={[
                  styles.textoBotao,
                  tipoImovel === "Casa" && styles.textoAtivo,
                  temItensCadastrados &&
                    tipoImovel !== "Casa" &&
                    styles.textoDesativado,
                ]}
              >
                🏠 Casa
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.botaoOpcao,
                tipoImovel === "Apartamento" && styles.botaoAtivo,
                temItensCadastrados &&
                  tipoImovel !== "Apartamento" &&
                  styles.botaoDesativado,
              ]}
              onPress={() => setTipoImovel("Apartamento")}
              disabled={temItensCadastrados}
            >
              <Text
                style={[
                  styles.textoBotao,
                  tipoImovel === "Apartamento" && styles.textoAtivo,
                  temItensCadastrados &&
                    tipoImovel !== "Apartamento" &&
                    styles.textoDesativado,
                ]}
              >
                🏢 Apartamento
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bloco 2: Tensão de Trabalho Interna */}
        <View style={styles.cardConfig}>
          <Text style={styles.labelSecao}>Tensão de Trabalho Interna</Text>
          <View style={styles.rowBotoes}>
            <TouchableOpacity
              style={[
                styles.botaoOpcao,
                tensaoGeral === 127 && styles.botaoAtivo,
                temItensCadastrados &&
                  tensaoGeral !== 127 &&
                  styles.botaoDesativado,
              ]}
              onPress={() => setTensaoGeral(127)}
              disabled={temItensCadastrados}
            >
              <Text
                style={[
                  styles.textoBotao,
                  tensaoGeral === 127 && styles.textoAtivo,
                  temItensCadastrados &&
                    tensaoGeral !== 127 &&
                    styles.textoDesativado,
                ]}
              >
                127 V
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.botaoOpcao,
                tensaoGeral === 220 && styles.botaoAtivo,
                temItensCadastrados &&
                  tensaoGeral !== 220 &&
                  styles.botaoDesativado,
              ]}
              onPress={() => setTensaoGeral(220)}
              disabled={temItensCadastrados}
            >
              <Text
                style={[
                  styles.textoBotao,
                  tensaoGeral === 220 && styles.textoAtivo,
                  temItensCadastrados &&
                    tensaoGeral !== 220 &&
                    styles.textoDesativado,
                ]}
              >
                220 V
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bloco 3: Sistema de Rede */}
        <View style={styles.cardConfig}>
          <Text style={styles.labelSecao}>Sistema de Rede da Região</Text>
          <View style={styles.rowBotoes}>
            <TouchableOpacity
              style={[
                styles.botaoOpcao,
                sistemaDistribuicao === "127/220V" && styles.botaoAtivo,
                temItensCadastrados &&
                  sistemaDistribuicao !== "127/220V" &&
                  styles.botaoDesativado,
              ]}
              onPress={() => setSistemaDistribuicao("127/220V")}
              disabled={temItensCadastrados}
            >
              <Text
                style={[
                  styles.textoBotao,
                  sistemaDistribuicao === "127/220V" && styles.textoAtivo,
                  temItensCadastrados &&
                    sistemaDistribuicao !== "127/220V" &&
                    styles.textoDesativado,
                ]}
              >
                127/220 V (Sul/Sudeste)
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.botaoOpcao,
                sistemaDistribuicao === "220/380V" && styles.botaoAtivo,
                temItensCadastrados &&
                  sistemaDistribuicao !== "220/380V" &&
                  styles.botaoDesativado,
              ]}
              onPress={() => setSistemaDistribuicao("220/380V")}
              disabled={temItensCadastrados}
            >
              <Text
                style={[
                  styles.textoBotao,
                  sistemaDistribuicao === "220/380V" && styles.textoAtivo,
                  temItensCadastrados &&
                    sistemaDistribuicao !== "220/380V" &&
                    styles.textoDesativado,
                ]}
              >
                220/380 V (Nordeste/DF)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bloco 4: Distribuidora */}
        <View style={styles.cardConfig}>
          <Text style={styles.labelSecao}>Distribuidora de Energia</Text>
          <View style={styles.rowGrid}>
            {["CPFL", "Enel", "Neoenergia", "EDP"].map((dist) => (
              <TouchableOpacity
                key={dist}
                style={[
                  styles.botaoMini,
                  distribuidora === dist && styles.botaoAtivo,
                  temItensCadastrados &&
                    distribuidora !== dist &&
                    styles.botaoDesativado,
                ]}
                onPress={() => setDistribuidora(dist)}
                disabled={temItensCadastrados}
              >
                <Text
                  style={[
                    styles.textoBotao,
                    distribuidora === dist && styles.textoAtivo,
                    temItensCadastrados &&
                      distribuidora !== dist &&
                      styles.textoDesativado,
                  ]}
                >
                  {dist}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f3f4f6" },
  content: {
    padding: 16,
    maxWidth: 450,
    width: "100%",
    alignSelf: "center",
    paddingBottom: 100,
  },
  cardConfig: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
  },
  labelSecao: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 12,
    textAlign: "center",
  },
  rowBotoes: { flexDirection: "row", justifyContent: "space-between" },
  rowGrid: {
    flexDirection: "row",
    justifyContent: "space-between",
    flexWrap: "wrap",
  },
  botaoOpcao: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  botaoMini: {
    width: "23%",
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 8,
  },
  botaoAtivo: { backgroundColor: "#2563eb", borderColor: "#2563eb" },
  textoBotao: { fontSize: 13, fontWeight: "600", color: "#4b5563" },
  textoAtivo: { color: "#fff" },

  alertaBloqueio: {
    backgroundColor: "#fff1f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 12,
    padding: 14,
    marginBottom: 16,
  },
  tituloAlertaBloqueio: {
    color: "#991b1b",
    fontWeight: "bold",
    fontSize: 13,
    marginBottom: 4,
    textAlign: "center",
  },
  textoAlertaBloqueio: {
    color: "#991b1b",
    fontSize: 11,
    lineHeight: 18,
    textAlign: "justify",
  },
  botaoDesativado: {
    backgroundColor: "#f3f4f6",
    borderColor: "#e5e7eb",
    opacity: 0.5,
  },
  textoDesativado: {
    color: "#9ca3af",
  },
});
