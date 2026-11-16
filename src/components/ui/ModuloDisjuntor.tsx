// src/components/ui/ModuloDisjuntor.tsx
import { StyleSheet, Text, View } from "react-native";

interface ModuloProps {
  tipo: string; // "geral", "idr", "dps", "iluminacao", "tug", "tue"
  rotulo: string;
  detalhe?: string;
  corrente?: number;
  tensao?: number; // 🚀 Propriedade de tensão adicionada
  poleLargura?: number; // Quantos espaços ocupa (ex: 1 ou 2)
}

export default function ModuloDisjuntor({
  tipo,
  rotulo,
  detalhe,
  corrente,
  tensao,
  poleLargura = 1,
}: ModuloProps) {
  const getCorEstilo = () => {
    switch (tipo) {
      case "geral":
        return { bg: "#1E2937", border: "#0F172A", text: "#F8FAFC" };
      case "idr":
        return { bg: "#0284C7", border: "#0369A1", text: "#FFFFFF" };
      case "dps":
        return { bg: "#D97706", border: "#B45309", text: "#FFFFFF" };
      case "iluminacao":
        return { bg: "#E0F2FE", border: "#BAE6FD", text: "#0369A1" };
      case "tug":
        return { bg: "#FEF3C7", border: "#FDE68A", text: "#B45309" };
      case "tue":
        return { bg: "#FEE2E2", border: "#FECACA", text: "#B91C1C" };
      default:
        return { bg: "#F3F4F6", border: "#E5E7EB", text: "#374151" };
    }
  };

  const estilo = getCorEstilo();

  return (
    <View
      style={[
        styles.moduloContainer,
        {
          backgroundColor: estilo.bg,
          borderColor: estilo.border,
          flex: poleLargura,
          minWidth: 45 * poleLargura,
          maxWidth: 90 * poleLargura,
        },
      ]}
    >
      <View style={styles.chavinha} />

      <Text
        style={[styles.textoRotulo, { color: estilo.text }]}
        numberOfLines={2}
      >
        {rotulo}
      </Text>

      {/* 🚀 BLOCO DE CORRENTE E VOLTAGEM JUNTOS */}
      <View style={{ alignItems: "center" }}>
        {corrente && (
          <Text style={[styles.textoCorrente, { color: estilo.text }]}>
            {corrente}A
          </Text>
        )}
        {tensao && (
          <Text style={[styles.textoTensao, { color: estilo.text }]}>
            {tensao}V
          </Text>
        )}
      </View>

      {detalhe && (
        <Text
          style={[styles.textoDetalhe, { color: estilo.text }]}
          numberOfLines={1}
        >
          {detalhe}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  moduloContainer: {
    height: 115,
    borderWidth: 1.5,
    borderRadius: 6,
    padding: 6,
    alignItems: "center",
    justifyContent: "space-between",
    margin: 3,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1,
    elevation: 2,
  },
  chavinha: {
    width: 14,
    height: 8,
    backgroundColor: "#4B5563",
    borderRadius: 2,
    marginBottom: 2,
  },
  textoRotulo: {
    fontSize: 10,
    fontWeight: "bold",
    textAlign: "center",
  },
  textoCorrente: {
    fontSize: 12,
    fontWeight: "900",
    lineHeight: 14,
  },
  textoTensao: {
    fontSize: 9.5,
    fontWeight: "700",
    opacity: 0.9,
  },
  textoDetalhe: {
    fontSize: 9,
    opacity: 0.8,
    textAlign: "center",
  },
});
