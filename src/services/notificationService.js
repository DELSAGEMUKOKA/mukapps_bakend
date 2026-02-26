import logger from '../utils/logger.js';
import emailService from './emailService.js';
import { User, Product } from '../models/index.js';

class NotificationService {
  async sendLowStockNotification(product, companyId) {
    try {
      logger.warn('Low stock notification', {
        productId: product.id,
        productName: product.name,
        currentStock: product.current_stock,
        minLevel: product.min_stock_level,
        companyId
      });

      const admins = await User.findAll({
        where: {
          company_id: companyId,
          role: ['admin', 'manager'],
          is_active: true
        }
      });

      for (const admin of admins) {
        await emailService.sendLowStockAlert(admin.email, [product]);
      }

      return { success: true, notifiedUsers: admins.length };
    } catch (error) {
      logger.error('Failed to send low stock notification', {
        error: error.message,
        productId: product.id,
        companyId
      });
      return { success: false, error: error.message };
    }
  }

  async sendBulkLowStockNotification(companyId) {
    try {
      const lowStockProducts = await Product.findAll({
        where: {
          company_id: companyId
        }
      });

      const filteredProducts = lowStockProducts.filter(
        p => p.current_stock <= p.min_stock_level
      );

      if (filteredProducts.length === 0) {
        return { success: true, notifiedUsers: 0, productsCount: 0 };
      }

      logger.warn('Bulk low stock notification', {
        productsCount: filteredProducts.length,
        companyId
      });

      const admins = await User.findAll({
        where: {
          company_id: companyId,
          role: ['admin', 'manager'],
          is_active: true
        }
      });

      for (const admin of admins) {
        await emailService.sendLowStockAlert(admin.email, filteredProducts);
      }

      return {
        success: true,
        notifiedUsers: admins.length,
        productsCount: filteredProducts.length
      };
    } catch (error) {
      logger.error('Failed to send bulk low stock notification', {
        error: error.message,
        companyId
      });
      return { success: false, error: error.message };
    }
  }

  async sendInvoiceNotification(invoice, customer) {
    try {
      logger.info('Sending invoice notification', {
        invoiceId: invoice.id,
        customerId: customer.id
      });

      await emailService.sendInvoiceEmail(
        customer.email,
        customer.name,
        invoice.invoice_number
      );

      return { success: true };
    } catch (error) {
      logger.error('Failed to send invoice notification', {
        error: error.message,
        invoiceId: invoice.id
      });
      return { success: false, error: error.message };
    }
  }

  async sendPaymentReceivedNotification(invoice, customer, amount) {
    try {
      logger.info('Sending payment received notification', {
        invoiceId: invoice.id,
        customerId: customer.id,
        amount
      });

      await emailService.sendPaymentReceivedEmail(
        customer.email,
        customer.name,
        amount,
        invoice.invoice_number
      );

      return { success: true };
    } catch (error) {
      logger.error('Failed to send payment notification', {
        error: error.message,
        invoiceId: invoice.id
      });
      return { success: false, error: error.message };
    }
  }

  async sendWelcomeNotification(user, company) {
    try {
      logger.info('Sending welcome notification', {
        userId: user.id,
        companyId: company.id
      });

      await emailService.sendWelcomeEmail(user.email, user.name, company.name);

      return { success: true };
    } catch (error) {
      logger.error('Failed to send welcome notification', {
        error: error.message,
        userId: user.id
      });
      return { success: false, error: error.message };
    }
  }

  async sendInvoiceOverdueNotification(invoice, customer, companyId) {
    try {
      logger.warn('Invoice overdue notification', {
        invoiceId: invoice.id,
        customerId: customer.id,
        dueDate: invoice.due_date
      });

      const admins = await User.findAll({
        where: {
          company_id: companyId,
          role: ['admin', 'manager'],
          is_active: true
        }
      });

      for (const admin of admins) {
        logger.info('Notifying admin of overdue invoice', {
          adminId: admin.id,
          invoiceId: invoice.id
        });
      }

      return { success: true, notifiedUsers: admins.length };
    } catch (error) {
      logger.error('Failed to send overdue notification', {
        error: error.message,
        invoiceId: invoice.id
      });
      return { success: false, error: error.message };
    }
  }

  async sendStockAdjustmentNotification(product, adjustment, userId, companyId) {
    try {
      logger.info('Stock adjustment notification', {
        productId: product.id,
        adjustmentType: adjustment.type,
        quantity: adjustment.quantity,
        userId,
        companyId
      });

      const admins = await User.findAll({
        where: {
          company_id: companyId,
          role: ['admin'],
          is_active: true
        }
      });

      return { success: true, notifiedUsers: admins.length };
    } catch (error) {
      logger.error('Failed to send stock adjustment notification', {
        error: error.message,
        productId: product.id
      });
      return { success: false, error: error.message };
    }
  }

  async sendSubscriptionExpiryNotification(subscription, company) {
    try {
      const daysUntilExpiry = Math.ceil(
        (new Date(subscription.end_date) - new Date()) / (1000 * 60 * 60 * 24)
      );

      logger.warn('Subscription expiry notification', {
        companyId: company.id,
        daysUntilExpiry,
        planType: subscription.plan_type
      });

      const admins = await User.findAll({
        where: {
          company_id: company.id,
          role: 'admin',
          is_active: true
        }
      });

      return { success: true, notifiedUsers: admins.length, daysUntilExpiry };
    } catch (error) {
      logger.error('Failed to send subscription expiry notification', {
        error: error.message,
        companyId: company.id
      });
      return { success: false, error: error.message };
    }
  }

  async sendExpenseApprovalNotification(expense, approver, companyId) {
    try {
      logger.info('Expense approval notification', {
        expenseId: expense.id,
        approverId: approver.id,
        companyId
      });

      return { success: true };
    } catch (error) {
      logger.error('Failed to send expense approval notification', {
        error: error.message,
        expenseId: expense.id
      });
      return { success: false, error: error.message };
    }
  }

  async sendUserAccountNotification(user, action) {
    try {
      logger.info('User account notification', {
        userId: user.id,
        action
      });

      return { success: true };
    } catch (error) {
      logger.error('Failed to send user account notification', {
        error: error.message,
        userId: user.id,
        action
      });
      return { success: false, error: error.message };
    }
  }
}

export default new NotificationService();

