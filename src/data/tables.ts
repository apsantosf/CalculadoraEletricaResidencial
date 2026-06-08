// src/data/tables.ts

export interface TabelaCabo {
  secao: number; // em mm²
  correnteMax: number; // em Amperes (Método B1 - 2 condutores carregados - Cobre/PVC)
}

// Valores oficiais corrigidos para 2 condutores carregados (Tabela 36 da NBR 5410)
export const TABELA_CABOS: TabelaCabo[] = [
  { secao: 1.5, correnteMax: 17.5 },
  { secao: 2.5, correnteMax: 24 },
  { secao: 4.0, correnteMax: 32 },
  { secao: 6.0, correnteMax: 41 }, // 👈 Atualizado de 36 para 41 A!
  { secao: 10.0, correnteMax: 57 }, // 👈 Atualizado de 50 para 57 A!
  { secao: 16.0, correnteMax: 76 },
];

// Valores comerciais de disjuntores DIN (Amperes)
export const DISJUNTORES_COMERCIAIS: number[] = [
  10, 16, 20, 25, 32, 40, 50, 63,
];
