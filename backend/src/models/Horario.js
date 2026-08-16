const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Medicamento = require('./Medicamento');

const Horario = sequelize.define('Horario', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  horario: { type: DataTypes.STRING, allowNull: false }, // formato "HH:MM"
}, {
  tableName: 'horarios',
  timestamps: true,
});

Horario.belongsTo(Medicamento, { foreignKey: 'medicamentoId', as: 'medicamento' });
Medicamento.hasMany(Horario, { foreignKey: 'medicamentoId', as: 'horarios' });

module.exports = Horario;
