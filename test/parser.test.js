'use strict';

const { test } = require('node:test');
const assert = require('node:assert/strict');
const { parsePrescription, spreadTimes } = require('../server/parser');

test('extrai nome e dosagem', () => {
  const [med] = parsePrescription('1. LOSARTANA POTÁSSICA 50 mg');
  assert.equal(med.name, 'Losartana Potássica');
  assert.equal(med.dosage, '50mg');
});

test('mapeia intervalos em horas para a frequência do front', () => {
  const cases = [
    ['Dipirona 500mg\nTomar de 6 em 6h', 'four'],
    ['Amoxicilina 500mg 8/8h', 'three'],
    ['Metformina 850mg 12/12h', 'twice'],
    ['Omeprazol 20mg 1x ao dia', 'daily'],
  ];
  for (const [text, freq] of cases) {
    assert.equal(parsePrescription(text)[0].frequency, freq, text);
  }
});

test('"4x ao dia" vira four e "uso contínuo" vira daily', () => {
  assert.equal(parsePrescription('Paracetamol 750mg 4x ao dia')[0].frequency, 'four');
  assert.equal(parsePrescription('Sinvastatina 20mg uso contínuo')[0].frequency, 'daily');
});

test('"se dor" vira sos e não gera horários', () => {
  const [med] = parsePrescription('Ibuprofeno 400mg se dor');
  assert.equal(med.frequency, 'sos');
  assert.deepEqual(med.times, []);
});

test('distribui horários a partir do primeiro horário encontrado', () => {
  const [med] = parsePrescription('Amoxicilina 500mg\nde 8 em 8h, começar às 06:00');
  assert.deepEqual(med.times, ['06:00', '14:00', '22:00']);
});

test('usa pistas como "ao deitar" quando não há hora explícita', () => {
  assert.deepEqual(parsePrescription('Melatonina 3mg ao deitar')[0].times, ['21:00']);
});

test('contexto de um medicamento não vaza para o próximo', () => {
  const meds = parsePrescription('Losartana 50mg\nMetformina 850mg\n12/12h');
  assert.equal(meds[0].frequency, 'daily');
  assert.equal(meds[1].frequency, 'twice');
});

test('ignora duplicatas e datas parecidas com intervalo', () => {
  const meds = parsePrescription('Losartana 50mg\nLosartana 50mg\nData: 16/06/2026');
  assert.equal(meds.length, 1);
  assert.equal(meds[0].frequency, 'daily');
});

test('lê quantidade de comprimidos', () => {
  assert.equal(parsePrescription('Losartana 50mg - 30 comprimidos')[0].stock, 30);
});

test('spreadTimes passa da meia-noite', () => {
  assert.deepEqual(spreadTimes('20:30', 2), ['20:30', '08:30']);
});

test('ignora o marcador de página do pdf-parse', () => {
  const [med] = parsePrescription('Dipirona 500mg\nse dor\n-- 1 of 1 --');
  assert.equal(med.notes, 'se dor');
});
