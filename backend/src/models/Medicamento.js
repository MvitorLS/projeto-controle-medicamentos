const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Usuario = require('./Usuario');

const Medicamento = sequelize.define('Medicamento', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  nome: { type: DataTypes.STRING, allowNull: false },
  dosagem: { type: DataTypes.STRING, allowNull: false },
  instrucoes: { type: DataTypes.TEXT, allowNull: true },
  ativo: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: true },
}, {
  tableName: 'medicamentos',
  timestamps: true,
});

Medicamento.belongsTo(Usuario, { foreignKey: 'usuarioId', as: 'usuario' });
Usuario.hasMany(Medicamento, { foreignKey: 'usuarioId', as: 'medicamentos' });

module.exports = Medicamento;
