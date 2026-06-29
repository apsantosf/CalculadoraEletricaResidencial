// src/components/ui/CardVerificacaoRamal.tsx
import { useEffect, useState } from "react";
import {
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import {
    determinarTipoFornecimento,
    obterFatorDemandaGeral,
    processarTrechoRamal,
} from "../../utils/calculations";

interface CardVerificacaoRamalProps {
  potenciaBase: number;
  tensaoGeral: number;
  onCalcularRamal: (resultados: any) => void;
}

export function CardVerificacaoRamal({
  potenciaBase,
  tensaoGeral,
  onCalcularRamal,
}: CardVerificacaoRamalProps) {
  const [distanciaExterna, setDistanciaExterna] = useState("");
  const [distanciaInterna, setDistanciaInterna] = useState("");
  const [potenciaEditavel, setPotenciaEditavel] = useState("");
  const [resultadosLocal, setResultadosLocal] = useState<any>(null);

  // Sincroniza a potência calculada dos cômodos com o input editável
  useEffect(() => {
    if (potenciaBase > 0) {
      setPotenciaEditavel(potenciaBase.toString());
    } else {
      setPotenciaEditavel("");
      setResultadosLocal(null);
      onCalcularRamal(null);
    }
  }, [potenciaBase]);

  const handleCalcular = () => {
    const pot = parseFloat(potenciaEditavel);
    const distExt = parseFloat(distanciaExterna.replace(",", "."));
    const distInt = parseFloat(distanciaInterna.replace(",", "."));

    if (isNaN(pot) || pot <= 0)
      return Alert.alert("Atenção", "Informe uma potência total válida.");
    if (isNaN(distExt) || isNaN(distInt))
      return Alert.alert("Atenção", "Preencha as distâncias corretamente.");

    const fatorDemanda = obterFatorDemandaGeral(pot);
    const potenciaDemanda = pot * fatorDemanda;
    const correnteDemanda = potenciaDemanda / tensaoGeral;
    const caboMinimo = 10;

    const trecho1 = processarTrechoRamal(
      distExt,
      correnteDemanda,
      tensaoGeral,
      caboMinimo,
    );
    const trecho2 = processarTrechoRamal(
      distInt,
      correnteDemanda,
      tensaoGeral,
      0,
    );

    const resumoResultados = {
      fatorAplicado: Math.round(fatorDemanda * 100),
      potenciaDemanda: Math.round(potenciaDemanda),
      correnteDemanda: Number(correnteDemanda.toFixed(1)),
      fornecimento: determinarTipoFornecimento(trecho1.disjuntor),
      trecho1,
      trecho2,
    };

    setResultadosLocal(resumoResultados);
    onCalcularRamal(resumoResultados);
  };

  return (
    <View style={styles.cardEntrada}>
      <Text style={styles.tituloSecao}>
        📏 Verificação de Queda de Tensão (Opcional)
      </Text>
      <Text style={styles.textoInstrucao}>
        Informe as distâncias para verificar se os cabos gerais precisam ser
        aumentados.
      </Text>

      <Text style={styles.labelInput}>Potência Total (Watts/VA)</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        value={potenciaEditavel}
        onChangeText={setPotenciaEditavel}
        placeholder="Ex: 15000"
      />

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.labelInput}>Rua → Medidor (m)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={distanciaExterna}
            onChangeText={setDistanciaExterna}
            placeholder="Ex: 15"
          />
        </View>
        <View style={styles.col}>
          <Text style={styles.labelInput}>Medidor → QDC (m)</Text>
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={distanciaInterna}
            onChangeText={setDistanciaInterna}
            placeholder="Ex: 8"
          />
        </View>
      </View>

      <TouchableOpacity
        style={styles.botaoCalcularRamal}
        onPress={handleCalcular}
      >
        <Text style={styles.textoBotao}>Verificar Cabos</Text>
      </TouchableOpacity>

      {resultadosLocal && (
        <View style={styles.resultadoRamalBox}>
          <Text style={styles.txtFornecimentoDestaque}>
            {resultadosLocal.fornecimento}
          </Text>
          <Text style={styles.txtDemandaAplicada}>
            Demanda Final: {resultadosLocal.potenciaDemanda} VA
          </Text>
          <View style={styles.linhaTrecho}>
            <Text style={styles.lblTrecho}>📍 Rua ao Medidor:</Text>
            <Text style={styles.valTrecho}>
              Cabo {resultadosLocal.trecho1.bitola} mm² | Disj:{" "}
              {resultadosLocal.trecho1.disjuntor} A
            </Text>
          </View>
          <View style={styles.linhaTrecho}>
            <Text style={styles.lblTrecho}>🏠 Medidor ao QDC:</Text>
            <Text style={styles.valTrecho}>
              Cabo {resultadosLocal.trecho2.bitola} mm² | Disj:{" "}
              {resultadosLocal.trecho2.disjuntor} A
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  cardEntrada: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 2,
  },
  tituloSecao: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 6,
  },
  textoInstrucao: {
    fontSize: 12,
    color: "#6b7280",
    marginBottom: 14,
    fontStyle: "italic",
  },
  labelInput: {
    fontSize: 13,
    fontWeight: "600",
    color: "#374151",
    marginBottom: 4,
  },
  input: {
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    fontSize: 15,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  col: { width: "48%" },
  botaoCalcularRamal: {
    backgroundColor: "#0284c7",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 4,
  },
  textoBotao: { color: "#ffffff", fontWeight: "bold", fontSize: 14 },
  resultadoRamalBox: {
    backgroundColor: "#eff6ff",
    borderWidth: 1,
    borderColor: "#bfdbfe",
    borderRadius: 8,
    padding: 14,
    marginTop: 16,
  },
  txtFornecimentoDestaque: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1d4ed8",
    textAlign: "center",
    marginBottom: 4,
  },
  txtDemandaAplicada: {
    fontSize: 12,
    color: "#3b82f6",
    textAlign: "center",
    marginBottom: 12,
    fontWeight: "500",
  },
  linhaTrecho: {
    flexDirection: "column",
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: "#dbeafe",
  },
  lblTrecho: { fontSize: 12, fontWeight: "bold", color: "#1e40af" },
  valTrecho: {
    fontSize: 14,
    color: "#1e40af",
    marginTop: 2,
    fontWeight: "500",
  },
});
