// src/context/DataContext.tsx
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Comodo, Dispositivo } from "../utils/templates";

export type TipoSistema = "127/220V" | "220/380V";
export type TipoImovel = "Casa" | "Apartamento";

interface DataContextType {
  tensaoGeral: 127 | 220;
  setTensaoGeral: (tensao: 127 | 220) => void;
  distribuidora: string;
  setDistribuidora: (dist: string) => void;
  sistemaDistribuicao: TipoSistema;
  setSistemaDistribuicao: (sistema: TipoSistema) => void;
  tipoImovel: TipoImovel;
  setTipoImovel: (tipo: TipoImovel) => void;
  comodos: Comodo[];
  adicionarComodo: (novoComodo: Comodo) => void;
  removerComodo: (id: string) => void;
  atualizarComodo: (id: string, dados: Partial<Comodo>) => void;
  adicionarDispositivo: (
    comodoId: string,
    dispositivo: Omit<Dispositivo, "id">,
  ) => void;
  atualizarDispositivo: (
    comodoId: string,
    dispositivoId: string,
    dados: Partial<Dispositivo>,
  ) => void;
  removerDispositivo: (comodoId: string, dispositivoId: string) => void;

  projetosSalvos: any[];
  nomeProjetoAtual: string;
  idProjetoAtual: string | null;
  zerarProjeto: () => void;
  salvarProjetoAtual: (nomeProjeto: string) => Promise<void>;
  carregarProjeto: (id: string) => void;
  excluirProjeto: (id: string) => Promise<void>;
  tokenReset: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [tensaoGeral, setTensaoGeral] = useState<127 | 220>(127);
  const [distribuidora, setDistribuidora] = useState<string>("CPFL");
  const [sistemaDistribuicao, setSistemaDistribuicao] =
    useState<TipoSistema>("127/220V");
  const [tipoImovel, setTipoImovel] = useState<TipoImovel>("Casa");
  const [comodos, setComodos] = useState<Comodo[]>([]);
  const [tokenReset, setTokenReset] = useState<number>(0);

  const [projetosSalvos, setProjetosSalvos] = useState<any[]>([]);
  const [nomeProjetoAtual, setNomeProjetoAtual] = useState<string>("");
  const [idProjetoAtual, setIdProjetoAtual] = useState<string | null>(null);

  // 💡 NOVO ESTADO: Controla a exibição do Modal de Recuperação (Imune ao bloqueador da Web)
  const [rascunhoPendente, setRascunhoPendente] = useState<any>(null);

  useEffect(() => {
    const inicializarApp = async () => {
      try {
        const salvosStr = await AsyncStorage.getItem(
          "@EletricaResidencial_ProjetosSalvos",
        );
        if (salvosStr) setProjetosSalvos(JSON.parse(salvosStr));

        const rascunhoStr = await AsyncStorage.getItem(
          "@EletricaResidencial_RascunhoAtual",
        );
        if (rascunhoStr) {
          const rascunho = JSON.parse(rascunhoStr);

          const temDadosReais =
            rascunho.dados &&
            ((rascunho.dados.comodos && rascunho.dados.comodos.length > 0) ||
              rascunho.nomeProjetoAtual ||
              rascunho.dados.tensaoGeral !== 127 ||
              rascunho.dados.distribuidora !== "CPFL" ||
              rascunho.dados.sistemaDistribuicao !== "127/220V" ||
              rascunho.dados.tipoImovel !== "Casa");

          if (temDadosReais) {
            setRascunhoPendente(rascunho); // 💡 Aciona o Modal visual
          }
        }
      } catch (error) {
        console.error("Erro ao inicializar:", error);
      }
    };
    inicializarApp();
  }, []);

  const aplicarRascunho = () => {
    if (rascunhoPendente && rascunhoPendente.dados) {
      setTensaoGeral(rascunhoPendente.dados.tensaoGeral);
      setDistribuidora(rascunhoPendente.dados.distribuidora);
      setSistemaDistribuicao(rascunhoPendente.dados.sistemaDistribuicao);
      setTipoImovel(rascunhoPendente.dados.tipoImovel);
      setComodos(rascunhoPendente.dados.comodos || []);
      setNomeProjetoAtual(rascunhoPendente.nomeProjetoAtual || "");
      setIdProjetoAtual(rascunhoPendente.idProjetoAtual || null);
    }
    setRascunhoPendente(null);
  };

  const descartarRascunho = async () => {
    await AsyncStorage.removeItem("@EletricaResidencial_RascunhoAtual");
    setRascunhoPendente(null);
  };

  useEffect(() => {
    const salvarRascunho = async () => {
      const isDirty =
        comodos.length > 0 ||
        tensaoGeral !== 127 ||
        distribuidora !== "CPFL" ||
        sistemaDistribuicao !== "127/220V" ||
        tipoImovel !== "Casa" ||
        nomeProjetoAtual !== "" ||
        idProjetoAtual !== null;

      if (!isDirty) return;

      const rascunhoAtual = {
        idProjetoAtual,
        nomeProjetoAtual,
        dados: {
          tensaoGeral,
          distribuidora,
          sistemaDistribuicao,
          tipoImovel,
          comodos,
        },
      };

      await AsyncStorage.setItem(
        "@EletricaResidencial_RascunhoAtual",
        JSON.stringify(rascunhoAtual),
      );
    };

    const timeoutId = setTimeout(salvarRascunho, 1000);
    return () => clearTimeout(timeoutId);
  }, [
    tensaoGeral,
    distribuidora,
    sistemaDistribuicao,
    tipoImovel,
    comodos,
    nomeProjetoAtual,
    idProjetoAtual,
  ]);

  useEffect(() => {
    const limparMemoriaFantasma = async () => {
      if (comodos.length === 0 && !idProjetoAtual) {
        try {
          await AsyncStorage.multiRemove([
            "@EletricaResidencial_Carrinho_V1",
            "@EletricaResidencial_DadosRamal",
            "@EletricaResidencial_ProtecoesGerais",
            "@EletricaResidencial_ReservaAplicada",
          ]);
        } catch (error) {}
      }
    };
    limparMemoriaFantasma();
  }, [comodos, idProjetoAtual]);

  const salvarProjetoAtual = async (nomeProjeto: string) => {
    try {
      let listaProjetos = [...projetosSalvos];
      const indexExistente = listaProjetos.findIndex(
        (p) => p.id === idProjetoAtual || p.nome === nomeProjeto,
      );

      const projetoSnapshot = {
        id:
          indexExistente >= 0
            ? listaProjetos[indexExistente].id
            : Date.now().toString(),
        nome: nomeProjeto,
        dataHora: new Date().toISOString(),
        dados: {
          tensaoGeral,
          distribuidora,
          sistemaDistribuicao,
          tipoImovel,
          comodos,
        },
      };

      if (indexExistente >= 0) {
        listaProjetos[indexExistente] = projetoSnapshot;
      } else {
        listaProjetos.push(projetoSnapshot);
      }

      await AsyncStorage.setItem(
        "@EletricaResidencial_ProjetosSalvos",
        JSON.stringify(listaProjetos),
      );

      setProjetosSalvos(listaProjetos);
      setNomeProjetoAtual(nomeProjeto);
      setIdProjetoAtual(projetoSnapshot.id);
    } catch (error) {
      console.error("Erro ao salvar projeto:", error);
    }
  };

  const carregarProjeto = (id: string) => {
    const projeto = projetosSalvos.find((p) => p.id === id);
    if (projeto && projeto.dados) {
      setTensaoGeral(projeto.dados.tensaoGeral);
      setDistribuidora(projeto.dados.distribuidora);
      setSistemaDistribuicao(projeto.dados.sistemaDistribuicao);
      setTipoImovel(projeto.dados.tipoImovel);
      setComodos(projeto.dados.comodos || []);
      setNomeProjetoAtual(projeto.nome);
      setIdProjetoAtual(id);
    }
  };

  const excluirProjeto = async (id: string) => {
    try {
      const novaLista = projetosSalvos.filter((p) => p.id !== id);
      await AsyncStorage.setItem(
        "@EletricaResidencial_ProjetosSalvos",
        JSON.stringify(novaLista),
      );
      setProjetosSalvos(novaLista);
      if (id === idProjetoAtual) zerarProjeto();
    } catch (error) {
      console.error("Erro ao excluir projeto:", error);
    }
  };

  const zerarProjeto = async () => {
    setComodos([]);
    setNomeProjetoAtual("");
    setIdProjetoAtual(null);
    setTokenReset((prev) => prev + 1);

    // Força a exclusão imediata de QUALQUER dado de orçamentos e rascunhos anteriores
    try {
      await AsyncStorage.multiRemove([
        "@EletricaResidencial_RascunhoAtual",
        "@EletricaResidencial_Carrinho_V1",
        "@EletricaResidencial_DadosRamal",
        "@EletricaResidencial_ProtecoesGerais",
        "@EletricaResidencial_ReservaAplicada",
      ]);
    } catch (error) {
      console.error("Erro ao limpar dados:", error);
    }
  };

  const adicionarComodo = (novoComodo: Comodo) =>
    setComodos((prev) => [...prev, novoComodo]);
  const removerComodo = (id: string) =>
    setComodos((prev) => prev.filter((c) => c.id !== id));
  const atualizarComodo = (id: string, dados: Partial<Comodo>) =>
    setComodos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...dados } : c)),
    );
  const adicionarDispositivo = (
    comodoId: string,
    dispositivo: Omit<Dispositivo, "id">,
  ) => {
    const novo = { ...dispositivo, id: Math.random().toString() };
    setComodos((prev) =>
      prev.map((c) =>
        c.id === comodoId
          ? { ...c, dispositivos: [...c.dispositivos, novo] }
          : c,
      ),
    );
  };
  const atualizarDispositivo = (
    comodoId: string,
    dispositivoId: string,
    dados: Partial<Dispositivo>,
  ) => {
    setComodos((prev) =>
      prev.map((c) =>
        c.id !== comodoId
          ? c
          : {
              ...c,
              dispositivos: c.dispositivos.map((d) =>
                d.id === dispositivoId ? { ...d, ...dados } : d,
              ),
            },
      ),
    );
  };
  const removerDispositivo = (comodoId: string, dispositivoId: string) => {
    setComodos((prev) =>
      prev.map((c) =>
        c.id !== comodoId
          ? c
          : {
              ...c,
              dispositivos: c.dispositivos.filter(
                (d) => d.id !== dispositivoId,
              ),
            },
      ),
    );
  };

  return (
    <DataContext.Provider
      value={{
        tensaoGeral,
        setTensaoGeral,
        distribuidora,
        setDistribuidora,
        sistemaDistribuicao,
        setSistemaDistribuicao,
        tipoImovel,
        setTipoImovel,
        comodos,
        adicionarComodo,
        removerComodo,
        atualizarComodo,
        adicionarDispositivo,
        atualizarDispositivo,
        removerDispositivo,
        projetosSalvos,
        nomeProjetoAtual,
        idProjetoAtual,
        zerarProjeto,
        salvarProjetoAtual,
        carregarProjeto,
        excluirProjeto,
        tokenReset,
      }}
    >
      {children}

      {/* 💡 MODAL GLOBAL DE RECUPERAÇÃO DE DADOS (Não é bloqueado pela Web) */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={!!rascunhoPendente}
        onRequestClose={descartarRascunho}
      >
        <View style={stylesModal.overlay}>
          <View style={stylesModal.content}>
            <Text style={stylesModal.title}>Rascunho Encontrado 🔄</Text>
            <Text style={stylesModal.text}>
              O aplicativo foi fechado inesperadamente e encontramos um projeto
              em andamento. Deseja continuar de onde parou?
            </Text>

            <TouchableOpacity
              style={stylesModal.btnContinuar}
              onPress={aplicarRascunho}
            >
              <Text style={stylesModal.btnContinuarText}>
                ✅ Sim, Continuar Projeto
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={stylesModal.btnDescartar}
              onPress={descartarRascunho}
            >
              <Text style={stylesModal.btnDescartarText}>
                🗑️ Não, Iniciar do Zero
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context)
    throw new Error("useData deve ser usado dentro de um DataProvider");
  return context;
}

const stylesModal = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    width: "85%",
    maxWidth: 400,
    backgroundColor: "#ffffff",
    borderRadius: 12,
    padding: 24,
    ...Platform.select({
      web: { boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.3)" },
      default: { elevation: 8 },
    }),
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#1f2937",
    marginBottom: 12,
    textAlign: "center",
  },
  text: {
    fontSize: 15,
    color: "#4b5563",
    marginBottom: 24,
    lineHeight: 22,
    textAlign: "center",
  },
  btnContinuar: {
    backgroundColor: "#10b981",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  btnContinuarText: { color: "#ffffff", fontWeight: "bold", fontSize: 15 },
  btnDescartar: {
    backgroundColor: "#fef2f2",
    borderWidth: 1,
    borderColor: "#fca5a5",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  btnDescartarText: { color: "#ef4444", fontWeight: "bold", fontSize: 15 },
});
