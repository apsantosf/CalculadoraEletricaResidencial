// src/context/DataContext.tsx
import { dimensionarCircuito, dimensionarTUE } from "@/utils/calculations";
import React, { createContext, useContext, useState } from "react";

// 1. Definição da estrutura do circuito
export interface ItemCircuito {
  id: string;
  nome: string;
  tipo: "iluminacao" | "tug" | "tue";
  potenciaVA: number;
  potenciaWatts?: number;
  detalhe?: string;
  disjuntor?: number;
  bitola?: number;
}

// 2. Definição do tipo do Contexto
interface DataContextType {
  tensaoGeral: 127 | 220;
  setTensaoGeral: (tensao: 127 | 220) => void;
  circuitos: ItemCircuito[];
  adicionarCircuitos: (novos: ItemCircuito[]) => void;
  removerCircuito: (id: string) => void;
  zerarProjeto: () => void;
  tokenReset: number;
}

// 3. A CRIAÇÃO DO CONTEXTO (Esta linha que estava faltando no seu arquivo)
const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [tensaoGeral, setTensaoGeral] = useState<127 | 220>(127);
  const [circuitos, setCircuitos] = useState<ItemCircuito[]>([]);
  const [tokenReset, setTokenReset] = useState<number>(0);

  const removerCircuito = (id: string) => {
    setCircuitos((prev) => prev.filter((c) => c.id !== id));
  };

  const adicionarCircuitos = (novos: ItemCircuito[]) => {
    const circuitosCalculados = novos.map((circ) => {
      const calculo =
        circ.tipo === "tue"
          ? dimensionarTUE(circ.potenciaWatts || 0, tensaoGeral)
          : dimensionarCircuito(
              circ.potenciaVA,
              tensaoGeral,
              circ.tipo === "iluminacao" ? "iluminacao" : "tomada",
            );

      return {
        ...circ,
        bitola: calculo.secaoCabo,
        disjuntor: calculo.disjuntor,
      };
    });

    setCircuitos((prev) => [...prev, ...circuitosCalculados]);
  };

  const zerarProjeto = () => {
    setCircuitos([]);
    setTokenReset((prev) => prev + 1);
  };

  return (
    <DataContext.Provider
      value={{
        tensaoGeral,
        setTensaoGeral,
        circuitos,
        adicionarCircuitos,
        removerCircuito,
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
