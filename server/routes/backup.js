const express = require('express');
const { authenticateToken, requireRole } = require('../middleware/auth');
const backupService = require('../utils/backup');

const router = express.Router();

// Create manual backup
router.post('/create', authenticateToken, requireRole(['admin', 'producer']), async (req, res) => {
  try {
    const { format = 'json' } = req.body;
    
    if (!['json', 'csv', 'sql'].includes(format)) {
      return res.status(400).json({ error: 'Invalid format. Must be json, csv, or sql' });
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

// List available backups
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