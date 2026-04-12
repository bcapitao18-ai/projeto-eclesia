const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Descontos = require('./Descontos');

const PercentagemDesconto = sequelize.define('PercentagemDesconto', {

  percentagem: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
  }
});


// 🔗 RELACIONAMENTO
Descontos.hasMany(PercentagemDesconto);
PercentagemDesconto.belongsTo(Descontos);

module.exports = PercentagemDesconto;