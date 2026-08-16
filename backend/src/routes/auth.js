const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const Usuario = require('../models/Usuario');

const router = express.Router();

router.post('/registrar', async (req, res) => {
  try {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
      return res.status(400).json({ erro: 'Nome, e-mail e senha são obrigatórios' });
    }

    const existente = await Usuario.findOne({ where: { email } });
    if (existente) return res.status(409).json({ erro: 'E-mail já cadastrado' });

    const senhaHash = await bcrypt.hash(senha, 10);
    const usuario = await Usuario.create({ nome, email, senhaHash });

    const token = gerarToken(usuario);
    res.status(201).json({ token, usuario: dadosPublicos(usuario) });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao registrar usuário' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, senha } = req.body;
    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const senhaCorreta = await bcrypt.compare(senha, usuario.senhaHash);
    if (!senhaCorreta) return res.status(401).json({ erro: 'Credenciais inválidas' });

    const token = gerarToken(usuario);
    res.json({ token, usuario: dadosPublicos(usuario) });
  } catch (err) {
    res.status(500).json({ erro: 'Erro ao entrar' });
  }
});

function gerarToken(usuario) {
  return jwt.sign(
    { id: usuario.id, nome: usuario.nome },
    process.env.JWT_SECRET || 'segredo',
    { expiresIn: '8h' }
  );
}

function dadosPublicos(usuario) {
  return { id: usuario.id, nome: usuario.nome, email: usuario.email };
}

module.exports = router;
