// src/utils/pdfGenerator.ts
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Alert, Platform } from "react-native";

interface PDFData {
  comodos: any[];
  tensaoGeral: number;
  concessionaria: string;
  resultadoQDC: any;
  resultadoDemanda: any;
  resultadosRamal: any;
}

export const gerarMemorialPDF = async (data: PDFData) => {
  const {
    comodos,
    tensaoGeral,
    concessionaria,
    resultadoQDC,
    resultadoDemanda,
    resultadosRamal,
  } = data;

  // 1. Construção dinâmica da tabela de circuitos/cómodos
  let linhasComodosHtml = "";
  comodos.forEach((c) => {
    c.dispositivos.forEach((d: any) => {
      const potTotal = d.potencia * d.quantidade;
      const unidade = d.tipo === "tue" ? "W" : "VA";
      linhasComodosHtml += `
        <tr>
          <td><strong>${c.nome}</strong></td>
          <td>${d.nome}</td>
          <td style="text-align: center;">${d.quantidade}</td>
          <td style="text-align: right;">${potTotal} ${unidade}</td>
        </tr>
      `;
    });
  });

  // 2. Construção opcional do bloco de verificação por queda de tensão
  let blocoRamalHtml = "";
  if (resultadosRamal) {
    blocoRamalHtml = `
      <div class="card" style="border-left: 4px solid #0284c7;">
        <h2 style="color: #0284c7; margin-top: 0;">📏 Dimensionamento do Ramal (Verificação por Distância)</h2>
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
            <tr>
              <td>📍 Trecho 1: Rede da Rua ao Medidor</td>
              <td style="text-align: center;">${resultadosRamal.trecho1.bitola} mm²</td>
              <td style="text-align: center;">${resultadosRamal.trecho1.disjuntor} A</td>
            </tr>
            <tr>
              <td>🏠 Trecho 2: Medidor ao Quadro Interno (QDC)</td>
              <td style="text-align: center;">${resultadosRamal.trecho2.bitola} mm²</td>
              <td style="text-align: center;">${resultadosRamal.trecho2.disjuntor} A</td>
            </tr>
          </tbody>
        </table>
      </div>
    `;
  }

  // 3. Template HTML Completo
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
        .card { background-color: #ffffff; border: 1px solid #e5e7eb; border-radius: 6px; padding: 18px; margin-bottom: 20px; page-break-inside: avoid; }
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
            <div class="grid-cell label">Normativa de Referência de Base:</div>
            <div class="grid-cell value">NBR 5410:2004</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell label">Distribuidora de Energia Autorizada:</div>
            <div class="grid-cell value">${concessionaria}</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell label">Tensão Nominal de Trabalho:</div>
            <div class="grid-cell value">${tensaoGeral} V</div>
          </div>
        </div>
      </div>

      ${blocoRamalHtml}

      <div class="card">
        <h2>💡 Quadro de Distribuição Interno (QDC)</h2>
        <div class="grid-info">
          <div class="grid-row">
            <div class="grid-cell label">Potência Total Acumulada Instalada:</div>
            <div class="grid-cell value">${resultadoQDC?.potenciaTotalVA} VA</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell label">Corrente de Projeto de Carga Interna (Ib):</div>
            <div class="grid-cell value">${resultadoQDC?.correnteGeral} A</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell label">Seção do Condutor Alimentador Geral (QDC):</div>
            <div class="grid-cell value" style="color: #059669;">${resultadoQDC?.caboGeral} mm²</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell label">Disjuntor Termomagnético Geral do QDC:</div>
            <div class="grid-cell value" style="color: #059669;">${resultadoQDC?.disjuntorGeral} A</div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>🏢 Padrão de Entrada - Demanda</h2>
        <div class="grid-info">
          <div class="grid-row">
            <div class="grid-cell label">Demanda Total Prevista Admissível (S):</div>
            <div class="grid-cell value">${resultadoDemanda?.potenciaTotalVA} VA</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell label">Corrente de Demanda Corrigida (In):</div>
            <div class="grid-cell value">${resultadoDemanda?.correnteGeral} A</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell label">Cabo do Ramal de Entrada (Padrão):</div>
            <div class="grid-cell value" style="color: #1d4ed8;">${resultadoDemanda?.caboGeral} mm²</div>
          </div>
          <div class="grid-row">
            <div class="grid-cell label">Disjuntor Geral de Proteção do Medidor:</div>
            <div class="grid-cell value" style="color: #1d4ed8;">${resultadoDemanda?.disjuntorGeral} A</div>
          </div>
        </div>
      </div>

      <div class="card">
        <h2>📝 Relação Discriminada de Cargas por Divisão</h2>
        <table>
          <thead>
            <tr>
              <th>Ambiente / Divisão</th>
              <th>Circuito / Equipamento</th>
              <th style="text-align: center;">Qtd</th>
              <th style="text-align: right;">Potência Acumulada</th>
            </tr>
          </thead>
          <tbody>
            ${linhasComodosHtml}
          </tbody>
        </table>
      </div>

      <div class="footer">
        <p>Relatório técnico emitido de forma automatizada. Os condutores e disjuntores sugeridos obedecem estritamente aos critérios de capacidade de condução de corrente e limite de queda de tensão estipulados na NBR 5410.</p>
      </div>

    </body>
    </html>
  `;

  try {
    if (Platform.OS === "web") {
      // 💡 CORREÇÃO WEB: Abre uma nova aba (protegendo o aplicativo principal)
      const novaAba = window.open("", "_blank");
      if (novaAba) {
        novaAba.document.write(htmlContent);
        novaAba.document.close();

        // Aguarda um instante para renderizar o CSS e chama o diálogo de impressão
        setTimeout(() => {
          novaAba.print();
        }, 500);
      } else {
        window.alert(
          "O navegador bloqueou a abertura de uma nova aba (Pop-up bloqueado). Permita a abertura para gerar o PDF.",
        );
      }
    } else {
      // No Android/iOS, cria o ficheiro e abre o menu de partilha nativo
      const result = await Print.printToFileAsync({ html: htmlContent });

      if (result && result.uri) {
        await Sharing.shareAsync(result.uri, {
          mimeType: "application/pdf",
          dialogTitle: "Exportar Memorial Descritivo",
          UTI: "com.adobe.pdf", // Ajuda o iOS a entender o tipo de ficheiro
        });
      }
    }
  } catch (error) {
    console.error("Erro ao gerar relatório em PDF:", error);
    if (Platform.OS === "web") {
      window.alert("Não foi possível processar o relatório em PDF.");
    } else {
      Alert.alert("Erro", "Não foi possível processar o relatório em PDF.");
    }
  }
};
