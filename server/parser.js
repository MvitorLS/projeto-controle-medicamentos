'use strict';

/**
 * Parser de receitas médicas em português.
 * Extrai nome, dosagem, frequência, horários e estoque a partir de texto bruto,
 * no mesmo formato de medicamento usado pelo front (js/medicamentos.js).
 */

const DOSAGE_RE = /\b(\d+(?:[.,]\d+)?)\s*(mg|ml|mcg|g|ui|u\.i\.)(?![a-z])/i;

// Códigos iguais aos do <select id="medFreq">; a ordem importa (mais específico primeiro).
const FREQ_RULES = [
  { re: /\b6\s*(?:em|\/)\s*6\s*h?\b|de\s+6\s+em\s+6\s*h/i,   val: 'four' },
  { re: /\b8\s*(?:em|\/)\s*8\s*h?\b|de\s+8\s+em\s+8\s*h/i,   val: 'three' },
  { re: /\b12\s*(?:em|\/)\s*12\s*h?\b|de\s+12\s+em\s+12\s*h/i, val: 'twice' },
  { re: /\b4\s*x\s*(?:ao\s*)?dia|quatro\s*vezes/i,             val: 'four' },
  { re: /\b3\s*x\s*(?:ao\s*)?dia|tr[êe]s\s*vezes/i,            val: 'three' },
  { re: /\b2\s*x\s*(?:ao\s*)?dia|duas\s*vezes/i,               val: 'twice' },
  { re: /se\s+(?:necess[áa]rio|dor|febre)|conforme\s+necessidade|s\.?o\.?s\.?/i, val: 'sos' },
  { re: /\b1\s*x\s*(?:ao\s*)?dia|uma\s*vez|di[áa]rio|di[áa]ria|uso\s+cont[íi]nuo/i, val: 'daily' },
];

const DOSES_PER_DAY = { daily: 1, twice: 2, three: 3, four: 4, sos: 0 };

const TIME_RULES = [
  { re: /\b(\d{1,2}):(\d{2})\b/,                                     extract: m => `${m[1].padStart(2, '0')}:${m[2]}` },
  { re: /pela\s+manh[ãa]|ao\s+acordar|em\s+jejum|caf[ée]\s+da\s+manh[ãa]/i, extract: () => '07:00' },
  { re: /ao?\s+almo[çc]o|antes\s+do\s+almo[çc]o/i,                   extract: () => '12:00' },
  { re: /ao?\s+jantar|antes\s+do\s+jantar/i,                         extract: () => '19:00' },
  { re: /[àa]\s+noite|ao\s+deitar|antes\s+de\s+dormir/i,             extract: () => '21:00' },
];

const STOCK_RE = /\b([1-9]\d{0,2})\s*(?:comprimidos?|c[áa]psulas?|caps?\.?|cp\.?s?|ampolas?|frascos?)\b/i;

function titleCase(str) {
  const lower = ['de', 'da', 'do', 'das', 'dos', 'e', 'em', 'para', 'com', 'a', 'o'];
  return str
    .toLowerCase()
    .split(' ')
    .map((w, i) => (i === 0 || !lower.includes(w)) ? w.charAt(0).toUpperCase() + w.slice(1) : w)
    .join(' ');
}

/** Distribui as doses do dia a partir do primeiro horário, em intervalos iguais dentro de 24h. */
function spreadTimes(first, doses) {
  if (doses <= 1) return doses === 1 ? [first] : [];
  const [h, m] = first.split(':').map(Number);
  const step = 24 / doses;
  return Array.from({ length: doses }, (_, i) => {
    const hour = (h + Math.round(i * step)) % 24;
    return `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
  });
}

function parsePrescription(rawText) {
  const medications = [];
  const seen = new Set();

  const lines = rawText
    .replace(/\r\n?/g, '\n')
    .split('\n')
    .map(l => l.trim())
    .filter(l => l.length > 2 && !/^--\s*\d+\s+of\s+\d+\s*--$/.test(l)); // marcador de página do pdf-parse

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const dosageMatch = DOSAGE_RE.exec(line);
    if (!dosageMatch) continue;

    // Nome = tudo antes da dosagem na linha
    let name = line.slice(0, dosageMatch.index)
      .replace(/^[\d.\-•*)(]+\s*/, '') // remove marcadores de lista
      .replace(/\s+/g, ' ')
      .trim();

    if (name.length < 2) continue;
    name = titleCase(name);

    const key = name.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);

    const dosage = dosageMatch[1].replace(',', '.') + dosageMatch[2].toLowerCase();

    // Contexto: linha atual + próximas linhas até o próximo medicamento (máx. 3)
    const ctxLines = [line];
    for (let j = i + 1; j < Math.min(i + 4, lines.length) && !DOSAGE_RE.test(lines[j]); j++) {
      ctxLines.push(lines[j]);
    }
    const ctx = ctxLines.join(' ');

    let frequency = 'daily';
    for (const rule of FREQ_RULES) {
      if (rule.re.test(ctx)) { frequency = rule.val; break; }
    }

    let firstTime = '08:00';
    for (const rule of TIME_RULES) {
      const m = rule.re.exec(ctx);
      if (m) { firstTime = rule.extract(m); break; }
    }

    let stock = null;
    const stockMatch = STOCK_RE.exec(ctx);
    if (stockMatch) {
      const qty = parseInt(stockMatch[1], 10);
      if (qty >= 1 && qty <= 500) stock = qty;
    }

    medications.push({
      name,
      dosage,
      frequency,
      times: spreadTimes(firstTime, DOSES_PER_DAY[frequency]),
      stock,
      notes: ctxLines.slice(1).join(' '),
    });
  }

  return medications;
}

module.exports = { parsePrescription, spreadTimes };
