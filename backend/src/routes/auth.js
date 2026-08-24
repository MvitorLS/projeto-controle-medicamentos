const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');
const { autenticar } = require('../middleware/auth');


const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || 'medicontrol_secure_prod_key_2026_jwt_auth';

// Rate Limiter em memória contra brute force (15 tentativas/min por IP)
const authAttempts = new Map();
function rateLimiterAuth(req, res, next) {
  const ip = req.ip || req.connection.remoteAddress || 'unknown';
  const now = Date.now();
  const windowMs = 60 * 1000;
  const maxAttempts = 15;

  const record = authAttempts.get(ip) || { count: 0, firstAttempt: now };
  if (now - record.firstAttempt > windowMs) {
    record.count = 1;
    record.firstAttempt = now;
  } else {
    record.count += 1;
  }
  authAttempts.set(ip, record);

  if (record.count > maxAttempts) {
    return res.status(429).json({ erro: 'Muitas tentativas. Aguarde 1 minuto e tente novamente.' });
  }
  next();
}

router.post('/registrar', rateLimiterAuth, async (req, res) => {
  try {
    let { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios' });
    }

    nome = String(nome).trim();
    email = String(email).trim().toLowerCase();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ erro: 'Formato de e-mail inválido' });
    }

    if (senha.length < 6) {
      return res.status(400).json({ erro: 'A senha deve conter no mínimo 6 caracteres' });
    }

    const existente = await Usuario.findOne({ where: { email } });
    if (existente) return res.status(409).json({ erro: 'E-mail já cadastrado' });

    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = await Usuario.create({ nome, email, senhaHash });

    const token = gerarToken(usuario);
    res.status(201).json({ token, usuario: dadosPublicos(usuario) });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno ao registrar usuário' });
  }
});

router.post('/login', rateLimiterAuth, async (req, res) => {
  try {
    let { email, senha } = req.body;
    if (!email || !senha) {
      return res.status(400).json({ erro: 'E-mail e senha são obrigatórios' });
    }

    email = String(email).trim().toLowerCase();

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const senhaCorreta = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaCorreta) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const token = gerarToken(usuario);
    res.json({ token, usuario: dadosPublicos(usuario) });
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno ao autenticar' });
  }
});

router.get('/me', autenticar, async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.usuarioId, {
      attributes: ['id', 'nome', 'email', 'createdAt']
    });
    if (!usuario) return res.status(404).json({ erro: 'Usuário não encontrado' });
    res.json(usuario);
  } catch (err) {
    res.status(500).json({ erro: 'Erro interno no servidor' });
  }
});

function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, nome: usuario.nome },
    JWT_SECRET,
    { expiresIn: '8h' }
  );
}

function dadosPublicos(usuario) {
  return { id: usuario.id, nome: usuario.nome, email: usuario.email };
}

module.exports = router;

