import cleanupService from '../services/cleanupService.js';
import schedulerService from '../services/schedulerService.js';
import logger from '../utils/logger.js';

export const cleanupController = {
  /**
   * Manually trigger invoice cleanup
   * POST /api/v1/cleanup/invoices
   */
  async cleanupInvoices(req, res, next) {
    try {
      const { days_old = 32, dry_run = false } = req.body;

      // Validate days_old
      if (days_old < 1) {
        return res.status(400).json({
          success: false,
          message: 'days_old must be at least 1'
        });
      }

      logger.info(`Manual invoice cleanup triggered by user ${req.user.id}: ${days_old} days, dry_run: ${dry_run}`);

      const result = await cleanupService.deleteOldInvoices(days_old, dry_run);

      res.json({
        success: result.success,
        data: result,
        message: result.message || 'Cleanup completed'
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * Get cleanup statistics
   * GET /api/v1/cleanup/stats
   */
  async getStats(req, res, next) {
    try {
      const stats = cleanupService.getStats();
      const schedulerStatus = schedulerService.getStatus();

      res.json({
        success: true,
        data: {
          cleanup: stats,
          scheduler: schedulerStatus,
          configuration: {
            enabled: process.env.INVOICE_CLEANUP_ENABLED === 'true',
            days: parseInt(process.env.INVOICE_CLEANUP_DAYS || '32'),
            interval_hours: parseInt(process.env.INVOICE_CLEANUP_INTERVAL_HOURS || '24')
          }
        }
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * Reset cleanup statistics
   * POST /api/v1/cleanup/reset-stats
   */
  async resetStats(req, res, next) {
    try {
      cleanupService.resetStats();

      logger.info(`Cleanup statistics reset by user ${req.user.id}`);

      res.json({
        success: true,
        message: 'Statistics reset successfully'
      });

    } catch (error) {
      next(error);
    }
  },

  /**
   * Get scheduler status
   * GET /api/v1/cleanup/scheduler
   */
  async getSchedulerStatus(req, res, next) {
    try {
      const status = schedulerService.getStatus();

      res.json({
        success: true,
        data: status
      });

    } catch (error) {
      next(error);
    }
  }
};

export default cleanupController;
