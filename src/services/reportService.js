import { Invoice, Product, Customer, Expense, StockMovement } from '../models/index.js';
import { Op } from 'sequelize';
import logger from '../utils/logger.js';

class ReportService {
  async getSalesReport(companyId, dateFrom, dateTo) {
    try {
      const whereClause = {
        company_id: companyId,
        payment_status: 'paid'
      };

      if (dateFrom || dateTo) {
        whereClause.date = {};
        if (dateFrom) whereClause.date[Op.gte] = new Date(dateFrom);
        if (dateTo) whereClause.date[Op.lte] = new Date(dateTo);
      }

      const invoices = await Invoice.findAll({ where: whereClause });

      const totalSales = invoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
      const totalTax = invoices.reduce((sum, inv) => sum + parseFloat(inv.tax || 0), 0);
      const totalDiscount = invoices.reduce((sum, inv) => sum + parseFloat(inv.discount || 0), 0);

      const salesByDay = {};
      invoices.forEach(inv => {
        const day = new Date(inv.date).toISOString().split('T')[0];
        salesByDay[day] = (salesByDay[day] || 0) + parseFloat(inv.total);
      });

      return {
        totalSales: parseFloat(totalSales.toFixed(2)),
        totalTax: parseFloat(totalTax.toFixed(2)),
        totalDiscount: parseFloat(totalDiscount.toFixed(2)),
        count: invoices.length,
        averageSale: invoices.length > 0 ? parseFloat((totalSales / invoices.length).toFixed(2)) : 0,
        salesByDay,
        invoices: invoices.map(inv => ({
          id: inv.id,
          invoiceNumber: inv.invoice_number,
          date: inv.date,
          total: parseFloat(inv.total),
          customerId: inv.customer_id
        }))
      };
    } catch (error) {
      logger.error('Failed to generate sales report', { error: error.message, companyId });
      throw error;
    }
  }

  async getExpenseReport(companyId, dateFrom, dateTo) {
    try {
      const whereClause = { company_id: companyId };

      if (dateFrom || dateTo) {
        whereClause.date = {};
        if (dateFrom) whereClause.date[Op.gte] = new Date(dateFrom);
        if (dateTo) whereClause.date[Op.lte] = new Date(dateTo);
      }

      const expenses = await Expense.findAll({ where: whereClause });

      const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

      const expensesByCategory = {};
      expenses.forEach(exp => {
        const category = exp.category || 'Uncategorized';
        expensesByCategory[category] = (expensesByCategory[category] || 0) + parseFloat(exp.amount);
      });

      const expensesByDay = {};
      expenses.forEach(exp => {
        const day = new Date(exp.date).toISOString().split('T')[0];
        expensesByDay[day] = (expensesByDay[day] || 0) + parseFloat(exp.amount);
      });

      return {
        totalExpenses: parseFloat(totalExpenses.toFixed(2)),
        count: expenses.length,
        averageExpense: expenses.length > 0 ? parseFloat((totalExpenses / expenses.length).toFixed(2)) : 0,
        expensesByCategory,
        expensesByDay,
        expenses: expenses.map(exp => ({
          id: exp.id,
          date: exp.date,
          amount: parseFloat(exp.amount),
          category: exp.category,
          description: exp.description
        }))
      };
    } catch (error) {
      logger.error('Failed to generate expense report', { error: error.message, companyId });
      throw error;
    }
  }

  async getProfitReport(companyId, dateFrom, dateTo) {
    try {
      const sales = await this.getSalesReport(companyId, dateFrom, dateTo);
      const expenses = await this.getExpenseReport(companyId, dateFrom, dateTo);

      const profit = sales.totalSales - expenses.totalExpenses;
      const profitMargin = sales.totalSales > 0
        ? ((profit / sales.totalSales) * 100).toFixed(2)
        : 0;

      return {
        totalSales: sales.totalSales,
        totalExpenses: expenses.totalExpenses,
        profit: parseFloat(profit.toFixed(2)),
        profitMargin: parseFloat(profitMargin),
        invoiceCount: sales.count,
        expenseCount: expenses.count,
        averageProfit: sales.count > 0 ? parseFloat((profit / sales.count).toFixed(2)) : 0
      };
    } catch (error) {
      logger.error('Failed to generate profit report', { error: error.message, companyId });
      throw error;
    }
  }

  async getInventoryReport(companyId) {
    try {
      const products = await Product.findAll({ where: { company_id: companyId } });

      const totalProducts = products.length;
      const totalValue = products.reduce(
        (sum, p) => sum + (parseFloat(p.current_stock) * parseFloat(p.selling_price)),
        0
      );

      const lowStockProducts = products.filter(p => p.current_stock <= p.min_stock_level);
      const outOfStockProducts = products.filter(p => p.current_stock === 0);

      const categoryBreakdown = {};
      products.forEach(p => {
        const category = p.category || 'Uncategorized';
        if (!categoryBreakdown[category]) {
          categoryBreakdown[category] = { count: 0, value: 0 };
        }
        categoryBreakdown[category].count++;
        categoryBreakdown[category].value += parseFloat(p.current_stock) * parseFloat(p.selling_price);
      });

      return {
        totalProducts,
        totalValue: parseFloat(totalValue.toFixed(2)),
        lowStockCount: lowStockProducts.length,
        outOfStockCount: outOfStockProducts.length,
        categoryBreakdown,
        lowStockProducts: lowStockProducts.map(p => ({
          id: p.id,
          name: p.name,
          currentStock: p.current_stock,
          minStockLevel: p.min_stock_level
        })),
        outOfStockProducts: outOfStockProducts.map(p => ({
          id: p.id,
          name: p.name
        }))
      };
    } catch (error) {
      logger.error('Failed to generate inventory report', { error: error.message, companyId });
      throw error;
    }
  }

  async getCustomerReport(companyId, dateFrom, dateTo) {
    try {
      const customers = await Customer.findAll({ where: { company_id: companyId } });

      const whereClause = { company_id: companyId };
      if (dateFrom || dateTo) {
        whereClause.date = {};
        if (dateFrom) whereClause.date[Op.gte] = new Date(dateFrom);
        if (dateTo) whereClause.date[Op.lte] = new Date(dateTo);
      }

      const invoices = await Invoice.findAll({ where: whereClause });

      const customerStats = customers.map(customer => {
        const customerInvoices = invoices.filter(inv => inv.customer_id === customer.id);
        const totalSpent = customerInvoices.reduce(
          (sum, inv) => sum + parseFloat(inv.total),
          0
        );
        const paidInvoices = customerInvoices.filter(inv => inv.payment_status === 'paid');

        return {
          id: customer.id,
          name: customer.name,
          email: customer.email,
          totalInvoices: customerInvoices.length,
          totalSpent: parseFloat(totalSpent.toFixed(2)),
          paidInvoices: paidInvoices.length,
          averageOrderValue: customerInvoices.length > 0
            ? parseFloat((totalSpent / customerInvoices.length).toFixed(2))
            : 0
        };
      });

      customerStats.sort((a, b) => b.totalSpent - a.totalSpent);

      return {
        totalCustomers: customers.length,
        topCustomers: customerStats.slice(0, 10),
        customerStats
      };
    } catch (error) {
      logger.error('Failed to generate customer report', { error: error.message, companyId });
      throw error;
    }
  }

  async getTopProducts(companyId, dateFrom, dateTo, limit = 10) {
    try {
      const whereClause = { company_id: companyId };
      if (dateFrom || dateTo) {
        whereClause.date = {};
        if (dateFrom) whereClause.date[Op.gte] = new Date(dateFrom);
        if (dateTo) whereClause.date[Op.lte] = new Date(dateTo);
      }

      const invoices = await Invoice.findAll({ where: whereClause });

      const productSales = {};

      invoices.forEach(invoice => {
        if (invoice.items && Array.isArray(invoice.items)) {
          invoice.items.forEach(item => {
            const productId = item.product_id || item.id;
            if (!productSales[productId]) {
              productSales[productId] = {
                productId,
                name: item.name || item.description,
                quantity: 0,
                revenue: 0
              };
            }
            productSales[productId].quantity += parseInt(item.quantity);
            productSales[productId].revenue += parseFloat(item.total || (item.quantity * item.unit_price));
          });
        }
      });

      const topProducts = Object.values(productSales)
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, limit)
        .map(p => ({
          ...p,
          revenue: parseFloat(p.revenue.toFixed(2))
        }));

      return { topProducts };
    } catch (error) {
      logger.error('Failed to generate top products report', { error: error.message, companyId });
      throw error;
    }
  }

  async getDashboardStats(companyId) {
    try {
      const products = await Product.findAll({ where: { company_id: companyId } });
      const invoices = await Invoice.findAll({
        where: {
          company_id: companyId,
          payment_status: 'paid'
        }
      });
      const customers = await Customer.findAll({ where: { company_id: companyId } });
      const expenses = await Expense.findAll({ where: { company_id: companyId } });

      const totalProducts = products.length;
      const totalRevenue = invoices.reduce((sum, inv) => sum + parseFloat(inv.total), 0);
      const totalCustomers = customers.length;
      const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0);

      const lowStockProducts = products.filter(p => p.current_stock <= p.min_stock_level);

      const pendingInvoices = await Invoice.findAll({
        where: {
          company_id: companyId,
          payment_status: ['pending', 'partial']
        }
      });

      const overdueInvoices = await Invoice.findAll({
        where: {
          company_id: companyId,
          payment_status: ['pending', 'partial', 'overdue'],
          due_date: { [Op.lt]: new Date() }
        }
      });

      return {
        totalProducts,
        totalRevenue: parseFloat(totalRevenue.toFixed(2)),
        totalCustomers,
        totalInvoices: invoices.length,
        totalExpenses: parseFloat(totalExpenses.toFixed(2)),
        profit: parseFloat((totalRevenue - totalExpenses).toFixed(2)),
        lowStockCount: lowStockProducts.length,
        pendingInvoicesCount: pendingInvoices.length,
        overdueInvoicesCount: overdueInvoices.length
      };
    } catch (error) {
      logger.error('Failed to generate dashboard stats', { error: error.message, companyId });
      throw error;
    }
  }

  async getRevenueTrend(companyId, dateFrom, dateTo) {
    try {
      const whereClause = {
        company_id: companyId,
        payment_status: 'paid'
      };

      if (dateFrom || dateTo) {
        whereClause.date = {};
        if (dateFrom) whereClause.date[Op.gte] = new Date(dateFrom);
        if (dateTo) whereClause.date[Op.lte] = new Date(dateTo);
      }

      const invoices = await Invoice.findAll({ where: whereClause });

      const trend = {};
      invoices.forEach(inv => {
        const month = new Date(inv.date).toISOString().substring(0, 7);
        trend[month] = (trend[month] || 0) + parseFloat(inv.total);
      });

      const trendArray = Object.entries(trend).map(([month, revenue]) => ({
        month,
        revenue: parseFloat(revenue.toFixed(2))
      })).sort((a, b) => a.month.localeCompare(b.month));

      return { trend: trendArray };
    } catch (error) {
      logger.error('Failed to generate revenue trend', { error: error.message, companyId });
      throw error;
    }
  }

  async getStockMovementReport(companyId, dateFrom, dateTo) {
    try {
      const whereClause = { company_id: companyId };

      if (dateFrom || dateTo) {
        whereClause.created_at = {};
        if (dateFrom) whereClause.created_at[Op.gte] = new Date(dateFrom);
        if (dateTo) whereClause.created_at[Op.lte] = new Date(dateTo);
      }

      const movements = await StockMovement.findAll({ where: whereClause });

      const totalIn = movements
        .filter(m => m.type === 'in')
        .reduce((sum, m) => sum + parseInt(m.quantity), 0);

      const totalOut = movements
        .filter(m => m.type === 'out')
        .reduce((sum, m) => sum + parseInt(m.quantity), 0);

      return {
        totalMovements: movements.length,
        totalIn,
        totalOut,
        netChange: totalIn - totalOut,
        movements: movements.map(m => ({
          id: m.id,
          productId: m.product_id,
          type: m.type,
          quantity: m.quantity,
          date: m.created_at,
          reference: m.reference
        }))
      };
    } catch (error) {
      logger.error('Failed to generate stock movement report', { error: error.message, companyId });
      throw error;
    }
  }
}

export default new ReportService();

