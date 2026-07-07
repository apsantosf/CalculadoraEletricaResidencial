// src/app/tue.tsx
import { useEffect, useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CardResultado from "../components/ui/CardResultado";
import CustomHeader from "../components/ui/CustomHeader";
import FormTue from "../components/ui/FormTue";
import { useData } from "../context/DataContext";
import { dimensionarTUE } from "../utils/calculations";

const obterDimensionamentoCircuito = (
  tipo: string,
  potenciaTotal: number,
  tensao: number,
) => {
  const corrente = potenciaTotal / tensao;
  if (tipo === "iluminacao") return { cabo: "1.5", disj: 10 };
  if (tipo === "tug") return { cabo: "2.5", disj: corrente > 16 ? 20 : 16 };

  const disjuntores = [10, 16, 20, 25, 32, 40, 50, 63, 80, 100];
  let disj = disjuntores.find((d) => d >= corrente) || 100;
  let cabo = "2.5";
  if (disj > 20 && disj <= 25) cabo = "4";
  else if (disj > 25 && disj <= 32) cabo = "6";
  else if (disj > 32 && disj <= 40) cabo = "10";
  else if (disj > 40 && disj <= 50) cabo = "10";
  else if (disj > 50 && disj <= 63) cabo = "16";
  else if (disj > 63) cabo = "25";

  return { cabo, disj };
};

export default function TelaTues() {
  const { adicionarComodo, removerComodo, tokenReset, comodos, tensaoGeral } =
    useData();
  const [resultadoTue, setResultadoTue] = useState<any>(null);

  const tuesCadastrados = comodos
    ? comodos.flatMap((c) => c.dispositivos).filter((d) => d.tipo === "tue")
    : [];

  useEffect(() => {
    setResultadoTue(null);
  }, [tokenReset]);

  const handleCalcularTue = (dados: { nome: string; potencia: number }) => {
    const fp = dados.nome.toLowerCase().includes("chuveiro") ? 1.0 : 0.85;
    const dimensionamento = dimensionarTUE(dados.potencia, tensaoGeral, fp);

    setResultadoTue({
      nome: dados.nome,
      potencia: dados.potencia,
      tensao: tensaoGeral,
      ...dimensionamento,
    });
  };

  const handleAdicionarTue = () => {
    if (!resultadoTue) return;

    adicionarComodo({
      id: Math.random().toString(),
      nome: `Circuito Dedicado: ${resultadoTue.nome}`,
      area: 0,
      perimetro: 0,
      dispositivos: [
        {
          id: Math.random().toString(),
          nome: resultadoTue.nome,
          tipo: "tue",
          potencia: resultadoTue.potencia,
          unidade: "W",
          quantidade: 1,
        },
      ],
    });
    setResultadoTue(null);
  };

  // 💡 FUNÇÃO DE ALERTA ANTES DE DELETAR O TUE
  const handleRemoverComodoAlerta = (comodoId: string, nomeComodo: string) => {
    if (Platform.OS === "web") {
      if (window.confirm(`Tem certeza que vai excluir "${nomeComodo}"?`))
        removerComodo(comodoId);
    } else {
      Alert.alert("Excluir", `Tem certeza que vai excluir "${nomeComodo}"?`, [
        { text: "Não", style: "cancel" },
        {
          text: "Sim",
          style: "destructive",
          onPress: () => removerComodo(comodoId),
        },
      ]);
    }
  };

  const tensaoNaoDefinida = tensaoGeral !== 127 && tensaoGeral !== 220;

  const tuesOrdenados = comodos
    ? [...comodos]
        .filter((c) => c.dispositivos.some((d) => d.tipo === "tue"))
        .sort((a, b) => a.nome.localeCompare(b.nome))
    : [];

  return (
    <View style={styles.wrapperWeb}>
      <CustomHeader title="Circuitos Específicos" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 140 }}
        keyboardShouldPersistTaps="handled"
      >
        {tensaoNaoDefinida ? (
          <View style={styles.avisoBloqueioContainer}>
            <Text style={styles.avisoBloqueioTitulo}>⚠️ Acesso Bloqueado</Text>
            <Text style={styles.avisoBloqueioTexto}>
              Para preencher os Circuitos Específicos (TUEs), primeiro deve
              voltar à aba de **Início** e selecionar a **Tensão de Trabalho
              Interna**.
            </Text>
          </View>
        ) : (
          <>
            <FormTue
              onCalcular={handleCalcularTue}
              onAdicionar={handleAdicionarTue}
              podeAdicionar={resultadoTue !== null}
            />

            {resultadoTue && (
              <View style={styles.resultadoContainer}>
                <Text style={styles.txtFeedback}>
                  ✅ Pronto para Adicionar!
                </Text>
                <CardResultado
                  titulo={`⚡ Circuito Dedicado - ${resultadoTue.nome}`}
                  corBorda="#7c3aed"
                  items={[
                    {
                      label: "Potência",
                      valor: `${resultadoTue.potencia} W`,
                    },
                    {
                      label: "Corrente",
                      valor: `${resultadoTue.correnteProjeto} A`,
                    },
                    {
                      label: "Cabo Ideal",
                      valor: `${resultadoTue.secaoCabo} mm²`,
                      corValor: "green",
                    },
                    {
                      label: "Disjuntor",
                      valor: `${resultadoTue.disjuntor} A`,
                      corValor: "red",
                    },
                  ]}
                />
              </View>
            )}

            <Text style={styles.tituloLista}>📋 Relação de Cômodos e TUEs</Text>
            {tuesOrdenados.length === 0 && (
              <Text
                style={{ textAlign: "center", color: "#6b7280", marginTop: 20 }}
              >
                Nenhum circuito específico adicionado ainda.
              </Text>
            )}

            {tuesOrdenados.map((comodo: any) => (
              <View key={comodo.id} style={styles.cardComodoItem}>
                <View style={styles.headerComodo}>
                  <Text style={styles.nomeComodo}>{comodo.nome}</Text>
                  {/* 💡 TROCADA A CHAMADA DIRETA PARA O ALERTA */}
                  <TouchableOpacity
                    onPress={() =>
                      handleRemoverComodoAlerta(comodo.id, comodo.nome)
                    }
                  >
                    <Text style={styles.botaoRemover}>❌</Text>
                  </TouchableOpacity>
                </View>
                {comodo.dispositivos.map((disp: any) => {
                  const potTotal = disp.potencia * disp.quantidade;
                  const dim = obterDimensionamentoCircuito(
                    disp.tipo,
                    potTotal,
                    tensaoGeral,
                  );
                  return (
                    <Text key={disp.id} style={styles.textoDispositivo}>
                      ↳ {disp.quantidade}x {disp.nome} ({potTotal}{" "}
                      {disp.unidade})
                      <Text style={{ color: "#059669", fontWeight: "bold" }}>
                        {" "}
                        | Fio {dim.cabo}mm²
                      </Text>
                      <Text style={{ color: "#dc2626", fontWeight: "bold" }}>
                        {" "}
                        - Disj. {dim.disj}A
                      </Text>
                    </Text>
                  );
                })}
              </View>
            ))}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapperWeb: { flex: 1, backgroundColor: "#f3f4f6" },
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 16,
    maxWidth: 450,
    width: "100%",
    alignSelf: "center",
  },
  resultadoContainer: { marginVertical: 10 },
  txtFeedback: {
    fontSize: 14,
    color: "#7c3aed",
    fontWeight: "bold",
    marginBottom: 8,
    marginLeft: 4,
  },
  avisoBloqueioContainer: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
  },
  avisoBloqueioTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  avisoBloqueioTexto: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 20,
  },
  tituloLista: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 10,
    marginTop: 20,
  },
  cardComodoItem: {
    backgroundColor: "#fff",
    padding: 14,
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  headerComodo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  nomeComodo: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#374151",
    flexShrink: 1,
  },
  botaoRemover: { fontSize: 14, paddingLeft: 10, paddingVertical: 5 },
  textoDispositivo: {
    fontSize: 13,
    color: "#6b7280",
    marginTop: 4,
  },
});
