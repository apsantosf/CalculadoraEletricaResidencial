// src/app/index.tsx
import { useEffect, useState } from "react";
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
  const {
    tensaoGeral,
    setTensaoGeral,
    adicionarCircuitos,
    circuitos,
    tokenReset,
  } = useData();
  const [resultado, setResultado] = useState<any>(null);

  useEffect(() => {
    setResultado(null);
  }, [tokenReset]);

  // Filtra apenas circuitos de cômodos para o contador
  const totalComodos =
    circuitos.filter((c) => c.tipo === "iluminacao" || c.tipo === "tug")
      .length / 2;

  const handleCalcular = (dados: any) => {
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
      ...dados,
      iluminacao: { potencia: potIluminacao, ...circuitoIlum },
      tomadas: { quantidade: qtdTugs, potencia: potTugs, ...circuitoTomadas },
    });
  };

  const handleAdicionar = (dados: any) => {
    adicionarCircuitos([
      {
        id: Math.random().toString(),
        nome: `${dados.nome} (Luz)`,
        tipo: "iluminacao",
        potenciaVA: dados.potenciaIlum,
      },
      {
        id: Math.random().toString(),
        nome: `${dados.nome} (TUG)`,
        tipo: "tug",
        potenciaVA: dados.potenciaTugs,
        detalhe: `(${dados.qtdTugs} tomadas)`,
      },
    ]);
    setResultado(null);
  };

  return (
    <View style={styles.wrapperWeb}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 80 }}
      >
        <View style={styles.cardConfig}>
          <SeletorBotoes
            label="Tensão Geral"
            valorSelecionado={tensaoGeral}
            onSelecionar={setTensaoGeral}
            opcoes={[
              { id: 127, label: "127 V" },
              { id: 220, label: "220 V" },
            ]}
          />
        </View>

        <FormPrevisaoCarga
          onCalcular={handleCalcular}
          onAdicionar={handleAdicionar}
        />

        {resultado && (
          <View style={styles.resultadoContainer}>
            <Text style={styles.txtFeedback}>
              ✅ Pronto para adicionar: {resultado.nome}
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
                  label: "Cabo",
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
              titulo="🔌 Tomadas (TUG)"
              corBorda="#FF9500"
              items={[
                {
                  label: "Qtd. Tomadas",
                  valor: `${resultado.tomadas.quantidade}`,
                },
                {
                  label: "Potência",
                  valor: `${resultado.tomadas.potencia} VA`,
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

        <View style={styles.resumoContainer}>
          <Text style={styles.txtResumoTitulo}>🏠 Cômodos na Memória</Text>
          <Text style={styles.txtResumoSub}>
            Total cadastrado: {totalComodos} cômodo(s)
          </Text>
        </View>
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
  cardNorma: {
    backgroundColor: "#e0f2fe",
    padding: 12,
    borderRadius: 12,
    borderLeftWidth: 5,
    borderLeftColor: "#208AEF",
    marginBottom: 14,
    alignItems: "center",
  },
  txtNormaMain: { fontSize: 13, color: "#0369a1", fontWeight: "600" },
  txtNormaDestaque: {
    fontSize: 18,
    color: "#0284c7",
    fontWeight: "bold",
    marginVertical: 2,
  },
  txtNormaSub: { fontSize: 11, color: "#0c4a6e", fontWeight: "400" },
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
  resumoContainer: {
    marginTop: 14,
    padding: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
    marginBottom: 10,
  },
  txtResumoTitulo: { fontSize: 14, fontWeight: "bold", color: "#374151" },
  txtResumoSub: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  containerRodape: {
    width: "100%",
    maxWidth: 450,
    alignSelf: "center",
    backgroundColor: "#ffffff", // Mudado para branco para destacar a barra do rodapé
    paddingVertical: 10,
    paddingBottom: 25, // Adicionado espaço para não cobrir com o menu de abas
    borderTopWidth: 1,
    borderTopColor: "#e5e7eb",
  },
  txtVersaoApp: {
    fontSize: 12, // Aumentado levemente o tamanho
    color: "#4b5563", // Cor alterada para cinza escuro de fácil leitura
    textAlign: "center",
    fontWeight: "700", // Deixado em negrito sutil para destacar
  },
});
