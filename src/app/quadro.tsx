// quadro.tsx versão 1.2.0

import { router } from "expo-router";
import {
  Alert,
  Platform, // 👈 ADICIONADO: Para identificar se está no navegador ou celular
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import CardResultado from "../components/ui/CardResultado";
import { useData } from "../context/DataContext";
import { calcularAlimentadorGeral } from "../utils/calculations";

export default function TelaQuadro() {
  const { circuitos, tensaoGeral, removerCircuito, zerarProjeto } = useData();

  const processarQuadroGeral = () => {
    const somaIlumTugVA = circuitos
      .filter((c) => c.tipo === "iluminacao" || c.tipo === "tug")
      .reduce((acc, curr) => acc + curr.potenciaVA, 0);

    const listaWattsTue = circuitos
      .filter((c) => c.tipo === "tue" && c.potenciaWatts !== undefined)
      .map((c) => c.potenciaWatts as number);

    return calcularAlimentadorGeral({
      potenciaIlumTugVA: somaIlumTugVA,
      potenciasTueWatts: listaWattsTue,
      tensao: tensaoGeral,
    });
  };

  const resultadoQDC = circuitos.length > 0 ? processarQuadroGeral() : null;

  // 🛡️ CORRIGIDO: Validação de remoção compatível com Web e Celular
  const confirmarRemocao = (id: string, nome: string) => {
    if (Platform.OS === "web") {
      const desejaApagar = window.confirm(
        `Tem certeza que deseja remover o circuito "${nome}" do quadro?`,
      );
      if (desejaApagar) {
        removerCircuito(id);
      }
    } else {
      Alert.alert(
        "Apagar Circuito",
        `Tem certeza que deseja remover o circuito "${nome}" do quadro?`,
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Apagar",
            style: "destructive",
            onPress: () => removerCircuito(id),
          },
        ],
      );
    }
  };

  const handleCompartilharRelatorio = async () => {
    if (!resultadoQDC) return;

    let textoRelatorio = `⚡ *RELATÓRIO TÉCNICO ELÉTRICO* ⚡\n`;
    textoRelatorio += `📜 Baseado na Norma NBR 5410:2004\n`;
    textoRelatorio += `----------------------------------------\n\n`;
    textoRelatorio += `📋 *RELAÇÃO DE CIRCUITOS:* \n`;

    circuitos.forEach((c) => {
      if (c.tipo === "tue" && c.potenciaWatts) {
        textoRelatorio += `• ${c.nome}: ${c.potenciaWatts}W\n`;
      } else if (c.tipo === "tug" && c.detalhe) {
        textoRelatorio += `• ${c.nome} ${c.detalhe}: ${c.potenciaVA} VA\n`;
      } else {
        textoRelatorio += `• ${c.nome}: ${c.potenciaVA} VA\n`;
      }
    });

    textoRelatorio += `\n🏆 *DIMENSIONAMENTO GERAL (QDC):* \n`;
    textoRelatorio += `• Potência Bruta Total: ${resultadoQDC.potenciaTotalVA} VA\n`;
    textoRelatorio += `• Potência Corrigida (Demanda): ${resultadoQDC.potenciaDemandadaVA} VA\n`;
    textoRelatorio += `• Corrente Geral Calculada: ${resultadoQDC.correnteGeral} A\n`;
    textoRelatorio += `• Cabo do Alimentador Principal: *${resultadoQDC.caboGeral} mm²*\n`;
    textoRelatorio += `• Disjuntor Geral Indicado: *${resultadoQDC.disjuntorGeral} A*\n\n`;
    textoRelatorio += `_Gerado automaticamente pelo app Calculadora Elétrica_`;

    try {
      await Share.share({ message: textoRelatorio });
    } catch (error) {
      Alert.alert("Erro", "Não foi possível compartilhar o relatório.");
    }
  };

  // 🛡️ CORRIGIDO: Validação de reset compatível com Web e Celular
  const handleZerarProjetoCompleto = () => {
    if (Platform.OS === "web") {
      const desejaZerar = window.confirm(
        "Tem certeza que deseja apagar todos os dados e iniciar um novo projeto?",
      );
      if (desejaZerar) {
        zerarProjeto();
        router.replace("/");
      }
    } else {
      Alert.alert(
        "Zerar Projeto",
        "Tem certeza que deseja apagar todos os dados e iniciar um novo projeto?",
        [
          { text: "Cancelar", style: "cancel" },
          {
            text: "Zerar Tudo",
            style: "destructive",
            onPress: () => {
              zerarProjeto();
              router.replace("/");
            },
          },
        ],
      );
    }
  };

  const obterCorTag = (tipo: "iluminacao" | "tug" | "tue") => {
    if (tipo === "iluminacao") return "#208AEF";
    if (tipo === "tug") return "#FF9500";
    return "#7c3aed";
  };

  return (
    <View style={styles.wrapperWeb}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 80 }}
        showsVerticalScrollIndicator={true}
      >
        <View
          style={[
            styles.cardAvisoVazio,
            {
              backgroundColor: "#e0f2fe",
              borderColor: "#208AEF",
              borderStyle: "solid",
              borderWidth: 0,
              borderLeftWidth: 5,
              padding: 12,
              marginTop: 0,
              marginBottom: 10,
            },
          ]}
        >
          <Text style={{ fontSize: 13, color: "#0369a1", fontWeight: "600" }}>
            Cálculo do Alimentador Geral por Demanda
          </Text>
          <Text
            style={{
              fontSize: 18,
              color: "#0284c7",
              fontWeight: "bold",
              marginVertical: 2,
            }}
          >
            NBR 5410:2004
          </Text>
        </View>

        {resultadoQDC ? (
          <View style={styles.quadroContainer}>
            <Text style={styles.subtitulo}>
              📋 Circuitos Inseridos no Quadro
            </Text>
            <View style={styles.cardLista}>
              {circuitos.map((circuito) => (
                <View key={circuito.id} style={styles.itemCircuito}>
                  <View style={styles.itemEsquerda}>
                    <View
                      style={[
                        styles.tagTipo,
                        { backgroundColor: obterCorTag(circuito.tipo) },
                      ]}
                    >
                      <Text style={styles.textoTag}>
                        {circuito.tipo === "iluminacao"
                          ? "LUZ"
                          : circuito.tipo === "tug"
                            ? "TUG"
                            : "TUE"}
                      </Text>
                    </View>
                    <Text style={styles.nomeCircuito} numberOfLines={1}>
                      {circuito.nome}
                    </Text>
                  </View>
                  <View style={styles.itemDireita}>
                    <Text style={styles.potenciaCircuito}>
                      {circuito.tipo === "tue" && circuito.potenciaWatts
                        ? `${circuito.potenciaWatts}W`
                        : `${circuito.potenciaVA} VA`}
                    </Text>
                    <TouchableOpacity
                      style={styles.botaoDeletarItem}
                      onPress={() =>
                        confirmarRemocao(circuito.id, circuito.nome)
                      }
                    >
                      <Text style={styles.txtDeletarItem}>❌</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            <Text style={styles.txtContador}>
              Total de Circuitos Ativos: {circuitos.length}
            </Text>

            <Text style={styles.subtitulo}>
              ⚡ Parâmetros Gerais Calculados
            </Text>
            <CardResultado
              titulo="🏆 Alimentador Geral do Padrão de Entrada"
              corBorda="#10b981"
              items={[
                {
                  label: "Potência Bruta Total",
                  valor: `${resultadoQDC.potenciaTotalVA} VA`,
                },
                {
                  label: "Potência Corrigida (Com Demanda)",
                  valor: `${resultadoQDC.potenciaDemandadaVA} VA`,
                },
                {
                  label: "Corrente Geral Instalada",
                  valor: `${resultadoQDC.correnteGeral} A`,
                },
                {
                  label: "Cabo do Alimentador Principal",
                  valor: `${resultadoQDC.caboGeral} mm²`,
                  corValor: "green",
                },
                {
                  label: "Disjuntor Geral Indicado",
                  valor: `${resultadoQDC.disjuntorGeral} A`,
                  corValor: "red",
                },
              ]}
            />

            <TouchableOpacity
              style={styles.botaoExportar}
              onPress={handleCompartilharRelatorio}
            >
              <Text style={styles.textoBotaoExportar}>
                🟩 Enviar Relatório via WhatsApp / Copiar
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoLimpar}
              onPress={handleZerarProjetoCompleto}
            >
              <Text style={styles.textoBotaoLimpar}>
                Zerar e Iniciar Novo Projeto
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.cardAvisoVazio}>
            <Text style={styles.txtAviso}>
              Nenhum circuito cadastrado. Navegue pelas abas inferiores para
              cadastrar os cômodos e aparelhos primeiro!
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
  quadroContainer: { marginVertical: 10 },
  subtitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 10,
    marginTop: 14,
  },
  cardLista: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
    boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.1)",
  },
  itemCircuito: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  itemEsquerda: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 10,
  },
  itemDireita: { flexDirection: "row", alignItems: "center" },
  tagTipo: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
    minWidth: 42,
    alignItems: "center",
  },
  textoTag: { fontSize: 10, fontWeight: "bold", color: "#ffffff" },
  nomeCircuito: { fontSize: 14, color: "#374151", fontWeight: "500", flex: 1 },
  potenciaCircuito: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1f2937",
    marginRight: 10,
  },
  botaoDeletarItem: { padding: 4, borderRadius: 4, backgroundColor: "#fee2e2" },
  txtDeletarItem: { fontSize: 12 },
  txtContador: {
    fontSize: 13,
    color: "#6b7280",
    textAlign: "right",
    marginBottom: 16,
    fontWeight: "500",
  },
  cardAvisoVazio: {
    backgroundColor: "#e5e7eb",
    padding: 20,
    borderRadius: 12,
    borderStyle: "dashed",
    borderWidth: 2,
    borderColor: "#9ca3af",
    alignItems: "center",
    marginTop: 30,
  },
  txtAviso: {
    color: "#6b7280",
    fontSize: 14,
    textAlign: "center",
    fontWeight: "500",
    lineHeight: 20,
  },
  botaoExportar: {
    backgroundColor: "#10b981",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 20,
  },
  textoBotaoExportar: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
  botaoLimpar: {
    backgroundColor: "#ef4444",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 12,
    marginBottom: 40,
  },
  textoBotaoLimpar: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});
