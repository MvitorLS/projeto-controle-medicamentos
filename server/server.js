'use strict';

const express   = require('express');
const path      = require('path');

const app  = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve os arquivos estáticos do front-end (HTML, CSS, JS, img)
app.use(express.static(path.join(__dirname, '..')));

// Rotas da API REST
app.use('/api/medicamentos', require('./routes/medicamentos'));
app.use('/api/medicoes',     require('./routes/medicoes'));

// Fallback para o index.html em qualquer rota não-API
app.get('*', (req, res) => {
  if (!req.path.startsWith('/api')) {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
  }
});

app.listen(PORT, () => {
  console.log(`\n🏥 MediControl rodando em http://localhost:${PORT}\n`);
});
