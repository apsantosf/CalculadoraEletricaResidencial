// src/app/quadro.tsx
import { useState } from "react";
import {
  Alert,
  Platform,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { CardResumoQuadro } from "../components/ui/CardResumoQuadro";
import { CardVerificacaoRamal } from "../components/ui/CardVerificacaoRamal";
import CustomHeader from "../components/ui/CustomHeader";
import { useData } from "../context/DataContext";
import { calcularAlimentadorGeral } from "../utils/calculations";
import { gerarMemorialPDF } from "../utils/pdfGenerator";

const aplicarDemandaTues = (
  tueWatts: number[],
  concessionaria: string,
): number => {
  if (tueWatts.length === 0) return 0;
  let fator = 1.0;
  if (tueWatts.length === 2) fator = 0.9;
  else if (tueWatts.length >= 3 && tueWatts.length <= 5) fator = 0.8;
  else if (tueWatts.length >= 6) fator = 0.7;
  return tueWatts.reduce((acc, curr) => acc + curr, 0) * fator;
};

export default function TelaQuadro() {
  const { comodos, tensaoGeral, concessionaria, removerComodo } = useData();
  const [resultadosRamal, setResultadosRamal] = useState<any>(null);

  // 💡 LIFTING DE ESTADO: O controle da Reserva agora fica no arquivo principal
  const [reservaAplicada, setReservaAplicada] = useState(false);

  const calcularPotenciasAtuais = () => {
    let somaIlumTugVA = 0;
    let listaWattsTue: number[] = [];
    let totalBrutoOriginal = 0;

    // Se a reserva estiver ativada, multiplicamos tudo por 1.3 (30%)
    const fatorMultiplicador = reservaAplicada ? 1.3 : 1.0;

    comodos.forEach((c) => {
      c.dispositivos.forEach((d) => {
        const potOriginal = d.potencia * d.quantidade;
        totalBrutoOriginal += potOriginal;

        // Aplica o fator de reserva em cada dispositivo
        const potComReserva = potOriginal * fatorMultiplicador;

        if (d.tipo === "iluminacao" || d.tipo === "tug")
          somaIlumTugVA += potComReserva;
        else if (d.tipo === "tue") listaWattsTue.push(potComReserva);
      });
    });

    const totalBrutoAplicado = totalBrutoOriginal * fatorMultiplicador;

    return {
      somaIlumTugVA,
      listaWattsTue,
      totalBrutoOriginal,
      totalBrutoAplicado,
    };
  };

  const {
    somaIlumTugVA,
    listaWattsTue,
    totalBrutoOriginal,
    totalBrutoAplicado,
  } = calcularPotenciasAtuais();
  const projetoTemDados = comodos && comodos.length > 0;

  const resultadoQDC = projetoTemDados
    ? calcularAlimentadorGeral({
        potenciaIlumTugVA: somaIlumTugVA,
        potenciasTueWatts: listaWattsTue,
        tensao: tensaoGeral,
      })
    : null;

  const resultadoDemanda = projetoTemDados
    ? calcularAlimentadorGeral({
        potenciaIlumTugVA:
          somaIlumTugVA + aplicarDemandaTues(listaWattsTue, concessionaria),
        potenciasTueWatts: [],
        tensao: tensaoGeral,
      })
    : null;

  const handleGerarPDF = async () => {
    await gerarMemorialPDF({
      comodos,
      tensaoGeral,
      concessionaria,
      resultadoQDC,
      resultadoDemanda,
      resultadosRamal,
    });
  };

  const handleCompartilharRelatorio = async () => {
    let texto = `⚡ RELATÓRIO TÉCNICO ELÉTRICO ⚡\n`;
    texto += `📐 Norma NBR 5410 e Distribuidora (${concessionaria})\n`;
    texto += `🔌 Tensão do Sistema: ${tensaoGeral} V\n`;
    texto += `--------------------------------------\n\n`;

    if (projetoTemDados) {
      texto += `📋 RESUMO POR CÔMODOS E CIRCUITOS:\n`;
      comodos.forEach((c) => {
        texto += `\n• ${c.nome}:\n`;
        c.dispositivos.forEach((d) => {
          const potTotal = d.potencia * d.quantidade;
          const unidade = d.tipo === "tue" ? "W" : "VA";
          texto += `  - ${d.quantidade}x ${d.nome} (${potTotal} ${unidade})\n`;
        });
      });
      texto += `\n--------------------------------------\n\n`;

      texto += `💡 QDC INTERNO (INSTALADO):\nPotência: ${resultadoQDC?.potenciaTotalVA} VA\nCabo: ${resultadoQDC?.caboGeral} mm²\nDisjuntor: ${resultadoQDC?.disjuntorGeral} A\n`;
      texto += `\n🏢 DEMANDA PADRÃO (${concessionaria}):\nDemanda: ${resultadoDemanda?.potenciaTotalVA} VA\nCabo: ${resultadoDemanda?.caboGeral} mm²\nDisjuntor: ${resultadoDemanda?.disjuntorGeral} A\n\n`;
    }

    if (resultadosRamal) {
      texto += `📏 VERIFICAÇÃO POR QUEDA DE TENSÃO (DISTÂNCIA):\nFornecimento: ${resultadosRamal.fornecimento}\n`;
      texto += `Trecho 1 (Rua -> Medidor): Cabo ${resultadosRamal.trecho1.bitola} mm² | Disj: ${resultadosRamal.trecho1.disjuntor} A\n`;
      texto += `Trecho 2 (Medidor -> QDC): Cabo ${resultadosRamal.trecho2.bitola} mm² | Disj: ${resultadosRamal.trecho2.disjuntor} A\n`;
    }

    await Share.share({ message: texto });
  };

  const handleRemoverComodoAlerta = (comodoId: string, nomeComodo: string) => {
    if (Platform.OS === "web") {
      if (window.confirm(`Tem certeza que vai excluir "${nomeComodo}"?`))
        removerComodo(comodoId);
    } else {
      Alert.alert("Excluir", `Tem certeza que vai excluir "${nomeComodo}"?`, [
        { text: "Não", style: "cancel" },
        {
          text: "Sim",
          style: "destructive",
          onPress: () => removerComodo(comodoId),
        },
      ]);
    }
  };

  return (
    <View style={styles.wrapperWeb}>
      <CustomHeader title="Relatório e Dimensionamento" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 140 }}
      >
        {/* 💡 O Card de Ramal agora recebe os controles de Reserva do pai */}
        <CardVerificacaoRamal
          potenciaTotal={totalBrutoAplicado}
          potenciaOriginal={totalBrutoOriginal}
          tensaoGeral={tensaoGeral}
          reservaAplicada={reservaAplicada}
          onToggleReserva={setReservaAplicada}
          onCalcularRamal={setResultadosRamal}
        />

        {projetoTemDados && (
          <View style={styles.quadroContainer}>
            <Text style={styles.subtitulo}>📋 Relação de Cômodos</Text>
            <View style={styles.cardLista}>
              {comodos.map((c) => (
                <View key={c.id} style={styles.itemCircuito}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nomeCircuito}>{c.nome}</Text>
                    {c.dispositivos.map((d, index) => (
                      <Text key={index} style={styles.textoDetalhe}>
                        ↳ {d.quantidade}x {d.nome} ({d.potencia * d.quantidade}{" "}
                        {d.tipo === "tue" ? "W" : "VA"})
                      </Text>
                    ))}
                  </View>
                  <TouchableOpacity
                    style={styles.deleteButton}
                    onPress={() => handleRemoverComodoAlerta(c.id, c.nome)}
                  >
                    <Text style={{ fontSize: 18 }}>❌</Text>
                  </TouchableOpacity>
                </View>
              ))}
            </View>

            {resultadoQDC && resultadoDemanda && (
              <CardResumoQuadro
                resultadoQDC={resultadoQDC}
                resultadoDemanda={resultadoDemanda}
                concessionaria={concessionaria}
              />
            )}
          </View>
        )}

        {(projetoTemDados || resultadosRamal) && (
          <View style={styles.botoesAcaoContainer}>
            <TouchableOpacity
              style={[
                styles.botaoExportar,
                { backgroundColor: "#0284c7", marginBottom: 12 },
              ]}
              onPress={handleGerarPDF}
            >
              <Text style={styles.textoBotaoExportar}>
                📄 Gerar Memorial em PDF
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.botaoExportar}
              onPress={handleCompartilharRelatorio}
            >
              <Text style={styles.textoBotaoExportar}>
                🟩 Enviar Resumo por WhatsApp
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapperWeb: { flex: 1, backgroundColor: "#f3f4f6", width: "100%" },
  container: {
    flex: 1,
    padding: 16,
    maxWidth: 450,
    width: "100%",
    alignSelf: "center",
  },
  quadroContainer: { paddingBottom: 10 },
  subtitulo: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 10,
  },
  cardLista: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    elevation: 1,
  },
  itemCircuito: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  deleteButton: { padding: 8, marginLeft: 10 },
  nomeCircuito: {
    fontSize: 14,
    color: "#374151",
    flex: 1,
    fontWeight: "600",
    marginBottom: 4,
  },
  textoDetalhe: { fontSize: 12, color: "#6b7280", marginTop: 2 },
  botoesAcaoContainer: { marginTop: 10 },
  botaoExportar: {
    backgroundColor: "#10b981",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  textoBotaoExportar: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});
