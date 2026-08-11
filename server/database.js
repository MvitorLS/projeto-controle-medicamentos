'use strict';

const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = path.join(__dirname, '..', 'data', 'medicontrol.db');

const fs = require('fs');
fs.mkdirSync(path.dirname(DB_PATH), { recursive: true });

const db = new Database(DB_PATH);

db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

db.exec(`
  CREATE TABLE IF NOT EXISTS medicamentos (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nome       TEXT    NOT NULL,
    dosagem    TEXT    NOT NULL,
    horario    TEXT    NOT NULL,
    frequencia TEXT    NOT NULL DEFAULT '1x ao dia',
    estoque    INTEGER NOT NULL DEFAULT 30,
    tomada_hoje INTEGER NOT NULL DEFAULT 0,
    criado_em  TEXT    NOT NULL DEFAULT (datetime('now','localtime'))
  );

  CREATE TABLE IF NOT EXISTS medicoes (
    id        INTEGER PRIMARY KEY AUTOINCREMENT,
    tipo      TEXT NOT NULL,
    valor     TEXT NOT NULL,
    status    TEXT NOT NULL DEFAULT 'Normal',
    data      TEXT NOT NULL DEFAULT (datetime('now','localtime'))
  );
`);

// Dados iniciais de demonstração (só insere se as tabelas estiverem vazias)
const totalMeds = db.prepare('SELECT COUNT(*) as n FROM medicamentos').get().n;
if (totalMeds === 0) {
  const insertMed = db.prepare(`
    INSERT INTO medicamentos (nome, dosagem, horario, frequencia, estoque, tomada_hoje)
    VALUES (@nome, @dosagem, @horario, @frequencia, @estoque, @tomada_hoje)
  `);
  [
    { nome: 'Losartana Potássica', dosagem: '50mg', horario: '08:00', frequencia: '1x ao dia', estoque: 24, tomada_hoje: 1 },
    { nome: 'Metformina',          dosagem: '850mg', horario: '12:00', frequencia: '2x ao dia (12 em 12h)', estoque: 18, tomada_hoje: 0 },
    { nome: 'Sinvastatina',        dosagem: '20mg',  horario: '21:00', frequencia: '1x ao dia',             estoque: 30, tomada_hoje: 0 }
  ].forEach(m => insertMed.run(m));
}

const totalMeasures = db.prepare('SELECT COUNT(*) as n FROM medicoes').get().n;
if (totalMeasures === 0) {
  const insertMeasure = db.prepare(`
    INSERT INTO medicoes (tipo, valor, status, data)
    VALUES (@tipo, @valor, @status, @data)
  `);
  [
    { tipo: 'Pressão Arterial',    valor: '120/80 mmHg', status: 'Normal',        data: '2026-08-11 08:30' },
    { tipo: 'Glicemia',            valor: '95 mg/dL',    status: 'Normal',        data: '2026-08-11 07:45' },
    { tipo: 'Frequência Cardíaca', valor: '72 bpm',      status: 'Normal',        data: '2026-08-11 08:30' },
    { tipo: 'Peso Corporal',       valor: '78.5 kg',     status: 'Acompanhamento',data: '2026-08-10 09:00' }
  ].forEach(m => insertMeasure.run(m));
}

module.exports = db;
