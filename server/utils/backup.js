const fs = require('fs').promises;
const path = require('path');
const XLSX = require('xlsx');
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
    // Fix Excel format extension
    const extension = format === 'excel' ? 'xlsx' : format;
    return `backup_${type}_${timestamp}.${extension}`;
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
      } else if (format === 'excel' || format === 'xlsx') {
        await this.exportToExcel(filePath);
        // For Excel, we write directly to file, so no fileContent needed
        fileContent = null;
      } else if (format === 'sql') {
        backupData = await this.exportToSQL();
        fileContent = backupData;
      } else {
        throw new Error(`Unsupported format: ${format}`);
      }

      // Write backup file (skip for Excel as it's already written)
      if (fileContent !== null) {
        await fs.writeFile(filePath, fileContent, 'utf8');
      }
      
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

  async exportToExcel(filePath) {
    // Get all data
    const projects = await Project.findAll({
      include: [{ model: Student, as: 'student' }],
      where: { isActive: true },
    });
    const students = await Student.findAll({
      where: { isActive: true },
    });

    // Create new workbook with proper settings
    const wb = XLSX.utils.book_new();

    // Helper function to safely format dates
    const formatDate = (date) => {
      if (!date) return '';
      try {
        const d = new Date(date);
        return isNaN(d.getTime()) ? '' : d.toISOString().split('T')[0]; // YYYY-MM-DD format
      } catch {
        return '';
      }
    };

    // Helper function to clean text values
    const cleanText = (text) => {
      if (!text) return '';
      return String(text).replace(/[\x00-\x1F\x7F]/g, ''); // Remove control characters
    };

    // Projects worksheet with safer data formatting
    const projectsData = projects.map(project => ({
      'Project ID': project.id || '',
      'Title': cleanText(project.title) || '',
      'Description': cleanText(project.description) || '',
      'Genre': cleanText(project.genre) || '',
      'Duration (min)': project.duration || '',
      'Status': cleanText(project.status) || '',
      'Student ID': cleanText(project.student?.studentId) || '',
      'Student Name': project.student ? cleanText(`${project.student.firstName} ${project.student.lastName}`) : '',
      'Supervising Producer': cleanText(project.supervisingProducer) || '',
      'Director': cleanText(project.director) || '',
      'Editor': cleanText(project.editor) || '',
      'Sound Engineer': cleanText(project.soundEngineer) || '',
      'Camera Equipment': cleanText(project.cameraEquipment) || '',
      'Editing Suite': cleanText(project.editingSuite) || '',
      'Shoot Date': formatDate(project.shootDate),
      'Grade Date': formatDate(project.gradeDate),
      'Mix Date': formatDate(project.mixDate),
      'Rushes Delivery Date': formatDate(project.rushesDeliveryDate),
      'Final Delivery Date': formatDate(project.finalDeliveryDate),
      'Review Date': formatDate(project.reviewDate),
      'Screening Date': formatDate(project.screeningDate),
      'Notes': cleanText(project.notes) || '',
      'Created': formatDate(project.createdAt),
      'Updated': formatDate(project.updatedAt),
    }));
    
    // Create worksheet with proper options
    const projectsWs = XLSX.utils.json_to_sheet(projectsData, {
      cellStyles: true,
      cellText: false,
      cellHTML: false
    });
    
    // Set column widths
    const projectsCols = [
      { wch: 10 }, // Project ID
      { wch: 25 }, // Title
      { wch: 30 }, // Description
      { wch: 15 }, // Genre
      { wch: 12 }, // Duration
      { wch: 15 }, // Status
      { wch: 12 }, // Student ID
      { wch: 20 }, // Student Name
      { wch: 20 }, // Producer
      { wch: 15 }, // Director
      { wch: 15 }, // Editor
      { wch: 15 }, // Sound Engineer
      { wch: 20 }, // Camera Equipment
      { wch: 15 }, // Editing Suite
      { wch: 12 }, // Shoot Date
      { wch: 12 }, // Grade Date
      { wch: 12 }, // Mix Date
      { wch: 15 }, // Rushes Delivery
      { wch: 15 }, // Final Delivery
      { wch: 12 }, // Review Date
      { wch: 15 }, // Screening Date
      { wch: 30 }, // Notes
      { wch: 12 }, // Created
      { wch: 12 }, // Updated
    ];
    projectsWs['!cols'] = projectsCols;
    
    XLSX.utils.book_append_sheet(wb, projectsWs, 'Projects');

    // Students worksheet with safer data formatting
    const studentsData = students.map(student => ({
      'Student ID': cleanText(student.studentId) || '',
      'First Name': cleanText(student.firstName) || '',
      'Last Name': cleanText(student.lastName) || '',
      'Email': cleanText(student.email) || '',
      'Phone': cleanText(student.phone) || '',
      'Year': student.year || '',
      'Program': cleanText(student.program) || '',
      'Status': student.isActive ? 'Active' : 'Inactive',
      'Notes': cleanText(student.notes) || '',
      'Enrolled': formatDate(student.createdAt),
      'Last Updated': formatDate(student.updatedAt),
    }));
    
    const studentsWs = XLSX.utils.json_to_sheet(studentsData, {
      cellStyles: true,
      cellText: false,
      cellHTML: false
    });
    
    // Set column widths for students
    const studentsCols = [
      { wch: 12 }, // Student ID
      { wch: 15 }, // First Name
      { wch: 15 }, // Last Name
      { wch: 25 }, // Email
      { wch: 15 }, // Phone
      { wch: 8 },  // Year
      { wch: 20 }, // Program
      { wch: 10 }, // Status
      { wch: 30 }, // Notes
      { wch: 12 }, // Enrolled
      { wch: 12 }, // Updated
    ];
    studentsWs['!cols'] = studentsCols;
    
    XLSX.utils.book_append_sheet(wb, studentsWs, 'Students');

    // Write file with specific options for Excel compatibility
    XLSX.writeFile(wb, filePath, {
      bookType: 'xlsx',
      type: 'file',
      compression: false
    });
  }

  async importFromExcel(buffer) {
    const wb = XLSX.read(buffer, { type: 'buffer' });
    
    // Get worksheets
    const projectsSheetName = wb.SheetNames.find(name => 
      name.toLowerCase().includes('project') || name.toLowerCase() === 'projects'
    );
    const studentsSheetName = wb.SheetNames.find(name => 
      name.toLowerCase().includes('student') || name.toLowerCase() === 'students'
    );
    
    if (!projectsSheetName && !studentsSheetName) {
      throw new Error('Excel file must contain at least one "Projects" or "Students" worksheet');
    }
    
    const results = {
      projectsImported: 0,
      studentsImported: 0,
      errors: [],
    };
    
    // Start transaction
    const transaction = await sequelize.transaction();
    
    try {
      // Import students first (projects reference students)
      if (studentsSheetName) {
        const studentsSheet = wb.Sheets[studentsSheetName];
        const studentsData = XLSX.utils.sheet_to_json(studentsSheet);
        
        for (const row of studentsData) {
          try {
            // Skip empty rows
            if (!row['Student ID'] && !row['First Name'] && !row['Last Name']) {
              continue;
            }
            
            // Validate required fields
            if (!row['Student ID'] || !row['First Name'] || !row['Last Name'] || !row['Email']) {
              results.errors.push(`Student missing required fields: ${JSON.stringify(row)}`);
              continue;
            }
            
            // Check if student already exists
            const existingStudent = await Student.findOne({
              where: { studentId: row['Student ID'] },
              transaction
            });
            
            if (existingStudent) {
              // Update existing student
              await existingStudent.update({
                firstName: row['First Name'],
                lastName: row['Last Name'],
                email: row['Email'],
                phone: row['Phone'] || null,
                year: parseInt(row['Year']) || 1,
                program: row['Program'] || 'Film Production',
                isActive: (row['Status'] || 'Active').toLowerCase() === 'active',
                notes: row['Notes'] || null,
              }, { transaction });
            } else {
              // Create new student
              await Student.create({
                studentId: row['Student ID'],
                firstName: row['First Name'],
                lastName: row['Last Name'],
                email: row['Email'],
                phone: row['Phone'] || null,
                year: parseInt(row['Year']) || 1,
                program: row['Program'] || 'Film Production',
                isActive: (row['Status'] || 'Active').toLowerCase() === 'active',
                notes: row['Notes'] || null,
              }, { transaction });
            }
            
            results.studentsImported++;
          } catch (error) {
            results.errors.push(`Student import error: ${error.message}`);
          }
        }
      }
      
      // Import projects
      if (projectsSheetName) {
        const projectsSheet = wb.Sheets[projectsSheetName];
        const projectsData = XLSX.utils.sheet_to_json(projectsSheet);
        
        for (const row of projectsData) {
          try {
            // Skip empty rows
            if (!row['Title'] && !row['Student ID']) {
              continue;
            }
            
            // Validate required fields
            if (!row['Title']) {
              results.errors.push(`Project missing title: ${JSON.stringify(row)}`);
              continue;
            }
            
            // Find student if Student ID is provided
            let studentId = null;
            if (row['Student ID']) {
              const student = await Student.findOne({
                where: { studentId: row['Student ID'] },
                transaction
              });
              if (student) {
                studentId = student.id;
              } else {
                results.errors.push(`Student not found for project "${row['Title']}": ${row['Student ID']}`);
                continue;
              }
            }
            
            // Parse dates
            const parseDate = (dateStr) => {
              if (!dateStr) return null;
              const date = new Date(dateStr);
              return isNaN(date.getTime()) ? null : date;
            };
            
            // Create project
            await Project.create({
              title: row['Title'],
              description: row['Description'] || null,
              genre: row['Genre'] || null,
              duration: parseInt(row['Duration (min)']) || null,
              status: row['Status']?.toLowerCase().replace(/\s+/g, '-') || 'pre-production',
              studentId: studentId,
              supervisingProducer: row['Supervising Producer'] || null,
              director: row['Director'] || null,
              editor: row['Editor'] || null,
              soundEngineer: row['Sound Engineer'] || null,
              cameraEquipment: row['Camera Equipment'] || null,
              editingSuite: row['Editing Suite'] || null,
              shootDate: parseDate(row['Shoot Date']),
              gradeDate: parseDate(row['Grade Date']),
              mixDate: parseDate(row['Mix Date']),
              rushesDeliveryDate: parseDate(row['Rushes Delivery Date']),
              finalDeliveryDate: parseDate(row['Final Delivery Date']),
              reviewDate: parseDate(row['Review Date']),
              screeningDate: parseDate(row['Screening Date']),
              notes: row['Notes'] || null,
              isActive: true,
              createdBy: 1, // Will be updated with actual user ID in route
              updatedBy: 1,
            }, { transaction });
            
            results.projectsImported++;
          } catch (error) {
            results.errors.push(`Project import error: ${error.message}`);
          }
        }
      }
      
      await transaction.commit();
      
      return results;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
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

  async deleteBackup(filename) {
    try {
      const filePath = path.join(this.backupDir, filename);
      
      // Check if file exists
      try {
        await fs.access(filePath);
      } catch {
        throw new Error('Backup file not found');
      }
      
      // Delete the file
      await fs.unlink(filePath);
      
      // Update backup log status if exists
      try {
        const backupLog = await BackupLog.findOne({ where: { filename } });
        if (backupLog) {
          await backupLog.update({ status: 'deleted' });
        }
      } catch (error) {
        console.error('Error updating backup log:', error);
        // Don't throw here, file deletion was successful
      }
      
      console.log(`Deleted backup: ${filename}`);
      return { success: true, filename };
    } catch (error) {
      console.error('Error deleting backup:', error);
      throw error;
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