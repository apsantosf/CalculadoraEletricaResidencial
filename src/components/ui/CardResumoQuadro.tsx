// src/components/ui/CardResumoQuadro.tsx
import { StyleSheet, Text, View } from "react-native";

interface ResultadoDimensionamento {
  potenciaTotalVA: number;
  correnteGeral: number;
  caboGeral: number;
  disjuntorGeral: number;
  distanciaMetros?: number;
  qtdVias?: number;
  metragemTotalVias?: number;
}

interface CardResumoQuadroProps {
  resultadoQDC: ResultadoDimensionamento;
  resultadoDemanda: ResultadoDimensionamento;
  concessionaria: string;
}

export function CardResumoQuadro({
  resultadoQDC,
  resultadoDemanda,
  concessionaria,
}: CardResumoQuadroProps) {
  return (
    <View style={styles.container}>
      {/* CARTÃO VERDE: QDC */}
      <View style={styles.cardRelatorio}>
        <Text style={styles.tituloRelatorio}>
          💡 QDC - INSTALADO (INTERNO):
        </Text>
        <View style={styles.linhaResumo}>
          <Text style={styles.labelBranco}>Potência Total Bruta:</Text>
          <Text style={styles.valorBranco}>
            {resultadoQDC.potenciaTotalVA} VA
          </Text>
        </View>
        <View style={styles.linhaResumo}>
          <Text style={styles.labelBranco}>Corrente Máxima Teórica:</Text>
          <Text style={styles.valorBranco}>{resultadoQDC.correnteGeral} A</Text>
        </View>
        <View style={styles.linhaResumo}>
          <Text style={styles.labelBranco}>Cabo Alimentador Interno:</Text>
          <Text style={styles.valorAmarelo}>{resultadoQDC.caboGeral} mm²</Text>
        </View>
        <View style={styles.linhaResumo}>
          <Text style={styles.labelBranco}>Disjuntor Geral (QDC):</Text>
          <Text style={styles.valorAmarelo}>
            {resultadoQDC.disjuntorGeral} A
          </Text>
        </View>
      </View>

      {/* CARTÃO AZUL: PADRÃO DE ENTRADA COM DETALHAMENTO DE METRAGEM E VIAS */}
      <View style={[styles.cardRelatorio, { backgroundColor: "#312e81" }]}>
        <Text style={[styles.tituloRelatorio, { color: "#c7d2fe" }]}>
          🏢 PADRÃO DE ENTRADA ({concessionaria}):
        </Text>
        <View style={styles.linhaResumo}>
          <Text style={styles.labelBranco}>Demanda Corrigida (S):</Text>
          <Text style={[styles.valorAmarelo, { color: "#ca8a04" }]}>
            {resultadoDemanda.potenciaTotalVA} VA
          </Text>
        </View>
        <View style={styles.linhaResumo}>
          <Text style={styles.labelBranco}>Corrente de Demanda (In):</Text>
          <Text style={styles.valorBranco}>
            {resultadoDemanda.correnteGeral} A
          </Text>
        </View>
        <View style={styles.linhaResumo}>
          <Text style={styles.labelBranco}>Cabo do Ramal (Medidor):</Text>
          <Text style={styles.valorAmarelo}>
            {resultadoDemanda.caboGeral} mm²
          </Text>
        </View>

        {/* DETALHE EXECUTIVO DA METRAGEM POR VIA */}
        {resultadoDemanda.distanciaMetros &&
        resultadoDemanda.distanciaMetros > 0 ? (
          <View style={styles.linhaResumoDestaque}>
            <Text style={styles.labelBrancoDestaque}>
              Alimentador (Detalhe):
            </Text>
            <Text style={styles.valorAmareloDestaque}>
              {resultadoDemanda.distanciaMetros}m x {resultadoDemanda.qtdVias}{" "}
              vias = {resultadoDemanda.metragemTotalVias}m (c/ folga)
            </Text>
          </View>
        ) : null}

        <View style={styles.linhaResumo}>
          <Text style={styles.labelBranco}>Disjuntor Geral (Poste):</Text>
          <Text style={styles.valorAmarelo}>
            {resultadoDemanda.disjuntorGeral} A
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginTop: 10 },
  cardRelatorio: {
    backgroundColor: "#064e3b",
    padding: 16,
    borderRadius: 12,
    marginTop: 10,
  },
  tituloRelatorio: {
    color: "#fde047",
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  linhaResumo: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 5,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.2)",
  },
  linhaResumoDestaque: {
    flexDirection: "column",
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(255,255,255,0.2)",
    backgroundColor: "rgba(255,255,255,0.05)",
    paddingHorizontal: 6,
    borderRadius: 6,
    marginVertical: 4,
  },
  labelBranco: { color: "#ffffff", fontSize: 13 },
  valorBranco: { color: "#ffffff", fontWeight: "500" },
  valorAmarelo: { color: "#fde047", fontWeight: "bold", fontSize: 14 },
  labelBrancoDestaque: {
    color: "#e0e7ff",
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 2,
  },
  valorAmareloDestaque: { color: "#fde047", fontWeight: "bold", fontSize: 13 },
});
