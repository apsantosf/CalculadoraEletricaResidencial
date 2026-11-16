// src/utils/pdfGenerator.ts
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";
import { obterDimensionamentoCircuito } from "./calculations";

interface PDFData {
  comodos: any[];
  tensaoGeral: number;
  concessionaria: string;
  resultadoQDC: any;
  resultadoDemanda: any;
  resultadosRamal: any;
  tipoImovel: string;
  avisoConcessionaria?: { motivo: string; aviso: string } | null;
  tipoPadraoNovo: string;
  tensaoFornecimento: string;
}

export const gerarMemorialPDF = async (data: PDFData) => {
  const {
    comodos,
    tensaoGeral,
    concessionaria,
    resultadoQDC,
    resultadoDemanda,
    resultadosRamal,
    tipoImovel,
    avisoConcessionaria,
    tipoPadraoNovo,
    tensaoFornecimento,
  } = data;

  // ----------------------------------------------------
  // 1. DADOS E TABELA DE CÔMODOS
  // ----------------------------------------------------
  let linhasComodosHtml = "";
  let todosDispositivosHtml = "";
  let todosDispositivos: any[] = [];

  comodos.forEach((c) => {
    c.dispositivos.forEach((d: any) => {
      const potTotal = d.potencia * d.quantidade;
      const tensaoDispositivo = d.tensao || tensaoGeral;
      const unidade = d.tipo === "tue" ? "W" : "VA";
      const dim = obterDimensionamentoCircuito(
        d.tipo,
        potTotal,
        tensaoDispositivo,
      );

      linhasComodosHtml += `
        <tr>
          <td><strong>${c.nome}</strong></td>
          <td>${d.nome}</td>
          <td style="text-align: center;">${d.quantidade}</td>
          <td style="text-align: right;">${potTotal} ${unidade}</td>
          <td style="text-align: center; color: #059669; font-weight: bold;">${dim.cabo} mm²</td>
          <td style="text-align: center; color: #dc2626; font-weight: bold;">${dim.disj} A <span style="font-size: 8.5pt; color: #4b5563;">(${tensaoDispositivo}V)</span></td>
        </tr>
      `;

      let qtdPolos = 1;
      if (tensaoGeral === 127 && tensaoDispositivo === 220) qtdPolos = 2;
      else if (tensaoGeral === 220 && tensaoDispositivo === 380) qtdPolos = 2;

      todosDispositivos.push({
        tipo: d.tipo,
        rotulo: d.nome,
        detalhe: c.nome,
        corrente: dim.disj,
        tensao: tensaoDispositivo,
        polos: qtdPolos,
      });
    });
  });

  // ----------------------------------------------------
  // 2. LÓGICA DO QUADRO VISUAL EM HTML / CSS
  // ----------------------------------------------------
  const getCoresHtml = (tipo: string) => {
    switch (tipo) {
      case "geral":
        return { bg: "#1E2937", border: "#0F172A", text: "#F8FAFC" };
      case "idr":
        return { bg: "#0284C7", border: "#0369A1", text: "#FFFFFF" };
      case "dps":
        return { bg: "#D97706", border: "#B45309", text: "#FFFFFF" };
      case "iluminacao":
        return { bg: "#E0F2FE", border: "#BAE6FD", text: "#0369A1" };
      case "tug":
        return { bg: "#FEF3C7", border: "#FDE68A", text: "#B45309" };
      case "tue":
        return { bg: "#FEE2E2", border: "#FECACA", text: "#B91C1C" };
      default:
        return { bg: "#F3F4F6", border: "#E5E7EB", text: "#374151" };
    }
  };

  const renderModuloHtml = (disp: any) => {
    const cor = getCoresHtml(disp.tipo);
    const largura = disp.polos * 55;
    const larguraStr = `width: ${largura}px; min-width: ${largura}px; max-width: ${largura}px; flex: 0 0 auto;`;

    return `
      <div style="background-color: ${cor.bg}; border: 1.5px solid ${cor.border}; color: ${cor.text}; 
                  border-radius: 6px; padding: 6px; text-align: center; height: 100px;
                  display: flex; flex-direction: column; justify-content: space-between; align-items: center;
                  margin: 3px; box-sizing: border-box; ${larguraStr} 
                  -webkit-print-color-adjust: exact; print-color-adjust: exact;">
        <div style="width: 14px; height: 8px; background-color: #4B5563; border-radius: 2px; margin: 0 auto 4px auto;"></div>
        <div style="font-size: 9px; font-weight: bold; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical;">${disp.rotulo}</div>
        <div>
          ${disp.corrente ? `<div style="font-size: 11px; font-weight: 900; line-height: 1.1;">${disp.corrente}A</div>` : ""}
          ${disp.tensao ? `<div style="font-size: 8.5px; font-weight: bold; opacity: 0.9; margin-top: 1px;">${disp.tensao}V</div>` : ""}
        </div>
        ${disp.detalhe ? `<div style="font-size: 8px; opacity: 0.8; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; width: 100%;">${disp.detalhe}</div>` : ""}
      </div>
    `;
  };

  todosDispositivos.forEach((disp) => {
    todosDispositivosHtml += renderModuloHtml(disp);
  });

  const disjGeralAmp = resultadoDemanda?.disjuntorGeral || 63;
  let polosGeral = 1;
  if (resultadoQDC?.ehTrifasico) polosGeral = 3;
  else if (resultadoQDC?.potenciaTotalVA > 12000) polosGeral = 2;

  const idrAmp =
    [25, 40, 63, 80, 100, 125].find((i) => i >= disjGeralAmp) || disjGeralAmp;

  const esquemaQuadroHtml = `
    <div class="card" style="background-color: #f8fafc; border: 2px solid #cbd5e1; page-break-inside: avoid;">
      <h2>⚡ Esquema Visual do Quadro de Distribuição (QDC)</h2>
      <p style="font-size: 10pt; color: #64748b; margin-bottom: 12px;">Representação física em trilho DIN dos dispositivos dimensionados.</p>
      
      <div style="font-size: 10pt; font-weight: bold; margin-bottom: 5px; color: #475569;">Trilho 1: Entrada e Proteção Geral</div>
      <div style="display: flex; flex-direction: row; background-color: #e2e8f0; padding: 8px; border-radius: 8px; border: 1px solid #cbd5e1; margin-bottom: 15px; justify-content: center;">
        ${renderModuloHtml({ tipo: "dps", rotulo: "DPS Classe II", detalhe: "Surto", tensao: tensaoGeral, polos: 1 })}
        ${renderModuloHtml({ tipo: "geral", rotulo: "Disjuntor Geral", detalhe: polosGeral === 3 ? "Tripolar" : polosGeral === 2 ? "Bipolar" : "Monopolar", corrente: disjGeralAmp, tensao: tensaoGeral, polos: polosGeral })}
        ${renderModuloHtml({ tipo: "idr", rotulo: "IDR Principal", detalhe: "30mA", corrente: disjGeralAmp, tensao: tensaoGeral, polos: polosGeral === 3 ? 4 : 2 })}
      </div>

      <div style="font-size: 10pt; font-weight: bold; margin-bottom: 5px; color: #475569;">Trilho 2+: Circuitos Terminais</div>
      <div style="display: flex; flex-direction: row; flex-wrap: wrap; background-color: #e2e8f0; padding: 8px; border-radius: 8px; border: 1px solid #cbd5e1; justify-content: center;">
        ${todosDispositivosHtml || '<div style="padding: 10px; color: #64748b;">Nenhum circuito cadastrado.</div>'}
      </div>
    </div>
  `;

  let blocoAvisoConcessionariaHtml = "";
  if (avisoConcessionaria) {
    blocoAvisoConcessionariaHtml = `
      <div class="card" style="border: 2px solid #fca5a5; background-color: #fef2f2; page-break-inside: avoid;">
        <h2 style="color: #991b1b; margin-top: 0; border-bottom: 1px solid #fca5a5; padding-bottom: 8px;">⚠️ AVISO IMPORTANTE AO CLIENTE</h2>
        <p style="color: #7f1d1d; margin-bottom: 10px;"><strong>Motivo da Alteração:</strong> ${avisoConcessionaria.motivo}</p>
        <div style="background-color: #fff1f2; padding: 12px; border-left: 4px solid #e11d48;">
          <p style="color: #be123c; margin: 0; font-weight: bold; font-size: 11pt;">📢 ${avisoConcessionaria.aviso}</p>
        </div>
      </div>
    `;
  }

  let blocoRamalHtml = "";
  if (resultadosRamal) {
    const linhaTrecho1 = resultadosRamal.trecho1
      ? `
            <tr>
              <td>📍 Trecho Externo: Rede da Rua ao Medidor</td>
              <td style="text-align: center;">${resultadosRamal.trecho1.bitola} mm²</td>
              <td style="text-align: center;">${resultadosRamal.trecho1.disjuntor} A</td>
            </tr>
    `
      : "";

    blocoRamalHtml = `
      <div class="card" style="border-left: 4px solid #0284c7;">
        <h2 style="color: #0284c7; margin-top: 0;">📏 Dimensionamento do Alimentador Principal</h2>
        <p><strong>Tipo de Fornecimento Recomendado:</strong> ${resultadosRamal.fornecimento}</p>
        <p><strong>Demanda Corrigida:</strong> ${resultadosRamal.potenciaDemanda} VA | <strong>Corrente:</strong> ${resultadosRamal.correnteDemanda} A</p>
        <table style="margin-top: 10px;">
          <thead>
            <tr>
              <th>Trecho de Alimentação</th>
              <th style="text-align: center;">Cabo Ideal</th>
              <th style="text-align: center;">Disjuntor Comercial</th>
            </tr>
          </thead>
          <tbody>
            ${linhaTrecho1}
            <tr>
              <td>🏠 Trecho Interno: Medidor ao Quadro Interno (QDC)</td>
              <td style="text-align: center;">${resultadosRamal.trecho2.bitola} mm²</td>
              <td style="text-align: center;">${resultadosRamal.trecho2.disjuntor} A</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Memorial Descritivo Elétrico</title>
      <style>
        @page { size: A4; margin: 20mm 15mm; }
        body { font-family: 'Arial', sans-serif; color: #333; line-height: 1.3; margin: 0; padding: 0; font-size: 11pt; }
        .header-bg { background-color: #064e3b; color: #fff; padding: 25px; border-radius: 6px; margin-bottom: 25px; text-align: center; }
        .header-bg h1 { margin: 0; font-size: 20pt; letter-spacing: 0.5px; }
        .header-bg p { margin: 5px 0 0 0; font-size: 11pt; color: #a7f3d0; opacity: 0.9; }
        .card { background-color: #ffffff; border: 1.5px solid #e5e7eb; border-radius: 6px; padding: 18px; margin-bottom: 20px; page-break-inside: avoid; }
        h2 { font-size: 13pt; color: #064e3b; margin-top: 0; margin-bottom: 12px; border-bottom: 1px solid #e5e7eb; padding-bottom: 6px; }
        .grid-info { display: table; width: 100%; margin-bottom: 10px; }
        .grid-row { display: table-row; }
        .grid-cell { display: table-cell; padding: 6px 0; }
        .grid-cell.label { font-weight: bold; color: #4b5563; width: 60%; }
        .grid-cell.value { text-align: right; font-weight: 600; color: #111827; }
        table { width: 100%; border-collapse: collapse; margin-top: 5px; font-size: 10.5pt; }
        th { background-color: #f3f4f6; color: #374151; font-weight: bold; text-align: left; padding: 8px 10px; border-bottom: 2px solid #d1d5db; }
        td { padding: 8px 10px; border-bottom: 1px solid #e5e7eb; color: #4b5563; }
        tr:nth-child(even) td { background-color: #f9fafb; }
        .footer { text-align: center; margin-top: 40px; font-size: 9pt; color: #9ca3af; font-style: italic; border-top: 1px solid #e5e7eb; padding-top: 10px; page-break-inside: avoid; }
        .destaque-azul { color: #1d4ed8; font-weight: bold; }
      </style>
    </head>
    <body>
      <div class="header-bg">
        <h1>⚡ MEMORIAL DESCRITIVO ELÉTRICO ⚡</h1>
        <p>Dimensionamento de Instalações Técnicas Residenciais</p>
      </div>

      <div class="card">
        <h2>📋 Parâmetros Gerais do Projeto</h2>
        <div class="grid-info">
          <div class="grid-row">
            <div class="grid-cell label">Tipo de Imóvel:</div>
            <div class="grid-cell value destaque-azul">${tipoImovel}</div> 
          </div>
          <div class="grid-row">
            <div class="grid-cell label">Distribuidora de Energia:</div>
            <div class="grid-cell value">${concessionaria}</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell label">Padrão de Fornecimento Exigido:</div>
            <div class="grid-cell value destaque-azul">${tipoPadraoNovo} (${tensaoFornecimento})</div>
          </div>
        </div>
      </div>
      
      ${blocoAvisoConcessionariaHtml}
      ${blocoRamalHtml}

      <div class="card">
        <h2>📝 Relação de Cargas (Circuitos Terminais)</h2>
        <table>
          <thead>
            <tr>
              <th>Ambiente</th>
              <th>Circuito</th>
              <th style="text-align: center;">Qtd</th>
              <th style="text-align: right;">Carga</th>
              <th style="text-align: center;">Cabo</th>
              <th style="text-align: center;">Disjuntor / Tensão</th>
            </tr>
          </thead>
          <tbody>
            ${linhasComodosHtml}
          </tbody>
        </table>
      </div>

      ${esquemaQuadroHtml}

      <div class="footer">
        <p>Relatório automatizado NBR 5410 gerado por Elétrica Residencial.</p>
      </div>
    </body>
    </html>
  `;

  try {
    if (Platform.OS === "web") {
      const novaAba = window.open("", "_blank");
      if (novaAba) {
        novaAba.document.write(htmlContent);
        novaAba.document.close();
        setTimeout(() => novaAba.print(), 500);
      } else {
        window.alert("O navegador bloqueou a abertura do PDF (Pop-up).");
      }
    } else {
      const result = await Print.printToFileAsync({ html: htmlContent });
      if (result && result.uri) {
        await Sharing.shareAsync(result.uri, {
          mimeType: "application/pdf",
          dialogTitle: "Exportar Memorial",
          UTI: "com.adobe.pdf",
        });
      }
    }
  } catch (error) {
    console.error("Erro PDF:", error);
    Alert.alert("Erro", "Falha ao gerar o PDF.");
  }
};
