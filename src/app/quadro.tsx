// src/app/quadro.tsx
import { FontAwesome5 } from "@expo/vector-icons";
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

  const limiteBifasico = 12000;
  const limiteTrifasico = 25000;
  const exigeTrifasico = totalBrutoAplicado > limiteTrifasico;

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
            {exigeTrifasico ? (
              <View style={styles.alertaConcessionariaCritico}>
                <FontAwesome5
                  name="exclamation-triangle"
                  size={16}
                  color="#991b1b"
                />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.tituloAlertaCritico}>
                    Atenção: Padrão Trifásico Exigido
                  </Text>
                  <Text style={styles.textoAlertaCritico}>
                    A carga atual ({Math.round(totalBrutoAplicado)} VA)
                    ultrapassa o limite de 25kVA. Segundo a{" "}
                    {distribuidora || "concessionária local"}, o dimensionamento
                    foi ajustado automaticamente para o sistema Trifásico.
                  </Text>
                </View>
              </View>
            ) : totalBrutoAplicado > limiteBifasico ? (
              <View style={styles.alertaConcessionariaAviso}>
                <FontAwesome5 name="info-circle" size={16} color="#0369a1" />
                <View style={{ marginLeft: 10, flex: 1 }}>
                  <Text style={styles.tituloAlertaAviso}>
                    Recomendação da {distribuidora || "Concessionária"}
                  </Text>
                  <Text style={styles.textoAlertaAviso}>
                    A carga está entre 12kVA e 25kVA (
                    {Math.round(totalBrutoAplicado)} VA). Recomenda-se homologar
                    um padrão de entrada Bifásico ou Trifásico na
                    concessionária.
                  </Text>
                </View>
              </View>
            ) : null}
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
            <Text style={styles.subtitulo}>📋 Relação de Cômodos</Text>
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
              <CardResumoQuadro
                resultadoQDC={resultadoQDC}
                resultadoDemanda={resultadoDemanda}
                concessionaria={distribuidora}
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
  alertaConcessionariaAviso: {
    backgroundColor: "#f0f9ff",
    borderColor: "#bae6fd",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  tituloAlertaAviso: {
    color: "#0369a1",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  textoAlertaAviso: { color: "#0c4a6e", fontSize: 13, lineHeight: 18 },
  alertaConcessionariaCritico: {
    backgroundColor: "#fef2f2",
    borderColor: "#fecaca",
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    flexDirection: "row",
    alignItems: "flex-start",
  },
  tituloAlertaCritico: {
    color: "#b91c1c",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 2,
  },
  textoAlertaCritico: { color: "#7f1d1d", fontSize: 13, lineHeight: 18 },
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
  botaoExportar: {
    backgroundColor: "#10b981",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  textoBotaoExportar: { color: "#ffffff", fontSize: 16, fontWeight: "bold" },
});
