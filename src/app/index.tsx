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

  // Limpa o card de resultado local caso ocorra um reset no projeto
  useEffect(() => {
    setResultado(null);
  }, [tokenReset]);

  const comodosAdicionados = circuitos.filter(
    (c) => c.tipo === "iluminacao" || c.tipo === "tug",
  );

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

    const nomeFinal =
      dados.nome || `Cômodo ${comodosAdicionados.length / 2 + 1}`;

    setResultado({
      nome: nomeFinal,
      tipo: dados.tipo,
      perimetro: dados.perimetro,
      iluminacao: { potencia: potIluminacao, ...circuitoIlum },
      tomadas: { quantidade: qtdTugs, potencia: potTugs, ...circuitoTomadas },
    });

    adicionarCircuitos([
      {
        id: Math.random().toString(),
        nome: `${nomeFinal} (Luz)`,
        tipo: "iluminacao",
        potenciaVA: potIluminacao,
      },
      {
        id: Math.random().toString(),
        nome: `${nomeFinal} (TUG)`,
        tipo: "tug",
        potenciaVA: potTugs,
        detalhe: `(${qtdTugs} tomadas)`, // 👈 Passando a quantidade de tomadas detalhada!
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
        {/* Identificação Didática da Norma Técnica */}
        <View style={styles.cardNorma}>
          <Text style={styles.txtNormaMain}>
            Dimensionamento Baseado na Norma
          </Text>
          <Text style={styles.txtNormaDestaque}>NBR 5410:2004</Text>
          <Text style={styles.txtNormaSub}>
            Instalações Elétricas de Baixa Tensão
          </Text>
        </View>

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
                  label: "Potência Mínima Exigida",
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
                  label: "Mínimo Obrigatório por Norma",
                  valor: `${resultado.tomadas.quantidade} tomada(s)`,
                },
                {
                  label: "Critério de Fração Aplicado",
                  valor:
                    resultado.tipo === "servico"
                      ? `1 tomada a cada 3,5m de perímetro (${resultado.perimetro}m)`
                      : `1 tomada a cada 5,0m de perímetro (${resultado.perimetro}m)`,
                },
                {
                  label: "Potência de Carga do Circuito",
                  valor: `${resultado.tomadas.potencia} VA`,
                },
                {
                  label: "Cabo Mínimo da Linha",
                  valor: `${resultado.tomadas.secaoCabo} mm²`,
                  corValor: "green",
                },
                {
                  label: "Disjuntor de Proteção",
                  valor: `${resultado.tomadas.disjuntor} A`,
                  corValor: "red",
                },
              ]}
            />
          </View>
        )}

        {comodosAdicionados.length > 0 && (
          <View style={styles.resumoContainer}>
            <Text style={styles.txtResumoTitulo}>
              🏠 Cômodos na Memória do Quadro
            </Text>
            <Text style={styles.txtResumoSub}>
              Total cadastrado: {comodosAdicionados.length / 2} cômodo(s)
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
  },
  txtResumoTitulo: { fontSize: 14, fontWeight: "bold", color: "#374151" },
  txtResumoSub: { fontSize: 12, color: "#6b7280", marginTop: 2 },
});
