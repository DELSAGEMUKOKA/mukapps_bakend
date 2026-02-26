// src/controllers/categoryController.js
import { Category } from '../models/index.js';
import { NotFoundError, ValidationError } from '../utils/helpers.js';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';
import sequelize from '../config/database.js';

/**
 * Créer une nouvelle catégorie
 */
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, color } = req.body;
    const companyId = req.user.companyId;

    // Vérifier si une catégorie avec le même nom existe déjà
    const existingCategory = await Category.findOne({
      where: { 
        name, 
        companyId 
      }
    });

    if (existingCategory) {
      throw new ValidationError('A category with this name already exists');
    }

    // Créer la catégorie
    const category = await Category.create({
      id: uuidv4(),
      name,
      description: description || '',
      color: color || '#3B82F6',
      companyId,
      createdAt: new Date(),
      updatedAt: new Date(),
      _export_date: new Date()
    });

    res.status(201).json({
      success: true,
      data: category,
      message: 'Category created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer toutes les catégories d'une entreprise
 */
export const getCategories = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { page = 1, limit = 5000, search } = req.query;
    const offset = (page - 1) * limit;

    // Construire la requête
    const whereClause = { companyId };
    
    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    // ✅ CORRECTION: Utiliser findAndCountAll au lieu de findByCompany
    const { count, rows: categories } = await Category.findAndCountAll({
      where: whereClause,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: categories,
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
 * Récupérer une catégorie par ID
 */
export const getCategoryById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    // ✅ CORRECTION: Utiliser findOne au lieu de findById
    const category = await Category.findOne({
      where: { 
        id,
        companyId 
      }
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Mettre à jour une catégorie
 */
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;
    const { name, description, color } = req.body;

    // Trouver la catégorie
    const category = await Category.findOne({
      where: { 
        id,
        companyId 
      }
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // Vérifier si le nouveau nom existe déjà (si changé)
    if (name && name !== category.name) {
      const existingCategory = await Category.findOne({
        where: { 
          name, 
          companyId,
          id: { [Op.ne]: id }
        }
      });
      
      if (existingCategory) {
        throw new ValidationError('A category with this name already exists');
      }
    }

    // ✅ CORRECTION: Utiliser update au lieu de Category.update()
    await category.update({
      name: name || category.name,
      description: description !== undefined ? description : category.description,
      color: color || category.color,
      updatedAt: new Date()
    });

    res.json({
      success: true,
      data: category,
      message: 'Category updated successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer une catégorie
 */
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    // Trouver la catégorie
    const category = await Category.findOne({
      where: { 
        id,
        companyId 
      }
    });

    if (!category) {
      throw new NotFoundError('Category not found');
    }

    // Vérifier si des produits utilisent cette catégorie
    const productCount = await sequelize.models.Product?.count({
      where: { categoryId: id }
    }) || 0;

    if (productCount > 0) {
      throw new ValidationError('Cannot delete category because it has associated products');
    }

    // ✅ CORRECTION: Utiliser destroy au lieu de Category.delete()
    await category.destroy();

    res.json({
      success: true,
      message: 'Category deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer toutes les catégories (sans pagination)
 */
export const getAllCategories = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const categories = await Category.findAll({
      where: { companyId },
      order: [['name', 'ASC']]
    });

    res.json({
      success: true,
      data: categories
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les statistiques des catégories
 */
export const getCategoryStats = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const stats = await Category.findAll({
      where: { companyId },
      attributes: [
        'id',
        'name',
        'color',
        [sequelize.fn('COUNT', sequelize.col('products.id')), 'productCount']
      ],
      include: [{
        model: sequelize.models.Product,
        attributes: [],
        required: false
      }],
      group: ['Category.id'],
      order: [[sequelize.fn('COUNT', sequelize.col('products.id')), 'DESC']]
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
};