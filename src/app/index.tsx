// src/app/index.tsx
import { useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import CardResultado from "../components/ui/CardResultado";
import CustomHeader from "../components/ui/CustomHeader";
import FormPrevisaoCarga from "../components/ui/FormPrevisaoCarga";
import SeletorBotoes from "../components/ui/SeletorBotoes";
import { useData } from "../context/DataContext";
import {
  calcularIluminacao,
  calcularPotenciaTugs,
  calcularQuantidadeTugs,
  dimensionarCircuito,
} from "../utils/calculations";
import { Dispositivo, TEMPLATES_COMODOS } from "../utils/templates";

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
  const {
    tensaoGeral,
    setTensaoGeral,
    concessionaria,
    setConcessionaria,
    adicionarComodo,
    comodos,
  } = useData();

  const [resultado, setResultado] = useState<ResultadoPrevisao | null>(null);

  // Agora a contagem de cômodos é direta pelo tamanho da lista
  const totalComodos = comodos ? comodos.length : 0;

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

    // Identifica se há um template correspondente (ex: 'cozinha', 'banheiro') ou usa o genérico
    const chaveTemplate = TEMPLATES_COMODOS[dados.tipo?.toLowerCase()]
      ? dados.tipo.toLowerCase()
      : "sala";
    const template = TEMPLATES_COMODOS[chaveTemplate];

    // Monta a lista de dispositivos injetando os cálculos recomendados da NBR 5410 como padrão editável
    const dispositivosPreenchidos: Dispositivo[] = (
      template.dispositivosPadrao || []
    ).map((disp) => {
      let potenciaFinal = disp.potencia;
      let qtdFinal = disp.quantidade;

      if (disp.tipo === "iluminacao") potenciaFinal = potIluminacao;
      if (disp.tipo === "tug") {
        qtdFinal = qtdTugs;
        potenciaFinal = potTugs;
      }

      return {
        ...disp,
        id: Math.random().toString(),
        potencia: potenciaFinal,
        quantidade: qtdFinal,
      };
    });

    // Se o template padrão não possuir itens, garante a inserção mínima calculada
    if (dispositivosPreenchidos.length === 0) {
      dispositivosPreenchidos.push(
        {
          id: Math.random().toString(),
          nome: "Iluminação",
          tipo: "iluminacao",
          potencia: potIluminacao,
          unidade: "VA",
          quantidade: 1,
        },
        {
          id: Math.random().toString(),
          nome: "Tomadas Gerais",
          tipo: "tug",
          potencia: potTugs,
          unidade: "VA",
          quantidade: qtdTugs,
        },
      );
    }

    // Salva o objeto estruturado do cômodo no contexto global
    adicionarComodo({
      id: Math.random().toString(),
      nome: dados.nome || template.nome,
      area: Number(dados.area) || 0,
      perimetro: Number(dados.perimetro) || 0,
      dispositivos: dispositivosPreenchidos,
    });

    setResultado(null);
  };

  const projetoIniciado = comodos && comodos.length > 0;

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
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 140 }}
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
              onSelecionar={setTensaoGeral as any}
              opcoes={[
                { id: 127, label: "127 V" },
                { id: 220, label: "220 V" },
              ]}
            />
          )}

          <Text
            style={[
              styles.lblSeletor,
              {
                marginTop: 16,
                borderTopWidth: 1,
                borderColor: "#E5E7EB",
                paddingTop: 12,
              },
            ]}
          >
            Distribuidora de Energia
          </Text>
          {projetoIniciado ? (
            <View style={styles.valorTravadoContainer}>
              <Text style={styles.valorTravadoTexto}>{concessionaria}</Text>
            </View>
          ) : (
            <SeletorBotoes
              label=""
              valorSelecionado={concessionaria}
              onSelecionar={setConcessionaria}
              opcoes={[
                { id: "CPFL", label: "CPFL" },
                { id: "ENEL", label: "Enel" },
                { id: "NEOENERGIA", label: "Neoenergia" },
                { id: "EDP", label: "EDP" },
              ]}
            />
          )}

          {projetoIniciado && (
            <Text style={styles.txtAvisoBloqueio}>
              ⚠️ Configurações travadas. Esvazie o &quot;Quadro Geral&quot; para
              alterar.
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
  valorTravadoTexto: { fontSize: 16, fontWeight: "bold", color: "#1F2937" },
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
