const cron = require('node-cron');
const backupService = require('./backup');

class BackupScheduler {
  constructor() {
    this.jobs = new Map();
    this.initializeSchedules();
  }

  initializeSchedules() {
    const backupSchedule = process.env.BACKUP_SCHEDULE || 'daily';
    
    // Stop any existing jobs
    this.stopAllJobs();
    
    switch (backupSchedule.toLowerCase()) {
      case 'daily':
        this.scheduleDailyBackup();
        break;
      case 'weekly':
        this.scheduleWeeklyBackup();
        break;
      case 'monthly':
        this.scheduleMonthlyBackup();
        break;
      default:
        console.log('No backup schedule configured');
    }
    
    // Always schedule cleanup job (runs weekly)
    this.scheduleCleanupJob();
  }

  scheduleDailyBackup() {
    // Run daily at 2:00 AM
    const job = cron.schedule('0 2 * * *', async () => {
      console.log('Starting scheduled daily backup...');
      try {
        await backupService.createFullBackup('json', 'system');
        console.log('Daily backup completed successfully');
      } catch (error) {
        console.error('Daily backup failed:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/New_York', // Adjust as needed
    });
    
    this.jobs.set('daily-backup', job);
    job.start();
    console.log('Daily backup scheduled for 2:00 AM');
  }

  scheduleWeeklyBackup() {
    // Run weekly on Sunday at 2:00 AM
    const job = cron.schedule('0 2 * * 0', async () => {
      console.log('Starting scheduled weekly backup...');
      try {
        await backupService.createFullBackup('json', 'system');
        console.log('Weekly backup completed successfully');
      } catch (error) {
        console.error('Weekly backup failed:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/New_York',
    });
    
    this.jobs.set('weekly-backup', job);
    job.start();
    console.log('Weekly backup scheduled for Sundays at 2:00 AM');
  }

  scheduleMonthlyBackup() {
    // Run monthly on the 1st at 2:00 AM
    const job = cron.schedule('0 2 1 * *', async () => {
      console.log('Starting scheduled monthly backup...');
      try {
        await backupService.createFullBackup('json', 'system');
        console.log('Monthly backup completed successfully');
      } catch (error) {
        console.error('Monthly backup failed:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/New_York',
    });
    
    this.jobs.set('monthly-backup', job);
    job.start();
    console.log('Monthly backup scheduled for the 1st of each month at 2:00 AM');
  }

  scheduleCleanupJob() {
    // Run cleanup weekly on Saturday at 3:00 AM
    const retentionDays = parseInt(process.env.BACKUP_RETENTION_DAYS) || 30;
    
    const job = cron.schedule('0 3 * * 6', async () => {
      console.log('Starting scheduled backup cleanup...');
      try {
        const deletedCount = await backupService.deleteOldBackups(retentionDays);
        console.log(`Backup cleanup completed. Deleted ${deletedCount} old backups.`);
      } catch (error) {
        console.error('Backup cleanup failed:', error);
      }
    }, {
      scheduled: false,
      timezone: 'America/New_York',
    });
    
    this.jobs.set('cleanup', job);
    job.start();
    console.log(`Backup cleanup scheduled for Saturdays at 3:00 AM (retention: ${retentionDays} days)`);
  }

  updateSchedule(newSchedule) {
    process.env.BACKUP_SCHEDULE = newSchedule;
    this.initializeSchedules();
    console.log(`Backup schedule updated to: ${newSchedule}`);
  }

  stopAllJobs() {
    for (const [name, job] of this.jobs) {
      job.destroy();
      console.log(`Stopped job: ${name}`);
    }
    this.jobs.clear();
  }

  getJobStatus() {
    const status = {};
    for (const [name, job] of this.jobs) {
      status[name] = {
        running: job.running,
        scheduled: job.scheduled,
      };
    }
    return status;
  }

  // Manual trigger for testing
  async triggerBackupNow(format = 'json') {
    console.log('Triggering manual backup...');
    try {
      const result = await backupService.createFullBackup(format, 'manual-trigger');
      console.log('Manual backup completed:', result);
      return result;
    } catch (error) {
      console.error('Manual backup failed:', error);
      throw error;
    }
  }
}

module.exports = new BackupScheduler();