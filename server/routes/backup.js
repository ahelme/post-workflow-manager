const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticateToken, requireRole } = require('../middleware/auth');
const backupService = require('../utils/backup');

const router = express.Router();

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    // Accept Excel files
    if (file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' || 
        file.mimetype === 'application/vnd.ms-excel' ||
        file.originalname.endsWith('.xlsx') ||
        file.originalname.endsWith('.xls')) {
      cb(null, true);
    } else {
      cb(new Error('Only Excel files are allowed'), false);
    }
  },
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  }
});

// Create manual backup
router.post('/create', authenticateToken, requireRole(['admin', 'producer']), async (req, res) => {
  try {
    const { format = 'json', type = 'manual' } = req.body;
    
    if (!['json', 'csv', 'sql', 'excel'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Must be json, csv, sql, or excel' });
    }
    
    const result = await backupService.createFullBackup(format, req.user.id.toString());
    
    res.json({
      message: 'Backup created successfully',
      backup: result,
    });
  } catch (error) {
    console.error('Manual backup error:', error);
    res.status(500).json({ error: 'Failed to create backup' });
  }
});

// Import from Excel file
router.post('/import', authenticateToken, requireRole(['admin', 'producer']), upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const result = await backupService.importFromExcel(req.file.buffer);
    
    res.json({
      message: 'Import completed successfully',
      result,
    });
  } catch (error) {
    console.error('Import error:', error);
    res.status(500).json({ error: error.message || 'Failed to import data' });
  }
});

// Download sample Excel template
router.get('/sample-template', authenticateToken, requireRole(['admin', 'producer']), (req, res) => {
  try {
    const samplePath = path.join(__dirname, '../../Import_Sample.xlsx');
    res.download(samplePath, 'Import_Sample.xlsx', (error) => {
      if (error) {
        console.error('Sample download error:', error);
        res.status(404).json({ error: 'Sample template not found' });
      }
    });
  } catch (error) {
    console.error('Sample template error:', error);
    res.status(500).json({ error: 'Failed to provide sample template' });
  }
});

// Get backup history from database
router.get('/history', authenticateToken, async (req, res) => {
  try {
    const { BackupLog } = require('../models');
    
    const backups = await BackupLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 50, // Limit to last 50 backups
    });
    
    res.json(backups);
  } catch (error) {
    console.error('Backup history error:', error);
    res.status(500).json({ error: 'Failed to get backup history' });
  }
});

// List available backups (filesystem)
router.get('/list', authenticateToken, requireRole(['admin', 'producer']), async (req, res) => {
  try {
    const backups = await backupService.listBackups();
    
    res.json({
      backups,
      count: backups.length,
    });
  } catch (error) {
    console.error('List backups error:', error);
    res.status(500).json({ error: 'Failed to list backups' });
  }
});

// Download backup file
router.get('/download/:filename', authenticateToken, requireRole(['admin', 'producer']), async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    if (!filename.startsWith('backup_')) {
      return res.status(400).json({ error: 'Invalid backup filename' });
    }
    
    const backups = await backupService.listBackups();
    const backup = backups.find(b => b.filename === filename);
    
    if (!backup) {
      return res.status(404).json({ error: 'Backup file not found' });
    }
    
    res.download(backup.path, filename, (error) => {
      if (error) {
        console.error('Download error:', error);
        res.status(500).json({ error: 'Failed to download backup' });
      }
    });
  } catch (error) {
    console.error('Download backup error:', error);
    res.status(500).json({ error: 'Failed to download backup' });
  }
});

// Restore from backup
router.post('/restore', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { filename } = req.body;
    
    if (!filename) {
      return res.status(400).json({ error: 'Filename is required' });
    }
    
    // Validate filename
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    if (!filename.startsWith('backup_')) {
      return res.status(400).json({ error: 'Invalid backup filename' });
    }
    
    const result = await backupService.restoreFromBackup(filename);
    
    res.json({
      message: 'Database restored successfully',
      restoration: result,
    });
  } catch (error) {
    console.error('Restore backup error:', error);
    res.status(500).json({ error: error.message || 'Failed to restore backup' });
  }
});

// Delete specific backup
router.delete('/:filename', authenticateToken, requireRole(['admin', 'producer']), async (req, res) => {
  try {
    const { filename } = req.params;
    
    // Validate filename to prevent directory traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      return res.status(400).json({ error: 'Invalid filename' });
    }
    
    if (!filename.startsWith('backup_')) {
      return res.status(400).json({ error: 'Invalid backup filename' });
    }
    
    const result = await backupService.deleteBackup(filename);
    
    res.json({
      message: 'Backup deleted successfully',
      filename,
    });
  } catch (error) {
    console.error('Delete backup error:', error);
    res.status(500).json({ error: 'Failed to delete backup' });
  }
});

// Delete old backups
router.delete('/cleanup', authenticateToken, requireRole(['admin']), async (req, res) => {
  try {
    const { retentionDays = 30 } = req.body;
    
    const deletedCount = await backupService.deleteOldBackups(retentionDays);
    
    res.json({
      message: `Cleanup completed. Deleted ${deletedCount} old backups.`,
      deletedCount,
    });
  } catch (error) {
    console.error('Backup cleanup error:', error);
    res.status(500).json({ error: 'Failed to cleanup old backups' });
  }
});

module.exports = router;