const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BackupLog = sequelize.define('BackupLog', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  filename: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  type: {
    type: DataTypes.ENUM('full', 'incremental', 'manual'),
    allowNull: false,
  },
  format: {
    type: DataTypes.ENUM('json', 'csv', 'sql'),
    allowNull: false,
  },
  size: {
    type: DataTypes.BIGINT, // File size in bytes
  },
  status: {
    type: DataTypes.ENUM('pending', 'completed', 'failed'),
    defaultValue: 'pending',
  },
  errorMessage: {
    type: DataTypes.TEXT,
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  scheduledBy: {
    type: DataTypes.STRING, // 'system' for automated, or user ID for manual
    defaultValue: 'system',
  },
});

module.exports = BackupLog;