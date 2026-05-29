import { StyleSheet, Text, View } from "react-native";

interface CardResultadoProps {
  titulo: string;
  corBorda: string;
  items: {
    label: string;
    valor: string | number;
    corValor?: string;
    bold?: boolean;
  }[];
}

export default function CardResultado({
  titulo,
  corBorda,
  items,
}: CardResultadoProps) {
  return (
    <View style={[styles.card, { borderLeftColor: corBorda }]}>
      <Text style={styles.titulo}>{titulo}</Text>
      {items.map((item, index) => (
        <Text key={index} style={styles.texto}>
          {item.label}:{" "}
          <Text
            style={[
              item.bold !== false && styles.bold,
              item.corValor ? { color: item.corValor } : null,
            ]}
          >
            {item.valor}
          </Text>
        </Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  titulo: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#1f2937",
  },
  texto: { fontSize: 14, color: "#4b5563", marginVertical: 2 },
  bold: { fontWeight: "bold" },
});
