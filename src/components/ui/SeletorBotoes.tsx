import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

interface SeletorBotoesProps {
  label: string;
  opcoes: { id: any; label: string }[];
  valorSelecionado: any;
  onSelecionar: (id: any) => void;
}

export default function SeletorBotoes({
  label,
  opcoes,
  valorSelecionado,
  onSelecionar,
}: SeletorBotoesProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <View style={styles.row}>
        {opcoes.map((opcao) => {
          const ativo = opcao.id === valorSelecionado;
          return (
            <TouchableOpacity
              key={opcao.id}
              style={[styles.botao, ativo && styles.botaoAtivo]}
              onPress={() => onSelecionar(opcao.id)}
            >
              <Text style={[styles.texto, ativo && styles.textoAtivo]}>
                {opcao.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginVertical: 6 },
  label: { fontSize: 14, fontWeight: "600", color: "#4b5563", marginBottom: 6 },
  row: { flexDirection: "row", justifyContent: "space-between" },
  botao: {
    flex: 1,
    backgroundColor: "#f9fafb",
    borderWidth: 1,
    borderColor: "#d1d5db",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
  botaoAtivo: { backgroundColor: "#208AEF", borderColor: "#1e40af" },
  texto: { fontSize: 14, fontWeight: "bold", color: "#4b5563" },
  textoAtivo: { color: "#ffffff" },
});
