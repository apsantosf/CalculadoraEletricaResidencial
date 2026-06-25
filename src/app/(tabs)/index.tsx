//   src/app/index.tsx
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import CardResultado from "../../components/ui/CardResultado";
import CustomHeader from "../../components/ui/CustomHeader";
import FormPrevisaoCarga from "../../components/ui/FormPrevisaoCarga";
import SeletorBotoes from "../../components/ui/SeletorBotoes";
import { useData } from "../../context/DataContext";
import {
  calcularIluminacao,
  calcularPotenciaTugs,
  calcularQuantidadeTugs,
  dimensionarCircuito,
} from "../../utils/calculations";

// Interface auxiliar para tipar o resultado e eliminar avisos de aninhamento
interface DetalheCircuito {
  potencia: number;
  correnteProjeto: number;
  secaoCabo: number;
  disjuntor: number;
  quantidade?: number;
}

interface ResultadoPrevisao {
  nome: string;
  iluminacao?: DetalheCircuito;
  tomadas?: DetalheCircuito;
}

export default function TelaComodos() {
  const { tensaoGeral, setTensaoGeral, adicionarCircuitos, circuitos } =
    useData();

  // Adicionada a tipagem estruturada no useState
  const [resultado, setResultado] = useState<ResultadoPrevisao | null>(null);

  // Conta cômodos pelo tipo iluminacao
  const totalComodos = (circuitos || []).filter(
    (c) => c.tipo === "iluminacao",
  ).length;

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

    // Gerado o identificador único e seguro para o par (Luz + TUG)
    const grupoComodoId = Math.random().toString();

    adicionarCircuitos([
      {
        id: Math.random().toString(),
        nome: `${dados.nome} (Luz - ${potIluminacao}W - ${tensaoGeral}V)`,
        grupoId: grupoComodoId,
        tipo: "iluminacao",
        potenciaVA: potIluminacao,
        potenciaWatts: potIluminacao,
        disjuntor: circIlum.disjuntor,
        bitola: circIlum.secaoCabo,
      },
      {
        id: Math.random().toString(),
        nome: `${dados.nome} (TUG - ${potTugs}VA - ${tensaoGeral}V)`,
        grupoId: grupoComodoId,
        tipo: "tug",
        potenciaVA: potTugs,
        potenciaWatts: 0,
        detalhe: `${qtdTugs} tomadas`,
        disjuntor: circTug.disjuntor,
        bitola: circTug.secaoCabo,
      },
    ]);
    setResultado(null);
  };

  // Verifica se o projeto já possui circuitos para travar a tensão geral
  const projetoIniciado = circuitos && circuitos.length > 0;

  // Variáveis seguras tipadas puramente como string garantem que o CardResultado não reclame de tipagem
  const ilumPotencia = resultado?.iluminacao?.potencia
    ? `${resultado.iluminacao.potencia} VA`
    : "-";
  const ilumDisjuntor = resultado?.iluminacao?.disjuntor
    ? `${resultado.iluminacao.disjuntor} A`
    : "-";
  const ilumCabo = resultado?.iluminacao?.secaoCabo
    ? `${resultado.iluminacao.secaoCabo} mm²`
    : "-";

  const tugQtd = resultado?.tomadas?.quantidade
    ? `${resultado.tomadas.quantidade} unid.`
    : "-";
  const tugDisjuntor = resultado?.tomadas?.disjuntor
    ? `${resultado.tomadas.disjuntor} A`
    : "-";
  const tugCabo = resultado?.tomadas?.secaoCabo
    ? `${resultado.tomadas.secaoCabo} mm²`
    : "-";

  return (
    <View style={styles.wrapperWeb}>
      <CustomHeader title="Previsão de Carga" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }} // <-- Adiciona 100 pixels de respiro na base para afastar do rodapé
      >
        <View style={styles.cardConfig}>
          <Text style={styles.lblSeletor}>
            Tensão de Entrada (Concessionária)
          </Text>
          {projetoIniciado ? (
            <View style={styles.valorTravadoContainer}>
              <Text style={styles.valorTravadoTexto}>{tensaoGeral} V</Text>
            </View>
          ) : (
            <SeletorBotoes
              label=""
              valorSelecionado={tensaoGeral}
              onSelecionar={setTensaoGeral}
              opcoes={[
                { id: 127, label: "127 V" },
                { id: 220, label: "220 V" },
              ]}
            />
          )}

          {projetoIniciado && (
            <Text style={styles.txtAvisoBloqueio}>
              ⚠️ Tensão de entrada travada (inicie um novo projeto no X para
              alterar).
            </Text>
          )}
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
                { label: "Potência", valor: ilumPotencia },
                { label: "Disjuntor", valor: ilumDisjuntor },
                { label: "Cabo", valor: ilumCabo },
              ]}
            />

            <CardResultado
              titulo="🔌 Tomadas"
              corBorda="#FF9500"
              items={[
                { label: "Qtd", valor: tugQtd },
                { label: "Disjuntor", valor: tugDisjuntor },
                { label: "Cabo", valor: tugCabo },
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
  lblSeletor: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#374151",
    marginBottom: 8,
    textAlign: "center",
  },
  valorTravadoContainer: {
    backgroundColor: "#F3F4F6",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  valorTravadoTexto: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1F2937",
  },
  txtResumoTitulo: { fontSize: 14, fontWeight: "bold", color: "#374151" },
  resultadoContainer: { marginVertical: 10 },
  txtFeedback: {
    fontSize: 14,
    color: "#10b981",
    fontWeight: "bold",
    marginBottom: 8,
  },
  txtAvisoBloqueio: {
    fontSize: 12,
    color: "#6B7280",
    marginTop: 8,
    textAlign: "center",
    fontStyle: "italic",
  },
});
