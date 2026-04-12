const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Subsidio = require('./Subsidios');

const PercentagemSubsidio = sequelize.define('PercentagemSubsidio', {

  percentagem: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false,
    defaultValue: 0.00,
  }
});


// 🔗 RELACIONAMENTO
Subsidio.hasMany(PercentagemSubsidio);
PercentagemSubsidio.belongsTo(Subsidio);

module.exports = PercentagemSubsidio;