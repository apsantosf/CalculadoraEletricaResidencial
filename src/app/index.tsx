// src/app/index.tsx
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import CardResultado from "../components/ui/CardResultado";
import FormPrevisaoCarga from "../components/ui/FormPrevisaoCarga";
import SeletorBotoes from "../components/ui/SeletorBotoes";
import { useData } from "../context/DataContext";
import {
  calcularIluminacao,
  calcularPotenciaTugs,
  calcularQuantidadeTugs,
  dimensionarCircuito,
} from "../utils/calculations";

export default function TelaComodos() {
  const { tensaoGeral, setTensaoGeral, adicionarCircuitos } = useData();
  const [resultado, setResultado] = useState<any>(null);

  const handleCalcularComodo = (dados: {
    nome: string;
    area: number;
    perimetro: number;
    tipo: "social" | "servico";
  }) => {
    const potIluminacao = calcularIluminacao(dados.area);
    const qtdTugs = calcularQuantidadeTugs(dados.tipo, dados.perimetro);
    const potTugs = calcularPotenciaTugs(dados.tipo, qtdTugs);

    const circuitoIlum = dimensionarCircuito(
      potIluminacao,
      tensaoGeral,
      "iluminacao",
    );
    const circuitoTomadas = dimensionarCircuito(potTugs, tensaoGeral, "tomada");

    setResultado({
      nome: dados.nome,
      iluminacao: { potencia: potIluminacao, ...circuitoIlum },
      tomadas: { quantidade: qtdTugs, potencia: potTugs, ...circuitoTomadas },
    });

    adicionarCircuitos([
      {
        id: Math.random().toString(),
        nome: `${dados.nome} (Luz)`,
        tipo: "iluminacao",
        potenciaVA: potIluminacao,
      },
      {
        id: Math.random().toString(),
        nome: `${dados.nome} (TUG)`,
        tipo: "tug",
        potenciaVA: potTugs,
      },
    ]);
  };

  return (
    <View style={styles.wrapperWeb}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 80 }} // Garante que o conteúdo role para cima do menu inferior
        showsVerticalScrollIndicator={true} // Ativa visualmente a barra de rolagem
      >
        <View style={styles.cardConfig}>
          <SeletorBotoes
            label="Tensão Geral da Instalação"
            valorSelecionado={tensaoGeral}
            onSelecionar={(val) => setTensaoGeral(val)}
            opcoes={[
              { id: 127, label: "127 V" },
              { id: 220, label: "220 V" },
            ]}
          />
        </View>

        <FormPrevisaoCarga onCalcular={handleCalcularComodo} />

        {resultado && (
          <View style={styles.resultadoContainer}>
            <Text style={styles.txtFeedback}>
              ✅ Salvo no Quadro: {resultado.nome}
            </Text>
            <CardResultado
              titulo="💡 Iluminação"
              corBorda="#208AEF"
              items={[
                {
                  label: "Potência",
                  valor: `${resultado.iluminacao.potencia} VA`,
                },
                {
                  label: "Cabo Ideal",
                  valor: `${resultado.iluminacao.secaoCabo} mm²`,
                  corValor: "green",
                },
                {
                  label: "Disjuntor",
                  valor: `${resultado.iluminacao.disjuntor} A`,
                  corValor: "red",
                },
              ]}
            />
            <CardResultado
              titulo="🔌 Tomadas Gerais (TUG)"
              corBorda="#FF9500"
              items={[
                {
                  label: "Quantidade",
                  valor: `${resultado.tomadas.quantidade} pçs`,
                },
                {
                  label: "Potência",
                  valor: `${resultado.tomadas.potencia} VA`,
                },
                {
                  label: "Cabo Ideal",
                  valor: `${resultado.tomadas.secaoCabo} mm²`,
                  corValor: "green",
                },
                {
                  label: "Disjuntor",
                  valor: `${resultado.tomadas.disjuntor} A`,
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
    maxHeight: "100vh", // Limita a altura do contêiner pai na web
  },
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 16,
    maxWidth: 450,
    width: "100%",
    alignSelf: "center",
  },
  cardConfig: {
    backgroundColor: "#ffffff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
    elevation: 1,
  },
  resultadoContainer: { marginVertical: 10 },
  txtFeedback: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "bold",
    marginBottom: 8,
    marginLeft: 4,
  },
});
