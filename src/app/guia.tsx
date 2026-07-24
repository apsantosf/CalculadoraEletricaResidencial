// src/app/telaGuia.tsx
import { FontAwesome5 } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import CustomHeader from "../components/ui/CustomHeader";
import { useData } from "../context/DataContext";
import {
  calcularAlimentadorGeral,
  obterFatorDemandaGeral,
} from "../utils/calculations";

const CHAVE_PROTECAO = "@EletricaResidencial_Protecao";
const CHAVE_RESERVA = "@EletricaResidencial_ReservaAplicada";

export default function TelaGuia() {
  const router = useRouter();
  const { comodos, tensaoGeral, distribuidora } = useData();

  const [protecaoSalva, setProtecaoSalva] = useState<any>(null);
  const [reservaAplicada, setReservaAplicada] = useState(false);

  // 💡 LÓGICA NOVA: O Guia agora lê a inteligência exata do Quadro
  useFocusEffect(
    useCallback(() => {
      const carregarDadosGlobais = async () => {
        const protecao = await AsyncStorage.getItem(CHAVE_PROTECAO);
        const reserva = await AsyncStorage.getItem(CHAVE_RESERVA);

        if (protecao) setProtecaoSalva(JSON.parse(protecao));
        else setProtecaoSalva(null);

        setReservaAplicada(reserva === "true");
      };
      carregarDadosGlobais();
    }, []),
  );

  const projetoTemDados = comodos && comodos.length > 0;
  const voltagem = tensaoGeral || 220;

  let disjuntorGeralCalculado = 0;
  let idrRecomendado = 0;
  let dpsRecomendado = 2;
  let tipoIdr = "Bipolar";

  if (projetoTemDados) {
    // Se o Quadro já calculou e salvou, nós apenas espelhamos com precisão máxima
    if (protecaoSalva) {
      disjuntorGeralCalculado = protecaoSalva.disjQDC?.amp || 0;
      idrRecomendado = protecaoSalva.idr?.amp || 0;
      tipoIdr =
        protecaoSalva.idr?.id === "idr_tetrapolar" ? "Tetrapolar" : "Bipolar";
      dpsRecomendado = protecaoSalva.dps?.qtd || 2;
    } else {
      // Fallback de segurança: Caso o usuário não tenha passado pela aba Quadro ainda
      let somaIlumTugVA = 0;
      let listaVATue: number[] = [];
      const fatorMultiplicador = reservaAplicada ? 1.3 : 1.0; // 💡 Agora considera a reserva

      comodos.forEach((c) => {
        c.dispositivos.forEach((d) => {
          let potOriginalVA = d.potencia * d.quantidade;
          if (d.tipo === "tue") {
            const fp = d.nome.toLowerCase().includes("chuveiro") ? 1.0 : 0.85;
            potOriginalVA = potOriginalVA / fp;
          }
          const potComReserva = potOriginalVA * fatorMultiplicador;

          if (d.tipo === "tue") listaVATue.push(potComReserva);
          else somaIlumTugVA += potComReserva;
        });
      });

      let fatorTue = 1.0;
      if (listaVATue.length === 2) fatorTue = 0.9;
      else if (listaVATue.length >= 3 && listaVATue.length <= 5) fatorTue = 0.8;
      else if (listaVATue.length >= 6) fatorTue = 0.7;
      const tuesComDemanda = listaVATue.map((pot) =>
        Math.round(pot * fatorTue),
      );

      const demandaIlumTug = Math.round(
        somaIlumTugVA * obterFatorDemandaGeral(Math.round(somaIlumTugVA)),
      );

      const resultadoQDC = calcularAlimentadorGeral({
        potenciaIlumTugVA: Math.round(somaIlumTugVA),
        potenciasTueWatts: listaVATue.map(Math.round),
        tensao: tensaoGeral,
        forcarTrifasico: false,
      });

      const resultadoDemanda = calcularAlimentadorGeral({
        potenciaIlumTugVA: demandaIlumTug,
        potenciasTueWatts: tuesComDemanda,
        tensao: tensaoGeral,
        forcarTrifasico: resultadoQDC?.ehTrifasico || false,
      });

      disjuntorGeralCalculado = resultadoDemanda?.disjuntorGeral || 0;
      const idrsComerciais = [25, 40, 63, 80, 100, 125];
      idrRecomendado =
        idrsComerciais.find((idr) => idr >= disjuntorGeralCalculado) ||
        disjuntorGeralCalculado;
      tipoIdr = resultadoQDC?.ehTrifasico ? "Tetrapolar" : "Bipolar";
      dpsRecomendado = resultadoQDC?.ehTrifasico
        ? 4
        : tensaoGeral === 220
          ? 3
          : 2;
    }
  }

  return (
    <View style={styles.wrapperWeb}>
      <CustomHeader title="Guia Prático" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 140 }}
      >
        <Text style={styles.subtitle}>
          Soluções de campo para o eletricista
        </Text>

        {projetoTemDados && disjuntorGeralCalculado > 0 ? (
          <View style={styles.smartCard}>
            <Text style={styles.cardTitle}>
              Recomendação Base ({voltagem}V)
            </Text>
            <Text style={styles.cardText}>
              Disjuntor Padrão ({distribuidora || "CPFL"}):{" "}
              <Text style={styles.bold}>{disjuntorGeralCalculado}A</Text>
            </Text>
            <Text style={styles.cardText}>
              IDR Recomendado:{" "}
              <Text style={styles.bold}>
                ≥ {idrRecomendado}A ({tipoIdr})
              </Text>
            </Text>
            <Text style={styles.cardText}>
              DPS Recomendado:{" "}
              <Text style={styles.bold}>
                {dpsRecomendado}x {voltagem <= 127 ? "175V" : "275V"} (Classe
                II)
              </Text>
            </Text>
          </View>
        ) : (
          <View style={styles.warningCard}>
            <FontAwesome5
              name="info-circle"
              size={20}
              color="#856404"
              style={{ marginRight: 10 }}
            />
            <Text style={styles.warningText}>
              Adicione os ambientes na aba "Cômodos" e dimensione a
              "Alimentação" na aba "Quadro" para ver as recomendações de IDR e
              DPS.
            </Text>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Situações do Dia a Dia</Text>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => router.push("/idr")}
          >
            <View style={styles.iconBoxYellow}>
              <FontAwesome5
                name="exclamation-triangle"
                size={14}
                color="#fff"
              />
            </View>
            <Text style={styles.menuButtonText}>
              IDR em instalações sem Fio Terra
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => router.push("/dps")}
          >
            <View style={styles.iconBoxRed}>
              <FontAwesome5 name="bolt" size={16} color="#fff" />
            </View>
            <Text style={styles.menuButtonText}>
              DPS sem Aterramento: Alerta Crítico
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => router.push("/retrofit")}
          >
            <View style={styles.iconBoxBlue}>
              <FontAwesome5 name="tools" size={16} color="#fff" />
            </View>
            <Text style={styles.menuButtonText}>
              Retrofit: Modernizando Quadro de Madeira
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.menuButton}
            onPress={() => router.push("/galeria")}
          >
            <View style={[styles.iconBoxBlue, { backgroundColor: "#8b5cf6" }]}>
              <FontAwesome5 name="images" size={14} color="#fff" />
            </View>
            <Text style={styles.menuButtonText}>
              Padrões de Montagem: Galeria de Quadros
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapperWeb: { flex: 1, backgroundColor: "#f3f4f6", width: "100%" },
  container: {
    flex: 1,
    padding: 16,
    maxWidth: 450,
    width: "100%",
    alignSelf: "center",
  },
  subtitle: { fontSize: 14, color: "#6b7280", marginBottom: 20 },
  smartCard: {
    backgroundColor: "#e0f2fe",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#bae6fd",
  },
  warningCard: {
    backgroundColor: "#fef3c7",
    padding: 16,
    borderRadius: 12,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#fde68a",
    flexDirection: "row",
    alignItems: "center",
  },
  warningText: { color: "#856404", fontSize: 14, flex: 1 },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#0369a1",
    marginBottom: 8,
  },
  cardText: { fontSize: 14, color: "#374151", marginBottom: 4 },
  bold: { fontWeight: "bold" },
  section: { marginTop: 10 },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 16,
  },
  menuButton: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    flexDirection: "row",
    alignItems: "center",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  iconBoxRed: {
    backgroundColor: "#ef4444",
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconBoxBlue: {
    backgroundColor: "#208AEF",
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  iconBoxYellow: {
    backgroundColor: "#f59e0b",
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuButtonText: {
    fontSize: 15,
    color: "#374151",
    fontWeight: "600",
    flex: 1,
  },
});
