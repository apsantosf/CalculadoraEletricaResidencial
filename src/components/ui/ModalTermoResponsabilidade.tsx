// src/components/ui/ModalTermoResponsabilidade.tsx
import { FontAwesome5 } from "@expo/vector-icons";
import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

interface ModalProps {
  visivel: boolean;
  onAceitar: () => void;
}

export default function ModalTermoResponsabilidade({
  visivel,
  onAceitar,
}: ModalProps) {
  return (
    <Modal visible={visivel} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={styles.container}>
          <View style={styles.header}>
            <FontAwesome5 name="shield-alt" size={28} color="#2563eb" />
            <Text style={styles.tituloHeader}>Aviso de Responsabilidade</Text>
          </View>

          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={true}
          >
            <Text style={styles.subtitulo}>
              Termo de Uso e Responsabilidade Técnica
            </Text>

            <Text style={styles.texto}>
              O <Text style={styles.bold}>Elétrica Residencial</Text> é uma
              ferramenta tecnológica de facilitação desenvolvida exclusivamente
              para agilizar rotinas de cálculo e pré-dimensionamento de
              instalações elétricas, com base nos parâmetros gerais da NBR 5410.
            </Text>

            <View style={styles.boxAlerta}>
              <Text style={styles.textoAlerta}>
                ⚠️ <Text style={styles.bold}>ATENÇÃO IMPORTANTE:</Text> Este
                aplicativo <Text style={styles.bold}>NÃO substitui</Text> o
                projeto elétrico formal, laudos técnicos ou a atuação direta de
                um profissional habilitado.
              </Text>
            </View>

            <Text style={styles.texto}>
              1. <Text style={styles.bold}>Habilitação Técnica:</Text> Toda e
              qualquer instalação, modificação ou execução física de
              infraestrutura elétrica deve ser elaborada, executada e
              supervisionada por profissional credenciado em seu respectivo
              conselho de classe (<Text style={styles.bold}>CREA, CFT</Text> ou
              equivalente), com a devida emissão da Anotação ou Termo de
              Responsabilidade Técnica (<Text style={styles.bold}>ART/TRT</Text>
              ).
            </Text>

            <Text style={styles.texto}>
              2. <Text style={styles.bold}>Isenção do Desenvolvedor:</Text> O
              aplicativo atua estritamente como um instrumento de apoio
              matemático. O desenvolvedor isenta-se de qualquer responsabilidade
              por dados incorretos inseridos pelo usuário, interpretações
              equivocadas dos resultados ou execuções físicas em desacordo com
              as normas de segurança.
            </Text>

            <Text style={styles.textoFinal}>
              Ao prosseguir, você declara que compreendeu este aviso e concorda
              em utilizar a ferramenta sob sua própria responsabilidade
              profissional.
            </Text>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.btnAceitar}
              onPress={onAceitar}
              activeOpacity={0.85}
            >
              <Text style={styles.btnAceitarTexto}>
                Li, Concordo e Assumo a Responsabilidade ⚡
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.75)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
  },
  container: {
    backgroundColor: "#ffffff",
    width: "100%",
    maxWidth: 450,
    maxHeight: "85%",
    borderRadius: 16,
    overflow: "hidden",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    padding: 20,
    backgroundColor: "#eff6ff",
    borderBottomWidth: 1,
    borderColor: "#dbeafe",
  },
  tituloHeader: { fontSize: 18, fontWeight: "bold", color: "#1e3a8a" },
  content: { padding: 20 },
  subtitulo: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
  },
  texto: { fontSize: 13, color: "#4b5563", lineHeight: 20, marginBottom: 12 },
  textoFinal: {
    fontSize: 13,
    color: "#1f2937",
    fontWeight: "600",
    lineHeight: 20,
    marginTop: 8,
    marginBottom: 20,
  },
  bold: { fontWeight: "bold", color: "#111827" },
  boxAlerta: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fecaca",
    borderRadius: 8,
    padding: 12,
    marginBottom: 14,
  },
  textoAlerta: { fontSize: 13, color: "#991b1b", lineHeight: 18 },
  footer: {
    padding: 16,
    borderTopWidth: 1,
    borderColor: "#e5e7eb",
    backgroundColor: "#f9fafb",
  },
  btnAceitar: {
    backgroundColor: "#2563eb",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  btnAceitarTexto: {
    color: "#ffffff",
    fontWeight: "bold",
    fontSize: 14,
    textAlign: "center",
  },
});
