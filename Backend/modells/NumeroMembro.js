const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const Membros = require('./Membros');


const NumeroMembro = sequelize.define('NumeroMembro', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },

  numero: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
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


module.exports = NumeroMembro;