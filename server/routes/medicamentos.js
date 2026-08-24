'use strict';

const express = require('express');
const router  = express.Router();
const db      = require('../database');

const getAll = db.prepare('SELECT * FROM medicamentos ORDER BY horario ASC');
const getOne = db.prepare('SELECT * FROM medicamentos WHERE id = ?');
const insert = db.prepare(`
  INSERT INTO medicamentos (nome, dosagem, horario, frequencia, estoque, tomada_hoje)
  VALUES (@nome, @dosagem, @horario, @frequencia, @estoque, @tomada_hoje)
`);
const remove      = db.prepare('DELETE FROM medicamentos WHERE id = ?');
const toggleDose  = db.prepare('UPDATE medicamentos SET tomada_hoje = @tomada_hoje, estoque = @estoque WHERE id = ?');
const resetDoses  = db.prepare('UPDATE medicamentos SET tomada_hoje = 0');

// GET /api/medicamentos
router.get('/', (req, res) => {
  try {
    const rows = getAll.all();
    res.json(rows.map(r => ({ ...r, tomada_hoje: r.tomada_hoje === 1 })));
  } catch (err) {
    res.status(500).json({ error: 'Erro interno ao buscar medicamentos.' });
  }
});

// POST /api/medicamentos
router.post('/', (req, res) => {
  try {
    let { nome, dosagem, horario, frequencia = '1x ao dia', estoque = 30 } = req.body;
    if (!nome || !dosagem || !horario) {
      return res.status(400).json({ error: 'Campos nome, dosagem e horario são obrigatórios.' });
    }

    const estoqueNum = Math.max(0, parseInt(estoque, 10) || 0);

    const info = insert.run({
      nome: String(nome).trim(),
      dosagem: String(dosagem).trim(),
      horario: String(horario).trim(),
      frequencia: String(frequencia).trim(),
      estoque: estoqueNum,
      tomada_hoje: 0
    });

    res.status(201).json(getOne.get(info.lastInsertRowid));
  } catch (err) {
    res.status(500).json({ error: 'Erro interno ao cadastrar medicamento.' });
  }
});

// PUT /api/medicamentos/:id/dose — marca/desmarca dose do dia
router.put('/:id/dose', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'ID inválido.' });

    const med = getOne.get(id);
    if (!med) return res.status(404).json({ error: 'Medicamento não encontrado.' });

    const tomadaAtual = med.tomada_hoje === 1;
    const novaTomada  = !tomadaAtual;
    const novoEstoque = novaTomada && med.estoque > 0 ? med.estoque - 1 : med.estoque;

    toggleDose.run({ tomada_hoje: novaTomada ? 1 : 0, estoque: novoEstoque }, med.id);
    const updated = getOne.get(med.id);
    res.json({ ...updated, tomada_hoje: updated.tomada_hoje === 1 });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno ao atualizar dose.' });
  }
});

// DELETE /api/medicamentos/:id
router.delete('/:id', (req, res) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (!id) return res.status(400).json({ error: 'ID inválido.' });

    const info = remove.run(id);
    if (info.changes === 0) return res.status(404).json({ error: 'Medicamento não encontrado.' });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno ao remover medicamento.' });
  }
});

// POST /api/medicamentos/reset-doses — reseta doses do dia
router.post('/reset-doses', (req, res) => {
  try {
    resetDoses.run();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: 'Erro interno ao resetar doses.' });
  }
});

module.exports = router;
