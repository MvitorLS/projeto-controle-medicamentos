const express = require('express');
const { Op } = require('sequelize');
const Medicamento = require('../models/Medicamento');
const Horario = require('../models/Horario');
const RegistroUso = require('../models/RegistroUso');
const { autenticar } = require('../middleware/auth');

const router = express.Router();

function hojeISO() {
  return new Date().toISOString().split('T')[0];
}

// GET /api/registros/hoje — doses previstas pra hoje, com status (pendente/tomado/nao_tomado)
router.get('/hoje', autenticar, async (req, res) => {
  const data = req.query.data || hojeISO();

  const medicamentos = await Medicamento.findAll({
    where: { usuarioId: req.usuario.id, ativo: true },
    include: [{
      model: Horario,
      as: 'horarios',
      include: [{ model: RegistroUso, as: 'registros', where: { data }, required: false }],
    }],
  });

  const doses = [];
  for (const med of medicamentos) {
    for (const h of med.horarios) {
      const registro = h.registros && h.registros[0];
      doses.push({
        horarioId: h.id,
        medicamentoId: med.id,
        medicamento: med.nome,
        dosagem: med.dosagem,
        horario: h.horario,
        status: registro ? registro.status : 'pendente',
      });
    }
  }

  doses.sort((a, b) => a.horario.localeCompare(b.horario));
  res.json(doses);
});

// POST /api/registros — marca uma dose como tomada ou não tomada
router.post('/', autenticar, async (req, res) => {
  try {
    const { horarioId, data, status } = req.body;
    if (!horarioId || !data || !['tomado', 'nao_tomado'].includes(status)) {
      return res.status(400).json({ erro: 'horarioId, data e status válido são obrigatórios' });
    }

    const horario = await Horario.findByPk(horarioId, {
      include: [{ model: Medicamento, as: 'medicamento' }],
    });
    if (!horario || horario.medicamento.usuarioId !== req.usuario.id) {
      return res.status(404).json({ erro: 'Horário não encontrado' });
    }

    const [registro] = await RegistroUso.upsert(
      { horarioId, data, status, registradoEm: new Date() },
      { returning: true }
    );

    res.status(201).json(registro);
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao registrar dose' });
  }
});

// GET /api/registros/adesao?dias=30 — percentual de doses tomadas no período
router.get('/adesao', autenticar, async (req, res) => {
  const dias = Number(req.query.dias) || 30;
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);
  const desdeISO = desde.toISOString().split('T')[0];

  const horarios = await Horario.findAll({
    include: [{ model: Medicamento, as: 'medicamento', where: { usuarioId: req.usuario.id } }],
  });
  const horarioIds = horarios.map((h) => h.id);

  const registros = await RegistroUso.findAll({
    where: { horarioId: { [Op.in]: horarioIds }, data: { [Op.gte]: desdeISO } },
  });

  const tomados = registros.filter((r) => r.status === 'tomado').length;
  const total = registros.length;
  const percentual = total > 0 ? Math.round((tomados / total) * 100) : null;

  res.json({ dias, total, tomados, naoTomados: total - tomados, percentual });
});

// GET /api/registros/historico?dias=14 — lista de registros pra tabela de histórico
router.get('/historico', autenticar, async (req, res) => {
  const dias = Number(req.query.dias) || 14;
  const desde = new Date();
  desde.setDate(desde.getDate() - dias);
  const desdeISO = desde.toISOString().split('T')[0];

  const horarios = await Horario.findAll({
    include: [{ model: Medicamento, as: 'medicamento', where: { usuarioId: req.usuario.id } }],
  });
  const horarioIds = horarios.map((h) => h.id);
  const mapaHorarios = Object.fromEntries(horarios.map((h) => [h.id, h]));

  const registros = await RegistroUso.findAll({
    where: { horarioId: { [Op.in]: horarioIds }, data: { [Op.gte]: desdeISO } },
    order: [['data', 'DESC'], ['registradoEm', 'DESC']],
  });

  const resultado = registros.map((r) => ({
    id: r.id,
    data: r.data,
    status: r.status,
    horario: mapaHorarios[r.horarioId]?.horario,
    medicamento: mapaHorarios[r.horarioId]?.medicamento?.nome,
  }));

  res.json(resultado);
});

module.exports = router;
