'use strict';

/**
 * Parser de receitas médicas em português.
 * Extrai nome, dosagem, horário, frequência e estoque a partir de texto bruto.
 */

const DOSAGE_RE = /\b(\d+(?:[.,]\d+)?)\s*(mg|ml|mcg|g|ui|u\.i\.)\b/i;

const FREQ_RULES = [
  { re: /8\s*(?:em|\/)\s*8|de\s+8\s+em\s+8\s*h/i,   val: '3x ao dia (8 em 8h)' },
  { re: /12\s*(?:em|\/)\s*12|de\s+12\s+em\s+12\s*h/i, val: '2x ao dia (12 em 12h)' },
  { re: /6\s*(?:em|\/)\s*6|de\s+6\s+em\s+6\s*h/i,    val: 'Uso Contínuo / Conforme Necessário' },
  { re: /4\s*x?\s*ao\s*dia|quatro\s*vezes/i,           val: 'Uso Contínuo / Conforme Necessário' },
  { re: /3\s*x?\s*ao\s*dia|três\s*vezes/i,             val: '3x ao dia (8 em 8h)' },
  { re: /2\s*x?\s*ao\s*dia|duas\s*vezes/i,             val: '2x ao dia (12 em 12h)' },
  { re: /1\s*x?\s*ao\s*dia|uma\s*vez|diário|diária/i,  val: '1x ao dia' },
  { re: /uso\s+contínuo|conforme\s+necessário/i,        val: 'Uso Contínuo / Conforme Necessário' },
];

const TIME_RULES = [
  { re: /\b(\d{1,2}:\d{2})\b/,                               extract: m => m[1] },
  { re: /pela\s+manhã|ao\s+acordar|em\s+jejum|café\s+da\s+manhã/i, extract: () => '07:00' },
  { re: /ao?\s+almoço|antes\s+do\s+almoço/i,                 extract: () => '12:00' },
  { re: /ao?\s+jantar|antes\s+do\s+jantar/i,                 extract: () => '19:00' },
  { re: /à\s+noite|ao\s+deitar|antes\s+de\s+dormir/i,        extract: () => '21:00' },
];

const STOCK_RE = /\b([1-9]\d{1,2})\s*(?:comprimidos?|cápsulas?|caps?\.?|cp\.?s?|ampolas?|frascos?)\b/i;

function titleCase(str) {
  const lower = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'para', 'com', 'a', 'o'];
  return str
    .toLowerCase()
    .split(' ')
    .map((w, i) => (i === 0 || !lower.includes(w)) ? w.charAt(0).toUpperCase() + w.slice(1) : w)
    .join(' ');
}

function parsePrescription(rawText) {
  const medications = [];
  const seen = new Set();

  const lines = rawText
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 2);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dosageMatch = DOSAGE_RE.exec(line);
    if (!dosageMatch) continue;

    // Nome = tudo antes da dosagem na linha
    let nome = line.slice(0, dosageMatch.index)
      .replace(/^[\d.\-•*)(]+\s*/, '') // remove marcadores de lista
      .replace(/\s+/g, ' ')
      .trim();

    if (nome.length < 2) continue;
    nome = titleCase(nome);

    // Evita duplicatas
    const key = nome.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const dosagem = dosageMatch[1].replace(',', '.') + dosageMatch[2].toLowerCase();

    // Contexto: linha atual + até 3 próximas
    const ctx = lines.slice(i, Math.min(i + 4, lines.length)).join(' ');

    // Frequência
    let frequencia = '1x ao dia';
    for (const rule of FREQ_RULES) {
      if (rule.re.test(ctx)) { frequencia = rule.val; break; }
    }

    // Horário
    let horario = '08:00';
    for (const rule of TIME_RULES) {
      const m = rule.re.exec(ctx);
      if (m) { horario = rule.extract(m); break; }
    }

    // Estoque
    let estoque = 30;
    const stockMatch = STOCK_RE.exec(ctx);
    if (stockMatch) {
      const qty = parseInt(stockMatch[1]);
      if (qty >= 1 && qty <= 500) estoque = qty;
    }

    medications.push({ nome, dosagem, horario, frequencia, estoque });
  }

  return medications;
}

module.exports = { parsePrescription };
