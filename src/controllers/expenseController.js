// src/controllers/expenseController.js
import { Expense, User, Company } from '../models/index.js';
import { NotFoundError, ValidationError } from '../utils/helpers.js';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

/**
 * Créer une nouvelle dépense
 */
export const createExpense = async (req, res, next) => {
  try {
    const { title, description, amount, category, date, paymentMethod, receiptUrl } = req.body;
    const companyId = req.user.companyId;
    const userId = req.user.userId;

    // Validation
    if (!title) {
      return res.status(400).json({
        success: false,
        message: 'Title is required'
      });
    }

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: 'Amount is required'
      });
    }

    // Déterminer si approuvé automatiquement selon le rôle
    const isApproved = req.user.role === 'admin';

    // Générer un ID unique
    const expenseId = uuidv4();

    // Créer la dépense
    const expense = await Expense.create({
      id: expenseId,
      title,
      description: description || null,
      amount: amount.toString(),
      category: category || 'other',
      date: date || new Date().toISOString(),
      paymentMethod: paymentMethod || 'cash',
      receiptUrl: receiptUrl || null,
      status: isApproved ? 'approved' : 'pending',
      approvedBy: isApproved ? userId : null,
      approvedAt: isApproved ? new Date().toISOString() : null,
      userId,
      companyId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _export_date: new Date()
    });

    // ✅ CORRIGÉ: Remplacé 'user' par 'creator'
    const createdExpense = await Expense.findByPk(expense.id, {
      include: [
        {
          model: User,
          as: 'creator',  // ← Changé de 'user' à 'creator'
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdExpense,
      message: 'Expense created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer toutes les dépenses
 */
export const getExpenses = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { page = 1, limit = 20, search, category, status, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const where = { companyId };

    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    if (category) {
      where.category = category;
    }

    if (status) {
      where.status = status;
    }

    if (startDate) {
      where.date = { ...where.date, [Op.gte]: startDate };
    }

    if (endDate) {
      where.date = { ...where.date, [Op.lte]: endDate };
    }

    // ✅ CORRIGÉ: Remplacé 'user' par 'creator'
    const { rows: expenses, count } = await Expense.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'creator',  // ← Changé de 'user' à 'creator'
          attributes: ['id', 'name', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC']],
      distinct: true
    });

    res.json({
      success: true,
      data: expenses,
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
 * Récupérer une dépense par ID
 */
export const getExpenseById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    // ✅ CORRIGÉ: Remplacé 'user' par 'creator'
    const expense = await Expense.findOne({
      where: {
        id,
        companyId
      },
      include: [
        {
          model: User,
          as: 'creator',  // ← Changé de 'user' à 'creator'
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'approver',  // ← AJOUTÉ pour l'approbateur
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    res.json({
      success: true,
      data: expense
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour une dépense
 */
export const updateExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const { title, description, amount, category, date, paymentMethod, receiptUrl } = req.body;

    const expense = await Expense.findOne({
      where: {
        id,
        companyId
      }
    });

    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    const updateData = {
      updatedAt: new Date().toISOString()
    };

    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description;
    if (amount !== undefined) updateData.amount = amount.toString();
    if (category !== undefined) updateData.category = category;
    if (date !== undefined) updateData.date = date;
    if (paymentMethod !== undefined) updateData.paymentMethod = paymentMethod;
    if (receiptUrl !== undefined) updateData.receiptUrl = receiptUrl;

    await expense.update(updateData);

    // ✅ CORRIGÉ: Remplacé 'user' par 'creator'
    const updatedExpense = await Expense.findByPk(expense.id, {
      include: [
        {
          model: User,
          as: 'creator',  // ← Changé de 'user' à 'creator'
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedExpense,
      message: 'Expense updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Approuver une dépense
 */
export const approveExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const userId = req.user.userId;

    if (req.user.role !== 'admin' && req.user.role !== 'supervisor') {
      return res.status(403).json({
        success: false,
        message: 'Only admins and supervisors can approve expenses'
      });
    }

    const expense = await Expense.findOne({
      where: {
        id,
        companyId
      }
    });

    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    if (expense.status === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Expense is already approved'
      });
    }

    await expense.update({
      status: 'approved',
      approvedBy: userId,
      approvedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    // ✅ CORRIGÉ: Inclure à la fois creator et approver
    const updatedExpense = await Expense.findByPk(expense.id, {
      include: [
        {
          model: User,
          as: 'creator',  // ← Le créateur original
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'approver',  // ← L'approbateur
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      success: true,
      data: updatedExpense,
      message: 'Expense approved successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Rejeter une dépense
 */
export const rejectExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    if (req.user.role !== 'admin' && req.user.role !== 'supervisor') {
      return res.status(403).json({
        success: false,
        message: 'Only admins and supervisors can reject expenses'
      });
    }

    const expense = await Expense.findOne({
      where: {
        id,
        companyId
      }
    });

    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    await expense.update({
      status: 'rejected',
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      data: expense,
      message: 'Expense rejected successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer une dépense
 */
export const deleteExpense = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    const expense = await Expense.findOne({
      where: {
        id,
        companyId
      }
    });

    if (!expense) {
      throw new NotFoundError('Expense not found');
    }

    await expense.destroy();

    res.json({
      success: true,
      message: 'Expense deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les statistiques des dépenses
 */
export const getExpenseStats = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { startDate, endDate } = req.query;

    const where = { companyId };

    if (startDate) {
      where.date = { ...where.date, [Op.gte]: startDate };
    }

    if (endDate) {
      where.date = { ...where.date, [Op.lte]: endDate };
    }

    const expenses = await Expense.findAll({
      where,
      attributes: ['amount', 'category', 'status']
    });

    const totalExpenses = expenses.reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    
    const approvedExpenses = expenses
      .filter(exp => exp.status === 'approved')
      .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    
    const pendingExpenses = expenses
      .filter(exp => exp.status === 'pending')
      .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);
    
    const rejectedExpenses = expenses
      .filter(exp => exp.status === 'rejected')
      .reduce((sum, exp) => sum + (parseFloat(exp.amount) || 0), 0);

    const byCategory = expenses.reduce((acc, exp) => {
      const cat = exp.category || 'Uncategorized';
      acc[cat] = (acc[cat] || 0) + (parseFloat(exp.amount) || 0);
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        total: totalExpenses,
        approved: approvedExpenses,
        pending: pendingExpenses,
        rejected: rejectedExpenses,
        byCategory,
        count: expenses.length,
        approvedCount: expenses.filter(e => e.status === 'approved').length,
        pendingCount: expenses.filter(e => e.status === 'pending').length,
        rejectedCount: expenses.filter(e => e.status === 'rejected').length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les catégories de dépenses
 */
export const getExpenseCategories = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const expenses = await Expense.findAll({
      where: { companyId },
      attributes: ['category'],
      group: ['category']
    });

    const categories = expenses
      .map(exp => exp.category)
      .filter(cat => cat && cat !== '');

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

// Export all functions
export default {
  createExpense,
  getExpenses,
  getExpenseById,
  updateExpense,
  approveExpense,
  rejectExpense,
  deleteExpense,
  getExpenseStats,
  getExpenseCategories
};