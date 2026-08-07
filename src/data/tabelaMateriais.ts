// src/data/tabelaMateriais.ts

// 💡 Definimos os tipos exatos para garantir a qualidade dos dados e evitar erros
export type TipoMedida = "rolo" | "metro" | "unidade" | "peça";
export type CategoriaMaterial =
  | "cabo"
  | "protecao"
  | "ponto_consumo"
  | "iluminacao";

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
  {
    id: "cabo_35_0",
    nome: "Cabo Flexível 35 mm²",
    categoria: "cabo",
    medida: "metro",
    precoMedio: 32.0,
  },

  // --- PROTEÇÃO GERAL: IDR e DPS (Vendidos por Unidade) ---
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

  // --- DISJUNTORES ESPECÍFICOS (Dimensionados automaticamente pelo app) ---
  {
    id: "disjuntor_10a",
    nome: "Disjuntor DIN 10A (Curva B/C)",
    categoria: "protecao",
    medida: "unidade",
    precoMedio: 15.0,
  },
  {
    id: "disjuntor_16a",
    nome: "Disjuntor DIN 16A (Curva B/C)",
    categoria: "protecao",
    medida: "unidade",
    precoMedio: 15.0,
  },
  {
    id: "disjuntor_20a",
    nome: "Disjuntor DIN 20A (Curva B/C)",
    categoria: "protecao",
    medida: "unidade",
    precoMedio: 16.0,
  },
  {
    id: "disjuntor_25a",
    nome: "Disjuntor DIN 25A (Curva B/C)",
    categoria: "protecao",
    medida: "unidade",
    precoMedio: 16.0,
  },
  {
    id: "disjuntor_32a",
    nome: "Disjuntor DIN 32A (Curva B/C)",
    categoria: "protecao",
    medida: "unidade",
    precoMedio: 18.0,
  },
  {
    id: "disjuntor_40a",
    nome: "Disjuntor DIN 40A (Curva B/C)",
    categoria: "protecao",
    medida: "unidade",
    precoMedio: 22.0,
  },
  {
    id: "disjuntor_50a",
    nome: "Disjuntor DIN 50A (Curva B/C)",
    categoria: "protecao",
    medida: "unidade",
    precoMedio: 25.0,
  },
  {
    id: "disjuntor_63a",
    nome: "Disjuntor DIN 63A (Curva B/C)",
    categoria: "protecao",
    medida: "unidade",
    precoMedio: 28.0,
  },
  {
    id: "disjuntor_70a",
    nome: "Disjuntor DIN 70A (Curva B/C)",
    categoria: "protecao",
    medida: "unidade",
    precoMedio: 40.0,
  },
  {
    id: "disjuntor_80a",
    nome: "Disjuntor DIN 80A (Curva B/C)",
    categoria: "protecao",
    medida: "unidade",
    precoMedio: 55.0,
  },
  {
    id: "disjuntor_100a",
    nome: "Disjuntor DIN 100A (Curva B/C)",
    categoria: "protecao",
    medida: "unidade",
    precoMedio: 70.0,
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
    nome: "Conjunto Interruptor Paralelo",
    categoria: "ponto_consumo",
    medida: "unidade",
    precoMedio: 14.0,
  },

  // --- ILUMINAÇÃO (Vendidos por Unidade) ---
  {
    id: "lampada_led",
    nome: "Lâmpada LED 9W (Bulbo Padrão)",
    categoria: "iluminacao",
    medida: "unidade",
    precoMedio: 12.0,
  },
  {
    id: "soquete_bocal",
    nome: "Soquete/Bocal Simples E27",
    categoria: "iluminacao",
    medida: "peça",
    precoMedio: 5.0,
  },
];
