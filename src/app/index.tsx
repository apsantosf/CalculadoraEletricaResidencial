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
  const { tensaoGeral, setTensaoGeral, adicionarCircuitos, circuitos } =
    useData();
  const [resultado, setResultado] = useState<any>(null);

  // Filtra apenas o tipo iluminação para contar cômodos corretamente
  const totalComodos = circuitos.filter((c) => c.tipo === "iluminacao").length;

  const handleCalcularOficial = (dados: any) => {
    const potIluminacao = calcularIluminacao(dados.area);
    const qtdTugs = calcularQuantidadeTugs(dados.tipo, dados.perimetro);
    const potTugs = calcularPotenciaTugs(dados.tipo, qtdTugs);
    const circIlum = dimensionarCircuito(
      potIluminacao,
      tensaoGeral,
      "iluminacao",
    );
    const circTug = dimensionarCircuito(potTugs, tensaoGeral, "tomada");

    setResultado({
      nome: dados.nome || "Cômodo",
      iluminacao: { potencia: potIluminacao, ...circIlum },
      tomadas: { quantidade: qtdTugs, potencia: potTugs, ...circTug },
    });
  };

  const handleAdicionarAoQuadro = (dados: any) => {
    const potIluminacao = calcularIluminacao(dados.area);
    const qtdTugs = calcularQuantidadeTugs(dados.tipo, dados.perimetro);
    const potTugs = calcularPotenciaTugs(dados.tipo, qtdTugs);

    const circIlum = dimensionarCircuito(
      potIluminacao,
      tensaoGeral,
      "iluminacao",
    );
    const circTug = dimensionarCircuito(potTugs, tensaoGeral, "tomada");

    adicionarCircuitos([
      {
        id: Math.random().toString(),
        nome: `${dados.nome} (Luz)`,
        tipo: "iluminacao",
        potenciaVA: potIluminacao,
        disjuntor: circIlum.disjuntor,
      },
      {
        id: Math.random().toString(),
        nome: `${dados.nome} (TUG)`,
        tipo: "tug",
        potenciaVA: potTugs,
        detalhe: `${qtdTugs} tomadas`,
        disjuntor: circTug.disjuntor,
      },
    ]);
    setResultado(null);
  };

  return (
    <View style={styles.wrapperWeb}>
      <ScrollView style={styles.container}>
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
          onCalcular={handleCalcularOficial}
          onAdicionar={handleAdicionarAoQuadro}
        />

        {resultado && (
          <View style={styles.resultadoContainer}>
            <Text style={styles.txtFeedback}>✅ {resultado.nome}</Text>
            <CardResultado
              titulo="💡 Iluminação"
              corBorda="#208AEF"
              items={[
                {
                  label: "Potência",
                  valor: `${resultado.iluminacao.potencia} VA`,
                },
              ]}
            />
            <CardResultado
              titulo="🔌 Tomadas"
              corBorda="#FF9500"
              items={[
                {
                  label: "Qtd",
                  valor: `${resultado.tomadas.quantidade} unid.`,
                },
              ]}
            />
          </View>
        )}

        {totalComodos > 0 && (
          <View style={styles.resumoContainer}>
            <Text style={styles.txtResumoTitulo}>
              Total de cômodos cadastrados: {totalComodos}
            </Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapperWeb: { flex: 1, backgroundColor: "#f3f4f6" },
  container: {
    flex: 1,
    padding: 16,
    maxWidth: 450,
    width: "100%",
    alignSelf: "center",
  },
  cardConfig: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  resumoContainer: {
    marginTop: 14,
    padding: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
  },
  txtResumoTitulo: { fontSize: 14, fontWeight: "bold", color: "#374151" },
  resultadoContainer: { marginVertical: 10 },
  txtFeedback: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "bold",
    marginBottom: 8,
  },
});
