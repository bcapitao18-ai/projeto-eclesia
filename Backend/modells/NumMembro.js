const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Membros = require('./Membros');


const Sede = require("./Sede");
const Filhal = require("./filhal");

const NumeroMembro = sequelize.define('NumberMembro', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  numero: {
    type: DataTypes.STRING,
    allowNull: false,
    // vai guardar "0000", "0001", etc
  },

  usado: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}
);

Membros.hasMany(NumeroMembro);
NumeroMembro.belongsTo(Membros);




Sede.hasMany(NumeroMembro);
NumeroMembro.belongsTo(Sede);



Filhal.hasMany(NumeroMembro);
NumeroMembro.belongsTo(Filhal);


module.exports = NumeroMembro;