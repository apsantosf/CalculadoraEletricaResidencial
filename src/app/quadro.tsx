const handleCompartilharRelatorio = async () => {
  if (!resultadoQDC) return;

  let textoRelatorio = `⚡ *RELATÓRIO TÉCNICO ELÉTRICO* ⚡\n`;
  textoRelatorio += `📜 Baseado na Norma NBR 5410:2004\n`; // 👈 Norma adicionada!
  textoRelatorio += `----------------------------------------\n\n`;
  textoRelatorio += `📋 *RELAÇÃO DE CIRCUITOS:* \n`;

  circuitos.forEach((c) => {
    if (c.tipo === "tue" && c.potenciaWatts) {
      textoRelatorio += `• ${c.nome}: ${c.potenciaWatts}W\n`;
    } else if (c.tipo === "tug" && c.detalhe) {
      textoRelatorio += `• ${c.nome} ${c.detalhe}: ${c.potenciaVA} VA\n`; // 👈 Detalhe de tomadas adicionado!
    } else {
      textoRelatorio += `• ${c.nome}: ${c.potenciaVA} VA\n`;
    }
  });

  textoRelatorio += `\n🏆 *DIMENSIONAMENTO GERAL (QDC):* \n`;
  textoRelatorio += `• Potência Bruta Total: ${resultadoQDC.potenciaTotalVA} VA\n`;
  textoRelatorio += `• Potência Corrigida (Demanda): ${resultadoQDC.potenciaDemandadaVA} VA\n`;
  textoRelatorio += `• Corrente Geral Calculada: ${resultadoQDC.correnteGeral} A\n`;
  textoRelatorio += `• Cabo do Alimentador Principal: *${resultadoQDC.caboGeral} mm²*\n`;
  textoRelatorio += `• Disjuntor Geral Indicado: *${resultadoQDC.disjuntorGeral} A*\n\n`;
  textoRelatorio += `_Gerado automaticamente pelo app Calculadora Elétrica_`;

  try {
    await Share.share({ message: textoRelatorio });
  } catch (error) {
    Alert.alert("Erro", "Não foi possível compartilhar o relatório.");
  }
};
