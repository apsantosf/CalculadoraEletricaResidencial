// src/app/tue.tsx
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
  const [count, setCount] = useState(0);

  // Escuta o reset do quadro para apagar os cards de resultado locais automaticamente
  useEffect(() => {
    setResultadoTue(null);
    setCount(0);
  }, [tokenReset]);

  const handleCalcularTue = (dados: {
    nome: string;
    potencia: number;
    tensao: number;
  }) => {
    const dimensionamento = dimensionarTUE(dados.potencia, dados.tensao, 0.85);

    setResultadoTue({
      nome: dados.nome,
      watts: dados.potencia,
      tensao: dados.tensao,
      ...dimensionamento,
    });
  };

  const handleAdicionarTue = (dados: {
    nome: string;
    potencia: number;
    tensao: number;
  }) => {
    // 1. Calcula antes de salvar (garante os valores)
    const dimensionamento = dimensionarTUE(dados.potencia, dados.tensao, 0.85);

    // 2. Adiciona ao contexto
    adicionarCircuitos([
      {
        id: Math.random().toString(),
        nome: `${dados.nome} (${dados.potencia}W - ${dados.tensao}V)`,
        tipo: "tue",
        potenciaVA: dimensionamento.potenciaVA,
        potenciaWatts: dados.potencia,
      },
    ]);

    // 3. Atualiza contador e limpa a tela
    setCount((prev) => prev + 1);
    setResultadoTue(null);
  };

  return (
    <View style={styles.wrapperWeb}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={true}
      >
        <FormTue
          onCalcular={handleCalcularTue}
          onAdicionar={handleAdicionarTue}
        />

        <View style={styles.containerContador}>
          <Text style={styles.txtMemoria}>
            Equipamentos na Memória do Quadro
          </Text>
          <Text style={styles.txtTotal}>
            Total cadastrado: {count} equipamento(s)
          </Text>
        </View>

        {resultadoTue && (
          <View style={styles.resultadoContainer}>
            <Text style={styles.txtFeedback}>
              ✅ Pronto para adicionar: {resultadoTue.nome}
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
  containerContador: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  txtMemoria: { fontSize: 14, color: "#4b5563" },
  txtTotal: { fontSize: 16, fontWeight: "bold", color: "#2563eb" },
  resultadoContainer: { marginVertical: 10 },
  txtFeedback: {
    fontSize: 14,
    color: "#7c3aed",
    fontWeight: "bold",
    marginBottom: 8,
    marginLeft: 4,
  },
});
