// src/utils/calculations.ts

// 1. TABELA DE CONDUTORES EXPANDIDA (Vinda do seu arquivo tabelasCondutores.ts)
export interface Condutor {
  bitola: number;
  capacidadeCorrente: number;
}

export const tabelaCondutores: Condutor[] = [
  { bitola: 1.5, capacidadeCorrente: 15 },
  { bitola: 2.5, capacityCorrente: 21 }, // Mantendo compatibilidade
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

// 2. FATOR DE DEMANDA DA REDE (Vindo do seu calculosEletricos.ts)
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

// 3. ENCONTRAR DISJUNTOR COMERCIAL E CLASSIFICAÇÃO POLAR
export const encontrarDisjuntorComercial = (correnteDemanda: number, capacidadeCabo: number): number => {
  const disjuntoresComerciais = [10, 16, 20, 25, 32, 40, 50, 63, 70, 80, 100, 125];
  const adequados = disjuntoresComerciais.filter((d) => d >= correnteDemanda && d <= capacidadeCabo);
  if (adequados.length > 0) return adequados[0];
  return disjuntoresComerciais.find((d) => d >= correnteDemanda) || 125;
};

export const determinarTipoFornecimento = (disjuntorGeral: number): string => {
  if (disjuntorGeral <= 40) return "Monofásico (1 Polo)";
  if (disjuntorGeral > 40 && disjuntorGeral <= 70) return "Bifásico (2 Polos)";
  return "Trifásico (3 Polos)";
};

// 4. CÁLCULO FÍSICO DE QUEDA DE TENSÃO (Vindo do seu calculosFisicos.ts)
export const calcularQuedaTensao = (
  comprimento: number,
  corrente: number,
  bitola: number,
  tensao: number
): number => {
  const resistividadeCobre = 0.0172;
  // Identifica se adota fator 2 (m/b) ou raiz de 3 (t) baseado no disjuntor de forma simplificada
  const ehTrifasico = corrente > 70; 
  const fatorFase = ehTrifasico ? Math.sqrt(3) : 2;
  const deltaU = (fatorFase * comprimento * corrente * resistividadeCobre) / bitola;
  return (deltaU / tensao) * 100;
};

export const sugerirBitolaPorQueda = (comprimento: number, corrente: number, tensao: number) => {
  const cabosPossiveis = tabelaCondutores.filter((c) => c.capacidadeCorrente >= corrente);
  if (cabosPossiveis.length === 0) return tabelaCondutores[tabelaCondutores.length - 1];

  const bitolaIdeal = cabosPossiveis.find((c) => {
    const queda = calcularQuedaTensao(comprimento, corrente, c.bitola, tensao);
    return queda <= 4.0; // Limite padrão normativo de 4%
  });

  return bitolaIdeal || cabosPossiveis[cabosPossiveis.length - 1];
};

// 5. PROCESSAMENTO DE UM TRECHO ESPECÍFICO (Ramal de Ligação ou Entrada)
export const processarTrechoRamal = (
  distancia: number,
  corrente: number,
  tensao: number,
  caboMinimo: number
) => {
  if (distancia <= 0 || corrente <= 0) return { bitola: caboMinimo, disjuntor: 0, classificacao: "N/A" };

  const calculo = sugerirBitolaPorQueda(distancia, corrente, tensao);
  const bitolaAjustada = Math.max(calculo.bitola, caboMinimo);
  const disjuntor = encontrarDisjuntorComercial(corrente, calculo.capacidadeCorrente);
  const classificacao = determinarTipoFornecimento(disjuntor);

  return {
    bitola: bitolaAjustada,
    disjuntor: disjuntor,
    classificacao: classificacao,
  };
};

// 6. MANUTENÇÃO DOS MÓDULOS DE CÔMODOS EXISTENTES (Para não quebrar as outras telas)
export const calcularIluminacao = (area: number): number => {
  if (area <= 6) return 100;
  return 100 + Math.floor((area - 6) / 4) * 60;
};

export const calcularQuantidadeTugs = (tipo: string, perimetro: number): number => {
  const t = tipo.toLowerCase();
  if (t === "cozinha" || t === "banheiro") return Math.max(3, Math.ceil(perimetro / 3.5));
  return Math.max(1, Math.ceil(perimetro / 5));
};

export const calcularPotenciaTugs = (tipo: string, quantidade: number): number => {
  const t = tipo.toLowerCase();
  if (t === "cozinha" || t === "banheiro") {
    if (quantidade <= 3) return quantidade * 600;
    return 3 * 600 + (quantidade - 3) * 100;
  }
  return quantidade * 100;
};

export const dimensionarCircuito = (potenciaVA: number, tensao: number, tipo: string) => {
  const corrente = potenciaVA / tensao;
  const caboMin = tipo === "iluminacao" ? 1.5 : 2.5;
  const caboIdeal = tabelaCondutores.find((c) => c.capacidadeCorrente >= corrente && c.bitola >= caboMin) || tabelaCondutores[1];
  const disjuntor = encontrarDisjuntorComercial(corrente, caboIdeal.capacidadeCorrente);
  return { correnteProjeto: Number(corrente.toFixed(2)), secaoCabo: caboIdeal.bitola, disjuntor };
};

export const dimensionarTUE = (potenciaWatts: number, tensao: number, fp: number) => {
  const potenciaVA = potenciaWatts / fp;
  const corrente = potenciaVA / tensao;
  const caboIdeal = tabelaCondutores.find((c) => c.capacidadeCorrente >= corrente && c.bitola >= 2.5) || tabelaCondutores[1];
  const disjuntor = encontrarDisjuntorComercial(corrente, caboIdeal.capacidadeCorrente);
  return { potenciaVA: Math.round(potenciaVA), correnteProjeto: Number(corrente.toFixed(2)), secaoCabo: caboIdeal.bitola, disjuntor };
};

export const calcularAlimentadorGeral = (dados: { potenciaIlumTugVA: number; potenciasTueWatts: number[]; tensao: number }) => {
  const somaTues = dados.potenciasTueWatts.reduce((acc, curr) => acc + curr, 0);
  const potenciaTotalVA = dados.potenciaIlumTugVA + somaTues; 
  const correnteGeral = potenciaTotalVA / dados.tensao;
  const caboIdeal = tabelaCondutores.find((c) => c.capacidadeCorrente >= correnteGeral && c.bitola >= 6.0) || tabelaCondutores[3];
  const disjuntorGeral = encontrarDisjuntorComercial(correnteGeral, caboIdeal.capacidadeCorrente);
  return { potenciaTotalVA: Math.round(potenciaTotalVA), correnteGeral: Number(correnteGeral.toFixed(1)), caboGeral: caboIdeal.bitola, disjuntorGeral };
};