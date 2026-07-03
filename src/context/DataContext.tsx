// src/context/DataContext.tsx
import React, { createContext, useContext, useState } from "react";
import { Comodo, Dispositivo } from "../utils/templates";

// 1. O tipo exportado caso outras telas precisem saber as opções exatas
export type TipoSistema = "127/220V" | "220/380V";
export type TipoImovel = "Casa" | "Apartamento";

interface DataContextType {
  tensaoGeral: 127 | 220;
  setTensaoGeral: (tensao: 127 | 220) => void;

  distribuidora: string;
  setDistribuidora: (dist: string) => void;

  sistemaDistribuicao: TipoSistema;
  setSistemaDistribuicao: (sistema: TipoSistema) => void;

  // 💡 NOVA VARIÁVEL: Casa ou Apartamento
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
  zerarProjeto: () => void;
  tokenReset: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [tensaoGeral, setTensaoGeral] = useState<127 | 220>(127);
  const [distribuidora, setDistribuidora] = useState<string>("CPFL");
  const [sistemaDistribuicao, setSistemaDistribuicao] =
    useState<TipoSistema>("127/220V");

  // 💡 Estado inicial definido como Casa
  const [tipoImovel, setTipoImovel] = useState<TipoImovel>("Casa");

  const [comodos, setComodos] = useState<Comodo[]>([]);
  const [tokenReset, setTokenReset] = useState<number>(0);

  const adicionarComodo = (novoComodo: Comodo) => {
    setComodos((prev) => [...prev, novoComodo]);
  };

  const removerComodo = (id: string) => {
    setComodos((prev) => prev.filter((c) => c.id !== id));
  };

  const atualizarComodo = (id: string, dados: Partial<Comodo>) => {
    setComodos((prev) =>
      prev.map((c) => (c.id === id ? { ...c, ...dados } : c)),
    );
  };

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
      prev.map((c) => {
        if (c.id !== comodoId) return c;
        return {
          ...c,
          dispositivos: c.dispositivos.map((d) =>
            d.id === dispositivoId ? { ...d, ...dados } : d,
          ),
        };
      }),
    );
  };

  const removerDispositivo = (comodoId: string, dispositivoId: string) => {
    setComodos((prev) =>
      prev.map((c) => {
        if (c.id !== comodoId) return c;
        return {
          ...c,
          dispositivos: c.dispositivos.filter((d) => d.id !== dispositivoId),
        };
      }),
    );
  };

  const zerarProjeto = () => {
    setComodos([]);
    setTokenReset((prev) => prev + 1);
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
        tipoImovel, // 💡 Exportando o tipo de imóvel
        setTipoImovel, // 💡 Exportando a função
        comodos,
        adicionarComodo,
        removerComodo,
        atualizarComodo,
        adicionarDispositivo,
        atualizarDispositivo,
        removerDispositivo,
        zerarProjeto,
        tokenReset,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (!context)
    throw new Error("useData deve ser usado dentro de um DataProvider");
  return context;
}
