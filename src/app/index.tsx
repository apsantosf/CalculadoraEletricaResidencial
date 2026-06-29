// src/app/index.tsx
import { useState } from "react";
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
    sistemaDistribuicao,
    setSistemaDistribuicao,
    adicionarComodo,
    comodos,
  } = useData();

  const [resultado, setResultado] = useState<ResultadoPrevisao | null>(null);

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

    const chaveTemplate = TEMPLATES_COMODOS[dados.tipo?.toLowerCase()]
      ? dados.tipo.toLowerCase()
      : "sala";
    const template = TEMPLATES_COMODOS[chaveTemplate];

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

  // Função explicativa do Sistema de Distribuição
  const mostrarInfoSistema = () => {
    const mensagem =
      "Entenda o Sistema de Distribuição Nacional\n\n" +
      "A configuração do padrão de entrada depende de como a concessionária local distribui a energia na rede secundária do transformador:\n\n" +
      "1. Sistema 127/220V (Padrão de SP, RJ, MG, PR, etc.):\n" +
      "• Tensão de Fase (Fase + Neutro) = 127 V.\n" +
      "• Tensão de Linha (Fase + Fase) = 220 V.\n" +
      "👉 Se você precisa de 220V para a residência ou para circuitos internos, a concessionária obrigatoriamente terá que fornecer 2 Fases + Neutro, resultando em um padrão BIFÁSICO no mínimo.\n\n" +
      "2. Sistema 220/380V (Padrão do Nordeste, DF, SC, GO, etc.):\n" +
      "• Tensão de Fase (Fase + Neutro) = 220 V.\n" +
      "• Tensão de Linha (Fase + Fase) = 380 V.\n" +
      "👉 Como a tensão entre uma única fase e o neutro já é 220V, o fornecimento para uma carga de 220V pode ser feito com apenas 1 Fase + Neutro, resultando em um padrão MONOFÁSICO.\n\n" +
      "Importância no Cálculo:\n" +
      "Essa seleção define se o disjuntor geral do medidor começará com 1 polo (monofásico) ou 2 polos (bifásico), além de influenciar o cálculo exato da corrente de demanda e a queda de tensão nos cabos do ramal.";

    if (Platform.OS === "web") {
      window.alert(mensagem);
    } else {
      Alert.alert("Guia Técnico: Sistema de Distribuição", mensagem);
    }
  };

  return (
    <View style={styles.wrapperWeb}>
      <CustomHeader title="Previsão de Carga" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 140 }}
      >
        <View style={styles.cardConfig}>
          {/* SELETOR 1: TENSÃO */}
          <Text style={styles.lblSeletor}>Tensão de Trabalho Interna</Text>
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

          {/* SELETOR 2: SISTEMA DA CONCESSIONÁRIA COM BOTÃO INFO */}
          <View style={styles.headerInfoContainer}>
            <Text style={styles.lblSeletorSemMargem}>
              Sistema de Rede da Região
            </Text>
            <TouchableOpacity
              onPress={mostrarInfoSistema}
              style={styles.iconeInfo}
            >
              <Text style={styles.txtIconeInfo}>ℹ️</Text>
            </TouchableOpacity>
          </View>

          {projetoIniciado ? (
            <View style={styles.valorTravadoContainer}>
              <Text style={styles.valorTravadoTexto}>
                {sistemaDistribuicao}
              </Text>
            </View>
          ) : (
            <SeletorBotoes
              label=""
              valorSelecionado={sistemaDistribuicao}
              onSelecionar={setSistemaDistribuicao as any}
              opcoes={[
                { id: "127/220V", label: "127/220 V (Ex: Sul/Sudeste)" },
                { id: "220/380V", label: "220/380 V (Ex: Nordeste/DF)" },
              ]}
            />
          )}

          {/* SELETOR 3: CONCESSIONÁRIA */}
          <Text style={[styles.lblSeletor, styles.bordaDivisora]}>
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
              ⚠️ Configurações travadas. Limpe o &quot;Quadro Geral&quot; para
              alterar os parâmetros da rede.
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

  // Novos estilos para o título com ícone de info
  headerInfoContainer: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    paddingTop: 12,
    marginBottom: 8,
  },
  lblSeletorSemMargem: { fontSize: 14, fontWeight: "bold", color: "#374151" },
  iconeInfo: { marginLeft: 8, padding: 2 },
  txtIconeInfo: { fontSize: 16 },

  bordaDivisora: {
    marginTop: 16,
    borderTopWidth: 1,
    borderColor: "#E5E7EB",
    paddingTop: 12,
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
