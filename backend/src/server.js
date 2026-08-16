require('dotenv').config();
const express = require('express');
const cors = require('cors');
const sequelize = require('./config/database');

const authRoutes = require('./routes/auth');
const medicamentosRoutes = require('./routes/medicamentos');
const registrosRoutes = require('./routes/registros');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/medicamentos', medicamentosRoutes);
app.use('/api/registros', registrosRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;

sequelize.sync().then(() => {
  app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));
}).catch((err) => {
  console.error('Erro ao iniciar o banco de dados:', err.message);
});
