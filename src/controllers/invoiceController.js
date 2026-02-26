// src/controllers/invoiceController.js
import { Invoice, Customer, Product, User, Company } from '../models/index.js';
import { NotFoundError, ValidationError } from '../utils/helpers.js';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

/**
 * Créer une nouvelle facture
 */
export const createInvoice = async (req, res, next) => {
  try {
    const {
      customerId,
      customerName,
      items,
      subtotal,
      tax,
      discount,
      discountPercentage,
      total,
      paymentMethod,
      status,
      notes,
      deliveryAddress
    } = req.body;

    const companyId = req.user.companyId;
    const userId = req.user.id; // CORRIGÉ: userId → id

    // Validation
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Items are required and must be a non-empty array'
      });
    }

    if (!total) {
      return res.status(400).json({
        success: false,
        message: 'Total amount is required'
      });
    }

    // Vérifier que tous les produits existent et appartiennent à l'entreprise
    for (const item of items) {
      if (!item.productId) {
        return res.status(400).json({
          success: false,
          message: 'Each item must have a productId'
        });
      }

      const product = await Product.findOne({
        where: {
          id: item.productId,
          companyId
        }
      });

      if (!product) {
        return res.status(400).json({
          success: false,
          message: `Product with ID ${item.productId} not found in your company`
        });
      }

      // Mettre à jour le stock si nécessaire
      if (product.trackStock) {
        const newStock = product.currentStock - (item.quantity || 0);
        if (newStock < 0) {
          return res.status(400).json({
            success: false,
            message: `Insufficient stock for product ${product.name}`
          });
        }
        await product.update({ currentStock: newStock });
      }
    }

    // Vérifier que le client existe (si fourni)
    if (customerId) {
      const customer = await Customer.findOne({
        where: {
          id: customerId,
          companyId
        }
      });

      if (!customer) {
        return res.status(400).json({
          success: false,
          message: 'Customer not found in your company'
        });
      }

      // Mettre à jour les statistiques du client
      const totalSpent = parseFloat(customer.totalSpent || 0) + parseFloat(total);
      const totalPurchases = parseInt(customer.totalPurchases || 0) + 1;

      await customer.update({
        totalSpent: totalSpent.toString(),
        totalPurchases: totalPurchases.toString(),
        lastPurchaseDate: new Date().toISOString()
      });
    }

    // Générer un numéro de facture unique
    const invoiceNumber = `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

    // Générer un ID unique pour la facture
    const invoiceId = uuidv4();

    // Créer la facture
    const invoice = await Invoice.create({
      id: invoiceId,
      invoiceNumber,
      customerId: customerId || null,
      customerName: customerName || null,
      items: JSON.stringify(items),
      subtotal: subtotal?.toString() || total.toString(),
      tax: tax?.toString() || '0',
      discount: discount?.toString() || '0',
      discountPercentage: discountPercentage?.toString() || '0',
      total: total.toString(),
      paymentMethod: paymentMethod || 'cash',
      status: status || 'paid',
      notes: notes || null,
      deliveryAddress: deliveryAddress || null,
      date: new Date().toISOString(),
      userId,
      companyId,
      companyInfo: null,
      paymentDate: status === 'paid' ? new Date().toISOString() : null,
      _export_date: new Date()
    });

    // Récupérer la facture avec les relations
    const createdInvoice = await Invoice.findByPk(invoice.id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdInvoice,
      message: 'Invoice created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer toutes les factures - AVEC FILTRAGE PAR RÔLE
 */
export const getInvoices = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const { 
      page = 1, 
      limit = 5000, 
      startDate, 
      endDate, 
      customerId, 
      status,
      search,
      userId: filterUserId // Pour filtrer par utilisateur spécifique (admin seulement)
    } = req.query;
    
    const offset = (page - 1) * limit;

    // ✅ CONSTRUCTION DU WHERE AVEC FILTRAGE PAR RÔLE
    const where = { companyId };

    // ✅ SI CAISSIER, NE VOIT QUE SES PROPRES FACTURES
    if (userRole === 'cashier') {
      where.userId = userId;
    }
    
    // ✅ SI ADMIN/SUPERVISEUR, PEUT FILTRER PAR UTILISATEUR SPÉCIFIQUE
    if (userRole !== 'cashier' && filterUserId) {
      where.userId = filterUserId;
    }

    // Filtres supplémentaires
    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    if (customerId) {
      where.customerId = customerId;
    }

    if (status) {
      where.status = status;
    }

    if (search) {
      where[Op.or] = [
        { invoiceNumber: { [Op.like]: `%${search}%` } },
        { customerName: { [Op.like]: `%${search}%` } }
      ];
    }

    const { rows: invoices, count } = await Invoice.findAndCountAll({
      where,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC']],
      distinct: true
    });

    // Parse les items JSON pour chaque facture
    const invoicesWithParsedItems = invoices.map(inv => {
      const invoice = inv.toJSON();
      try {
        invoice.items = JSON.parse(invoice.items || '[]');
      } catch {
        invoice.items = [];
      }
      return invoice;
    });

    res.json({
      success: true,
      data: invoicesWithParsedItems,
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

/**
 * Récupérer une facture par ID - AVEC VÉRIFICATION DE PROPRIÉTÉ
 */
export const getInvoiceById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const userRole = req.user.role;

    // ✅ CONSTRUCTION DU WHERE AVEC VÉRIFICATION
    const where = {
      id,
      companyId
    };

    // ✅ SI CAISSIER, NE PEUT VOIR QUE SES PROPRES FACTURES
    if (userRole === 'cashier') {
      where.userId = userId;
    }

    const invoice = await Invoice.findOne({
      where,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'email', 'phone', 'address']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    // Parser les items
    const invoiceData = invoice.toJSON();
    try {
      invoiceData.items = JSON.parse(invoiceData.items || '[]');
    } catch {
      invoiceData.items = [];
    }

    res.json({
      success: true,
      data: invoiceData
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour une facture
 */
export const updateInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const userRole = req.user.role;
    
    const {
      paymentMethod,
      status,
      notes,
      deliveryAddress
    } = req.body;

    // ✅ CONSTRUCTION DU WHERE AVEC VÉRIFICATION
    const where = {
      id,
      companyId
    };

    // ✅ SI CAISSIER, NE PEUT MODIFIER QUE SES PROPRES FACTURES
    if (userRole === 'cashier') {
      where.userId = userId;
    }

    const invoice = await Invoice.findOne({ where });

    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    // ✅ VÉRIFICATION SUPPLÉMENTAIRE POUR LES CAISSIERS
    if (userRole === 'cashier' && invoice.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own invoices'
      });
    }

    const updateData = {};

    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (status !== undefined) {
      updateData.status = status;
      if (status === 'paid' && invoice.status !== 'paid') {
        updateData.paymentDate = new Date().toISOString();
      }
    }
    if (notes !== undefined) updateData.notes = notes;
    if (deliveryAddress !== undefined) updateData.deliveryAddress = deliveryAddress;

    await invoice.update(updateData);

    res.json({
      success: true,
      data: invoice,
      message: 'Invoice updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Annuler une facture
 */
export const cancelInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const userRole = req.user.role;

    // ✅ CONSTRUCTION DU WHERE AVEC VÉRIFICATION
    const where = {
      id,
      companyId
    };

    // ✅ SI CAISSIER, NE PEUT ANNULER QUE SES PROPRES FACTURES
    if (userRole === 'cashier') {
      where.userId = userId;
    }

    const invoice = await Invoice.findOne({ where });

    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    // ✅ VÉRIFICATION SUPPLÉMENTAIRE POUR LES CAISSIERS
    if (userRole === 'cashier' && invoice.userId !== userId) {
      return res.status(403).json({
        success: false,
        message: 'You can only cancel your own invoices'
      });
    }

    if (invoice.status === 'cancelled') {
      return res.status(400).json({
        success: false,
        message: 'Invoice is already cancelled'
      });
    }

    // Restaurer le stock
    try {
      const items = JSON.parse(invoice.items || '[]');
      for (const item of items) {
        if (item.productId) {
          const product = await Product.findOne({
            where: {
              id: item.productId,
              companyId
            }
          });
          if (product && product.trackStock) {
            await product.update({
              currentStock: product.currentStock + (item.quantity || 0)
            });
          }
        }
      }
    } catch (e) {
      console.error('Error restoring stock:', e);
    }

    await invoice.update({
      status: 'cancelled'
    });

    res.json({
      success: true,
      message: 'Invoice cancelled successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer une facture (admin seulement)
 */
export const deleteInvoice = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    // Vérifier que l'utilisateur est admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete invoices'
      });
    }

    const invoice = await Invoice.findOne({
      where: {
        id,
        companyId
      }
    });

    if (!invoice) {
      throw new NotFoundError('Invoice not found');
    }

    await invoice.destroy();

    res.json({
      success: true,
      message: 'Invoice deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les statistiques des factures - AVEC FILTRAGE PAR RÔLE
 */
export const getInvoiceStats = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { period = 'month' } = req.query;

    const now = new Date();
    let startDate;

    switch (period) {
      case 'day':
        startDate = new Date(now.setHours(0, 0, 0, 0));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      case 'year':
        startDate = new Date(now.setFullYear(now.getFullYear() - 1));
        break;
      default:
        startDate = new Date(now.setMonth(now.getMonth() - 1));
    }

    // ✅ CONSTRUCTION DU WHERE AVEC FILTRAGE PAR RÔLE
    const where = {
      companyId,
      date: { [Op.gte]: startDate.toISOString() },
      status: 'paid'
    };

    // ✅ SI CAISSIER, NE VOIT QUE SES PROPRES STATISTIQUES
    if (userRole === 'cashier') {
      where.userId = userId;
    }

    const invoices = await Invoice.findAll({ where });

    const totalRevenue = invoices.reduce((sum, inv) => {
      return sum + (parseFloat(inv.total) || 0);
    }, 0);

    // ✅ STATISTIQUES PAR UTILISATEUR (POUR ADMIN)
    let byUser = null;
    if (userRole !== 'cashier') {
      const userStats = {};
      for (const inv of invoices) {
        const userName = inv.userId;
        if (!userStats[userName]) {
          const user = await User.findByPk(userName, { attributes: ['name'] });
          userStats[userName] = {
            userId: userName,
            userName: user?.name || 'Inconnu',
            count: 0,
            total: 0
          };
        }
        userStats[userName].count += 1;
        userStats[userName].total += parseFloat(inv.total || 0);
      }
      byUser = Object.values(userStats);
    }

    const stats = {
      period,
      totalInvoices: invoices.length,
      totalRevenue,
      averagePerInvoice: invoices.length > 0 ? totalRevenue / invoices.length : 0,
      byUser, // Statistiques par utilisateur (admin seulement)
      byStatus: {
        paid: invoices.length,
        pending: 0,
        cancelled: 0
      }
    };

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les factures d'un client - AVEC FILTRAGE PAR RÔLE
 */
export const getCustomerInvoices = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const companyId = req.user.companyId;
    const userId = req.user.id;
    const userRole = req.user.role;

    // ✅ CONSTRUCTION DU WHERE AVEC FILTRAGE PAR RÔLE
    const where = {
      customerId,
      companyId
    };

    // ✅ SI CAISSIER, NE VOIT QUE SES PROPRES FACTURES POUR CE CLIENT
    if (userRole === 'cashier') {
      where.userId = userId;
    }

    const invoices = await Invoice.findAll({
      where,
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'creator',
          attributes: ['id', 'name']
        }
      ],
      order: [['date', 'DESC']]
    });

    res.json({
      success: true,
      data: invoices
    });
  } catch (error) {
    next(error);
  }
};

/**
 * ✅ NOUVELLE FONCTION: Récupérer les statistiques par caissier (admin seulement)
 */
export const getCashierStats = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    
    // Vérifier que l'utilisateur est admin ou supervisor
    if (req.user.role === 'cashier') {
      return res.status(403).json({
        success: false,
        message: 'Access denied'
      });
    }

    const { startDate, endDate } = req.query;

    const where = { companyId };
    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    // Récupérer tous les utilisateurs de l'entreprise
    const users = await User.findAll({
      where: { company_id: companyId },
      attributes: ['id', 'name', 'email']
    });

    // Récupérer les stats pour chaque utilisateur
    const stats = await Promise.all(
      users.map(async (user) => {
        const userInvoices = await Invoice.findAll({
          where: {
            ...where,
            userId: user.id,
            status: 'paid'
          }
        });

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

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};

// ✅ Export de toutes les fonctions
export default {
  createInvoice,
  getInvoices,
  getInvoiceById,
  updateInvoice,
  cancelInvoice,
  deleteInvoice,
  getInvoiceStats,
  getCustomerInvoices,
  getCashierStats // ✅ Nouvelle fonction exportée
};