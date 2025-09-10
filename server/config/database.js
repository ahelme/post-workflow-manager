const { Sequelize } = require('sequelize');
const path = require('path');

const dbPath = process.env.DB_PATH || './database/film_production.sqlite';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: process.env.NODE_ENV === 'development' ? console.log : false,
  define: {
    timestamps: true,
    underscored: true,
  },
});

module.exports = sequelize;