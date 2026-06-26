//  src/app/tue.tsx
import { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import CardResultado from "../components/ui/CardResultado";
import CustomHeader from "../components/ui/CustomHeader";
import FormTue from "../components/ui/FormTue";
import { useData } from "../context/DataContext";
import { dimensionarTUE } from "../utils/calculations";

export default function TelaTues() {
  const { adicionarCircuitos, tokenReset, circuitos, tensaoGeral } = useData();
  const [resultadoTue, setResultadoTue] = useState<any>(null);

  // Filtra os TUEs já adicionados ao quadro
  const tuesCadastrados = circuitos.filter((c) => c.tipo === "tue");

  useEffect(() => {
    setResultadoTue(null);
  }, [tokenReset]);

  const handleCalcularTue = (dados: { nome: string; potencia: number }) => {
    const fp = dados.nome.toLowerCase().includes("chuveiro") ? 1.0 : 0.85;
    const dimensionamento = dimensionarTUE(dados.potencia, tensaoGeral, fp);

    setResultadoTue({
      nome: dados.nome,
      potencia: dados.potencia,
      tensao: tensaoGeral,
      ...dimensionamento,
    });
  };

  const handleAdicionarTue = () => {
    if (!resultadoTue) return;

    adicionarCircuitos([
      {
        id: Math.random().toString(),
        nome: `${resultadoTue.nome} (${resultadoTue.potencia}W - ${tensaoGeral}V)`,
        tipo: "tue",
        potenciaVA: resultadoTue.potenciaVA,
        potenciaWatts: resultadoTue.potencia,
        disjuntor: resultadoTue.disjuntor,
        bitola: resultadoTue.secaoCabo,
      },
    ]);
    setResultadoTue(null);
  };

  // VERIFICAÇÃO DE BLOQUEIO: Se a tensão geral não foi selecionada (ou seja, diferente de 127 ou 220), bloqueia a aba.
  const tensaoNaoDefinida = tensaoGeral !== 127 && tensaoGeral !== 220;

  return (
    <View style={styles.wrapperWeb}>
      <CustomHeader title="Circuitos Específicos" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingTop: 16, paddingBottom: 140 }}
      >
        {tensaoNaoDefinida ? (
          <View style={styles.avisoBloqueioContainer}>
            <Text style={styles.avisoBloqueioTitulo}>⚠️ Acesso Bloqueado</Text>
            <Text style={styles.avisoBloqueioTexto}>
              Para preencher os Circuitos Específicos (TUEs), primeiro deve
              voltar à aba de **Previsão de Carga** e selecionar a **Tensão de
              Entrada (Concessionária)**.
            </Text>
          </View>
        ) : (
          <>
            <FormTue
              onCalcular={handleCalcularTue}
              onAdicionar={handleAdicionarTue}
              podeAdicionar={resultadoTue !== null}
            />

            {resultadoTue && (
              <View style={styles.resultadoContainer}>
                <Text style={styles.txtFeedback}>
                  ✅ Pronto para Adicionar!
                </Text>
                <CardResultado
                  titulo={`⚡ Circuito Dedicado - ${resultadoTue.nome}`}
                  corBorda="#7c3aed"
                  items={[
                    {
                      label: "Potência",
                      valor: `${resultadoTue.potenciaVA} VA`,
                    },
                    {
                      label: "Corrente",
                      valor: `${resultadoTue.correnteProjeto} A`,
                    },
                    {
                      label: "Cabo Ideal",
                      valor: `${resultadoTue.secaoCabo} mm²`,
                      corValor: "green",
                    },
                    {
                      label: "Disjuntor",
                      valor: `${resultadoTue.disjuntor} A`,
                      corValor: "red",
                    },
                  ]}
                />
              </View>
            )}

            {tuesCadastrados.length > 0 && (
              <View style={styles.resumoContainer}>
                <Text style={styles.txtResumoTitulo}>
                  Total de dispositivos cadastrados: {tuesCadastrados.length}
                </Text>
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapperWeb: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
    padding: 16,
    maxWidth: 450,
    width: "100%",
    alignSelf: "center",
  },
  resultadoContainer: { marginVertical: 10 },
  resumoContainer: {
    marginTop: 14,
    padding: 12,
    backgroundColor: "#e5e7eb",
    borderRadius: 10,
  },
  txtResumoTitulo: { fontSize: 14, fontWeight: "bold", color: "#374151" },
  txtFeedback: {
    fontSize: 14,
    color: "#7c3aed",
    fontWeight: "bold",
    marginBottom: 8,
    marginLeft: 4,
  },
  avisoBloqueioContainer: {
    backgroundColor: "#ffffff",
    padding: 24,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  avisoBloqueioTitulo: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1F2937",
    marginBottom: 12,
  },
  avisoBloqueioTexto: {
    fontSize: 14,
    color: "#4B5563",
    textAlign: "center",
    lineHeight: 20,
  },
});
