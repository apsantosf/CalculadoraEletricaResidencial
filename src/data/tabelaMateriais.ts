// src/data/tabelaMateriais.ts

// 💡 Definimos os tipos exatos para garantir a qualidade dos dados e evitar erros
export type TipoMedida = "rolo" | "metro" | "unidade";
export type CategoriaMaterial = "cabo" | "protecao" | "ponto_consumo";

export interface MaterialBase {
  id: string;
  nome: string;
  categoria: CategoriaMaterial;
  medida: TipoMedida;
  precoMedio: number; // Preço base para usarmos caso o usuário não tenha editado
}

export const MATERIAIS_PADRAO: MaterialBase[] = [
  // --- CABOS (Vendidos por Rolo de 100m) ---
  {
    id: "cabo_1_5",
    nome: "Cabo Flexível 1,5 mm²",
    categoria: "cabo",
    medida: "rolo",
    precoMedio: 180.0,
  },
  {
    id: "cabo_2_5",
    nome: "Cabo Flexível 2,5 mm²",
    categoria: "cabo",
    medida: "rolo",
    precoMedio: 250.0,
  },
  {
    id: "cabo_4_0",
    nome: "Cabo Flexível 4,0 mm²",
    categoria: "cabo",
    medida: "rolo",
    precoMedio: 390.0,
  },
  {
    id: "cabo_6_0",
    nome: "Cabo Flexível 6,0 mm²",
    categoria: "cabo",
    medida: "rolo",
    precoMedio: 580.0,
  },

  // --- CABOS DO RAMAL (Vendidos por Metro) ---
  {
    id: "cabo_10_0",
    nome: "Cabo Flexível 10 mm²",
    categoria: "cabo",
    medida: "metro",
    precoMedio: 9.5,
  },
  {
    id: "cabo_16_0",
    nome: "Cabo Flexível 16 mm²",
    categoria: "cabo",
    medida: "metro",
    precoMedio: 14.5,
  },
  {
    id: "cabo_25_0",
    nome: "Cabo Flexível 25 mm²",
    categoria: "cabo",
    medida: "metro",
    precoMedio: 22.0,
  },

  // --- PROTEÇÃO (Vendidos por Unidade) ---
  {
    id: "disj_mono",
    nome: "Disjuntor Monofásico (1 Polo)",
    categoria: "protecao",
    medida: "unidade",
    precoMedio: 16.0,
  },
  {
    id: "disj_bi",
    nome: "Disjuntor Bifásico (2 Polos)",
    categoria: "protecao",
    medida: "unidade",
    precoMedio: 45.0,
  },
  {
    id: "disj_tri",
    nome: "Disjuntor Trifásico (3 Polos)",
    categoria: "protecao",
    medida: "unidade",
    precoMedio: 65.0,
  },
  {
    id: "idr_bipolar",
    nome: "IDR Bipolar (F+N ou F+F)",
    categoria: "protecao",
    medida: "unidade",
    precoMedio: 185.0,
  },
  {
    id: "idr_tetrapolar",
    nome: "IDR Tetrapolar (3F+N)",
    categoria: "protecao",
    medida: "unidade",
    precoMedio: 220.0,
  },
  {
    id: "dps_275v",
    nome: "DPS 275V (Classe II)",
    categoria: "protecao",
    medida: "unidade",
    precoMedio: 48.0,
  },

  // --- PONTOS DE CONSUMO (Vendidos por Unidade) ---
  {
    id: "tomada_10a",
    nome: "Conjunto Tomada Simples 10A",
    categoria: "ponto_consumo",
    medida: "unidade",
    precoMedio: 12.0,
  },
  {
    id: "tomada_20a",
    nome: "Conjunto Tomada TUE 20A",
    categoria: "ponto_consumo",
    medida: "unidade",
    precoMedio: 15.0,
  },
  {
    id: "interruptor_simples",
    nome: "Conjunto Interruptor Simples",
    categoria: "ponto_consumo",
    medida: "unidade",
    precoMedio: 10.0,
  },
  {
    id: "interruptor_paralelo",
    nome: "Conjunto Interruptor Paralelo (Three-Way)",
    categoria: "ponto_consumo",
    medida: "unidade",
    precoMedio: 14.0,
  },
];
