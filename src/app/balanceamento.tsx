// src/app/balanceamento.tsx
import { FontAwesome5 } from "@expo/vector-icons";
import { router } from "expo-router"; // 🚀 Importado o router para podermos voltar
import { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import CustomHeader from "../components/ui/CustomHeader";
import { useData } from "../context/DataContext";

interface Carga {
  id: string;
  nome: string;
  comodo: string;
  potenciaVA: number;
  tensao: number;
  ehBifasico: boolean;
}

export default function TelaBalanceamento() {
  const { comodos, tensaoGeral } = useData();

  const [faseR, setFaseR] = useState<Carga[]>([]);
  const [faseS, setFaseS] = useState<Carga[]>([]);
  const [cargasBifasicas, setCargasBifasicas] = useState<Carga[]>([]);

  // 🧠 Algoritmo de Auto-Balanceamento
  const autoBalancear = () => {
    let listaMonofasica: Carga[] = [];
    let listaBifasica: Carga[] = [];

    // 1. Extrair e classificar todas as cargas
    comodos.forEach((c) => {
      c.dispositivos.forEach((d, idx) => {
        let potTotal = d.potencia * d.quantidade;
        let potVA = potTotal;
        if (d.tipo === "tue") {
          const fp = d.nome.toLowerCase().includes("chuveiro") ? 1.0 : 0.85;
          potVA = potTotal / fp;
        }

        const tensaoDispositivo = d.tensao || tensaoGeral;
        const ehBifasico = tensaoGeral === 127 && tensaoDispositivo === 220;

        const carga: Carga = {
          id: `${c.id}-${idx}-${Math.random().toString(36).substring(7)}`,
          nome: d.nome,
          comodo: c.nome,
          potenciaVA: Math.round(potVA),
          tensao: tensaoDispositivo,
          ehBifasico,
        };

        if (ehBifasico) listaBifasica.push(carga);
        else listaMonofasica.push(carga);
      });
    });

    setCargasBifasicas(listaBifasica);

    // 2. Ordenar as cargas monofásicas da mais pesada para a mais leve (Melhor distribuição)
    listaMonofasica.sort((a, b) => b.potenciaVA - a.potenciaVA);

    let tempFaseR: Carga[] = [];
    let tempFaseS: Carga[] = [];
    let totalR = 0;
    let totalS = 0;

    // 3. Distribuir inteligentemente
    listaMonofasica.forEach((carga) => {
      if (totalR <= totalS) {
        tempFaseR.push(carga);
        totalR += carga.potenciaVA;
      } else {
        tempFaseS.push(carga);
        totalS += carga.potenciaVA;
      }
    });

    setFaseR(tempFaseR);
    setFaseS(tempFaseS);
  };

  useEffect(() => {
    autoBalancear(); // Executa assim que a tela abre
  }, []);

  // 🔄 Função para o utilizador mover manualmente a carga de fase
  const moverCarga = (carga: Carga, origem: "R" | "S") => {
    if (origem === "R") {
      setFaseR((prev) => prev.filter((c) => c.id !== carga.id));
      setFaseS((prev) => [...prev, carga]);
    } else {
      setFaseS((prev) => prev.filter((c) => c.id !== carga.id));
      setFaseR((prev) => [...prev, carga]);
    }
  };

  // Cálculos de Totais (Atualizados automaticamente ao mover os cards)
  const totalBifasico = cargasBifasicas.reduce(
    (acc, c) => acc + c.potenciaVA,
    0,
  );
  const metadeBifasico = Math.round(totalBifasico / 2);

  const totalR =
    faseR.reduce((acc, c) => acc + c.potenciaVA, 0) + metadeBifasico;
  const totalS =
    faseS.reduce((acc, c) => acc + c.potenciaVA, 0) + metadeBifasico;

  // 🌡️ O Termómetro (Diferença Percentual)
  const maxFase = Math.max(totalR, totalS);
  const minFase = Math.min(totalR, totalS);
  const diffPercentual =
    maxFase > 0 ? ((maxFase - minFase) / maxFase) * 100 : 0;

  const estaBalanceado = diffPercentual <= 15; // Tolerância de 15%

  // Renderizador Inteligente dos Cartões
  const renderCardCarga = (carga: Carga, local: "BIFASICO" | "R" | "S") => (
    <View key={carga.id} style={styles.cardCarga}>
      <View style={{ flex: 1 }}>
        <Text style={styles.nomeCarga} numberOfLines={1}>
          {carga.nome}
        </Text>
        <Text style={styles.comodoCarga} numberOfLines={1}>
          {carga.comodo}
        </Text>
        <View style={styles.badgePotencia}>
          <Text style={styles.textoBadge}>{carga.potenciaVA} VA</Text>
        </View>
      </View>

      {/* 🚀 SETINHAS DE MOVIMENTAÇÃO MANUAL */}
      {local === "R" && (
        <TouchableOpacity
          style={styles.botaoMoverDireita}
          onPress={() => moverCarga(carga, "R")}
        >
          <FontAwesome5 name="arrow-right" size={14} color="#ffffff" />
        </TouchableOpacity>
      )}

      {local === "S" && (
        <TouchableOpacity
          style={styles.botaoMoverEsquerda}
          onPress={() => moverCarga(carga, "S")}
        >
          <FontAwesome5 name="arrow-left" size={14} color="#ffffff" />
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <View style={styles.wrapperWeb}>
      <CustomHeader title="Balanceamento de Fases" />

      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 60, paddingTop: 16 }}
      >
        {/* ⬅️ BOTÃO DE VOLTAR AO QUADRO GERAL */}
        <TouchableOpacity
          style={styles.botaoVoltar}
          onPress={() => router.back()} // Volta para a tela anterior
        >
          <FontAwesome5 name="arrow-left" size={14} color="#475569" />
          <Text style={styles.textoBotaoVoltar}>Voltar ao Quadro Geral</Text>
        </TouchableOpacity>

        {/* 🌡️ BANNER DE STATUS DO BALANCEAMENTO */}
        <View
          style={[
            styles.bannerStatus,
            estaBalanceado ? styles.bannerVerde : styles.bannerLaranja,
          ]}
        >
          <FontAwesome5
            name={estaBalanceado ? "check-circle" : "exclamation-triangle"}
            size={24}
            color={estaBalanceado ? "#065f46" : "#9a3412"}
            style={{ marginBottom: 8 }}
          />
          <Text
            style={[
              styles.tituloBanner,
              { color: estaBalanceado ? "#065f46" : "#9a3412" },
            ]}
          >
            {estaBalanceado
              ? "✅ Quadro Balanceado!"
              : "⚠️ Atenção: Desbalanceado"}
          </Text>
          <Text
            style={[
              styles.textoBanner,
              { color: estaBalanceado ? "#064e3b" : "#7c2d12" },
            ]}
          >
            A diferença de carga entre a Fase mais pesada e a mais leve é de{" "}
            <Text style={{ fontWeight: "bold" }}>
              {diffPercentual.toFixed(1)}%
            </Text>
            .
            {estaBalanceado
              ? " (Excelente, dentro da margem de 15%)"
              : " (Acima de 15%. Risco de desarme precoce do disjuntor geral)."}
          </Text>
        </View>

        {/* 🔄 BOTÃO RE-BALANCEAR AUTOMÁTICO */}
        <TouchableOpacity style={styles.botaoAuto} onPress={autoBalancear}>
          <FontAwesome5 name="magic" size={14} color="#fff" />
          <Text style={styles.textoBotaoAuto}>
            {" "}
            Otimizar Distribuição Automaticamente
          </Text>
        </TouchableOpacity>

        {/* ⚡ CARGAS BIFÁSICAS (Ambas as fases) */}
        {cargasBifasicas.length > 0 && (
          <View style={styles.bifasicoContainer}>
            <Text style={styles.tituloSecao}>
              ⚡ Equipamentos 220V (Distribuídos em ambas as fases)
            </Text>
            <View style={styles.gridBifasico}>
              {cargasBifasicas.map((carga) =>
                renderCardCarga(carga, "BIFASICO"),
              )}
            </View>
          </View>
        )}

        {/* 📊 COLUNAS DAS FASES */}
        <View style={styles.colunasContainer}>
          {/* COLUNA FASE R */}
          <View style={styles.colunaFase}>
            <View style={[styles.headerFase, { backgroundColor: "#dc2626" }]}>
              <Text style={styles.tituloFase}>Fase R</Text>
              <Text style={styles.totalFase}>{totalR} VA</Text>
            </View>
            <View style={styles.listaFase}>
              {faseR.map((carga) => renderCardCarga(carga, "R"))}
              {faseR.length === 0 && (
                <Text style={styles.txtVazio}>Nenhuma carga</Text>
              )}
            </View>
          </View>

          {/* COLUNA FASE S */}
          <View style={styles.colunaFase}>
            <View style={[styles.headerFase, { backgroundColor: "#000000" }]}>
              <Text style={styles.tituloFase}>Fase S</Text>
              <Text style={styles.totalFase}>{totalS} VA</Text>
            </View>
            <View style={styles.listaFase}>
              {faseS.map((carga) => renderCardCarga(carga, "S"))}
              {faseS.length === 0 && (
                <Text style={styles.txtVazio}>Nenhuma carga</Text>
              )}
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapperWeb: { flex: 1, backgroundColor: "#f3f4f6", width: "100%" },
  container: {
    flex: 1,
    padding: 16,
    maxWidth: 800,
    width: "100%",
    alignSelf: "center",
  },

  // 🚀 Estilos do Botão de Voltar
  botaoVoltar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e2e8f0",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  textoBotaoVoltar: {
    color: "#475569",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 14,
  },

  bannerStatus: {
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 16,
    borderWidth: 1,
  },
  bannerVerde: { backgroundColor: "#d1fae5", borderColor: "#a7f3d0" },
  bannerLaranja: { backgroundColor: "#ffedd5", borderColor: "#fed7aa" },
  tituloBanner: { fontSize: 18, fontWeight: "bold", marginBottom: 4 },
  textoBanner: { fontSize: 13, textAlign: "center", lineHeight: 18 },

  botaoAuto: {
    flexDirection: "row",
    backgroundColor: "#0284c7",
    padding: 14,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
    elevation: 2,
  },
  textoBotaoAuto: { color: "#fff", fontWeight: "bold", marginLeft: 8 },

  bifasicoContainer: {
    backgroundColor: "#e2e8f0",
    padding: 12,
    borderRadius: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#cbd5e1",
  },
  tituloSecao: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#334155",
    marginBottom: 10,
    textAlign: "center",
  },
  gridBifasico: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 8,
  },

  colunasContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 12,
  },
  colunaFase: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    overflow: "hidden",
  },
  headerFase: { padding: 12, alignItems: "center", justifyContent: "center" },
  tituloFase: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  totalFase: {
    color: "#fff",
    fontWeight: "900",
    fontSize: 14,
    marginTop: 4,
    opacity: 0.9,
  },

  listaFase: { padding: 8, minHeight: 200 },
  txtVazio: { textAlign: "center", color: "#9ca3af", marginTop: 20 },

  cardCarga: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8fafc",
    padding: 10,
    borderRadius: 6,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  nomeCarga: { fontSize: 12, fontWeight: "bold", color: "#1e293b" },
  comodoCarga: { fontSize: 10, color: "#64748b", marginBottom: 6 },
  badgePotencia: {
    backgroundColor: "#e0f2fe",
    alignSelf: "flex-start",
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  textoBadge: { fontSize: 11, color: "#0369a1", fontWeight: "bold" },

  botaoMoverDireita: {
    backgroundColor: "#3b82f6",
    padding: 10,
    borderRadius: 6,
    marginLeft: 8,
  },
  botaoMoverEsquerda: {
    backgroundColor: "#3b82f6",
    padding: 10,
    borderRadius: 6,
    marginRight: 8,
  },
});
