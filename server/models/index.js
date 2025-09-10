const sequelize = require('../config/database');
const User = require('./User');
const Student = require('./Student');
const Project = require('./Project');
const BackupLog = require('./BackupLog');

// Define associations
Student.hasMany(Project, {
  foreignKey: 'studentId',
  as: 'projects',
});

Project.belongsTo(Student, {
  foreignKey: 'studentId',
  as: 'student',
});

User.hasMany(Project, {
  foreignKey: 'createdBy',
  as: 'createdProjects',
});

Project.belongsTo(User, {
  foreignKey: 'createdBy',
  as: 'creator',
});

User.hasMany(Project, {
  foreignKey: 'updatedBy',
  as: 'updatedProjects',
});

Project.belongsTo(User, {
  foreignKey: 'updatedBy',
  as: 'updater',
});

// Export models and database connection
module.exports = {
  sequelize,
  User,
  Student,
  Project,
  BackupLog,
};