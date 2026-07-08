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
): string => {
  if (sistemaDistribuicao === "127/220V") {
    if (tensaoSelecionada === 220) {
      if (disjuntorGeral <= 70) return "Bifásico (2 Polos)";
      return "Trifásico (3 Polos)";
    }
    if (disjuntorGeral <= 40) return "Monofásico (1 Polo)";
    if (disjuntorGeral > 40 && disjuntorGeral <= 70)
      return "Bifásico (2 Polos)";
    return "Trifásico (3 Polos)";
  }

  if (sistemaDistribuicao === "220/380V") {
    if (disjuntorGeral <= 40) return "Monofásico (1 Polo)";
    if (disjuntorGeral > 40 && disjuntorGeral <= 70)
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
  const cabosPossiveis = tableCondutores.filter(
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

export const processarTrechoRamal = (
  distancia: number,
  corrente: number,
  tensao: number,
  caboMinimo: number,
  sistemaDistribuicao: string,
) => {
  if (distancia <= 0 || corrente <= 0)
    return { bitola: caboMinimo, disjuntor: 0, classificacao: "N/A" };

  const calculo = sugerirBitolaPorQueda(distancia, corrente, tensao);
  const bitolaAjustada = Math.max(calculo.bitola, caboMinimo);
  const disjuntor = encontrarDisjuntorComercial(
    corrente,
    calculo.capacidadeCorrente,
  );
  const classificacao = determinarTipoFornecimento(
    disjuntor,
    tensao,
    sistemaDistribuicao,
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

export const calcularAlimentadorGeral = (dados: {
  potenciaIlumTugVA: number;
  potenciasTueWatts: number[];
  tensao: number;
  forcarTrifasico?: boolean;
  tipoImovel?: string;
  isQDC?: boolean;
}) => {
  const somaTues = dados.potenciasTueWatts.reduce((acc, curr) => acc + curr, 0);
  const potenciaTotalBruta = dados.potenciaIlumTugVA + somaTues;

  // 💡 LÓGICA UNIFICADA E NORMATIVA:
  // Aplicamos os fatores de demanda normativos igualmente para o QDC e a Entrada,
  // garantindo consistência matemática entre as duas visões da tela.
  const fatorTUGs = obterFatorDemandaGeral(dados.potenciaIlumTugVA);

  let fatorTUEs = 1.0;
  const qtdTUEs = dados.potenciasTueWatts.length;
  if (qtdTUEs === 2) fatorTUEs = 0.9;
  else if (qtdTUEs >= 3 && qtdTUEs <= 5) fatorTUEs = 0.8;
  else if (qtdTUEs >= 6) fatorTUEs = 0.7;

  const somaTuesComFator = dados.potenciasTueWatts.reduce(
    (acc, curr) => acc + curr * fatorTUEs,
    0,
  );

  const potenciaDemandaDiferenciada =
    dados.potenciaIlumTugVA * fatorTUGs + somaTuesComFator;

  // Se for apartamento, mantém a infraestrutura bifásica interna de distribuição.
  // Se for casa e a potência bruta ultrapassar o limite de 25kW, a transição trifásica é mandatória.
  let ehTrifasico = dados.forcarTrifasico || false;
  if (dados.tipoImovel !== "Apartamento" && potenciaTotalBruta > 25000) {
    ehTrifasico = true;
  }

  let correnteGeral = 0;

  if (ehTrifasico) {
    const tensaoLinha = dados.tensao === 127 ? 220 : 380;
    correnteGeral = potenciaDemandaDiferenciada / (tensaoLinha * Math.sqrt(3));
  } else {
    correnteGeral = potenciaDemandaDiferenciada / dados.tensao;
  }

  // 💡 CRITÉRIO DE SELETIVIDADE TÉCNICA E SEGURANÇA:
  // Para blindar contra desarmes simultâneos (ex: dois chuveiros de alta potência ligados),
  // a corrente base calculada é validada contra o pior cenário real de concorrência de carga.
  let correnteMinimaSeguranca = 0;
  if (dados.potenciasTueWatts.length > 0) {
    const maiorTUE = Math.max(...dados.potenciasTueWatts);
    const tensaoMaiorEquipamento = maiorTUE > 3000 ? 220 : dados.tensao;
    // Pega o maior circuito individual e adiciona uma margem segura para o uso do restante dos cômodos
    correnteMinimaSeguranca = maiorTUE / tensaoMaiorEquipamento + 15;
  } else {
    correnteMinimaSeguranca = 6800 / 220 + 10;
  }

  if (correnteGeral < correnteMinimaSeguranca) {
    correnteGeral = correnteMinimaSeguranca;
  }

  if (ehTrifasico && correnteGeral < 40) {
    correnteGeral = 40;
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
    potenciaTotalVA: Math.round(potenciaDemandaDiferenciada),
    correnteGeral: Number(correnteGeral.toFixed(1)),
    caboGeral: caboIdeal.bitola,
    disjuntorGeral,
    ehTrifasico,
  };
};
