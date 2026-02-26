// src/controllers/customerController.js
import { Customer, Invoice } from '../models/index.js';
import { NotFoundError, ValidationError } from '../utils/helpers.js';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

/**
 * Créer un nouveau client
 */
export const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, address, city, taxId } = req.body;
    const companyId = req.user.companyId;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        message: 'Customer name is required'
      });
    }

    // Vérifier si l'email existe déjà (si fourni)
    if (email) {
      const existingCustomer = await Customer.findOne({
        where: {
          email,
          companyId
        }
      });

      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: 'A customer with this email already exists in your company'
        });
      }
    }

    // ✅ Générer un ID unique
    const customerId = uuidv4();

    // Créer le client
    const customer = await Customer.create({
      id: customerId,
      name,
      email: email || null,
      phone: phone || null,
      address: address || null,
      city: city || null,
      taxId: taxId || null,
      companyId,
      type: 'individual',
      totalPurchases: '0',
      totalSpent: '0',
      loyaltyPoints: '0',
      isVip: '0',
      discountPercentage: '0',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _export_date: new Date()
    });

    res.status(201).json({
      success: true,
      data: customer,
      message: 'Customer created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer tous les clients avec pagination
 */
export const getCustomers = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { page = 1, limit = 20, search, isVip } = req.query;
    const offset = (page - 1) * limit;

    // Construire la clause WHERE
    const whereClause = { companyId };

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    if (isVip !== undefined) {
      whereClause.isVip = isVip === 'true' ? '1' : '0';
    }

    // Exécuter la requête avec pagination
    const { count, rows: customers } = await Customer.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']],
      distinct: true
    });

    res.json({
      success: true,
      data: customers,
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
 * Récupérer un client par ID
 */
export const getCustomerById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    // ✅ Utiliser findOne avec les bonnes conditions
    const customer = await Customer.findOne({
      where: {
        id,
        companyId
      }
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    res.json({
      success: true,
      data: customer
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour un client
 */
export const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const { name, email, phone, address, city, taxId } = req.body;

    // Trouver le client
    const customer = await Customer.findOne({
      where: {
        id,
        companyId
      }
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // Vérifier l'unicité de l'email si modifié
    if (email && email !== customer.email) {
      const existingCustomer = await Customer.findOne({
        where: {
          email,
          companyId,
          id: { [Op.ne]: id }
        }
      });

      if (existingCustomer) {
        return res.status(400).json({
          success: false,
          message: 'A customer with this email already exists in your company'
        });
      }
    }

    // Préparer les données de mise à jour
    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (phone !== undefined) updateData.phone = phone;
    if (address !== undefined) updateData.address = address;
    if (city !== undefined) updateData.city = city;
    if (taxId !== undefined) updateData.taxId = taxId;

    // ✅ Mettre à jour avec Sequelize (pas Supabase)
    await customer.update(updateData);

    res.json({
      success: true,
      data: customer,
      message: 'Customer updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un client
 */
export const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    // Trouver le client
    const customer = await Customer.findOne({
      where: {
        id,
        companyId
      }
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // Vérifier si le client a des factures
    const invoiceCount = await Invoice.count({
      where: { customerId: id }
    });

    if (invoiceCount > 0) {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete customer with existing invoices'
      });
    }

    // ✅ Supprimer avec Sequelize (pas Supabase)
    await customer.destroy();

    res.json({
      success: true,
      message: 'Customer deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les statistiques d'un client
 */
export const getCustomerStats = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    // Trouver le client
    const customer = await Customer.findOne({
      where: {
        id,
        companyId
      }
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // Récupérer les factures du client
    const invoices = await Invoice.findAll({
      where: {
        customerId: id,
        companyId
      },
      attributes: ['id', 'total', 'date', 'invoiceNumber'],
      order: [['date', 'DESC']],
      limit: 50
    });

    // Calculer les statistiques
    const totalSpent = invoices.reduce((sum, inv) => {
      return sum + (parseFloat(inv.total) || 0);
    }, 0);

    const stats = {
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        isVip: customer.isVip === '1'
      },
      totalPurchases: invoices.length,
      totalSpent,
      averagePerPurchase: invoices.length > 0 ? totalSpent / invoices.length : 0,
      lastPurchase: invoices[0] || null,
      recentInvoices: invoices.slice(0, 5)
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
 * Rechercher des clients
 */
export const searchCustomers = async (req, res, next) => {
  try {
    const { q } = req.query;
    const companyId = req.user.companyId;

    if (!q) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const customers = await Customer.findAll({
      where: {
        companyId,
        [Op.or]: [
          { name: { [Op.like]: `%${q}%` } },
          { email: { [Op.like]: `%${q}%` } },
          { phone: { [Op.like]: `%${q}%` } }
        ]
      },
      limit: 20,
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les clients VIP
 */
export const getVipCustomers = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const customers = await Customer.findAll({
      where: {
        companyId,
        isVip: '1'
      },
      order: [['totalSpent', 'DESC']],
      limit: 50
    });

    res.json({
      success: true,
      data: customers
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ajouter une note à un client
 */
export const addNote = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { note } = req.body;
    const companyId = req.user.companyId;

    if (!note) {
      return res.status(400).json({
        success: false,
        message: 'Note is required'
      });
    }

    const customer = await Customer.findOne({
      where: {
        id,
        companyId
      }
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    // Ajouter la note aux notes existantes
    const currentNotes = customer.notes || '';
    const newNotes = currentNotes 
      ? `${currentNotes}\n[${new Date().toLocaleDateString()}] ${note}`
      : `[${new Date().toLocaleDateString()}] ${note}`;

    await customer.update({
      notes: newNotes,
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      data: customer,
      message: 'Note added successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour le statut VIP
 */
export const toggleVipStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { isVip } = req.body;
    const companyId = req.user.companyId;

    const customer = await Customer.findOne({
      where: {
        id,
        companyId
      }
    });

    if (!customer) {
      throw new NotFoundError('Customer not found');
    }

    await customer.update({
      isVip: isVip ? '1' : '0',
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      data: customer,
      message: `Customer ${isVip ? 'marked as VIP' : 'removed from VIP'}`
    });
  } catch (error) {
    next(error);
  }
};