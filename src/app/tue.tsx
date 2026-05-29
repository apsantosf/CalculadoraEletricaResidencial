// src/app/tue.tsx
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import CardResultado from "../components/ui/CardResultado";
import FormTue from "../components/ui/FormTue";
import { useData } from "../context/DataContext";
import { dimensionarTUE } from "../utils/calculations";

export default function TelaTues() {
  const { adicionarCircuitos, tokenReset } = useData();
  const [resultadoTue, setResultadoTue] = useState<any>(null);

  // Escuta o reset do quadro para apagar os cards de resultado locais automaticamente
  useEffect(() => {
    setResultadoTue(null);
  }, [tokenReset]);

  const handleCalcularTue = (dados: {
    watts: number;
    tipo: "chuveiro" | "arConditioned";
    tensao: 127 | 220;
  }) => {
    const fp = dados.tipo === "chuveiro" ? 1.0 : 0.85;
    const dimensionamento = dimensionarTUE(dados.watts, dados.tensao, fp);
    const nomeEquipamento =
      dados.tipo === "chuveiro" ? "Chuveiro" : "Ar-Condicionado";

    setResultadoTue({
      nome: nomeEquipamento,
      watts: dados.watts,
      tensao: dados.tensao,
      ...dimensionamento,
    });

    adicionarCircuitos([
      {
        id: Math.random().toString(),
        nome: `${nomeEquipamento} (${dados.watts}W - ${dados.tensao}V)`,
        tipo: "tue",
        potenciaVA: dimensionamento.potenciaVA,
        potenciaWatts: dados.watts,
      },
    ]);
  };

  return (
    <View style={styles.wrapperWeb}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={true}
      >
        <FormTue onCalcular={handleCalcularTue} />

        {resultadoTue && (
          <View style={styles.resultadoContainer}>
            <Text style={styles.txtFeedback}>
              ✅ Salvo no Quadro: {resultadoTue.nome}
            </Text>
            <CardResultado
              titulo={`⚡ Circuito Dedicado - ${resultadoTue.nome} (${resultadoTue.tensao}V)`}
              corBorda="#7c3aed"
              items={[
                {
                  label: "Potência em VA",
                  valor: `${resultadoTue.potenciaVA} VA`,
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
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapperWeb: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    width: "100%",
    maxHeight: "100vh",
  },
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
});
