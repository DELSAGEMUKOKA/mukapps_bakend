// src/controllers/stockController.js
import { StockMovement, Product, User, Category } from '../models/index.js';
import { NotFoundError, ValidationError } from '../utils/helpers.js';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

/**
 * Créer un mouvement de stock
 */
export const createStockMovement = async (req, res, next) => {
  try {
    const { productId, type, quantity, reference, notes } = req.body;
    const companyId = req.user.companyId;
    const userId = req.user.userId;

    // Validation du productId
    if (!productId) {
      return res.status(400).json({
        success: false,
        message: 'Product ID is required'
      });
    }

    // Validation du type
    if (!['in', 'out', 'adjustment'].includes(type)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid movement type. Must be: in, out, or adjustment'
      });
    }

    // Validation de la quantité
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Quantity must be a positive number'
      });
    }

    // Rechercher le produit
    const product = await Product.findOne({
      where: {
        id: productId,
        companyId
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found in your company'
      });
    }

    // Vérifier que le produit suit le stock
    if (!product.trackStock) {
      return res.status(400).json({
        success: false,
        message: 'Stock tracking is disabled for this product'
      });
    }

    // Calculer le nouveau stock
    const currentStock = parseInt(product.currentStock) || 0;
    const quantityNum = parseInt(quantity) || 0;
    
    let newStock = currentStock;
    if (type === 'in') {
      newStock = currentStock + quantityNum;
    } else if (type === 'out' || type === 'adjustment') {
      newStock = currentStock - quantityNum;
    }

    if (newStock < 0) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock'
      });
    }

    // Générer un ID unique
    const movementId = uuidv4();

    // Créer le mouvement
    const movement = await StockMovement.create({
      id: movementId,
      productId,
      type,
      quantity: quantityNum.toString(),
      previousStock: currentStock.toString(),
      currentStock: newStock.toString(),
      reason: type === 'adjustment' ? 'adjustment' : null,
      reference: reference || null,
      notes: notes || null,
      date: new Date().toISOString(),
      userId,
      companyId,
      createdAt: new Date().toISOString(),
      _export_date: new Date()
    });

    // Mettre à jour le stock du produit
    await product.update({
      currentStock: newStock,
      updatedAt: new Date().toISOString()
    });

    // ✅ CORRIGÉ: Remplacé 'user' par 'creator'
    const createdMovement = await StockMovement.findByPk(movement.id, {
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'barcode']
        },
        {
          model: User,
          as: 'creator',  // ← Changé de 'user' à 'creator'
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.status(201).json({
      success: true,
      data: createdMovement,
      message: 'Stock movement created successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer tous les mouvements de stock
 */
export const getStockMovements = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;
    const { page = 1, limit = 20, productId, type, startDate, endDate } = req.query;
    const offset = (page - 1) * limit;

    const where = { companyId };

    if (productId) {
      where.productId = productId;
    }

    if (type) {
      where.type = type;
    }

    if (startDate && endDate) {
      where.date = {
        [Op.between]: [startDate, endDate]
      };
    }

    // ✅ CORRIGÉ: Remplacé 'user' par 'creator'
    const { rows: movements, count } = await StockMovement.findAndCountAll({
      where,
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'barcode']
        },
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
      data: movements,
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
 * Récupérer un mouvement de stock par ID
 */
export const getStockMovementById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    // ✅ CORRIGÉ: Remplacé 'user' par 'creator'
    const movement = await StockMovement.findOne({
      where: {
        id,
        companyId
      },
      include: [
        {
          model: Product,
          as: 'product',
          attributes: ['id', 'name', 'barcode', 'currentStock']
        },
        {
          model: User,
          as: 'creator',  // ← Changé de 'user' à 'creator'
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!movement) {
      throw new NotFoundError('Stock movement not found');
    }

    res.json({
      success: true,
      data: movement
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les produits en stock faible
 */
export const getLowStockProducts = async (req, res, next) => {
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
      data: products,
      count: products.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer la valorisation du stock
 */
export const getStockValuation = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const products = await Product.findAll({
      where: { companyId },
      attributes: ['currentStock', 'costPrice', 'price']
    });

    const valuation = products.reduce((acc, product) => {
      const stock = parseInt(product.currentStock) || 0;
      const costPrice = parseFloat(product.costPrice) || 0;
      const sellingPrice = parseFloat(product.price) || 0;

      const purchaseValue = stock * costPrice;
      const sellingValue = stock * sellingPrice;

      acc.purchaseValue += purchaseValue;
      acc.sellingValue += sellingValue;
      acc.potentialProfit += sellingValue - purchaseValue;
      acc.totalItems += stock;

      return acc;
    }, {
      purchaseValue: 0,
      sellingValue: 0,
      potentialProfit: 0,
      totalItems: 0
    });

    res.json({
      success: true,
      data: {
        ...valuation,
        productCount: products.length
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Ajuster le stock manuellement
 */
export const adjustStock = async (req, res, next) => {
  try {
    const { productId, newStock, reason } = req.body;
    const companyId = req.user.companyId;
    const userId = req.user.userId;

    const product = await Product.findOne({
      where: {
        id: productId,
        companyId
      }
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const currentStock = parseInt(product.currentStock) || 0;
    const newStockNum = parseInt(newStock) || 0;
    const difference = newStockNum - currentStock;

    if (difference === 0) {
      return res.json({
        success: true,
        message: 'Stock is already at the desired level'
      });
    }

    const type = difference > 0 ? 'in' : 'out';
    const quantity = Math.abs(difference);

    // Créer le mouvement
    const movementId = uuidv4();
    const movement = await StockMovement.create({
      id: movementId,
      productId,
      type,
      quantity: quantity.toString(),
      previousStock: currentStock.toString(),
      currentStock: newStockNum.toString(),
      reason: 'adjustment',
      reference: 'ADJUSTMENT',
      notes: `Stock adjusted from ${currentStock} to ${newStockNum}. Reason: ${reason || 'Manual adjustment'}`,
      date: new Date().toISOString(),
      userId,
      companyId,
      createdAt: new Date().toISOString(),
      _export_date: new Date()
    });

    // Mettre à jour le stock
    await product.update({
      currentStock: newStockNum,
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      data: movement,
      message: 'Stock adjusted successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer les produits en rupture de stock
 */
export const getOutOfStockProducts = async (req, res, next) => {
  try {
    const companyId = req.user.companyId;

    const products = await Product.findAll({
      where: {
        companyId,
        currentStock: 0,
        trackStock: true
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
      data: products,
      count: products.length
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Récupérer l'historique des mouvements d'un produit
 */
export const getProductStockHistory = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const companyId = req.user.companyId;
    const { page = 1, limit = 50 } = req.query;
    const offset = (page - 1) * limit;

    const product = await Product.findOne({
      where: {
        id: productId,
        companyId
      }
    });

    if (!product) {
      throw new NotFoundError('Product not found');
    }

    // ✅ CORRIGÉ: Remplacé 'user' par 'creator'
    const { rows: movements, count } = await StockMovement.findAndCountAll({
      where: {
        productId,
        companyId
      },
      include: [
        {
          model: User,
          as: 'creator',  // ← Changé de 'user' à 'creator'
          attributes: ['id', 'name', 'email']
        }
      ],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['date', 'DESC']]
    });

    res.json({
      success: true,
      data: {
        product: {
          id: product.id,
          name: product.name,
          currentStock: product.currentStock
        },
        movements
      },
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
 * Transférer du stock entre produits
 */
export const transferStock = async (req, res, next) => {
  try {
    const { fromProductId, toProductId, quantity, notes } = req.body;
    const companyId = req.user.companyId;
    const userId = req.user.userId;

    const fromProduct = await Product.findOne({
      where: {
        id: fromProductId,
        companyId
      }
    });

    if (!fromProduct) {
      throw new NotFoundError('Source product not found');
    }

    const toProduct = await Product.findOne({
      where: {
        id: toProductId,
        companyId
      }
    });

    if (!toProduct) {
      throw new NotFoundError('Destination product not found');
    }

    const quantityNum = parseInt(quantity) || 0;

    if (fromProduct.currentStock < quantityNum) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient stock in source product'
      });
    }

    // Mouvement sortant
    const outMovementId = uuidv4();
    const outMovement = await StockMovement.create({
      id: outMovementId,
      productId: fromProductId,
      type: 'out',
      quantity: quantityNum.toString(),
      previousStock: fromProduct.currentStock.toString(),
      currentStock: (fromProduct.currentStock - quantityNum).toString(),
      reason: 'transfer',
      reference: `TRANSFER to ${toProduct.name}`,
      notes: notes || 'Stock transfer',
      date: new Date().toISOString(),
      userId,
      companyId,
      createdAt: new Date().toISOString(),
      _export_date: new Date()
    });

    // Mouvement entrant
    const inMovementId = uuidv4();
    const inMovement = await StockMovement.create({
      id: inMovementId,
      productId: toProductId,
      type: 'in',
      quantity: quantityNum.toString(),
      previousStock: toProduct.currentStock.toString(),
      currentStock: (toProduct.currentStock + quantityNum).toString(),
      reason: 'transfer',
      reference: `TRANSFER from ${fromProduct.name}`,
      notes: notes || 'Stock transfer',
      date: new Date().toISOString(),
      userId,
      companyId,
      createdAt: new Date().toISOString(),
      _export_date: new Date()
    });

    // Mettre à jour les stocks
    await fromProduct.update({
      currentStock: fromProduct.currentStock - quantityNum,
      updatedAt: new Date().toISOString()
    });

    await toProduct.update({
      currentStock: toProduct.currentStock + quantityNum,
      updatedAt: new Date().toISOString()
    });

    res.json({
      success: true,
      data: {
        fromMovement: outMovement,
        toMovement: inMovement
      },
      message: 'Stock transferred successfully'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Supprimer un mouvement de stock (admin seulement)
 */
export const deleteStockMovement = async (req, res, next) => {
  try {
    const { id } = req.params;
    const companyId = req.user.companyId;

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can delete stock movements'
      });
    }

    const movement = await StockMovement.findOne({
      where: {
        id,
        companyId
      }
    });

    if (!movement) {
      throw new NotFoundError('Stock movement not found');
    }

    await movement.destroy();

    res.json({
      success: true,
      message: 'Stock movement deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Export all functions
export default {
  createStockMovement,
  getStockMovements,
  getStockMovementById,
  getLowStockProducts,
  getStockValuation,
  adjustStock,
  getOutOfStockProducts,
  getProductStockHistory,
  transferStock,
  deleteStockMovement
};