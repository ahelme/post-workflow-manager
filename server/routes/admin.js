const express = require('express');
const router = express.Router();
const { User, Student, Project, BackupLog } = require('../models');
const { authenticateToken } = require('../middleware/auth');
const fs = require('fs').promises;
const path = require('path');

// Admin middleware - check if user is admin
const adminAuth = async (req, res, next) => {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Create SQL backup before reset
router.post('/backup', authenticateToken, adminAuth, async (req, res) => {
  try {
    // Create backup using existing backup service
    const backupService = require('../utils/backup');
    const result = await backupService.createFullBackup('sql', req.user.id.toString());
    
    res.json({
      success: true,
      message: 'Backup created successfully',
      filename: result.filename,
      backup: result
    });
  } catch (error) {
    console.error('Backup creation error:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// Reset database - delete all user data but keep admin user
router.post('/reset-database', authenticateToken, adminAuth, async (req, res) => {
  try {
    // Start transaction for safety
    const t = await require('../models').sequelize.transaction();

    try {
      // Delete all projects (soft delete - set isActive to false)
      await Project.update(
        { isActive: false },
        { 
          where: { isActive: true },
          transaction: t
        }
      );

      // Delete all students (soft delete - set isActive to false)  
      await Student.update(
        { isActive: false },
        { 
          where: { isActive: true },
          transaction: t
        }
      );

      // Keep admin users but delete non-admin users (soft delete)
      await User.update(
        { isActive: false },
        {
          where: { 
            isActive: true,
            role: { [require('sequelize').Op.ne]: 'admin' }
          },
          transaction: t
        }
      );

      // Log the reset operation
      await BackupLog.create({
        filename: 'database_reset.log',
        format: 'RESET',
        fileSize: 0,
        status: 'completed',
        createdBy: req.user.id,
        notes: 'Database reset operation - all user data removed'
      }, { transaction: t });

      // Commit transaction
      await t.commit();

      res.json({
        success: true,
        message: 'Database has been reset successfully. All projects and students have been removed.'
      });

    } catch (error) {
      // Rollback transaction on error
      await t.rollback();
      throw error;
    }

  } catch (error) {
    console.error('Database reset error:', error);
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

// Get system information
router.get('/system-info', authenticateToken, adminAuth, async (req, res) => {
  try {
    const projectCount = await Project.count({ where: { isActive: true } });
    const studentCount = await Student.count({ where: { isActive: true } });
    const userCount = await User.count({ where: { isActive: true } });
    
    res.json({
      environment: process.env.NODE_ENV || 'development',
      database: {
        projects: projectCount,
        students: studentCount,
        users: userCount
      },
      uptime: process.uptime(),
      version: process.env.npm_package_version || '1.0.0'
    });
  } catch (error) {
    console.error('System info error:', error);
    res.status(500).json({ error: 'Failed to get system information' });
  }
});

module.exports = router;