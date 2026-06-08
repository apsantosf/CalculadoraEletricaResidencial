//  src/app/tue.tsx
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import CardResultado from "../components/ui/CardResultado";
import FormTue from "../components/ui/FormTue";
import { useData } from "../context/DataContext";
import { dimensionarTUE } from "../utils/calculations";

export default function TelaTues() {
  const { adicionarCircuitos, tokenReset, circuitos } = useData();
  const [resultadoTue, setResultadoTue] = useState<any>(null);

  // Filtra os TUEs já adicionados ao quadro
  const tuesCadastrados = circuitos.filter((c) => c.tipo === "tue");

  useEffect(() => {
    setResultadoTue(null);
  }, [tokenReset]);

  const handleCalcularTue = (dados: {
    nome: string;
    potencia: number;
    tensao: number;
  }) => {
    const fp = dados.nome.toLowerCase().includes("chuveiro") ? 1.0 : 0.85;
    const dimensionamento = dimensionarTUE(dados.potencia, dados.tensao, fp);

    setResultadoTue({
      nome: dados.nome,
      potencia: dados.potencia,
      tensao: dados.tensao,
      ...dimensionamento,
    });
  };

  const handleAdicionarTue = () => {
    if (!resultadoTue) return;

    adicionarCircuitos([
      {
        id: Math.random().toString(),
        nome: `${resultadoTue.nome} (${resultadoTue.potencia}W - ${resultadoTue.tensao}V)`,
        tipo: "tue",
        potenciaVA: resultadoTue.potenciaVA,
        potenciaWatts: resultadoTue.potencia,
        disjuntor: resultadoTue.disjuntor,
        // AQUI ESTÁ O SEGREDO: Adicionamos a bitola que já foi calculada!
        bitola: resultadoTue.secaoCabo,
      },
    ]);
    setResultadoTue(null);
  };

  return (
    <View style={styles.wrapperWeb}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <FormTue
          onCalcular={handleCalcularTue}
          onAdicionar={handleAdicionarTue}
          podeAdicionar={resultadoTue !== null}
        />

        {resultadoTue && (
          <View style={styles.resultadoContainer}>
            <Text style={styles.txtFeedback}>✅ Pronto para Adicionar!</Text>
            <CardResultado
              titulo={`⚡ Circuito Dedicado - ${resultadoTue.nome}`}
              corBorda="#7c3aed"
              items={[
                { label: "Potência", valor: `${resultadoTue.potenciaVA} VA` },
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

        {/* CONTADOR AQUI */}
        {tuesCadastrados.length > 0 && (
          <View style={styles.resumoContainer}>
            <Text style={styles.txtResumoTitulo}>
              Total de dispositivos cadastrados: {tuesCadastrados.length}
            </Text>
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
  resumoContainer: {
    marginTop: 14,
    padding: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
  },
  txtResumoTitulo: { fontSize: 14, fontWeight: "bold", color: "#374151" },
  txtFeedback: {
    fontSize: 14,
    color: "#7c3aed",
    fontWeight: "bold",
    marginBottom: 8,
    marginLeft: 4,
  },
});
