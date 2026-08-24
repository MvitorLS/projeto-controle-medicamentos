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
  try {
    res.json(getAll.all());
  } catch (err) {
    res.status(500).json({ error: 'Erro interno ao buscar medições.' });
  }
});

// POST /api/medicoes
router.post('/', (req, res) => {
  try {
    let { tipo, valor, status = 'Normal', data } = req.body;
    if (!tipo || !valor) {
      return res.status(400).json({ error: 'Campos tipo e valor são obrigatórios.' });
    }

    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    const defaultData = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    const dataFinal = data ? String(data).replace('T', ' ').trim() : defaultData;

    const info = insert.run({
      tipo: String(tipo).trim(),
      valor: String(valor).trim(),
      status: String(status).trim(),
      data: dataFinal
    });

    res.status(201).json(getOne.get(info.lastInsertRowid));
  } catch (err) {
    res.status(500).json({ error: 'Erro interno ao registrar medição.' });
  }
});

// DELETE /api/medicoes/:id
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'ID inválido.' });

    const info = remove.run(id);
    if (info.changes === 0) return res.status(404).json({ error: 'Medição não encontrada.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno ao remover medição.' });
  }
});

module.exports = router;
