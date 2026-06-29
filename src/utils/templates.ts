// src/utils/templates.ts

export type TipoCarga = "iluminacao" | "tug" | "tue";

export interface Dispositivo {
  id: string;
  nome: string;
  tipo: TipoCarga;
  potencia: number;
  unidade: "W" | "VA";
  quantidade: number;
}

export interface Comodo {
  id: string;
  nome: string;
  area: number;
  perimetro: number;
  dispositivos: Dispositivo[];
}

export const TEMPLATES_COMODOS: Record<
  string,
  { nome: string; dispositivosPadrao: Omit<Dispositivo, "id">[] }
> = {
  sala: {
    nome: "Sala",
    dispositivosPadrao: [
      {
        nome: "Iluminação",
        tipo: "iluminacao",
        potencia: 100,
        unidade: "VA",
        quantidade: 1,
      },
      {
        nome: "Tomadas Gerais",
        tipo: "tug",
        potencia: 100,
        unidade: "VA",
        quantidade: 3,
      },
    ],
  },
  cozinha: {
    nome: "Cozinha",
    dispositivosPadrao: [
      {
        nome: "Iluminação",
        tipo: "iluminacao",
        potencia: 100,
        unidade: "VA",
        quantidade: 1,
      },
      {
        nome: "Tomadas de Cozinha",
        tipo: "tug",
        potencia: 600,
        unidade: "VA",
        quantidade: 3,
      },
      {
        nome: "Micro-ondas",
        tipo: "tue",
        potencia: 2000,
        unidade: "W",
        quantidade: 1,
      },
    ],
  },
  banheiro: {
    nome: "Banheiro",
    dispositivosPadrao: [
      {
        nome: "Iluminação",
        tipo: "iluminacao",
        potencia: 100,
        unidade: "VA",
        quantidade: 1,
      },
      {
        nome: "Tomada do Lavatório",
        tipo: "tug",
        potencia: 600,
        unidade: "VA",
        quantidade: 1,
      },
      {
        nome: "Chuveiro",
        tipo: "tue",
        potencia: 5500,
        unidade: "W",
        quantidade: 1,
      },
    ],
  },
  custom: {
    nome: "Novo Cômodo",
    dispositivosPadrao: [],
  },
};
