const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');



const Sede = require("./Sede");
const Filhal = require("./filhal");



const Categoria = sequelize.define('Categoria', {
  nome: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  descricao: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  ativa: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  }
}, {
  tableName: 'categorias',
  timestamps: true
});





Sede.hasMany(Categoria);
Categoria.belongsTo(Sede);



Filhal.hasMany(Categoria);
Categoria.belongsTo(Filhal);

module.exports = Categoria;
 