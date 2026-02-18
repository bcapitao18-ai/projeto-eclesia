const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Despesas = require('./Despesas');


const Categoria = require('./Categorias');

const CategoriaDespesas = sequelize.define('CategoriaDespesas', {


});



Despesas.hasMany(CategoriaDespesas);
CategoriaDespesas.belongsTo(Despesas);



Categoria.hasMany(CategoriaDespesas);
CategoriaDespesas.belongsTo(Categoria);
 

module.exports = CategoriaDespesas;
