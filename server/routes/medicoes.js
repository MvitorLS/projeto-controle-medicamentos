'use strict';

const express = require('express');
const router  = express.Router();
const db      = require('../database');

const getAll = db.prepare('SELECT * FROM medicoes ORDER BY data DESC');
const getOne = db.prepare('SELECT * FROM medicoes WHERE id = ?');
const insert = db.prepare(`
  INSERT INTO medicoes (tipo, valor, status, data)
  VALUES (@tipo, @valor, @status, @data)
`);
const remove = db.prepare('DELETE FROM medicoes WHERE id = ?');

// GET /api/medicoes
router.get('/', (req, res) => {
  res.json(getAll.all());
});

// POST /api/medicoes
router.post('/', (req, res) => {
  const { tipo, valor, status = 'Normal', data } = req.body;
  if (!tipo || !valor) {
    return res.status(400).json({ error: 'Campos tipo e valor são obrigatórios.' });
  }

  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const defaultData = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
  const dataFinal = data ? data.replace('T', ' ') : defaultData;

  const info = insert.run({ tipo, valor, status, data: dataFinal });
  res.status(201).json(getOne.get(info.lastInsertRowid));
});

// DELETE /api/medicoes/:id
router.delete('/:id', (req, res) => {
  const info = remove.run(req.params.id);
  if (info.changes === 0) return res.status(404).json({ error: 'Medição não encontrada.' });
  res.json({ success: true });
});

module.exports = router;
