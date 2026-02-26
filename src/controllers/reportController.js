// src/controllers/reportController.js
import { Product, Category, Customer, Invoice, Expense, User, Company, StockMovement } from '../models/index.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';

// ======================================================
// FONCTIONS UTILITAIRES POUR LE FILTRAGE
// ======================================================

/**
 * Applique le filtre utilisateur selon le rôle
 */
const applyUserFilter = (req, baseWhere = {}) => {
  const where = { ...baseWhere };
  const userRole = req.user.role;
  const userId = req.user.id;

  // Si caissier, filtrer par ses propres données
  if (userRole === 'cashier') {
    where.userId = userId;
  }

  return where;
};

/**
 * Applique le filtre de dates
 */
const applyDateFilter = (req, baseWhere = {}) => {
  const where = { ...baseWhere };
  const { startDate, endDate } = req.query;

  if (startDate && endDate) {
    where.date = {
      [Op.between]: [startDate, endDate]
    };
  } else if (startDate) {
    where.date = { [Op.gte]: startDate };
  } else if (endDate) {
    where.date = { [Op.lte]: endDate };
  }

  return where;
};

// ======================================================
// RAPPORTS PRINCIPAUX
// ======================================================

/**
 * Tableau de bord - Adapté selon le rôle
 */
export const getDashboard = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const today = new Date().toISOString().split('T')[0];
    const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();
    const startOfWeek = new Date(new Date().setDate(new Date().getDate() - 7)).toISOString();

    // Construction du where pour les factures selon le rôle
    const invoiceWhere = { companyId };
    if (userRole === 'cashier') {
      invoiceWhere.userId = userId; // Caissier ne voit que ses propres factures
    }

    const [
      todaySales,
      weekSales,
      monthSales,
      totalProducts,
      allProducts,
      totalCustomers,
      pendingExpenses,
      recentInvoices
    ] = await Promise.all([
      // Ventes du jour - filtrées par utilisateur
      Invoice.sum('total', {
        where: {
          ...invoiceWhere,
          date: { [Op.gte]: today },
          status: 'paid'
        }
      }),

      // Ventes de la semaine - filtrées par utilisateur
      Invoice.sum('total', {
        where: {
          ...invoiceWhere,
          date: { [Op.gte]: startOfWeek },
          status: 'paid'
        }
      }),

      // Ventes du mois - filtrées par utilisateur
      Invoice.sum('total', {
        where: {
          ...invoiceWhere,
          date: { [Op.gte]: startOfMonth },
          status: 'paid'
        }
      }),

      // Total produits (non filtré par utilisateur)
      Product.count({ where: { companyId } }),

      // Tous les produits
      Product.findAll({
        where: { companyId },
        attributes: ['currentStock', 'minStockLevel']
      }),

      // Total clients (non filtré)
      Customer.count({ where: { companyId } }),

      // Dépenses en attente (non filtrées)
      Expense.findAll({
        where: {
          companyId,
          status: 'pending'
        },
        attributes: ['amount']
      }),

      // Factures récentes - filtrées par utilisateur
      Invoice.findAll({
        where: invoiceWhere,
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name']
          }
        ],
        order: [['date', 'DESC']],
        limit: 5
      })
    ]);

    const lowStockCount = allProducts.filter(p => 
      parseInt(p.currentStock) <= parseInt(p.minStockLevel)
    ).length || 0;

    const outOfStockCount = allProducts.filter(p => 
      parseInt(p.currentStock) === 0
    ).length || 0;

    const pendingExpensesTotal = pendingExpenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0) || 0;

    // Statistiques par utilisateur pour admin/supervisor
    let userStats = null;
    if (userRole !== 'cashier') {
      const users = await User.findAll({
        where: { company_id: companyId },
        attributes: ['id', 'name']
      });

      const stats = await Promise.all(
        users.map(async (user) => {
          const userSales = await Invoice.sum('total', {
            where: {
              companyId,
              userId: user.id,
              date: { [Op.gte]: startOfMonth },
              status: 'paid'
            }
          });

          return {
            userId: user.id,
            userName: user.name,
            monthlySales: parseFloat(userSales) || 0
          };
        })
      );

      userStats = stats;
    }

    res.json({
      success: true,
      data: {
        sales: {
          today: parseFloat(todaySales) || 0,
          week: parseFloat(weekSales) || 0,
          month: parseFloat(monthSales) || 0
        },
        counts: {
          products: totalProducts || 0,
          customers: totalCustomers || 0,
          lowStock: lowStockCount,
          outOfStock: outOfStockCount,
          pendingExpenses: pendingExpenses.length || 0
        },
        financials: {
          pendingExpensesTotal
        },
        recentInvoices,
        userStats,
        userRole
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Rapport des ventes - Filtré par utilisateur
 */
export const getSalesReport = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { startDate, endDate, groupBy = 'day' } = req.query;

    // Construction du where de base
    let where = { companyId };

    // Appliquer le filtre de dates
    where = applyDateFilter(req, where);

    // Appliquer le filtre utilisateur si caissier
    if (userRole === 'cashier') {
      where.userId = userId;
    }

    const invoices = await Invoice.findAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name']
        }
      ],
      order: [['date', 'ASC']]
    });

    const totalSales = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    const totalSubtotal = invoices.reduce((sum, inv) => sum + parseFloat(inv.subtotal || 0), 0);
    const totalTax = invoices.reduce((sum, inv) => sum + parseFloat(inv.tax || 0), 0);
    const totalDiscount = invoices.reduce((sum, inv) => sum + parseFloat(inv.discount || 0), 0);

    const byPaymentMethod = invoices.reduce((acc, inv) => {
      const method = inv.paymentMethod || 'unknown';
      acc[method] = (acc[method] || 0) + parseFloat(inv.total || 0);
      return acc;
    }, {});

    const paidInvoices = invoices.filter(inv => inv.status === 'paid');
    const pendingInvoices = invoices.filter(inv => inv.status === 'pending');

    // Grouper par période si demandé
    let groupedData = null;
    if (groupBy) {
      groupedData = invoices.reduce((acc, inv) => {
        const date = new Date(inv.date);
        let key;
        
        if (groupBy === 'day') {
          key = date.toISOString().split('T')[0];
        } else if (groupBy === 'month') {
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        } else if (groupBy === 'year') {
          key = date.getFullYear().toString();
        } else {
          key = date.toISOString().split('T')[0];
        }

        if (!acc[key]) {
          acc[key] = { period: key, count: 0, total: 0 };
        }
        acc[key].count += 1;
        acc[key].total += parseFloat(inv.total || 0);
        return acc;
      }, {});
    }

    // Statistiques par utilisateur pour admin/supervisor
    let byUser = null;
    if (userRole !== 'cashier') {
      byUser = invoices.reduce((acc, inv) => {
        const userName = inv.creator?.name || 'Inconnu';
        if (!acc[userName]) {
          acc[userName] = { count: 0, total: 0 };
        }
        acc[userName].count += 1;
        acc[userName].total += parseFloat(inv.total || 0);
        return acc;
      }, {});
    }

    res.json({
      success: true,
      data: {
        summary: {
          totalSales,
          totalSubtotal,
          totalTax,
          totalDiscount,
          invoiceCount: invoices.length,
          paidCount: paidInvoices.length,
          pendingCount: pendingInvoices.length
        },
        byPaymentMethod,
        byPeriod: groupedData ? Object.values(groupedData) : null,
        byUser,
        invoices: invoices.slice(0, 100)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Rapport des profits - Filtré par utilisateur
 */
export const getProfitReport = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { startDate, endDate } = req.query;

    // Construction du where avec dates
    let invoiceWhere = { companyId, status: 'paid' };
    let expenseWhere = { companyId, status: 'approved' };
    
    invoiceWhere = applyDateFilter(req, invoiceWhere);
    expenseWhere = applyDateFilter(req, expenseWhere);

    // Appliquer le filtre utilisateur si caissier
    if (userRole === 'cashier') {
      invoiceWhere.userId = userId;
    }

    // Récupérer les factures payées
    const invoices = await Invoice.findAll({ where: invoiceWhere });
    
    // Récupérer les dépenses approuvées
    const expenses = await Expense.findAll({ where: expenseWhere });

    const revenue = invoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
    const totalExpenses = expenses.reduce((sum, exp) => sum + parseFloat(exp.amount || 0), 0);

    // Calculer le coût des marchandises vendues
    let costOfGoodsSold = 0;
    for (const invoice of invoices) {
      try {
        const items = JSON.parse(invoice.items || '[]');
        for (const item of items) {
          if (item.productId) {
            const product = await Product.findByPk(item.productId);
            if (product) {
              const purchasePrice = parseFloat(product.costPrice) || 0;
              costOfGoodsSold += purchasePrice * (item.quantity || 0);
            }
          }
        }
      } catch (e) {
        console.error('Error parsing invoice items:', e);
      }
    }

    const grossProfit = revenue - costOfGoodsSold;
    const netProfit = grossProfit - totalExpenses;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    res.json({
      success: true,
      data: {
        summary: {
          revenue,
          costOfGoodsSold,
          grossProfit,
          totalExpenses,
          netProfit,
          profitMargin: parseFloat(profitMargin.toFixed(2))
        },
        counts: {
          invoiceCount: invoices.length,
          expenseCount: expenses.length
        },
        period: { startDate, endDate }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Rapport d'inventaire
 */
export const getInventoryReport = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const products = await Product.findAll({
      where: { companyId },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    });

    const totalProducts = products.length;
    const totalStock = products.reduce((sum, prod) => sum + (parseInt(prod.currentStock) || 0), 0);
    const totalValue = products.reduce((sum, prod) => {
      return sum + ((parseInt(prod.currentStock) || 0) * (parseFloat(prod.costPrice) || 0));
    }, 0);
    const potentialRevenue = products.reduce((sum, prod) => {
      return sum + ((parseInt(prod.currentStock) || 0) * (parseFloat(prod.price) || 0));
    }, 0);

    const lowStockProducts = products.filter(prod => 
      parseInt(prod.currentStock) <= parseInt(prod.minStockLevel)
    );

    const outOfStockProducts = products.filter(prod => 
      parseInt(prod.currentStock) === 0
    );

    const byCategory = products.reduce((acc, prod) => {
      const categoryName = prod.category?.name || 'Uncategorized';
      if (!acc[categoryName]) {
        acc[categoryName] = { count: 0, stock: 0, value: 0 };
      }
      acc[categoryName].count += 1;
      acc[categoryName].stock += parseInt(prod.currentStock) || 0;
      acc[categoryName].value += (parseInt(prod.currentStock) || 0) * (parseFloat(prod.costPrice) || 0);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        summary: {
          totalProducts,
          totalStock,
          totalValue,
          potentialRevenue,
          potentialProfit: potentialRevenue - totalValue,
          averageValue: totalProducts > 0 ? totalValue / totalProducts : 0
        },
        alerts: {
          lowStockCount: lowStockProducts.length,
          outOfStockCount: outOfStockProducts.length
        },
        lowStockProducts: lowStockProducts.slice(0, 10),
        outOfStockProducts: outOfStockProducts.slice(0, 10),
        byCategory
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Rapport des clients
 */
export const getCustomerReport = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const customers = await Customer.findAll({
      where: { companyId },
      attributes: ['id', 'name', 'email', 'totalPurchases', 'totalSpent', 'isVip', 'createdAt']
    });

    const totalCustomers = customers.length;
    const vipCustomers = customers.filter(c => c.isVip === '1' || c.isVip === true).length;
    const totalPurchases = customers.reduce((sum, c) => sum + (parseFloat(c.totalPurchases) || 0), 0);
    const totalSpent = customers.reduce((sum, c) => sum + (parseFloat(c.totalSpent) || 0), 0);
    const averageSpent = totalCustomers > 0 ? totalSpent / totalCustomers : 0;

    const topCustomers = customers
      .sort((a, b) => (parseFloat(b.totalSpent) || 0) - (parseFloat(a.totalSpent) || 0))
      .slice(0, 10)
      .map(c => ({
        id: c.id,
        name: c.name,
        email: c.email,
        totalPurchases: parseFloat(c.totalPurchases) || 0,
        totalSpent: parseFloat(c.totalSpent) || 0,
        isVip: c.isVip === '1' || c.isVip === true,
        createdAt: c.createdAt
      }));

    res.json({
      success: true,
      data: {
        summary: {
          totalCustomers,
          vipCustomers,
          vipPercentage: totalCustomers > 0 ? (vipCustomers / totalCustomers * 100).toFixed(2) : 0,
          totalPurchases,
          totalSpent,
          averageSpent: parseFloat(averageSpent.toFixed(2))
        },
        topCustomers
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Top produits - Filtré par utilisateur
 */
export const getTopProducts = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { startDate, endDate, limit = 10 } = req.query;

    // Construction du where
    let where = { companyId };
    where = applyDateFilter(req, where);

    // Appliquer le filtre utilisateur si caissier
    if (userRole === 'cashier') {
      where.userId = userId;
    }

    const invoices = await Invoice.findAll({
      where,
      attributes: ['items']
    });

    const productStats = {};

    invoices.forEach(invoice => {
      try {
        const items = JSON.parse(invoice.items || '[]');
        items.forEach(item => {
          const productId = item.productId;
          if (!productStats[productId]) {
            productStats[productId] = {
              product: {
                id: productId,
                name: item.productName || 'Unknown',
                barcode: item.barcode || null
              },
              totalQuantity: 0,
              totalRevenue: 0,
              salesCount: 0
            };
          }
          productStats[productId].totalQuantity += item.quantity || 0;
          productStats[productId].totalRevenue += item.total || 0;
          productStats[productId].salesCount += 1;
        });
      } catch (e) {
        console.error('Error parsing invoice items:', e);
      }
    });

    const topProducts = Object.values(productStats)
      .sort((a, b) => b.totalRevenue - a.totalRevenue)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        limit: parseInt(limit),
        products: topProducts
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Rapport des dépenses
 */
export const getExpenseReport = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { startDate, endDate } = req.query;

    const where = { companyId };

    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate]
      };
    } else if (startDate) {
      where.date = { [Op.gte]: startDate };
    } else if (endDate) {
      where.date = { [Op.lte]: endDate };
    }

    const expenses = await Expense.findAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['date', 'ASC']]
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    const approvedExpenses = expenses.filter(exp => exp.status === 'approved')
      .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    const pendingExpenses = expenses.filter(exp => exp.status === 'pending')
      .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    const rejectedExpenses = expenses.filter(exp => exp.status === 'rejected')
      .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

    const byCategory = expenses.reduce((acc, exp) => {
      const cat = exp.category || 'Uncategorized';
      if (!acc[cat]) {
        acc[cat] = { category: cat, count: 0, total: 0 };
      }
      acc[cat].count += 1;
      acc[cat].total += (parseFloat(exp.amount) || 0);
      return acc;
    }, {});

    const byMonth = expenses.reduce((acc, exp) => {
      const date = new Date(exp.date);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!acc[monthKey]) {
        acc[monthKey] = { month: monthKey, count: 0, total: 0 };
      }
      acc[monthKey].count += 1;
      acc[monthKey].total += (parseFloat(exp.amount) || 0);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        summary: {
          totalExpenses,
          approvedExpenses,
          pendingExpenses,
          rejectedExpenses,
          expenseCount: expenses.length,
          averageExpense: expenses.length > 0 ? totalExpenses / expenses.length : 0
        },
        byCategory: Object.values(byCategory),
        byMonth: Object.values(byMonth),
        expenses: expenses.slice(0, 100)
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Produits les moins performants - Filtré par utilisateur
 */
export const getLowPerformingProducts = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { startDate, endDate, limit = 10 } = req.query;

    const allProducts = await Product.findAll({
      where: { companyId },
      attributes: ['id', 'name', 'barcode', 'currentStock', 'price', 'costPrice']
    });

    let invoiceWhere = { companyId };
    if (startDate && endDate) {
      invoiceWhere.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    // Appliquer le filtre utilisateur si caissier
    if (userRole === 'cashier') {
      invoiceWhere.userId = userId;
    }

    const invoices = await Invoice.findAll({
      where: invoiceWhere,
      attributes: ['items']
    });

    const productSales = {};

    invoices.forEach(invoice => {
      try {
        const items = JSON.parse(invoice.items || '[]');
        items.forEach(item => {
          if (item.productId) {
            if (!productSales[item.productId]) {
              productSales[item.productId] = { quantity: 0, revenue: 0, profit: 0 };
            }
            productSales[item.productId].quantity += item.quantity || 0;
            productSales[item.productId].revenue += item.total || 0;
          }
        });
      } catch (e) {
        console.error('Error parsing invoice items:', e);
      }
    });

    const lowPerforming = allProducts
      .map(product => {
        const sales = productSales[product.id] || { quantity: 0, revenue: 0 };
        const cost = parseFloat(product.costPrice) || 0;
        const potentialProfit = (parseFloat(product.price) || 0) - cost;
        
        return {
          id: product.id,
          name: product.name,
          barcode: product.barcode,
          currentStock: product.currentStock,
          price: parseFloat(product.price) || 0,
          costPrice: cost,
          potentialProfit,
          totalQuantitySold: sales.quantity,
          totalRevenue: sales.revenue,
          estimatedProfit: sales.revenue - (sales.quantity * cost),
          turnoverRate: product.currentStock > 0 ? (sales.quantity / product.currentStock) : 0
        };
      })
      .sort((a, b) => a.totalRevenue - b.totalRevenue)
      .slice(0, parseInt(limit));

    res.json({
      success: true,
      data: {
        limit: parseInt(limit),
        products: lowPerforming
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Tendance des revenus - Filtré par utilisateur
 */
export const getRevenueTrend = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { startDate, endDate, groupBy = 'day' } = req.query;

    // Construction du where
    let where = {
      companyId,
      status: 'paid'
    };
    where = applyDateFilter(req, where);

    // Appliquer le filtre utilisateur si caissier
    if (userRole === 'cashier') {
      where.userId = userId;
    }

    const invoices = await Invoice.findAll({
      where,
      order: [['date', 'ASC']],
      attributes: ['date', 'total']
    });

    const trend = invoices.reduce((acc, inv) => {
      const date = new Date(inv.date);
      let key;
      
      if (groupBy === 'day') {
        key = date.toISOString().split('T')[0];
      } else if (groupBy === 'month') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (groupBy === 'year') {
        key = date.getFullYear().toString();
      } else {
        key = date.toISOString().split('T')[0];
      }

      if (!acc[key]) {
        acc[key] = { period: key, total: 0, count: 0 };
      }
      acc[key].total += parseFloat(inv.total || 0);
      acc[key].count += 1;
      return acc;
    }, {});

    const trendData = Object.values(trend).sort((a, b) => {
      if (groupBy === 'year') {
        return parseInt(a.period) - parseInt(b.period);
      }
      return a.period.localeCompare(b.period);
    });

    res.json({
      success: true,
      data: {
        groupBy,
        data: trendData
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Rapport profits/pertes par période
 */
export const getProfitLossReport = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { year, month } = req.query;

    if (!year) {
      return res.status(400).json({
        success: false,
        message: 'Year is required'
      });
    }

    let startDate, endDate;
    
    if (month) {
      // Rapport pour un mois spécifique
      startDate = new Date(year, month - 1, 1);
      endDate = new Date(year, month, 0);
    } else {
      // Rapport pour toute l'année
      startDate = new Date(year, 0, 1);
      endDate = new Date(year, 11, 31);
    }

    const invoices = await Invoice.findAll({
      where: {
        companyId,
        status: 'paid',
        date: {
          [Op.between]: [startDate.toISOString(), endDate.toISOString()]
        }
      }
    });

    const expenses = await Expense.findAll({
      where: {
        companyId,
        status: 'approved',
        date: {
          [Op.between]: [startDate.toISOString(), endDate.toISOString()]
        }
      }
    });

    const revenue = invoices.reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
    const expenseTotal = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

    // Calculer le coût des marchandises vendues
    let costOfGoodsSold = 0;
    for (const invoice of invoices) {
      try {
        const items = JSON.parse(invoice.items || '[]');
        for (const item of items) {
          if (item.productId) {
            const product = await Product.findByPk(item.productId);
            if (product) {
              const purchasePrice = parseFloat(product.costPrice) || 0;
              costOfGoodsSold += purchasePrice * (item.quantity || 0);
            }
          }
        }
      } catch (e) {
        console.error('Error parsing invoice items:', e);
      }
    }

    const grossProfit = revenue - costOfGoodsSold;
    const netProfit = grossProfit - expenseTotal;
    const profitMargin = revenue > 0 ? (netProfit / revenue) * 100 : 0;

    res.json({
      success: true,
      data: {
        period: month ? `${year}-${month}` : year.toString(),
        year: parseInt(year),
        month: month ? parseInt(month) : null,
        revenue,
        costOfGoodsSold,
        grossProfit,
        expenses: expenseTotal,
        netProfit,
        profitMargin: profitMargin.toFixed(2),
        invoiceCount: invoices.length,
        expenseCount: expenses.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Rapport de stock faible
 */
export const getLowStockReport = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const products = await Product.findAll({
      where: {
        companyId,
        trackStock: true,
        [Op.and]: [
          { currentStock: { [Op.lte]: Product.sequelize.col('minStockLevel') } }
        ]
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['currentStock', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        count: products.length,
        products
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Rapport de rupture de stock
 */
export const getOutOfStockReport = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const products = await Product.findAll({
      where: {
        companyId,
        trackStock: true,
        currentStock: 0
      },
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: {
        count: products.length,
        products
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Activité récente - Filtrée par utilisateur
 */
export const getActivityReport = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { limit = 20 } = req.query;

    // Construction des where
    let invoiceWhere = { companyId };
    let expenseWhere = { companyId };

    // Appliquer le filtre utilisateur si caissier
    if (userRole === 'cashier') {
      invoiceWhere.userId = userId;
    }

    const [recentInvoices, recentExpenses] = await Promise.all([
      Invoice.findAll({
        where: invoiceWhere,
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'name']
          },
          {
            model: User,
            as: 'creator',
            attributes: ['id', 'name']
          }
        ],
        order: [['date', 'DESC']],
        limit: parseInt(limit) / 2
      }),
      Expense.findAll({
        where: expenseWhere,
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name']
          }
        ],
        order: [['date', 'DESC']],
        limit: parseInt(limit) / 2
      })
    ]);

    const activity = [
      ...recentInvoices.map(inv => ({
        type: 'invoice',
        id: inv.id,
        reference: inv.invoiceNumber,
        amount: parseFloat(inv.total) || 0,
        date: inv.date,
        customer: inv.customer?.name,
        userName: inv.creator?.name,
        status: inv.status
      })),
      ...recentExpenses.map(exp => ({
        type: 'expense',
        id: exp.id,
        reference: exp.title,
        amount: parseFloat(exp.amount) || 0,
        date: exp.date,
        userName: exp.user?.name,
        status: exp.status
      }))
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, parseInt(limit));

    res.json({
      success: true,
      data: activity
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Statistiques par caissier (admin/supervisor seulement)
 */
export const getCashierStats = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const userRole = req.user.role;

    // Vérifier que l'utilisateur est admin ou supervisor
    if (userRole === 'cashier') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { startDate, endDate } = req.query;

    // Récupérer tous les utilisateurs de l'entreprise
    const users = await User.findAll({
      where: { company_id: companyId },
      attributes: ['id', 'name', 'email']
    });

    // Récupérer les stats pour chaque utilisateur
    const stats = await Promise.all(
      users.map(async (user) => {
        let where = { companyId, userId: user.id, status: 'paid' };
        
        if (startDate && endDate) {
          where.date = {
            [Op.between]: [startDate, endDate]
          };
        }

        const userInvoices = await Invoice.findAll({ where });
        
        const total = userInvoices.reduce((sum, inv) => sum + parseFloat(inv.total || 0), 0);
        const count = userInvoices.length;

        return {
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          invoiceCount: count,
          totalAmount: total,
          averageAmount: count > 0 ? total / count : 0
        };
      })
    );

    // Trier par totalAmount décroissant
    stats.sort((a, b) => b.totalAmount - a.totalAmount);

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Exporter un rapport
 */
export const exportReport = async (req, res, next) => {
  try {
    const { type, format = 'json' } = req.query;

    res.json({
      success: true,
      message: 'Export functionality not yet implemented',
      data: { type, format }
    });
  } catch (error) {
    next(error);
  }
};

// Export all functions
export default {
  getSalesReport,
  getProfitReport,
  getInventoryReport,
  getCustomerReport,
  getTopProducts,
  getDashboard,
  getExpenseReport,
  getLowPerformingProducts,
  getRevenueTrend,
  getProfitLossReport,
  getLowStockReport,
  getOutOfStockReport,
  getActivityReport,
  getCashierStats,
  exportReport
};