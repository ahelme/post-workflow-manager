const fs = require('fs').promises;
const path = require('path');
const { BackupLog, Project, Student, User } = require('../models');
const sequelize = require('../config/database');

class BackupService {
  constructor() {
    this.backupDir = process.env.BACKUP_PATH || './backups';
    this.ensureBackupDirectory();
  }

  async ensureBackupDirectory() {
    try {
      await fs.access(this.backupDir);
    } catch {
      await fs.mkdir(this.backupDir, { recursive: true });
    }
  }

  generateFilename(type, format) {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    return `backup_${type}_${timestamp}.${format}`;
  }

  async createFullBackup(format = 'json', scheduledBy = 'system') {
    const filename = this.generateFilename('full', format);
    const filePath = path.join(this.backupDir, filename);
    
    // Create backup log entry
    const backupLog = await BackupLog.create({
      filename,
      type: 'full',
      format,
      filePath,
      scheduledBy,
      status: 'pending',
    });

    try {
      let backupData;
      let fileContent;

      if (format === 'json') {
        backupData = await this.exportToJSON();
        fileContent = JSON.stringify(backupData, null, 2);
      } else if (format === 'csv') {
        backupData = await this.exportToCSV();
        fileContent = backupData;
      } else if (format === 'sql') {
        backupData = await this.exportToSQL();
        fileContent = backupData;
      } else {
        throw new Error(`Unsupported format: ${format}`);
      }

      await fs.writeFile(filePath, fileContent, 'utf8');
      
      const stats = await fs.stat(filePath);
      
      await backupLog.update({
        status: 'completed',
        size: stats.size,
      });

      return {
        success: true,
        filename,
        size: stats.size,
        path: filePath,
      };
    } catch (error) {
      await backupLog.update({
        status: 'failed',
        errorMessage: error.message,
      });
      
      throw error;
    }
  }

  async exportToJSON() {
    const [projects, students, users, backupLogs] = await Promise.all([
      Project.findAll({
        include: [
          {
            model: Student,
            as: 'student',
            attributes: ['id', 'studentId', 'firstName', 'lastName', 'email'],
          },
        ],
      }),
      Student.findAll(),
      User.findAll({
        attributes: { exclude: ['password'] },
      }),
      BackupLog.findAll(),
    ]);

    return {
      exportedAt: new Date().toISOString(),
      version: '1.0',
      data: {
        projects,
        students,
        users,
        backupLogs,
      },
    };
  }

  async exportToCSV() {
    const projects = await Project.findAll({
      include: [
        {
          model: Student,
          as: 'student',
          attributes: ['studentId', 'firstName', 'lastName', 'email'],
        },
      ],
    });

    const csvHeaders = [
      'ID',
      'Title',
      'Description',
      'Genre',
      'Duration',
      'Status',
      'Student ID',
      'Student Name',
      'Student Email',
      'Shoot Date',
      'Grade Date',
      'Mix Date',
      'Rushes Delivery Date',
      'Final Delivery Date',
      'Review Date',
      'Screening Date',
      'Supervising Producer',
      'Director',
      'Editor',
      'Sound Engineer',
      'Camera Equipment',
      'Editing Suite',
      'Notes',
      'Created At',
      'Updated At',
    ].join(',');

    const csvRows = projects.map(project => {
      const student = project.student || {};
      return [
        project.id,
        `"${project.title || ''}"`,
        `"${project.description || ''}"`,
        `"${project.genre || ''}"`,
        project.duration || '',
        project.status || '',
        `"${student.studentId || ''}"`,
        `"${student.firstName || ''} ${student.lastName || ''}"`,
        `"${student.email || ''}"`,
        project.shootDate || '',
        project.gradeDate || '',
        project.mixDate || '',
        project.rushesDeliveryDate || '',
        project.finalDeliveryDate || '',
        project.reviewDate || '',
        project.screeningDate || '',
        `"${project.supervisingProducer || ''}"`,
        `"${project.director || ''}"`,
        `"${project.editor || ''}"`,
        `"${project.soundEngineer || ''}"`,
        `"${project.cameraEquipment || ''}"`,
        `"${project.editingSuite || ''}"`,
        `"${project.notes || ''}"`,
        project.createdAt,
        project.updatedAt,
      ].join(',');
    });

    return [csvHeaders, ...csvRows].join('\n');
  }

  async exportToSQL() {
    // Get database schema and data as SQL dump
    const projects = await Project.findAll();
    const students = await Student.findAll();
    const users = await User.findAll();

    let sqlDump = '-- Film Production Database Backup\n';
    sqlDump += `-- Generated on: ${new Date().toISOString()}\n\n`;

    // Add CREATE TABLE statements (simplified)
    sqlDump += '-- Table structure for Students\n';
    sqlDump += 'DROP TABLE IF EXISTS students;\n';
    sqlDump += `CREATE TABLE students (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      student_id VARCHAR(20) NOT NULL UNIQUE,
      first_name VARCHAR(50) NOT NULL,
      last_name VARCHAR(50) NOT NULL,
      email VARCHAR(255) NOT NULL,
      phone VARCHAR(20),
      year INTEGER NOT NULL,
      program VARCHAR(100) NOT NULL,
      is_active BOOLEAN DEFAULT true,
      notes TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );\n\n`;

    // Add INSERT statements for students
    if (students.length > 0) {
      sqlDump += '-- Data for Students\n';
      for (const student of students) {
        sqlDump += `INSERT INTO students VALUES (${student.id}, '${student.studentId}', '${student.firstName}', '${student.lastName}', '${student.email}', '${student.phone || ''}', ${student.year}, '${student.program}', ${student.isActive}, '${student.notes || ''}', '${student.createdAt}', '${student.updatedAt}');\n`;
      }
      sqlDump += '\n';
    }

    return sqlDump;
  }

  async listBackups() {
    try {
      const files = await fs.readdir(this.backupDir);
      const backupFiles = files.filter(file => file.startsWith('backup_'));
      
      const backupDetails = await Promise.all(
        backupFiles.map(async (filename) => {
          const filePath = path.join(this.backupDir, filename);
          const stats = await fs.stat(filePath);
          
          const backupLog = await BackupLog.findOne({
            where: { filename },
            order: [['createdAt', 'DESC']],
          });
          
          return {
            filename,
            path: filePath,
            size: stats.size,
            created: stats.birthtime,
            modified: stats.mtime,
            status: backupLog?.status || 'unknown',
            type: backupLog?.type || 'unknown',
            format: backupLog?.format || path.extname(filename).substring(1),
          };
        })
      );
      
      return backupDetails.sort((a, b) => b.created - a.created);
    } catch (error) {
      console.error('Error listing backups:', error);
      return [];
    }
  }

  async deleteOldBackups(retentionDays = 30) {
    try {
      const backups = await this.listBackups();
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
      
      const oldBackups = backups.filter(backup => backup.created < cutoffDate);
      
      for (const backup of oldBackups) {
        await fs.unlink(backup.path);
        console.log(`Deleted old backup: ${backup.filename}`);
      }
      
      return oldBackups.length;
    } catch (error) {
      console.error('Error deleting old backups:', error);
      return 0;
    }
  }

  async restoreFromBackup(filename) {
    const filePath = path.join(this.backupDir, filename);
    
    try {
      const fileContent = await fs.readFile(filePath, 'utf8');
      const backupData = JSON.parse(fileContent);
      
      if (!backupData.data) {
        throw new Error('Invalid backup format');
      }
      
      // Start transaction for restoration
      const transaction = await sequelize.transaction();
      
      try {
        // Clear existing data
        await Promise.all([
          Project.destroy({ where: {}, transaction }),
          Student.destroy({ where: {}, transaction }),
          // Don't restore users for security reasons
        ]);
        
        // Restore students first (they are referenced by projects)
        if (backupData.data.students) {
          await Student.bulkCreate(backupData.data.students, { transaction });
        }
        
        // Restore projects
        if (backupData.data.projects) {
          await Project.bulkCreate(backupData.data.projects, { transaction });
        }
        
        await transaction.commit();
        
        return {
          success: true,
          message: 'Backup restored successfully',
          restoredAt: new Date().toISOString(),
        };
      } catch (error) {
        await transaction.rollback();
        throw error;
      }
    } catch (error) {
      console.error('Restoration error:', error);
      throw new Error(`Failed to restore backup: ${error.message}`);
    }
  }
}

module.exports = new BackupService();