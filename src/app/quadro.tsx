// src/app/quadro.tsx
import { FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router";
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
import {
  calcularAlimentadorGeral,
  obterDimensionamentoCircuito,
  obterFatorDemandaGeral,
} from "../utils/calculations";
import { gerarMemorialPDF } from "../utils/pdfGenerator";

const aplicarDemandaTuesLista = (
  tueWatts: number[],
  distribuidora: string,
): number[] => {
  if (tueWatts.length === 0) return [];
  let fator = 1.0;
  if (tueWatts.length === 2) fator = 0.9;
  else if (tueWatts.length >= 3 && tueWatts.length <= 5) fator = 0.8;
  else if (tueWatts.length >= 6) fator = 0.7;
  return tueWatts.map((pot) => pot * fator);
};

export default function TelaQuadro() {
  const { comodos, tensaoGeral, distribuidora, tipoImovel, removerComodo } =
    useData();
  const [resultadosRamal, setResultadosRamal] = useState<any>(null);
  const [reservaAplicada, setReservaAplicada] = useState(false);

  const calcularPotenciasAtuais = () => {
    let somaIlumTugVA = 0;
    let listaVATue: number[] = [];
    let totalBrutoOriginal = 0;

    const fatorMultiplicador = reservaAplicada ? 1.3 : 1.0;

    comodos.forEach((c) => {
      c.dispositivos.forEach((d) => {
        let potOriginalVA = d.potencia * d.quantidade;

        if (d.tipo === "tue") {
          const fp = d.nome.toLowerCase().includes("chuveiro") ? 1.0 : 0.85;
          potOriginalVA = potOriginalVA / fp;
        }

        totalBrutoOriginal += potOriginalVA;
        const potComReserva = potOriginalVA * fatorMultiplicador;

        if (d.tipo === "iluminacao" || d.tipo === "tug") {
          somaIlumTugVA += potComReserva;
        } else if (d.tipo === "tue") {
          listaVATue.push(potComReserva);
        }
      });
    });

    return {
      somaIlumTugVA: Math.round(somaIlumTugVA),
      listaWattsTue: listaVATue.map(Math.round),
      totalBrutoOriginal: Math.round(totalBrutoOriginal),
      totalBrutoAplicado: Math.round(totalBrutoOriginal * fatorMultiplicador),
    };
  };

  const {
    somaIlumTugVA,
    listaWattsTue,
    totalBrutoOriginal,
    totalBrutoAplicado,
  } = calcularPotenciasAtuais();
  const projetoTemDados = comodos && comodos.length > 0;

  const limiteBifasico = 12000;
  const limiteTrifasico = 25000;

  const exigeTrifasico = totalBrutoAplicado > limiteTrifasico;
  const exigeBifasicoPorCarga =
    totalBrutoAplicado > limiteBifasico && !exigeTrifasico;

  const temEquipamento220 = comodos.some((c) =>
    c.dispositivos.some((d) => (d.tensao || tensaoGeral) === 220),
  );
  const exigeBifasicoPorTensao = tensaoGeral === 127 && temEquipamento220;

  const ehMultiFasico =
    exigeTrifasico || exigeBifasicoPorCarga || exigeBifasicoPorTensao;

  const tipoPadraoNovo = exigeTrifasico
    ? "Trifásico"
    : ehMultiFasico
      ? "Bifásico"
      : "Monofásico";
  const tensaoFornecimento = ehMultiFasico
    ? tensaoGeral === 127
      ? "127V / 220V"
      : "220V / 380V"
    : `${tensaoGeral} V`;

  const motivoMudanca = exigeTrifasico
    ? `A sua carga total (${Math.round(totalBrutoAplicado)} VA) ultrapassou o limite máximo.`
    : exigeBifasicoPorTensao
      ? `O projeto possui uma rede 127V, mas foram adicionados equipamentos de 220V.`
      : `A sua carga total (${Math.round(totalBrutoAplicado)} VA) ultrapassou o limite seguro Monofásico.`;
  const textoAvisoOficial = `AÇÃO OBRIGATÓRIA: É responsabilidade do cliente contatar a concessionária (${distribuidora || "local"}) para solicitar a homologação do novo padrão de entrada ${tipoPadraoNovo}. A não adequação pode gerar multas e riscos severos à instalação.`;

  const resultadoQDC = projetoTemDados
    ? calcularAlimentadorGeral({
        potenciaIlumTugVA: somaIlumTugVA,
        potenciasTueWatts: listaWattsTue,
        tensao: tensaoGeral,
        forcarTrifasico: exigeTrifasico,
      })
    : null;

  const resultadoDemanda =
    projetoTemDados && resultadoQDC
      ? calcularAlimentadorGeral({
          potenciaIlumTugVA: Math.round(
            somaIlumTugVA * obterFatorDemandaGeral(somaIlumTugVA),
          ),
          potenciasTueWatts: aplicarDemandaTuesLista(
            listaWattsTue,
            distribuidora,
          ).map(Math.round),
          tensao: tensaoGeral,
          forcarTrifasico: exigeTrifasico || resultadoQDC.ehTrifasico,
        })
      : null;

  const handleGerarPDF = async () => {
    await gerarMemorialPDF({
      comodos,
      tensaoGeral,
      concessionaria: distribuidora,
      resultadoQDC,
      resultadoDemanda,
      resultadosRamal,
      tipoImovel,
      avisoConcessionaria: ehMultiFasico
        ? { motivo: motivoMudanca, aviso: textoAvisoOficial }
        : null,
      tipoPadraoNovo,
      tensaoFornecimento,
    });
  };

  const handleCompartilharRelatorio = async () => {
    let texto = `⚡ *RELATÓRIO TÉCNICO ELÉTRICO* ⚡\n`;
    texto += `🏠 Imóvel: ${tipoImovel}\n`;
    texto += `📐 Norma: NBR 5410 | Distribuidora: ${distribuidora}\n`;
    texto += `🔌 Fornecimento Exigido: ${tipoPadraoNovo} (${tensaoFornecimento})\n`;
    if (resultadoDemanda) {
      texto += `⚡ Corrente Principal (Disj. Geral): ${resultadoDemanda.disjuntorGeral}A\n`;
    }
    texto += `--------------------------------------\n\n`;

    if (ehMultiFasico) {
      texto += `🚨 *MUDANÇA DE PADRÃO EXIGIDA*\n`;
      texto += `Motivo: ${motivoMudanca}\n`;
      texto += `⚠️ ${textoAvisoOficial}\n`;
      texto += `--------------------------------------\n\n`;
    }

    if (projetoTemDados) {
      texto += `📋 *RESUMO POR CÔMODOS E CIRCUITOS:*\n`;
      comodos.forEach((c) => {
        texto += `\n📍 *${c.nome}:*\n`;
        c.dispositivos.forEach((d) => {
          const potTotal = d.potencia * d.quantidade;
          let potVA = potTotal;
          if (d.tipo === "tue") {
            const fp = d.nome.toLowerCase().includes("chuveiro") ? 1.0 : 0.85;
            potVA = potTotal / fp;
          }
          const unidade = d.tipo === "tue" ? "W" : "VA";
          const dim = obterDimensionamentoCircuito(
            d.tipo,
            potVA,
            d.tensao || tensaoGeral,
          );

          const icone =
            d.tipo === "iluminacao" ? "💡" : d.tipo === "tug" ? "🔌" : "♨️";
          const infoTensao = d.tensao ? ` [${d.tensao}V]` : "";

          texto += ` ${icone} ${d.quantidade}x ${d.nome} (${potTotal} ${unidade})${infoTensao}\n`;
          texto += `    ↳ 🟢 Fio: ${dim.cabo}mm² | 🔴 Disj: ${dim.disj}A\n`;
        });
      });
      texto += `\n--------------------------------------\n\n`;

      const idrGeral = resultadoQDC?.ehTrifasico ? "Tetrapolar" : "Bipolar";

      texto += `🛡️ *ESQUEMA DO QUADRO (QDC)*\n`;
      texto += `[🟧 DPS ] [⬛ GERAL ${resultadoQDC?.disjuntorGeral}A ] [🟦 IDR ${idrGeral}]\n`;

      texto += `\n*Proteção Recomendada:*\n`;
      texto += `Potência: ${resultadoQDC?.potenciaTotalVA} VA\n`;
      texto += `Cabo Geral Interno: ${resultadoQDC?.caboGeral} mm²\n`;
      texto += `Disjuntor Geral: ${resultadoQDC?.disjuntorGeral} A\n`;
    }

    if (resultadosRamal) {
      texto += `\n📏 *ALIMENTADOR (MEDIDOR)*\n`;
      texto += `Padrão: ${resultadosRamal.fornecimento}\n`;
      if (resultadosRamal.trecho1) {
        texto += `Rua p/ Medidor: Fio ${resultadosRamal.trecho1.bitola}mm² | Disj ${resultadosRamal.trecho1.disjuntor}A\n`;
      }
      texto += `Medidor p/ QDC: Fio ${resultadosRamal.trecho2.bitola}mm² | Disj ${resultadosRamal.trecho2.disjuntor}A\n`;
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
      <CustomHeader title="Quadro Geral" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 140 }}
      >
        <View style={styles.cardReservaGeral}>
          <View style={styles.reservaHeader}>
            <FontAwesome5
              name="bolt"
              size={18}
              color={reservaAplicada ? "#059669" : "#d97706"}
            />
            <Text style={styles.tituloReserva}>Reserva Futura (NBR 5410)</Text>
          </View>
          <Text style={styles.textoReserva}>
            Aplica uma margem de segurança de +30% na potência bruta para
            garantir ampliações futuras sem sobrecarga.
          </Text>
          <TouchableOpacity
            style={[
              styles.botaoToggleReserva,
              reservaAplicada && styles.botaoToggleReservaAtivo,
            ]}
            onPress={() => setReservaAplicada(!reservaAplicada)}
          >
            <Text
              style={[
                styles.textoToggleReserva,
                reservaAplicada && styles.textoToggleReservaAtivo,
              ]}
            >
              {reservaAplicada
                ? "✅ Reserva de 30% Ativada"
                : "✨ Adicionar +30% de Reserva"}
            </Text>
          </TouchableOpacity>
        </View>

        {projetoTemDados && (
          <View style={{ marginBottom: 12 }}>
            {ehMultiFasico && (
              <View style={styles.alertaConcessionariaCritico}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginBottom: 6,
                  }}
                >
                  <FontAwesome5
                    name="exclamation-triangle"
                    size={18}
                    color="#991b1b"
                  />
                  <Text style={styles.tituloAlertaCritico}>
                    ⚠️ PADRÃO DE ENTRADA ALTERADO
                  </Text>
                </View>

                <Text style={styles.textoAlertaCritico}>{motivoMudanca}</Text>

                <View style={styles.caixaAvisoConcessionaria}>
                  <Text style={styles.textoAvisoConcessionaria}>
                    📢{" "}
                    <Text style={{ fontWeight: "bold" }}>
                      {textoAvisoOficial}
                    </Text>
                  </Text>
                </View>
              </View>
            )}
          </View>
        )}

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
            <Text style={styles.subtitulo}>
              📋 Relação de Circuitos e Cargas
            </Text>
            <View style={styles.cardLista}>
              {comodos.map((c) => (
                <View key={c.id} style={styles.itemCircuito}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nomeCircuito}>{c.nome}</Text>
                    {c.dispositivos.map((d, index) => {
                      const potTotal = d.potencia * d.quantidade;
                      const tensaoDisp = d.tensao || tensaoGeral;
                      let potVA = potTotal;
                      if (d.tipo === "tue") {
                        const fp = d.nome.toLowerCase().includes("chuveiro")
                          ? 1.0
                          : 0.85;
                        potVA = potTotal / fp;
                      }
                      const dim = obterDimensionamentoCircuito(
                        d.tipo,
                        potVA,
                        tensaoDisp,
                      );
                      return (
                        <Text key={index} style={styles.textoDetalhe}>
                          ↳ {d.quantidade}x {d.nome} ({potTotal}{" "}
                          {d.tipo === "tue" ? "W" : "VA"})
                          <Text
                            style={{ color: "#2563eb", fontWeight: "bold" }}
                          >
                            {" "}
                            [{tensaoDisp}V]
                          </Text>
                          <Text
                            style={{ color: "#059669", fontWeight: "bold" }}
                          >
                            {" "}
                            | Fio {dim.cabo}mm²
                          </Text>
                          <Text
                            style={{ color: "#dc2626", fontWeight: "bold" }}
                          >
                            {" "}
                            - Disj. {dim.disj}A ({tensaoDisp}V)
                          </Text>
                        </Text>
                      );
                    })}
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
                concessionaria={distribuidora}
                tipoPadraoNovo={tipoPadraoNovo}
                tensaoFornecimento={tensaoFornecimento}
              />
            )}
          </View>
        )}

        {(projetoTemDados || resultadosRamal) && (
          <View style={styles.botoesAcaoContainer}>
            {ehMultiFasico && (
              <TouchableOpacity
                style={[
                  styles.botaoExportar,
                  {
                    backgroundColor: "#f59e0b",
                    marginBottom: 12,
                    borderWidth: 2,
                    borderColor: "#d97706",
                  },
                ]}
                onPress={() => router.push("/balanceamento" as any)}
              >
                <Text
                  style={[
                    styles.textoBotaoExportar,
                    { color: "#fff", fontWeight: "900" },
                  ]}
                >
                  ⚖️ Balancear Cargas e Fases
                </Text>
              </TouchableOpacity>
            )}

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
              style={[
                styles.botaoExportar,
                { backgroundColor: "#10b981", marginBottom: 12 },
              ]}
              onPress={handleCompartilharRelatorio}
            >
              <Text style={styles.textoBotaoExportar}>
                🟩 Enviar Resumo por WhatsApp
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.botaoExportar, { backgroundColor: "#7c3aed" }]}
              onPress={() => router.push("/esquema-quadro" as any)}
            >
              <Text style={styles.textoBotaoExportar}>
                ⚡ Ver Esquema Visual do QDC
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
  cardReservaGeral: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  reservaHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  tituloReserva: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1f2937",
    marginLeft: 8,
  },
  textoReserva: {
    fontSize: 13,
    color: "#6b7280",
    marginBottom: 14,
    lineHeight: 18,
  },
  botaoToggleReserva: {
    backgroundColor: "#f3f4f6",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  botaoToggleReservaAtivo: {
    backgroundColor: "#dcfce7",
    borderColor: "#10b981",
  },
  textoToggleReserva: { fontSize: 14, fontWeight: "bold", color: "#4b5563" },
  textoToggleReservaAtivo: { color: "#059669" },
  alertaConcessionariaCritico: {
    backgroundColor: "#fef2f2",
    borderColor: "#fca5a5",
    borderWidth: 2,
    borderRadius: 10,
    padding: 16,
  },
  tituloAlertaCritico: {
    color: "#991b1b",
    fontSize: 15,
    fontWeight: "900",
    marginLeft: 8,
  },
  textoAlertaCritico: {
    color: "#7f1d1d",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 12,
    fontWeight: "500",
  },
  caixaAvisoConcessionaria: {
    backgroundColor: "#fff1f2",
    padding: 12,
    borderRadius: 8,
    borderLeftWidth: 4,
    borderLeftColor: "#e11d48",
  },
  textoAvisoConcessionaria: { color: "#be123c", fontSize: 13, lineHeight: 18 },
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
  textoDetalhe: { fontSize: 12, color: "#6b7280", marginTop: 4 },
  botoesAcaoContainer: { marginTop: 10 },
  botaoExportar: { padding: 14, borderRadius: 8, alignItems: "center" },
  textoBotaoExportar: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});
