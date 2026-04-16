const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Membros = require('./Membros');


const Sede = require("./Sede");
const Filhal = require("./filhal");


const DataValidadeCartao = sequelize.define('ValidadeAno', {
  data_emissao: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    defaultValue: DataTypes.NOW
  },

  data_validade: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },

  validade_cartao_ano: {
    type: DataTypes.INTEGER,
    allowNull: true,
    defaultValue: 3
  }
});

Membros.hasMany(DataValidadeCartao);
DataValidadeCartao.belongsTo(Membros);


Sede.hasMany(DataValidadeCartao);
DataValidadeCartao.belongsTo(Sede);


Filhal.hasMany(DataValidadeCartao);
DataValidadeCartao.belongsTo(Filhal);



module.exports = DataValidadeCartao;