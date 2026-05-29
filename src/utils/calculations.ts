// src/utils/calculations.ts
import { DISJUNTORES_COMERCIAIS, TABELA_CABOS } from "../data/tables";

interface ResultadoDimensionamento {
  correnteProjeto: number;
  secaoCabo: number;
  disjuntor: number;
}

// 1. Regra NBR 5410: Iluminação (100VA para primeiros 6m², +60VA a cada 4m² inteiros)
export function calcularIluminacao(area: number): number {
  if (area < 6) return 100;
  const areaRestante = area - 6;
  const adicionais = Math.floor(areaRestante / 4);
  return 100 + adicionais * 60;
}

// 2. Regra NBR 5410: Quantidade mínima de TUGs (Tomadas de Uso Geral)
export function calcularQuantidadeTugs(
  tipoComodo: "social" | "servico",
  perimetro: number,
): number {
  if (tipoComodo === "servico") {
    return Math.ceil(perimetro / 3.5);
  }
  return Math.ceil(perimetro / 5);
}

// 3. Calcula a potência das TUGs (Regra dos 600VA para cozinhas/banheiros)
export function calcularPotenciaTugs(
  tipoComodo: "social" | "servico",
  quantity: number,
): number {
  if (tipoComodo === "servico") {
    let potencia = 0;
    for (let i = 1; i <= quantity; i++) {
      potencia += i <= 3 ? 600 : 100;
    }
    return potencia;
  }
  return quantity * 100;
}

// 4. Dimensiona o cabo e o disjuntor com base na potência total calculada (TUG/Luz)
export function dimensionarCircuito(
  potencia: number,
  tensao: number,
  tipoCircuito: "iluminacao" | "tomada",
): ResultadoDimensionamento {
  const correnteProjeto = potencia / tensao;
  const secaoMinima = tipoCircuito === "iluminacao" ? 1.5 : 2.5;
  const disjuntorMinimo = tipoCircuito === "iluminacao" ? 10 : 16;

  let disjuntor =
    DISJUNTORES_COMERCIAIS.find((dj) => dj >= correnteProjeto) || 63;
  if (disjuntor < disjuntorMinimo) {
    disjuntor = disjuntorMinimo;
  }

  const caboIdeal = TABELA_CABOS.find(
    (c) => c.secao >= secaoMinima && c.correnteMax >= disjuntor,
  );

  if (!caboIdeal) {
    throw new Error("Carga muito alta para os limites padrão deste cálculo.");
  }

  return {
    correnteProjeto: Number(correnteProjeto.toFixed(2)),
    secaoCabo: caboIdeal.secao,
    disjuntor: disjuntor,
  };
}

// 5. Dimensiona Circuitos de Uso Especial (TUE) individuais (Chuveiro/Ar)
export function dimensionarTUE(
  potenciaWatts: number,
  tensao: number,
  fatorPotencia: number = 1.0,
) {
  const potenciaVA = potenciaWatts / fatorPotencia;
  const correnteProjeto = potenciaVA / tensao;
  const secaoMinima = 2.5;

  let disjuntor =
    DISJUNTORES_COMERCIAIS.find((dj) => dj >= correnteProjeto) || 63;
  if (disjuntor < 16) {
    disjuntor = 16;
  }

  const caboIdeal = TABELA_CABOS.find(
    (c) => c.secao >= secaoMinima && c.correnteMax >= disjuntor,
  );

  if (!caboIdeal) {
    throw new Error("Carga muito alta para os limites padrão deste cálculo.");
  }

  return {
    potenciaVA: Math.round(potenciaVA),
    correnteProjeto: Number(correnteProjeto.toFixed(2)),
    secaoCabo: caboIdeal.secao,
    disjuntor: disjuntor,
  };
}

// 6. Dimensiona o Alimentador Geral do Quadro de Distribuição (QDC)
export interface DadosQuadro {
  potenciaIlumTugVA: number;
  potenciasTueWatts: number[];
  tensao: number;
}

export function calcularAlimentadorGeral({
  potenciaIlumTugVA,
  potenciasTueWatts,
  tensao,
}: DadosQuadro) {
  // Correção dos fatores de demanda para Iluminação e TUGs (valores padrão NBR 5410)
  let fatorDemandaIlumTug = 0.5;
  if (potenciaIlumTugVA <= 1000) fatorDemandaIlumTug = 0.86;
  else if (potenciaIlumTugVA <= 2000) fatorDemandaIlumTug = 0.75;
  else if (potenciaIlumTugVA <= 3000) fatorDemandaIlumTug = 0.66;
  else if (potenciaIlumTugVA <= 4000) fatorDemandaIlumTug = 0.59;
  else if (potenciaIlumTugVA <= 5000) fatorDemandaIlumTug = 0.52;

  const demandaIlumTug = potenciaIlumTugVA * fatorDemandaIlumTug;

  // Correção dos fatores de demanda para TUEs (correção do bug da variável digitar errada)
  const qtdTues = potenciasTueWatts.length;
  let fatorDemandaTue = 1.0;
  if (qtdTues === 2) fatorDemandaTue = 0.75;
  else if (qtdTues === 3) fatorDemandaTue = 0.7;
  else if (qtdTues > 3) fatorDemandaTue = 0.6;

  const somaTueWatts = potenciasTueWatts.reduce((acc, curr) => acc + curr, 0);
  const demandaTue = somaTueWatts * fatorDemandaTue;

  const potenciaTotalDemandada = demandaIlumTug + demandaTue;
  const correnteGeral = potenciaTotalDemandada / tensao;
  const secaoMinimaGeral = 6.0;

  let disjuntorGeral =
    DISJUNTORES_COMERCIAIS.find((dj) => dj >= correnteGeral) || 63;
  if (disjuntorGeral < 32) disjuntorGeral = 32;

  const caboGeral = TABELA_CABOS.find(
    (c) => c.secao >= secaoMinimaGeral && c.correnteMax >= disjuntorGeral,
  );

  return {
    potenciaTotalVA: Math.round(potenciaIlumTugVA + somaTueWatts),
    potenciaDemandadaVA: Math.round(potenciaTotalDemandada),
    correnteGeral: Number(correnteGeral.toFixed(2)),
    caboGeral: caboGeral ? caboGeral.secao : 10.0,
    disjuntorGeral: disjuntorGeral,
  };
}
