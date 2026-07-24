// src/app/quadro.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router"; // 💡 NOVO: Sensor de Foco
import { useCallback, useState } from "react";
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
  obterFatorDemandaGeral,
} from "../utils/calculations";
import { gerarMemorialPDF } from "../utils/pdfGenerator";

// 💡 Chave para salvar a opção de 30% na memória
const CHAVE_RESERVA = "@EletricaResidencial_ReservaAplicada";

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

const obterDimensionamentoCircuito = (
  tipo: string,
  potenciaTotal: number,
  tensao: number,
) => {
  const corrente = potenciaTotal / tensao;
  if (tipo === "iluminacao") return { cabo: "1.5", disj: 10 };
  if (tipo === "tug") return { cabo: "2.5", disj: corrente > 16 ? 20 : 16 };

  const disjuntores = [10, 16, 20, 25, 32, 40, 50, 63, 80, 100];
  let disj = disjuntores.find((d) => d >= corrente) || 100;
  let cabo = "2.5";
  if (disj > 20 && disj <= 25) cabo = "4";
  else if (disj > 25 && disj <= 32) cabo = "6";
  else if (disj > 32 && disj <= 40) cabo = "10";
  else if (disj > 40 && disj <= 50) cabo = "10";
  else if (disj > 50 && disj <= 63) cabo = "16";
  else if (disj > 63) cabo = "25";

  return { cabo, disj };
};

export default function TelaQuadro() {
  const { comodos, tensaoGeral, distribuidora, tipoImovel, removerComodo } =
    useData();
  const [resultadosRamal, setResultadosRamal] = useState<any>(null);
  const [reservaAplicada, setReservaAplicada] = useState(false);

  // 💡 LÓGICA ATUALIZADA: Lê do BD sempre que a aba é focada
  useFocusEffect(
    useCallback(() => {
      const carregarReserva = async () => {
        const reservaSalva = await AsyncStorage.getItem(CHAVE_RESERVA);
        setReservaAplicada(reservaSalva === "true");
      };
      carregarReserva();
    }, []),
  );

  // 💡 Grava no BD e atualiza a tela instantaneamente
  const handleToggleReserva = async (status: boolean) => {
    setReservaAplicada(status);
    await AsyncStorage.setItem(CHAVE_RESERVA, status ? "true" : "false");
  };

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

    const totalBrutoAplicado = Math.round(
      totalBrutoOriginal * fatorMultiplicador,
    );

    return {
      somaIlumTugVA: Math.round(somaIlumTugVA),
      listaWattsTue: listaVATue.map(Math.round),
      totalBrutoOriginal: Math.round(totalBrutoOriginal),
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
        forcarTrifasico: false,
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
          forcarTrifasico: resultadoQDC.ehTrifasico,
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
    });
  };

  const handleCompartilharRelatorio = async () => {
    let texto = `⚡ RELATÓRIO TÉCNICO ELÉTRICO ⚡\n`;
    texto += `🏠 Tipo de Imóvel: ${tipoImovel}\n`;
    texto += `📐 Norma NBR 5410 e Distribuidora (${distribuidora})\n`;
    texto += `🔌 Tensão do Sistema: ${tensaoGeral} V\n`;
    texto += `--------------------------------------\n\n`;

    if (projetoTemDados) {
      texto += `📋 RESUMO POR CÔMODOS E CIRCUITOS:\n`;
      comodos.forEach((c) => {
        texto += `\n• ${c.nome}:\n`;
        c.dispositivos.forEach((d) => {
          const potTotal = d.potencia * d.quantidade;

          let potVA = potTotal;
          if (d.tipo === "tue") {
            const fp = d.nome.toLowerCase().includes("chuveiro") ? 1.0 : 0.85;
            potVA = potTotal / fp;
          }

          const unidade = d.tipo === "tue" ? "W" : "VA";
          const dim = obterDimensionamentoCircuito(d.tipo, potVA, tensaoGeral);
          texto += `  - ${d.quantidade}x ${d.nome} (${potTotal} ${unidade}) | Fio: ${dim.cabo}mm² | Disj: ${dim.disj}A\n`;
        });
      });
      texto += `\n--------------------------------------\n\n`;

      texto += `💡 QDC INTERNO (INSTALADO):\nPotência: ${resultadoQDC?.potenciaTotalVA} VA\nCabo: ${resultadoQDC?.caboGeral} mm²\nDisjuntor: ${resultadoQDC?.disjuntorGeral} A\n`;
      texto += `\n🏢 DEMANDA PADRÃO (${distribuidora}):\nDemanda: ${resultadoDemanda?.potenciaTotalVA} VA\nCabo: ${resultadoDemanda?.caboGeral} mm²\nDisjuntor: ${resultadoDemanda?.disjuntorGeral} A\n\n`;
    }

    if (resultadosRamal) {
      texto += `📏 DIMENSIONAMENTO DO ALIMENTADOR:\nFornecimento: ${resultadosRamal.fornecimento}\n`;

      if (resultadosRamal.trecho1) {
        texto += `Trecho Externo (Rua -> Medidor): Cabo ${resultadosRamal.trecho1.bitola} mm² | Disj: ${resultadosRamal.trecho1.disjuntor} A\n`;
      }

      texto += `Trecho Interno (Medidor -> QDC): Cabo ${resultadosRamal.trecho2.bitola} mm² | Disj: ${resultadosRamal.trecho2.disjuntor} A\n`;
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
        <CardVerificacaoRamal
          potenciaTotal={totalBrutoAplicado}
          potenciaOriginal={totalBrutoOriginal}
          tensaoGeral={tensaoGeral}
          reservaAplicada={reservaAplicada}
          onToggleReserva={handleToggleReserva} // 💡 Usa a nova função que grava
          onCalcularRamal={setResultadosRamal}
        />

        {projetoTemDados && (
          <View style={styles.quadroContainer}>
            <Text style={styles.subtitulo}>📋 Relação de Cômodos e TUEs</Text>
            <View style={styles.cardLista}>
              {comodos.map((c) => (
                <View key={c.id} style={styles.itemCircuito}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.nomeCircuito}>{c.nome}</Text>
                    {c.dispositivos.map((d, index) => {
                      const potTotal = d.potencia * d.quantidade;

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
                        tensaoGeral,
                      );
                      return (
                        <Text key={index} style={styles.textoDetalhe}>
                          ↳ {d.quantidade}x {d.nome} ({potTotal}{" "}
                          {d.tipo === "tue" ? "W" : "VA"})
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
                            - Disj. {dim.disj}A
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
              <View>
                {resultadoQDC.ehTrifasico && totalBrutoAplicado > 25000 && (
                  <View style={styles.alertaTrifasico}>
                    <Text style={styles.tituloAlerta}>
                      ⚠️ Alteração para Trifásico
                    </Text>
                    <Text style={styles.textoAlerta}>
                      A carga total atingiu {Math.round(totalBrutoAplicado)} VA
                      (acima do limite da concessionária). O dimensionamento
                      geral foi ajustado automaticamente para a rede Trifásica (
                      {tensaoGeral === 127 ? "220V" : "380V"} entre fases) para
                      evitar desequilíbrio.
                    </Text>
                  </View>
                )}

                <CardResumoQuadro
                  resultadoQDC={resultadoQDC}
                  resultadoDemanda={resultadoDemanda}
                  concessionaria={distribuidora}
                />
              </View>
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
  textoDetalhe: { fontSize: 12, color: "#6b7280", marginTop: 4 },

  alertaTrifasico: {
    backgroundColor: "#fffbeb",
    borderColor: "#fcd34d",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  tituloAlerta: {
    color: "#d97706",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 4,
  },
  textoAlerta: {
    color: "#92400e",
    fontSize: 13,
    lineHeight: 18,
  },

  botoesAcaoContainer: { marginTop: 10 },
  botaoExportar: {
    backgroundColor: "#10b981",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  textoBotaoExportar: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});
