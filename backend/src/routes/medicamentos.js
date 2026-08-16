const express = require('express');
const Medicamento = require('../models/Medicamento');
const Horario = require('../models/Horario');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

// GET /api/medicamentos — lista os medicamentos do usuário logado
router.get('/', autenticar, async (req, res) => {
  const medicamentos = await Medicamento.findAll({
    where: { usuarioId: req.usuario.id },
    include: [{ model: Horario, as: 'horarios' }],
    order: [['createdAt', 'DESC']],
  });
  res.json(medicamentos);
});

// POST /api/medicamentos — cria medicamento com horários (array de "HH:MM")
router.post('/', autenticar, async (req, res) => {
  try {
    const { nome, dosagem, instrucoes, horarios } = req.body;
    if (!nome || !dosagem || !Array.isArray(horarios) || horarios.length === 0) {
      return res.status(400).json({ erro: 'Nome, dosagem e ao menos um horário são obrigatórios' });
    }

    const medicamento = await Medicamento.create({
      usuarioId: req.usuario.id,
      nome,
      dosagem,
      instrucoes: instrucoes || null,
    });

    await Horario.bulkCreate(
      horarios.map((h) => ({ medicamentoId: medicamento.id, horario: h }))
    );

    const completo = await Medicamento.findByPk(medicamento.id, {
      include: [{ model: Horario, as: 'horarios' }],
    });
    res.status(201).json(completo);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao criar medicamento' });
  }
});

// PATCH /api/medicamentos/:id/inativar — pausa/encerra tratamento
router.patch('/:id/inativar', autenticar, async (req, res) => {
  const medicamento = await Medicamento.findOne({
    where: { id: req.params.id, usuarioId: req.usuario.id },
  });
  if (!medicamento) return res.status(404).json({ erro: 'Medicamento não encontrado' });
  medicamento.ativo = false;
  await medicamento.save();
  res.json(medicamento);
});

// DELETE /api/medicamentos/:id
router.delete('/:id', autenticar, async (req, res) => {
  const medicamento = await Medicamento.findOne({
    where: { id: req.params.id, usuarioId: req.usuario.id },
  });
  if (!medicamento) return res.status(404).json({ erro: 'Medicamento não encontrado' });
  await medicamento.destroy();
  res.status(204).send();
});

module.exports = router;
