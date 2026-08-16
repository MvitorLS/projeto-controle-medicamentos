const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Horario = require('./Horario');

const RegistroUso = sequelize.define('RegistroUso', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  data: { type: DataTypes.DATEONLY, allowNull: false }, // dia a que a dose se refere
  status: {
    type: DataTypes.ENUM('tomado', 'nao_tomado'),
    allowNull: false,
  },
  registradoEm: { type: DataTypes.DATE, allowNull: false, field: 'registrado_em' },
}, {
  tableName: 'registros_uso',
  timestamps: true,
  indexes: [{ unique: true, fields: ['horarioId', 'data'] }],
});

RegistroUso.belongsTo(Horario, { foreignKey: 'horarioId', as: 'horario' });
Horario.hasMany(RegistroUso, { foreignKey: 'horarioId', as: 'registros' });

module.exports = RegistroUso;
