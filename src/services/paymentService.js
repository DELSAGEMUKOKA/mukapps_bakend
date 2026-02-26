import logger from '../utils/logger.js';
import { Invoice } from '../models/index.js';
import { ValidationError } from '../utils/helpers.js';
import notificationService from './notificationService.js';

class PaymentService {
  async processPayment(invoiceId, paymentData, companyId) {
    try {
      const invoice = await Invoice.findById(invoiceId, companyId);

      if (!invoice) {
        throw new ValidationError({ invoice: 'Invoice not found' });
      }

      if (invoice.payment_status === 'paid') {
        throw new ValidationError({ invoice: 'Invoice is already paid' });
      }

      const paymentAmount = parseFloat(paymentData.amount);
      const invoiceTotal = parseFloat(invoice.total);

      if (paymentAmount <= 0) {
        throw new ValidationError({ amount: 'Payment amount must be greater than 0' });
      }

      let newStatus = 'pending';
      if (paymentAmount >= invoiceTotal) {
        newStatus = 'paid';
      } else if (paymentAmount > 0) {
        newStatus = 'partial';
      }

      await invoice.update({
        payment_status: newStatus,
        payment_date: paymentData.paymentDate || new Date(),
        payment_method: paymentData.paymentMethod || 'cash',
        notes: paymentData.notes || null
      });

      logger.info('Payment processed successfully', {
        invoiceId: invoice.id,
        amount: paymentAmount,
        status: newStatus,
        companyId
      });

      return {
        success: true,
        invoice: invoice,
        paymentStatus: newStatus,
        amountPaid: paymentAmount,
        remainingAmount: Math.max(0, invoiceTotal - paymentAmount)
      };
    } catch (error) {
      logger.error('Payment processing failed', {
        error: error.message,
        invoiceId,
        companyId
      });
      throw error;
    }
  }

  async recordPayment(invoiceId, paymentData, companyId, customer) {
    try {
      const result = await this.processPayment(invoiceId, paymentData, companyId);

      if (result.paymentStatus === 'paid' && customer) {
        await notificationService.sendPaymentReceivedNotification(
          result.invoice,
          customer,
          paymentData.amount
        );
      }

      return result;
    } catch (error) {
      logger.error('Payment recording failed', {
        error: error.message,
        invoiceId,
        companyId
      });
      throw error;
    }
  }

  async refundPayment(invoiceId, refundAmount, reason, companyId) {
    try {
      const invoice = await Invoice.findById(invoiceId, companyId);

      if (!invoice) {
        throw new ValidationError({ invoice: 'Invoice not found' });
      }

      if (invoice.payment_status !== 'paid') {
        throw new ValidationError({ invoice: 'Cannot refund an unpaid invoice' });
      }

      const refundAmountFloat = parseFloat(refundAmount);
      const invoiceTotal = parseFloat(invoice.total);

      if (refundAmountFloat <= 0 || refundAmountFloat > invoiceTotal) {
        throw new ValidationError({ amount: 'Invalid refund amount' });
      }

      await invoice.update({
        payment_status: 'refunded',
        notes: `Refund: ${refundAmount}. Reason: ${reason}`
      });

      logger.info('Payment refunded successfully', {
        invoiceId: invoice.id,
        refundAmount: refundAmountFloat,
        reason,
        companyId
      });

      return {
        success: true,
        invoice: invoice,
        refundAmount: refundAmountFloat,
        reason
      };
    } catch (error) {
      logger.error('Payment refund failed', {
        error: error.message,
        invoiceId,
        companyId
      });
      throw error;
    }
  }

  async getPaymentHistory(invoiceId, companyId) {
    try {
      const invoice = await Invoice.findById(invoiceId, companyId);

      if (!invoice) {
        throw new ValidationError({ invoice: 'Invoice not found' });
      }

      const history = [{
        date: invoice.payment_date || invoice.created_at,
        status: invoice.payment_status,
        amount: invoice.total,
        method: invoice.payment_method || 'unknown',
        notes: invoice.notes
      }];

      return {
        success: true,
        invoiceNumber: invoice.invoice_number,
        history
      };
    } catch (error) {
      logger.error('Failed to get payment history', {
        error: error.message,
        invoiceId,
        companyId
      });
      throw error;
    }
  }

  async validatePaymentMethod(method) {
    const validMethods = ['cash', 'card', 'bank_transfer', 'check', 'mobile_payment', 'other'];
    return validMethods.includes(method);
  }

  async calculatePaymentFees(amount, method) {
    const feeRates = {
      cash: 0,
      bank_transfer: 0,
      check: 0,
      card: 0.029,
      mobile_payment: 0.025,
      other: 0
    };

    const rate = feeRates[method] || 0;
    const fee = amount * rate;

    return {
      amount: parseFloat(amount),
      fee: parseFloat(fee.toFixed(2)),
      total: parseFloat((amount + fee).toFixed(2)),
      method
    };
  }

  async processSubscriptionPayment(subscriptionId, paymentData, companyId) {
    try {
      logger.info('Processing subscription payment', {
        subscriptionId,
        companyId,
        amount: paymentData.amount
      });

      const paymentAmount = parseFloat(paymentData.amount);

      if (paymentAmount <= 0) {
        throw new ValidationError({ amount: 'Payment amount must be greater than 0' });
      }

      logger.info('Subscription payment processed successfully', {
        subscriptionId,
        amount: paymentAmount,
        companyId
      });

      return {
        success: true,
        subscriptionId,
        amountPaid: paymentAmount,
        paymentDate: new Date()
      };
    } catch (error) {
      logger.error('Subscription payment processing failed', {
        error: error.message,
        subscriptionId,
        companyId
      });
      throw error;
    }
  }

  async getPaymentStats(companyId, dateFrom, dateTo) {
    try {
      const invoices = await Invoice.findAll({
        where: {
          company_id: companyId,
          payment_status: 'paid'
        }
      });

      let filteredInvoices = invoices;

      if (dateFrom || dateTo) {
        filteredInvoices = invoices.filter(inv => {
          const paymentDate = new Date(inv.payment_date || inv.created_at);
          if (dateFrom && paymentDate < new Date(dateFrom)) return false;
          if (dateTo && paymentDate > new Date(dateTo)) return false;
          return true;
        });
      }

      const totalPayments = filteredInvoices.reduce(
        (sum, inv) => sum + parseFloat(inv.total),
        0
      );

      const paymentsByMethod = filteredInvoices.reduce((acc, inv) => {
        const method = inv.payment_method || 'unknown';
        acc[method] = (acc[method] || 0) + parseFloat(inv.total);
        return acc;
      }, {});

      return {
        success: true,
        totalPayments: parseFloat(totalPayments.toFixed(2)),
        count: filteredInvoices.length,
        paymentsByMethod,
        averagePayment: filteredInvoices.length > 0
          ? parseFloat((totalPayments / filteredInvoices.length).toFixed(2))
          : 0
      };
    } catch (error) {
      logger.error('Failed to get payment stats', {
        error: error.message,
        companyId
      });
      throw error;
    }
  }

  async getOutstandingPayments(companyId) {
    try {
      const invoices = await Invoice.findAll({
        where: {
          company_id: companyId,
          payment_status: ['pending', 'partial', 'overdue']
        }
      });

      const totalOutstanding = invoices.reduce(
        (sum, inv) => sum + parseFloat(inv.total),
        0
      );

      const overdueInvoices = invoices.filter(inv => {
        if (!inv.due_date) return false;
        return new Date(inv.due_date) < new Date();
      });

      const totalOverdue = overdueInvoices.reduce(
        (sum, inv) => sum + parseFloat(inv.total),
        0
      );

      return {
        success: true,
        totalOutstanding: parseFloat(totalOutstanding.toFixed(2)),
        totalOverdue: parseFloat(totalOverdue.toFixed(2)),
        outstandingCount: invoices.length,
        overdueCount: overdueInvoices.length,
        invoices: invoices.map(inv => ({
          id: inv.id,
          invoiceNumber: inv.invoice_number,
          total: parseFloat(inv.total),
          dueDate: inv.due_date,
          status: inv.payment_status,
          isOverdue: inv.due_date && new Date(inv.due_date) < new Date()
        }))
      };
    } catch (error) {
      logger.error('Failed to get outstanding payments', {
        error: error.message,
        companyId
      });
      throw error;
    }
  }
}

export default new PaymentService();
