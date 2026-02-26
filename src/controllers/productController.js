// src/controllers/productController.js
import { Product, Category, StockMovement } from '../models/index.js';
import { paginate } from '../utils/helpers.js';
import { Op } from 'sequelize';
import sequelize from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

export const productController = {
  /**
   * Récupérer tous les produits avec pagination
   */
  async index(req, res, next) {
    try {
      const { page = 1, limit = 5000, search, categoryId, lowStock } = req.query;
      const offset = (page - 1) * limit;

      const where = { companyId: req.user.companyId };

      if (search) {
        where[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { barcode: { [Op.like]: `%${search}%` } },
          { description: { [Op.like]: `%${search}%` } }
        ];
      }

      if (categoryId) {
        where.categoryId = categoryId;
      }

      if (lowStock === 'true') {
        where[Op.and] = [
          sequelize.where(
            sequelize.col('currentStock'),
            '<=',
            sequelize.col('minStockLevel')
          )
        ];
      }

      const { rows, count } = await Product.findAndCountAll({
        where,
        include: [{ 
          model: Category, 
          as: 'category',  // ✅ Utiliser l'alias correct
          attributes: ['id', 'name', 'color'] 
        }],
        limit: parseInt(limit),
        offset: parseInt(offset),
        order: [['name', 'ASC']],
        distinct: true
      });

      res.json({
        success: true,
        data: rows,
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
  },

  /**
   * Récupérer un produit par ID
   */
  async show(req, res, next) {
    try {
      const product = await Product.findOne({
        where: {
          id: req.params.id,
          companyId: req.user.companyId
        },
        include: [{ 
          model: Category, 
          as: 'category',  // ✅ Utiliser l'alias correct
          attributes: ['id', 'name', 'color'] 
        }]
      });

      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: 'Product not found' 
        });
      }

      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Créer un nouveau produit
   */
  async create(req, res, next) {
    try {
      const {
        name,
        description,
        price,
        costPrice,
        categoryId,
        barcode,
        currentStock,
        minStockLevel,
        unit,
        trackStock
      } = req.body;

      // Validation
      if (!name) {
        return res.status(400).json({
          success: false,
          message: 'Product name is required'
        });
      }

      if (!price) {
        return res.status(400).json({
          success: false,
          message: 'Price is required'
        });
      }

      if (!costPrice) {
        return res.status(400).json({
          success: false,
          message: 'Cost price is required'
        });
      }

      // Vérifier l'unicité du barcode
      if (barcode) {
        const existingProduct = await Product.findOne({
          where: {
            barcode,
            companyId: req.user.companyId
          }
        });

        if (existingProduct) {
          return res.status(400).json({
            success: false,
            message: 'A product with this barcode already exists in your company',
            field: 'barcode'
          });
        }
      }

      // Vérifier la catégorie
      if (categoryId) {
        const category = await Category.findOne({
          where: {
            id: categoryId,
            companyId: req.user.companyId
          }
        });
        if (!category) {
          return res.status(400).json({
            success: false,
            message: 'Category not found'
          });
        }
      }

      // Créer le produit
      const product = await Product.create({
        id: uuidv4(),
        name,
        description: description || '',
        barcode: barcode || null,
        categoryId: categoryId || null,
        price,
        costPrice,
        minStockLevel: minStockLevel || 5,
        unit: unit || 'piece',
        companyId: req.user.companyId,
        currentStock: currentStock || 0,
        trackStock: trackStock !== undefined ? trackStock : true,
        allowVariablePrice: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        _export_date: new Date()
      });

      // Récupérer le produit avec sa catégorie
      const createdProduct = await Product.findByPk(product.id, {
        include: [{ 
          model: Category, 
          as: 'category',  // ✅ Utiliser l'alias correct
          attributes: ['id', 'name', 'color'] 
        }]
      });

      res.status(201).json({
        success: true,
        data: createdProduct,
        message: 'Product created successfully'
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'A product with this barcode already exists in your company',
          field: 'barcode'
        });
      }
      next(error);
    }
  },

  /**
   * Mettre à jour un produit
   */
  async update(req, res, next) {
    try {
      const product = await Product.findOne({
        where: {
          id: req.params.id,
          companyId: req.user.companyId
        }
      });

      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: 'Product not found' 
        });
      }

      const {
        name,
        description,
        price,
        costPrice,
        categoryId,
        barcode,
        currentStock,
        minStockLevel,
        unit,
        trackStock
      } = req.body;

      // Vérifier l'unicité du barcode
      if (barcode && barcode !== product.barcode) {
        const existingProduct = await Product.findOne({
          where: {
            barcode,
            companyId: req.user.companyId,
            id: { [Op.ne]: product.id }
          }
        });

        if (existingProduct) {
          return res.status(400).json({
            success: false,
            message: 'A product with this barcode already exists in your company',
            field: 'barcode'
          });
        }
      }

      const updateData = { updatedAt: new Date() };
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = price;
      if (costPrice !== undefined) updateData.costPrice = costPrice;
      if (categoryId !== undefined) updateData.categoryId = categoryId;
      if (barcode !== undefined) updateData.barcode = barcode;
      if (currentStock !== undefined) updateData.currentStock = currentStock;
      if (minStockLevel !== undefined) updateData.minStockLevel = minStockLevel;
      if (unit !== undefined) updateData.unit = unit;
      if (trackStock !== undefined) updateData.trackStock = trackStock;

      await product.update(updateData);

      const updatedProduct = await Product.findByPk(product.id, {
        include: [{ 
          model: Category, 
          as: 'category',  // ✅ Utiliser l'alias correct
          attributes: ['id', 'name', 'color'] 
        }]
      });

      res.json({
        success: true,
        data: updatedProduct,
        message: 'Product updated successfully'
      });
    } catch (error) {
      if (error.name === 'SequelizeUniqueConstraintError') {
        return res.status(400).json({
          success: false,
          message: 'A product with this barcode already exists in your company',
          field: 'barcode'
        });
      }
      next(error);
    }
  },

  /**
   * Supprimer un produit
   */
  async destroy(req, res, next) {
    try {
      const product = await Product.findOne({
        where: {
          id: req.params.id,
          companyId: req.user.companyId
        }
      });

      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: 'Product not found' 
        });
      }

      await product.destroy();

      res.json({ 
        success: true, 
        message: 'Product deleted successfully' 
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Rechercher un produit par barcode
   */
  async getByBarcode(req, res, next) {
    try {
      const product = await Product.findOne({
        where: {
          barcode: req.params.barcode,
          companyId: req.user.companyId
        },
        include: [{ 
          model: Category, 
          as: 'category',  // ✅ Utiliser l'alias correct
          attributes: ['id', 'name', 'color'] 
        }]
      });

      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: 'Product not found with this barcode' 
        });
      }

      res.json({ success: true, data: product });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Recherche avancée
   */
  async search(req, res, next) {
    try {
      const { q } = req.query;
      
      if (!q) {
        return res.status(400).json({
          success: false,
          message: 'Search query is required'
        });
      }

      const products = await Product.findAll({
        where: {
          companyId: req.user.companyId,
          [Op.or]: [
            { name: { [Op.like]: `%${q}%` } },
            { barcode: { [Op.like]: `%${q}%` } },
            { description: { [Op.like]: `%${q}%` } }
          ]
        },
        include: [{ 
          model: Category, 
          as: 'category',  // ✅ Utiliser l'alias correct
          attributes: ['id', 'name'] 
        }],
        limit: 5000
      });

      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Produits par catégorie
   */
  async getByCategory(req, res, next) {
    try {
      const products = await Product.findAll({
        where: {
          categoryId: req.params.categoryId,
          companyId: req.user.companyId
        },
        include: [{ 
          model: Category, 
          as: 'category',  // ✅ Utiliser l'alias correct
          attributes: ['id', 'name', 'color'] 
        }],
        order: [['name', 'ASC']]
      });

      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Produits en stock faible
   */
  async getLowStock(req, res, next) {
    try {
      const products = await Product.findAll({
        where: {
          companyId: req.user.companyId,
          trackStock: true,
          [Op.and]: [
            sequelize.where(
              sequelize.col('currentStock'),
              '<=',
              sequelize.col('minStockLevel')
            )
          ]
        },
        include: [{ 
          model: Category, 
          as: 'category',  // ✅ Utiliser l'alias correct
          attributes: ['id', 'name', 'color'] 
        }],
        order: [['currentStock', 'ASC']]
      });

      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Produits en rupture de stock
   */
  async getOutOfStock(req, res, next) {
    try {
      const products = await Product.findAll({
        where: {
          companyId: req.user.companyId,
          currentStock: 0,
          trackStock: true
        },
        include: [{ 
          model: Category, 
          as: 'category',  // ✅ Utiliser l'alias correct
          attributes: ['id', 'name', 'color'] 
        }],
        order: [['name', 'ASC']]
      });

      res.json({ success: true, data: products });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Historique des mouvements
   */
  async getHistory(req, res, next) {
    try {
      const movements = await StockMovement.findAll({
        where: {
          productId: req.params.id,
          companyId: req.user.companyId
        },
        include: [{ 
          model: Product, 
          as: 'product',  // ✅ Vérifiez que cet alias existe dans StockMovement
          attributes: ['id', 'name', 'barcode'] 
        }],
        order: [['createdAt', 'DESC']],
        limit: 50
      });

      res.json({ success: true, data: movements });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Création en lot
   */
  async bulkCreate(req, res, next) {
    try {
      const { products } = req.body;
      
      if (!Array.isArray(products) || products.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Products must be a non-empty array'
        });
      }

      const createdProducts = [];
      const errors = [];

      for (const p of products) {
        try {
          if (p.barcode) {
            const existing = await Product.findOne({
              where: {
                barcode: p.barcode,
                companyId: req.user.companyId
              }
            });
            if (existing) {
              errors.push({ product: p, error: 'Barcode already exists' });
              continue;
            }
          }

          const product = await Product.create({
            id: uuidv4(),
            name: p.name,
            description: p.description || '',
            barcode: p.barcode || null,
            categoryId: p.categoryId || null,
            price: p.price,
            costPrice: p.costPrice,
            minStockLevel: p.minStockLevel || 5,
            unit: p.unit || 'piece',
            companyId: req.user.companyId,
            currentStock: p.currentStock || 0,
            trackStock: p.trackStock !== undefined ? p.trackStock : true,
            createdAt: new Date(),
            updatedAt: new Date(),
            _export_date: new Date()
          });
          createdProducts.push(product);
        } catch (err) {
          errors.push({ product: p, error: err.message });
        }
      }

      res.status(201).json({
        success: true,
        data: createdProducts,
        errors: errors.length > 0 ? errors : undefined,
        message: `${createdProducts.length} products created successfully`
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mettre à jour le prix
   */
  async updatePrice(req, res, next) {
    try {
      const { price, costPrice } = req.body;
      const product = await Product.findOne({
        where: {
          id: req.params.id,
          companyId: req.user.companyId
        }
      });

      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: 'Product not found' 
        });
      }

      const updateData = { updatedAt: new Date() };
      if (price !== undefined) updateData.price = price;
      if (costPrice !== undefined) updateData.costPrice = costPrice;

      await product.update(updateData);

      res.json({
        success: true,
        data: product,
        message: 'Price updated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Mettre à jour le stock
   */
  async updateStock(req, res, next) {
    try {
      const { currentStock } = req.body;
      const product = await Product.findOne({
        where: {
          id: req.params.id,
          companyId: req.user.companyId
        }
      });

      if (!product) {
        return res.status(404).json({ 
          success: false, 
          message: 'Product not found' 
        });
      }

      await product.update({
        currentStock: Math.max(0, parseInt(currentStock) || 0),
        updatedAt: new Date()
      });

      res.json({
        success: true,
        data: product,
        message: 'Stock updated successfully'
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Suppression en lot
   */
  async bulkDelete(req, res, next) {
    try {
      const { ids } = req.body;
      
      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'IDs array is required'
        });
      }

      const deleted = await Product.destroy({
        where: {
          id: { [Op.in]: ids },
          companyId: req.user.companyId
        }
      });

      res.json({
        success: true,
        message: `${deleted} products deleted successfully`
      });
    } catch (error) {
      next(error);
    }
  }
};

export default productController;