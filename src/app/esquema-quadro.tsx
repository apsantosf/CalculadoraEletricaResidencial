// src/app/esquema-quadro.tsx
import { FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CustomHeader from "../components/ui/CustomHeader";
import ModuloDisjuntor from "../components/ui/ModuloDisjuntor";
import { useData } from "../context/DataContext";
import {
  calcularAlimentadorGeral,
  obterDimensionamentoCircuito,
} from "../utils/calculations";

export default function TelaEsquemaQuadro() {
  const { comodos, tensaoGeral } = useData();

  // 1. Extrair e calcular todos os dados a partir de "comodos"
  let somaIlumTugVA = 0;
  let listaWattsTue: number[] = [];
  let todosDispositivos: any[] = [];

  (comodos || []).forEach((c) => {
    (c.dispositivos || []).forEach((d) => {
      let potTotal = d.potencia * d.quantidade;
      let potVA = potTotal;

      if (d.tipo === "tue") {
        const fp = d.nome.toLowerCase().includes("chuveiro") ? 1.0 : 0.85;
        potVA = potTotal / fp;
        listaWattsTue.push(Math.round(potVA));
      } else {
        somaIlumTugVA += potVA;
      }

      const dim = obterDimensionamentoCircuito(d.tipo, potVA, tensaoGeral);

      // 🚀 LÓGICA DE POLOS E TENSÃO
      let qtdPolos = 1; // Padrão: Monopolar
      const tensaoDispositivo = d.tensao || tensaoGeral;

      if (tensaoGeral === 127 && tensaoDispositivo === 220) {
        qtdPolos = 2; // Bipolar
      } else if (tensaoGeral === 220 && tensaoDispositivo === 380) {
        qtdPolos = 2;
      }

      todosDispositivos.push({
        id: Math.random().toString(),
        nome: d.nome,
        tipo: d.tipo,
        comodo: c.nome,
        disjuntor: dim.disj,
        tensao: tensaoDispositivo,
        polos: qtdPolos,
      });
    });
  });

  // 2. Calcula o disjuntor geral com base nas cargas
  const resultadoGeral = calcularAlimentadorGeral({
    potenciaIlumTugVA: Math.round(somaIlumTugVA),
    potenciasTueWatts: listaWattsTue,
    tensao: tensaoGeral,
  });

  // 3. Determina o tamanho visual do Disjuntor Geral / IDR
  const potenciaTotalBruta =
    somaIlumTugVA + listaWattsTue.reduce((a, b) => a + b, 0);
  let polosGeral = 1;
  if (resultadoGeral?.ehTrifasico || potenciaTotalBruta > 25000) {
    polosGeral = 3;
  } else if (potenciaTotalBruta > 12000) {
    polosGeral = 2;
  }

  return (
    <View style={styles.wrapperWeb}>
      <CustomHeader title="Esquema Visual do QDC" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 140, paddingTop: 16 }}
      >
        {/* ⬅️ BOTÃO DE VOLTAR AO QUADRO GERAL */}
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => router.replace("/quadro" as any)}
        >
          <FontAwesome5 name="arrow-left" size={14} color="#475569" />
          <Text style={styles.textoBotaoVoltar}>Voltar ao Quadro Geral</Text>
        </TouchableOpacity>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>
            ⚡ Representação Esquemática do QDC
          </Text>
          <Text style={styles.infoText}>
            Esta vista simula o arranjo físico em trilho DIN dos dispositivos de
            proteção. A largura dos disjuntores ajusta-se automaticamente
            (Monopolar, Bipolar ou Tripolar) de acordo com a tensão e a carga.
          </Text>
        </View>

        {/* TRILHO 1: PROTEÇÃO DE ENTRADA E GERAL */}
        <Text style={styles.trilhoTitulo}>
          Trilho 1: Entrada e Proteção Geral
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trilhoScrollContainer}
        >
          <View style={styles.trilhoBoxUnicaLinha}>
            <ModuloDisjuntor
              tipo="dps"
              rotulo="DPS Classe II"
              detalhe="Surto"
              tensao={tensaoGeral}
              poleLargura={1}
            />
            <ModuloDisjuntor
              tipo="geral"
              rotulo="Disjuntor Geral"
              detalhe={
                polosGeral === 3
                  ? "Tripolar"
                  : polosGeral === 2
                    ? "Bipolar"
                    : "Monopolar"
              }
              corrente={resultadoGeral?.disjuntorGeral || 63}
              tensao={tensaoGeral}
              poleLargura={polosGeral}
            />
            <ModuloDisjuntor
              tipo="idr"
              rotulo="Diretor da IDR"
              detalhe="30mA"
              corrente={resultadoGeral?.disjuntorGeral || 63}
              tensao={tensaoGeral}
              poleLargura={polosGeral === 3 ? 4 : 2}
            />
          </View>
        </ScrollView>

        {/* TRILHO 2 EM DIANTE: CIRCUITOS TERMINAIS */}
        <Text style={styles.trilhoTitulo}>
          Trilho 2+: Circuitos Terminais (Cômodos e Cargas)
        </Text>
        <View style={styles.trilhoBoxGrid}>
          {todosDispositivos.length > 0 ? (
            todosDispositivos.map((disp, index) => (
              <ModuloDisjuntor
                key={index}
                tipo={disp.tipo}
                rotulo={disp.nome}
                detalhe={disp.comodo}
                corrente={disp.disjuntor}
                tensao={disp.tensao}
                poleLargura={disp.polos}
              />
            ))
          ) : (
            <Text style={styles.avisoVazio}>
              Nenhum circuito cadastrado no quadro.
            </Text>
          )}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapperWeb: { flex: 1, backgroundColor: "#f3f4f6" },
  container: {
    flex: 1,
    padding: 16,
    maxWidth: 600,
    width: "100%",
    alignSelf: "center",
  },
  // 🚀 Estilos do Botão de Voltar adicionados
  botaoVoltar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e2e8f0",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  textoBotaoVoltar: {
    color: "#475569",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 14,
  },
  infoCard: {
    backgroundColor: "#EFF6FF",
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#BFDBFE",
    marginBottom: 20,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1E3A8A",
    marginBottom: 4,
  },
  infoText: { fontSize: 13, color: "#1E40AF", lineHeight: 18 },
  trilhoTitulo: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
    marginTop: 12,
  },
  trilhoScrollContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  trilhoBoxUnicaLinha: {
    flexDirection: "row",
    flexWrap: "nowrap",
    alignItems: "center",
    backgroundColor: "#E5E7EB",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  trilhoBoxGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    backgroundColor: "#E5E7EB",
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#D1D5DB",
  },
  avisoVazio: {
    textAlign: "center",
    color: "#6B7280",
    padding: 20,
    width: "100%",
  },
});
