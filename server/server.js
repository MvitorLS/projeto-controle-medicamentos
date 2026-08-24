'use strict';

const express   = require('express');
const path      = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// Middlewares de Segurança OWASP
app.use((req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  res.setHeader('X-XSS-Protection', '1; mode=block');
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  res.removeHeader('X-Powered-By');
  next();
});

// Middlewares de Parsing com limites de payload
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));

// Serve os arquivos estáticos do front-end (HTML, CSS, JS, img)
app.use(express.static(path.join(__dirname, '..')));

// Rotas da API REST
app.use('/api/medicamentos', require('./routes/medicamentos'));
app.use('/api/medicoes',     require('./routes/medicoes'));
app.use('/api/scanner',      require('./routes/scanner'));

// Fallback para o index.html em qualquer rota não-API
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`\n🏥 MediControl rodando em http://localhost:${PORT}\n`);
});

