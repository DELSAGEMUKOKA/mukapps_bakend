import { Invoice } from '../models/index.js';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';
import sequelize from '../config/database.js';

export class CleanupService {
  constructor() {
    this.isRunning = false;
    this.lastRunTime = null;
    this.stats = {
      totalInvoicesDeleted: 0,
      lastCleanupCount: 0,
      lastCleanupDate: null,
      errors: 0
    };
  }

  /**
   * Delete invoices older than specified days
   * @param {number} daysOld - Number of days (default: 32)
   * @param {boolean} dryRun - If true, only counts without deleting
   * @returns {Promise<Object>} Statistics about the cleanup
   */
  async deleteOldInvoices(daysOld = 32, dryRun = false) {
    if (this.isRunning) {
      logger.warn('Invoice cleanup already running, skipping...');
      return { skipped: true, reason: 'Already running' };
    }

    this.isRunning = true;
    const startTime = Date.now();

    let transaction;

    try {
      // Calculate the cutoff date
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysOld);

      logger.info(`Starting invoice cleanup: deleting invoices older than ${daysOld} days (before ${cutoffDate.toISOString()})`);

      // Start transaction
      transaction = await sequelize.transaction();

      // Find old invoices
      const oldInvoices = await Invoice.findAll({
        where: {
          created_at: {
            [Op.lt]: cutoffDate
          },
          // Only delete paid or cancelled invoices to be safe
          payment_status: {
            [Op.in]: ['paid', 'cancelled', 'refunded']
          }
        },
        attributes: ['id', 'invoice_number', 'total', 'created_at', 'company_id'],
        transaction
      });

      const count = oldInvoices.length;

      if (count === 0) {
        logger.info('No old invoices found to delete');
        await transaction.commit();
        this.isRunning = false;
        return {
          success: true,
          deletedCount: 0,
          message: 'No old invoices to delete',
          cutoffDate: cutoffDate.toISOString()
        };
      }

      // Log invoices to be deleted
      logger.info(`Found ${count} invoices to delete`);

      if (dryRun) {
        logger.info('DRY RUN - Would delete the following invoices:');
        oldInvoices.forEach(invoice => {
          logger.info(`  - Invoice ${invoice.invoice_number} (${invoice.id}) from ${invoice.created_at}`);
        });
        await transaction.rollback();
        this.isRunning = false;
        return {
          success: true,
          dryRun: true,
          wouldDeleteCount: count,
          invoices: oldInvoices.map(i => ({
            id: i.id,
            invoice_number: i.invoice_number,
            created_at: i.created_at,
            total: i.total
          })),
          cutoffDate: cutoffDate.toISOString()
        };
      }

      // Create backup log of deleted invoices
      const deletedInvoiceIds = oldInvoices.map(i => i.id);
      const deletedInvoiceNumbers = oldInvoices.map(i => i.invoice_number).join(', ');

      // Delete the invoices (cascade will delete invoice_items)
      const deletedCount = await Invoice.destroy({
        where: {
          id: {
            [Op.in]: deletedInvoiceIds
          }
        },
        transaction
      });

      // Commit the transaction
      await transaction.commit();

      // Update statistics
      this.stats.lastCleanupCount = deletedCount;
      this.stats.totalInvoicesDeleted += deletedCount;
      this.stats.lastCleanupDate = new Date();
      this.lastRunTime = new Date();

      const duration = Date.now() - startTime;

      logger.info(`Successfully deleted ${deletedCount} old invoices in ${duration}ms`);
      logger.info(`Deleted invoice numbers: ${deletedInvoiceNumbers}`);

      return {
        success: true,
        deletedCount,
        duration,
        cutoffDate: cutoffDate.toISOString(),
        deletedInvoiceIds,
        message: `Successfully deleted ${deletedCount} invoices older than ${daysOld} days`
      };

    } catch (error) {
      // Rollback on error
      if (transaction) {
        await transaction.rollback();
      }

      this.stats.errors += 1;
      logger.error('Error during invoice cleanup:', error);

      return {
        success: false,
        error: error.message,
        message: 'Failed to delete old invoices'
      };

    } finally {
      this.isRunning = false;
    }
  }

  /**
   * Get cleanup statistics
   * @returns {Object} Cleanup statistics
   */
  getStats() {
    return {
      ...this.stats,
      isRunning: this.isRunning,
      lastRunTime: this.lastRunTime
    };
  }

  /**
   * Reset statistics
   */
  resetStats() {
    this.stats = {
      totalInvoicesDeleted: 0,
      lastCleanupCount: 0,
      lastCleanupDate: null,
      errors: 0
    };
    logger.info('Cleanup statistics reset');
  }
}

// Singleton instance
export const cleanupService = new CleanupService();

export default cleanupService;
