import cleanupService from './cleanupService.js';
import logger from '../utils/logger.js';

export class SchedulerService {
  constructor() {
    this.intervals = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize and start all scheduled tasks
   */
  async initialize() {
    if (this.isInitialized) {
      logger.warn('Scheduler already initialized');
      return;
    }

    logger.info('Initializing scheduler service...');

    // Check if cleanup is enabled
    const cleanupEnabled = process.env.INVOICE_CLEANUP_ENABLED === 'true';
    const cleanupDays = parseInt(process.env.INVOICE_CLEANUP_DAYS || '32');
    const cleanupInterval = parseInt(process.env.INVOICE_CLEANUP_INTERVAL_HOURS || '24');

    if (cleanupEnabled) {
      logger.info(`Invoice cleanup enabled: deleting invoices older than ${cleanupDays} days, running every ${cleanupInterval} hours`);
      this.scheduleInvoiceCleanup(cleanupDays, cleanupInterval);
    } else {
      logger.info('Invoice cleanup disabled (set INVOICE_CLEANUP_ENABLED=true to enable)');
    }

    this.isInitialized = true;
    logger.info('Scheduler service initialized');
  }

  /**
   * Schedule automatic invoice cleanup
   * @param {number} daysOld - Delete invoices older than this many days
   * @param {number} intervalHours - Run cleanup every X hours
   */
  scheduleInvoiceCleanup(daysOld = 32, intervalHours = 24) {
    // Clear existing interval if any
    if (this.intervals.has('invoiceCleanup')) {
      clearInterval(this.intervals.get('invoiceCleanup'));
    }

    // Run immediately on startup (optional - can be removed if not desired)
    // Uncomment the next line to run cleanup on server start
    // this.runInvoiceCleanup(daysOld);

    // Schedule periodic cleanup
    const intervalMs = intervalHours * 60 * 60 * 1000; // Convert hours to milliseconds
    const intervalId = setInterval(() => {
      this.runInvoiceCleanup(daysOld);
    }, intervalMs);

    this.intervals.set('invoiceCleanup', intervalId);

    logger.info(`Invoice cleanup scheduled: running every ${intervalHours} hours`);
  }

  /**
   * Run invoice cleanup task
   * @param {number} daysOld - Delete invoices older than this many days
   */
  async runInvoiceCleanup(daysOld = 32) {
    try {
      logger.info(`Running scheduled invoice cleanup (${daysOld} days)...`);
      const result = await cleanupService.deleteOldInvoices(daysOld, false);

      if (result.success) {
        logger.info(`Scheduled cleanup completed: ${result.deletedCount} invoices deleted`);
      } else {
        logger.error(`Scheduled cleanup failed: ${result.error}`);
      }

      return result;
    } catch (error) {
      logger.error('Error running scheduled invoice cleanup:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Stop all scheduled tasks
   */
  stop() {
    logger.info('Stopping all scheduled tasks...');

    this.intervals.forEach((intervalId, taskName) => {
      clearInterval(intervalId);
      logger.info(`Stopped task: ${taskName}`);
    });

    this.intervals.clear();
    this.isInitialized = false;

    logger.info('Scheduler service stopped');
  }

  /**
   * Get status of all scheduled tasks
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      activeTasks: Array.from(this.intervals.keys()),
      cleanupStats: cleanupService.getStats()
    };
  }
}

// Singleton instance
export const schedulerService = new SchedulerService();

export default schedulerService;
