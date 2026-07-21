// src/utils/calculations.ts

export interface Condutor {
  bitola: number;
  capacidadeCorrente: number;
}

export const tabelaCondutores: Condutor[] = [
  { bitola: 1.5, capacidadeCorrente: 15 },
  { bitola: 2.5, capacidadeCorrente: 21 },
  { bitola: 4.0, capacidadeCorrente: 28 },
  { bitola: 6.0, capacidadeCorrente: 36 },
  { bitola: 10, capacidadeCorrente: 50 },
  { bitola: 16, capacidadeCorrente: 68 },
  { bitola: 25, capacidadeCorrente: 89 },
  { bitola: 35, capacidadeCorrente: 111 },
  { bitola: 50, capacidadeCorrente: 134 },
  { bitola: 70, capacidadeCorrente: 171 },
  { bitola: 95, capacidadeCorrente: 207 },
  { bitola: 120, capacidadeCorrente: 239 },
];

// 💡 Dicionário de Regras Regionais (Padrão de Entrada)
const REGRA_DISTRIBUIDORA: Record<
  string,
  {
    limiteMonoVA: number;
    limiteBiVA: number;
    disjuntorMaxMono: number;
    disjuntorMaxBi: number;
  }
> = {
  CPFL: {
    limiteMonoVA: 12000,
    limiteBiVA: 25000,
    disjuntorMaxMono: 50,
    disjuntorMaxBi: 70,
  },
  Enel: {
    limiteMonoVA: 12000,
    limiteBiVA: 25000,
    disjuntorMaxMono: 50,
    disjuntorMaxBi: 70,
  },
  EDP: {
    limiteMonoVA: 12000,
    limiteBiVA: 25000,
    disjuntorMaxMono: 50,
    disjuntorMaxBi: 70,
  },
  Neoenergia: {
    limiteMonoVA: 15000,
    limiteBiVA: 25000,
    disjuntorMaxMono: 63,
    disjuntorMaxBi: 70,
  },
  CEMIG: {
    limiteMonoVA: 10000,
    limiteBiVA: 15000,
    disjuntorMaxMono: 40,
    disjuntorMaxBi: 63,
  },
  COPEL: {
    limiteMonoVA: 10000,
    limiteBiVA: 15000,
    disjuntorMaxMono: 40,
    disjuntorMaxBi: 63,
  },
  LIGHT: {
    limiteMonoVA: 10000,
    limiteBiVA: 15000,
    disjuntorMaxMono: 40,
    disjuntorMaxBi: 63,
  },
  CELESC: {
    limiteMonoVA: 15000,
    limiteBiVA: 15000,
    disjuntorMaxMono: 70,
    disjuntorMaxBi: 0,
  },
  ENERGISA: {
    limiteMonoVA: 12000,
    limiteBiVA: 20000,
    disjuntorMaxMono: 50,
    disjuntorMaxBi: 70,
  },
  EQUATORIAL: {
    limiteMonoVA: 12000,
    limiteBiVA: 20000,
    disjuntorMaxMono: 50,
    disjuntorMaxBi: 70,
  },
};

export const obterFatorDemandaGeral = (potenciaWatts: number): number => {
  if (potenciaWatts <= 1000) return 0.86;
  if (potenciaWatts <= 2000) return 0.75;
  if (potenciaWatts <= 3000) return 0.66;
  if (potenciaWatts <= 4000) return 0.59;
  if (potenciaWatts <= 5000) return 0.52;
  if (potenciaWatts <= 6000) return 0.45;
  if (potenciaWatts <= 7000) return 0.4;
  if (potenciaWatts <= 8000) return 0.35;
  if (potenciaWatts <= 9000) return 0.31;
  if (potenciaWatts <= 10000) return 0.27;
  return 0.5;
};

export const encontrarDisjuntorComercial = (
  correnteDemanda: number,
  capacidadeCabo: number,
): number => {
  const disjuntoresComerciais = [
    10, 16, 20, 25, 32, 40, 50, 63, 70, 80, 100, 125, 150, 175, 200, 225, 250,
  ];

  const adequados = disjuntoresComerciais.filter(
    (d) => d >= correnteDemanda && d <= capacidadeCabo,
  );

  if (adequados.length > 0) return adequados[0];

  return (
    disjuntoresComerciais.find((d) => d >= correnteDemanda) ||
    disjuntoresComerciais[disjuntoresComerciais.length - 1]
  );
};

export const determinarTipoFornecimento = (
  disjuntorGeral: number,
  tensaoSelecionada: number,
  sistemaDistribuicao: string,
  distribuidora: string = "CPFL",
): string => {
  const regras =
    REGRA_DISTRIBUIDORA[distribuidora] || REGRA_DISTRIBUIDORA["CPFL"];

  if (sistemaDistribuicao === "127/220V") {
    if (tensaoSelecionada === 220) {
      if (disjuntorGeral <= regras.disjuntorMaxBi) return "Bifásico (2 Polos)";
      return "Trifásico (3 Polos)";
    }
    if (disjuntorGeral <= regras.disjuntorMaxMono) return "Monofásico (1 Polo)";
    if (
      disjuntorGeral > regras.disjuntorMaxMono &&
      disjuntorGeral <= regras.disjuntorMaxBi
    )
      return "Bifásico (2 Polos)";
    return "Trifásico (3 Polos)";
  }

  if (sistemaDistribuicao === "220/380V") {
    if (disjuntorGeral <= regras.disjuntorMaxMono) return "Monofásico (1 Polo)";
    if (regras.disjuntorMaxBi > 0 && disjuntorGeral <= regras.disjuntorMaxBi)
      return "Bifásico (2 Polos)";
    return "Trifásico (3 Polos)";
  }
  return "Indefinido";
};

export const calcularQuedaTensao = (
  comprimento: number,
  corrente: number,
  bitola: number,
  tensao: number,
): number => {
  const resistividadeCobre = 0.0172;
  const ehTrifasico = corrente > 70;
  const fatorFase = ehTrifasico ? Math.sqrt(3) : 2;
  const deltaU =
    (fatorFase * comprimento * corrente * resistividadeCobre) / bitola;
  return (deltaU / tensao) * 100;
};

export const sugerirBitolaPorQueda = (
  comprimento: number,
  corrente: number,
  tensao: number,
) => {
  const cabosPossiveis = tabelaCondutores.filter(
    (c) => c.capacidadeCorrente >= corrente,
  );
  if (cabosPossiveis.length === 0)
    return tabelaCondutores[tabelaCondutores.length - 1];

  const bitolaIdeal = cabosPossiveis.find((c) => {
    const queda = calcularQuedaTensao(comprimento, corrente, c.bitola, tensao);
    return queda <= 4.0;
  });

  return bitolaIdeal || cabosPossiveis[cabosPossiveis.length - 1];
};

// 💡 CORREÇÃO DO BUG DA DISTÂNCIA ZERO: Agora o cálculo flui mesmo sem distância preenchida
export const processarTrechoRamal = (
  distancia: number,
  corrente: number,
  tensao: number,
  caboMinimo: number,
  sistemaDistribuicao: string,
  distribuidora: string = "CPFL",
) => {
  if (corrente <= 0)
    return { bitola: caboMinimo, disjuntor: 0, classificacao: "N/A" };

  // Garante que não ocorrem falhas matemáticas se a distância for nula
  const distSegura = isNaN(distancia) || distancia < 0 ? 0 : distancia;

  const calculo = sugerirBitolaPorQueda(distSegura, corrente, tensao);
  const bitolaAjustada = Math.max(calculo.bitola, caboMinimo);

  // Encontra a capacidade do cabo que foi efetivamente escolhido
  const caboFinalInfo =
    tabelaCondutores.find((c) => c.bitola === bitolaAjustada) || calculo;

  const disjuntor = encontrarDisjuntorComercial(
    corrente,
    caboFinalInfo.capacidadeCorrente,
  );

  const classificacao = determinarTipoFornecimento(
    disjuntor,
    tensao,
    sistemaDistribuicao,
    distribuidora,
  );

  return {
    bitola: bitolaAjustada,
    disjuntor: disjuntor,
    classificacao: classificacao,
  };
};

export const calcularIluminacao = (area: number): number => {
  if (area <= 6) return 100;
  return 100 + Math.floor((area - 6) / 4) * 60;
};

export const calcularQuantidadeTugs = (
  tipo: string,
  perimetro: number,
): number => {
  const t = tipo.toLowerCase();
  if (t === "cozinha" || t === "banheiro")
    return Math.max(3, Math.ceil(perimetro / 3.5));
  return Math.max(1, Math.ceil(perimetro / 5));
};

export const calcularPotenciaTugs = (
  tipo: string,
  quantidade: number,
): number => {
  const t = tipo.toLowerCase();
  if (t === "cozinha" || t === "banheiro") {
    if (quantidade <= 3) return quantidade * 600;
    return 3 * 600 + (quantidade - 3) * 100;
  }
  return quantidade * 100;
};

export const dimensionarCircuito = (
  potenciaVA: number,
  tensao: number,
  tipo: string,
) => {
  const corrente = potenciaVA / tensao;
  const caboMin = tipo === "iluminacao" ? 1.5 : 2.5;
  const caboIdeal =
    tabelaCondutores.find(
      (c) => c.capacidadeCorrente >= corrente && c.bitola >= caboMin,
    ) || tabelaCondutores[1];
  const disjuntor = encontrarDisjuntorComercial(
    corrente,
    caboIdeal.capacidadeCorrente,
  );
  return {
    correnteProjeto: Number(corrente.toFixed(2)),
    secaoCabo: caboIdeal.bitola,
    disjuntor,
  };
};

export const dimensionarTUE = (
  potenciaWatts: number,
  tensao: number,
  fp: number,
) => {
  const potenciaVA = potenciaWatts / fp;
  const corrente = potenciaVA / tensao;
  const caboIdeal =
    tabelaCondutores.find(
      (c) => c.capacidadeCorrente >= corrente && c.bitola >= 2.5,
    ) || tabelaCondutores[1];
  const disjuntor = encontrarDisjuntorComercial(
    corrente,
    caboIdeal.capacidadeCorrente,
  );
  return {
    potenciaVA: Math.round(potenciaVA),
    correnteProjeto: Number(corrente.toFixed(2)),
    secaoCabo: caboIdeal.bitola,
    disjuntor,
  };
};

// 💡 SINCRONIA: Motor verifica o limite de VA e o limite de Amperes da Distribuidora
export const calcularAlimentadorGeral = (dados: {
  potenciaIlumTugVA: number;
  potenciasTueWatts: number[];
  tensao: number;
  forcarTrifasico?: boolean;
  distribuidora?: string;
}) => {
  const dist = dados.distribuidora || "CPFL";
  const regras = REGRA_DISTRIBUIDORA[dist] || REGRA_DISTRIBUIDORA["CPFL"];

  const somaTues = dados.potenciasTueWatts.reduce((acc, curr) => acc + curr, 0);
  const potenciaTotalVA = dados.potenciaIlumTugVA + somaTues;

  // Descobre qual seria a corrente e o disjuntor se não existisse limite
  const correnteTeste = potenciaTotalVA / dados.tensao;
  let disjTeste = 250;
  for (const c of tabelaCondutores) {
    if (c.bitola >= 6.0 && c.capacidadeCorrente >= correnteTeste) {
      disjTeste = encontrarDisjuntorComercial(
        correnteTeste,
        c.capacidadeCorrente,
      );
      break;
    }
  }

  // Verifica se violou as regras da Concessionária (VA ou Disjuntor Máximo)
  const estourouVA = potenciaTotalVA > regras.limiteBiVA;
  const estourouDisjuntor =
    regras.disjuntorMaxBi > 0 && disjTeste > regras.disjuntorMaxBi;

  const ehTrifasico = dados.forcarTrifasico || estourouVA || estourouDisjuntor;

  let correnteGeral = 0;

  if (ehTrifasico) {
    const tensaoLinha = dados.tensao === 127 ? 220 : dados.tensao;
    correnteGeral = potenciaTotalVA / (tensaoLinha * Math.sqrt(3));
  } else {
    correnteGeral = correnteTeste;
  }

  let caboIdeal = tabelaCondutores[tabelaCondutores.length - 1];
  let disjuntorGeral = 250;

  for (const c of tabelaCondutores) {
    if (c.bitola >= 6.0 && c.capacidadeCorrente >= correnteGeral) {
      const disj = encontrarDisjuntorComercial(
        correnteGeral,
        c.capacidadeCorrente,
      );
      if (disj >= correnteGeral && disj <= c.capacidadeCorrente) {
        caboIdeal = c;
        disjuntorGeral = disj;
        break;
      }
    }
  }

  return {
    potenciaTotalVA: Math.round(potenciaTotalVA),
    correnteGeral: Number(correnteGeral.toFixed(1)),
    caboGeral: caboIdeal.bitola,
    disjuntorGeral,
    ehTrifasico,
  };
};
