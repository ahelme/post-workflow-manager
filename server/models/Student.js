const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Student = sequelize.define('Student', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  studentId: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
    validate: {
      len: [1, 20],
    },
  },
  firstName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 50],
    },
  },
  lastName: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 50],
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      isEmail: true,
    },
  },
  phone: {
    type: DataTypes.STRING,
    validate: {
      len: [10, 20],
    },
  },
  year: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 4,
    },
  },
  program: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 100],
    },
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
  notes: {
    type: DataTypes.TEXT,
  },
});

module.exports = Student;