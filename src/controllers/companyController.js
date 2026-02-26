// src/controllers/companyController.js
import { Company, User, Product, Customer, Invoice, Expense, Category, Settings } from '../models/index.js';
import { NotFoundError, ValidationError } from '../utils/helpers.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Récupérer les informations de l'entreprise
 */
export const getCompany = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const company = await Company.findByPk(companyId, {
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'name', 'email', 'role', 'phone', 'is_active'],
          separate: true,
          limit: 10
        }
      ]
    });

    if (!company) {
      throw new NotFoundError('Company not found');
    }

    res.json({
      success: true,
      data: company
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour les informations de l'entreprise
 */
export const updateCompany = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { name, email, phone, address, city, country, taxId, currency, timezone, logoUrl } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update company settings'
      });
    }

    const company = await Company.findByPk(companyId);

    if (!company) {
      throw new NotFoundError('Company not found');
    }

    const updateData = {};
    
    if (name) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (country !== undefined) updateData.country = country;
    if (taxId !== undefined) updateData.taxId = taxId;
    if (currency) updateData.currency = currency;
    if (timezone) updateData.timezone = timezone;
    if (logoUrl !== undefined) updateData.logo = logoUrl;

    await company.update(updateData);

    const updatedCompany = await Company.findByPk(companyId, {
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'name', 'email', 'role']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedCompany,
      message: 'Company updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les statistiques de l'entreprise
 */
export const getCompanyStats = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const [
      usersCount,
      productsCount,
      customersCount,
      invoicesCount,
      categoriesCount
    ] = await Promise.all([
      User.count({ where: { company_id: companyId } }),
      Product.count({ where: { companyId } }),
      Customer.count({ where: { companyId } }),
      Invoice.count({ where: { companyId } }),
      Category.count({ where: { companyId } })
    ]);

    const invoices = await Invoice.findAll({
      where: { companyId },
      attributes: ['total']
    });

    const totalSales = invoices.reduce((sum, inv) => {
      const total = parseFloat(inv.total) || 0;
      return sum + total;
    }, 0);

    const products = await Product.findAll({
      where: { companyId },
      attributes: ['currentStock', 'costPrice']
    });

    const inventoryValue = products.reduce((sum, prod) => {
      const stock = parseInt(prod.currentStock) || 0;
      const price = parseFloat(prod.costPrice) || 0;
      return sum + (stock * price);
    }, 0);

    res.json({
      success: true,
      data: {
        users: usersCount,
        products: productsCount,
        customers: customersCount,
        invoices: invoicesCount,
        categories: categoriesCount,
        totalSales,
        inventoryValue
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les paramètres de l'entreprise
 */
export const getCompanySettings = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    // Chercher dans la table settings
    let settings = await Settings.findOne({
      where: { companyId }
    });

    // Si aucun paramètre n'existe, en créer par défaut
    if (!settings) {
      settings = await Settings.create({
        id: uuidv4(),
        companyId,
        currency: 'USD',
        timezone: 'UTC',
        dateFormat: 'DD/MM/YYYY',
        invoicePrefix: 'INV-',
        taxRate: 0,
        lowStockThreshold: 5
      });
    }

    res.json({
      success: true,
      data: {
        currency: settings.currency || 'USD',
        timezone: settings.timezone || 'UTC',
        dateFormat: settings.dateFormat || 'DD/MM/YYYY',
        invoicePrefix: settings.invoicePrefix || 'INV-',
        taxRate: parseFloat(settings.taxRate) || 0,
        lowStockThreshold: parseInt(settings.lowStockThreshold) || 5
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour les paramètres de l'entreprise
 */
export const updateCompanySettings = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { currency, timezone, dateFormat, invoicePrefix, taxRate, lowStockThreshold } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can update company settings'
      });
    }

    let settings = await Settings.findOne({
      where: { companyId }
    });

    if (!settings) {
      settings = await Settings.create({
        id: uuidv4(),
        companyId
      });
    }

    const updateData = {};
    
    if (currency !== undefined) updateData.currency = currency;
    if (timezone !== undefined) updateData.timezone = timezone;
    if (dateFormat !== undefined) updateData.dateFormat = dateFormat;
    if (invoicePrefix !== undefined) updateData.invoicePrefix = invoicePrefix;
    if (taxRate !== undefined) updateData.taxRate = taxRate;
    if (lowStockThreshold !== undefined) updateData.lowStockThreshold = lowStockThreshold;

    await settings.update(updateData);

    res.json({
      success: true,
      data: {
        currency: settings.currency || 'USD',
        timezone: settings.timezone || 'UTC',
        dateFormat: settings.dateFormat || 'DD/MM/YYYY',
        invoicePrefix: settings.invoicePrefix || 'INV-',
        taxRate: parseFloat(settings.taxRate) || 0,
        lowStockThreshold: parseInt(settings.lowStockThreshold) || 5
      },
      message: 'Company settings updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer l'activité récente de l'entreprise
 */
export const getCompanyActivity = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { limit = 20 } = req.query;

    const [recentInvoices, recentExpenses] = await Promise.all([
      Invoice.findAll({
        where: { companyId },
        attributes: ['id', 'invoiceNumber', 'total', 'date'],
        order: [['date', 'DESC']],
        limit: Math.floor(parseInt(limit) / 2)
      }),
      Expense.findAll({
        where: { companyId },
        attributes: ['id', 'title', 'amount', 'date'],
        order: [['date', 'DESC']],
        limit: Math.floor(parseInt(limit) / 2)
      })
    ]);

    // Formater l'activité
    const activity = [
      ...recentInvoices.map(inv => ({
        type: 'invoice',
        id: inv.id,
        description: `Invoice ${inv.invoiceNumber || inv.id.substring(0, 8)}`,
        amount: parseFloat(inv.total) || 0,
        date: inv.date
      })),
      ...recentExpenses.map(exp => ({
        type: 'expense',
        id: exp.id,
        description: exp.title || 'Expense',
        amount: parseFloat(exp.amount) || 0,
        date: exp.date
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
 * Récupérer le tableau de bord de l'entreprise
 */
export const getCompanyDashboard = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const [
      stats,
      recentInvoices,
      lowStockProducts,
      topCustomers
    ] = await Promise.all([
      getCompanyStats(req, res, () => {}),
      Invoice.findAll({
        where: { companyId },
        include: [
          {
            model: Customer,
            as: 'customer',
            attributes: ['id', 'name']
          }
        ],
        order: [['date', 'DESC']],
        limit: 10
      }),
      Product.findAll({
        where: { 
          companyId,
          [Op.and]: [
            sequelize.where(
              sequelize.col('currentStock'), 
              '<=', 
              sequelize.col('minStockLevel')
            )
          ]
        },
        order: [['currentStock', 'ASC']],
        limit: 10
      }),
      Customer.findAll({
        where: { companyId },
        attributes: [
          'id', 'name', 'email', 'totalSpent', 
          [sequelize.fn('COUNT', sequelize.col('invoices.id')), 'invoiceCount']
        ],
        include: [{
          model: Invoice,
          as: 'invoices',
          attributes: [],
          required: false
        }],
        group: ['Customer.id'],
        order: [[sequelize.literal('totalSpent'), 'DESC']],
        limit: 5,
        subQuery: false
      })
    ]);

    res.json({
      success: true,
      data: {
        stats: stats.data,
        recentInvoices,
        lowStockProducts,
        topCustomers
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer toutes les entreprises (admin seulement)
 */
export const getAllCompanies = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view all companies'
      });
    }

    const { page = 1, limit = 20, search } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = {};
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    const { count, rows: companies } = await Company.findAndCountAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'users',
          attributes: ['id', 'name', 'email', 'role'],
          required: false,
          separate: true,
          limit: 5
        },
        {
          model: User,
          as: 'owner',
          attributes: ['id', 'name', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      distinct: true
    });

    res.json({
      success: true,
      data: companies,
      pagination: {
        total: count,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    next(error);
  }
};

// Export all functions
export default {
  getCompany,
  updateCompany,
  getCompanyStats,
  getCompanySettings,
  updateCompanySettings,
  getCompanyActivity,
  getCompanyDashboard,
  getAllCompanies
};