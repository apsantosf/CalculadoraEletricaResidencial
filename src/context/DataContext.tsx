// src/context/DataContext.tsx
import React, { createContext, useContext, useState } from "react";

export interface ItemCircuito {
  id: string;
  nome: string;
  tipo: "iluminacao" | "tug" | "tue";
  potenciaVA: number;
  potenciaWatts?: number;
  detalhe?: string; // 👈 Nova propriedade para guardar observações
}

interface DataContextType {
  tensaoGeral: 127 | 220;
  setTensaoGeral: (tensao: 127 | 220) => void;
  concessionaria: string;
  setConcessionaria: (concessionaria: string) => void;
  circuitos: ItemCircuito[];
  adicionarCircuitos: (novos: ItemCircuito[]) => void;
  removerCircuito: (id: string) => void;
  zerarProjeto: () => void;
  tokenReset: number;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [tensaoGeral, setTensaoGeral] = useState<127 | 220>(127);
  // 🚀 Movido para dentro do Provider para funcionar perfeitamente
  const [concessionaria, setConcessionaria] = useState<string>("CPFL");
  const [circuitos, setCircuitos] = useState<ItemCircuito[]>([]);
  const [tokenReset, setTokenReset] = useState<number>(0);

  const adicionarCircuitos = (novos: ItemCircuito[]) => {
    setCircuitos((prev) => [...prev, ...novos]);
  };

  const removerCircuito = (id: string) => {
    setCircuitos((prev) => prev.filter((c) => c.id !== id));
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
        concessionaria,
        setConcessionaria,
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
