const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Project = sequelize.define('Project', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: [1, 200],
    },
  },
  description: {
    type: DataTypes.TEXT,
  },
  genre: {
    type: DataTypes.STRING,
    validate: {
      len: [1, 50],
    },
  },
  duration: {
    type: DataTypes.INTEGER, // Duration in minutes
    validate: {
      min: 1,
    },
  },
  status: {
    type: DataTypes.ENUM(
      'pre-production',
      'shooting',
      'post-production',
      'grading',
      'audio-mix',
      'complete'
    ),
    defaultValue: 'pre-production',
  },
  shootDate: {
    type: DataTypes.DATEONLY,
  },
  gradeDate: {
    type: DataTypes.DATEONLY,
  },
  mixDate: {
    type: DataTypes.DATEONLY,
  },
  rushesDeliveryDate: {
    type: DataTypes.DATEONLY,
  },
  finalDeliveryDate: {
    type: DataTypes.DATEONLY,
  },
  reviewDate: {
    type: DataTypes.DATEONLY,
  },
  screeningDate: {
    type: DataTypes.DATEONLY,
  },
  supervisingProducer: {
    type: DataTypes.STRING,
    validate: {
      len: [1, 100],
    },
  },
  director: {
    type: DataTypes.STRING,
    validate: {
      len: [1, 100],
    },
  },
  editor: {
    type: DataTypes.STRING,
    validate: {
      len: [1, 100],
    },
  },
  soundEngineer: {
    type: DataTypes.STRING,
    validate: {
      len: [1, 100],
    },
  },
  cameraEquipment: {
    type: DataTypes.STRING,
    validate: {
      len: [1, 200],
    },
  },
  editingSuite: {
    type: DataTypes.STRING,
    validate: {
      len: [1, 100],
    },
  },
  notes: {
    type: DataTypes.TEXT,
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
  },
});

module.exports = Project;