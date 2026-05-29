// src/context/DataContext.tsx
import React, { createContext, useContext, useState } from "react";

export interface ItemCircuito {
  id: string;
  nome: string;
  tipo: "iluminacao" | "tug" | "tue";
  potenciaVA: number;
  potenciaWatts?: number;
}

interface DataContextType {
  tensaoGeral: 127 | 220;
  setTensaoGeral: (tensao: 127 | 220) => void;
  circuitos: ItemCircuito[];
  adicionarCircuitos: (novos: ItemCircuito[]) => void;
  removerCircuito: (id: string) => void; // 👈 Nova função adicionada!
  zerarProjeto: () => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [tensaoGeral, setTensaoGeral] = useState<127 | 220>(127);
  const [circuitos, setCircutos] = useState<ItemCircuito[]>([]);

  const adicionarCircuitos = (novos: ItemCircuito[]) => {
    setCircutos((prev) => [...prev, ...novos]);
  };

  const removerCircuito = (id: string) => {
    setCircutos((prev) => prev.filter((c) => c.id !== id)); // 👈 Filtra e remove o item na hora
  };

  const zerarProjeto = () => {
    setCircutos([]);
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
