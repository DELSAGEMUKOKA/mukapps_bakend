import { Product, StockMovement, sequelize } from '../models/index.js';
import { ValidationError, NotFoundError } from '../utils/helpers.js';
import notificationService from './notificationService.js';
import logger from '../utils/logger.js';
import { Op } from 'sequelize';

class StockService {
  async checkStock(productId, companyId, quantity) {
    try {
      const product = await Product.findOne({
        where: { id: productId, company_id: companyId }
      });

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      const hasStock = product.current_stock >= quantity;

      return {
        hasStock,
        currentStock: product.current_stock,
        requestedQuantity: quantity,
        availableQuantity: product.current_stock
      };
    } catch (error) {
      logger.error('Failed to check stock', {
        error: error.message,
        productId,
        companyId
      });
      throw error;
    }
  }

  async adjustStock(productId, companyId, userId, type, quantity, reference = null, notes = null) {
    const transaction = await sequelize.transaction();

    try {
      const product = await Product.findOne({
        where: { id: productId, company_id: companyId },
        transaction
      });

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      const adjustQuantity = parseInt(quantity);
      if (adjustQuantity <= 0) {
        throw new ValidationError({ quantity: 'Quantity must be greater than 0' });
      }

      const newStock = type === 'in'
        ? product.current_stock + adjustQuantity
        : product.current_stock - adjustQuantity;

      if (newStock < 0) {
        throw new ValidationError({ quantity: 'Insufficient stock available' });
      }

      await product.update({ current_stock: newStock }, { transaction });

      const movement = await StockMovement.create({
        product_id: productId,
        company_id: companyId,
        user_id: userId,
        type,
        quantity: adjustQuantity,
        previous_stock: product.current_stock,
        new_stock: newStock,
        reference,
        notes
      }, { transaction });

      await transaction.commit();

      if (newStock <= product.min_stock_level && type === 'out') {
        await notificationService.sendLowStockNotification(
          { ...product.toJSON(), current_stock: newStock },
          companyId
        );
      }

      logger.info('Stock adjusted successfully', {
        productId,
        type,
        quantity: adjustQuantity,
        newStock,
        companyId
      });

      return {
        success: true,
        movement,
        product: {
          id: product.id,
          name: product.name,
          previousStock: product.current_stock,
          newStock,
          minStockLevel: product.min_stock_level
        }
      };
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      logger.error('Failed to adjust stock', {
        error: error.message,
        productId,
        companyId
      });
      throw error;
    }
  }

  async transferStock(fromProductId, toProductId, quantity, companyId, userId, notes = null) {
    const transaction = await sequelize.transaction();

    try {
      const fromProduct = await Product.findOne({
        where: { id: fromProductId, company_id: companyId },
        transaction
      });

      const toProduct = await Product.findOne({
        where: { id: toProductId, company_id: companyId },
        transaction
      });

      if (!fromProduct || !toProduct) {
        throw new NotFoundError('One or both products not found');
      }

      const transferQuantity = parseInt(quantity);
      if (transferQuantity <= 0) {
        throw new ValidationError({ quantity: 'Quantity must be greater than 0' });
      }

      if (fromProduct.current_stock < transferQuantity) {
        throw new ValidationError({
          quantity: `Insufficient stock. Available: ${fromProduct.current_stock}`
        });
      }

      await fromProduct.update({
        current_stock: fromProduct.current_stock - transferQuantity
      }, { transaction });

      await toProduct.update({
        current_stock: toProduct.current_stock + transferQuantity
      }, { transaction });

      const reference = `TRANSFER-${Date.now()}`;

      await StockMovement.create({
        product_id: fromProductId,
        company_id: companyId,
        user_id: userId,
        type: 'out',
        quantity: transferQuantity,
        previous_stock: fromProduct.current_stock + transferQuantity,
        new_stock: fromProduct.current_stock,
        reference,
        notes: notes || `Transfer to ${toProduct.name}`
      }, { transaction });

      await StockMovement.create({
        product_id: toProductId,
        company_id: companyId,
        user_id: userId,
        type: 'in',
        quantity: transferQuantity,
        previous_stock: toProduct.current_stock - transferQuantity,
        new_stock: toProduct.current_stock,
        reference,
        notes: notes || `Transfer from ${fromProduct.name}`
      }, { transaction });

      await transaction.commit();

      logger.info('Stock transferred successfully', {
        fromProductId,
        toProductId,
        quantity: transferQuantity,
        companyId
      });

      return {
        success: true,
        reference,
        fromProduct: {
          id: fromProduct.id,
          name: fromProduct.name,
          newStock: fromProduct.current_stock
        },
        toProduct: {
          id: toProduct.id,
          name: toProduct.name,
          newStock: toProduct.current_stock
        }
      };
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      logger.error('Failed to transfer stock', {
        error: error.message,
        fromProductId,
        toProductId,
        companyId
      });
      throw error;
    }
  }

  async getLowStockProducts(companyId, limit = 50) {
    try {
      const products = await Product.findAll({
        where: {
          company_id: companyId,
          current_stock: {
            [Op.lte]: sequelize.col('min_stock_level')
          }
        },
        order: [['current_stock', 'ASC']],
        limit
      });

      return {
        success: true,
        count: products.length,
        products: products.map(p => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          currentStock: p.current_stock,
          minStockLevel: p.min_stock_level,
          deficit: p.min_stock_level - p.current_stock
        }))
      };
    } catch (error) {
      logger.error('Failed to get low stock products', {
        error: error.message,
        companyId
      });
      throw error;
    }
  }

  async getOutOfStockProducts(companyId) {
    try {
      const products = await Product.findAll({
        where: {
          company_id: companyId,
          current_stock: 0
        },
        order: [['name', 'ASC']]
      });

      return {
        success: true,
        count: products.length,
        products: products.map(p => ({
          id: p.id,
          name: p.name,
          sku: p.sku,
          minStockLevel: p.min_stock_level
        }))
      };
    } catch (error) {
      logger.error('Failed to get out of stock products', {
        error: error.message,
        companyId
      });
      throw error;
    }
  }

  async getStockValuation(companyId) {
    try {
      const products = await Product.findAll({
        where: { company_id: companyId }
      });

      const totalValue = products.reduce((sum, p) => {
        return sum + (parseFloat(p.current_stock) * parseFloat(p.cost_price || p.selling_price));
      }, 0);

      const totalRetailValue = products.reduce((sum, p) => {
        return sum + (parseFloat(p.current_stock) * parseFloat(p.selling_price));
      }, 0);

      const totalItems = products.reduce((sum, p) => sum + parseInt(p.current_stock), 0);

      return {
        success: true,
        totalCostValue: parseFloat(totalValue.toFixed(2)),
        totalRetailValue: parseFloat(totalRetailValue.toFixed(2)),
        potentialProfit: parseFloat((totalRetailValue - totalValue).toFixed(2)),
        totalItems,
        totalProducts: products.length,
        averageItemValue: totalItems > 0
          ? parseFloat((totalValue / totalItems).toFixed(2))
          : 0
      };
    } catch (error) {
      logger.error('Failed to get stock valuation', {
        error: error.message,
        companyId
      });
      throw error;
    }
  }

  async getProductStockHistory(productId, companyId, limit = 50) {
    try {
      const product = await Product.findOne({
        where: { id: productId, company_id: companyId }
      });

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      const movements = await StockMovement.findAll({
        where: {
          product_id: productId,
          company_id: companyId
        },
        order: [['created_at', 'DESC']],
        limit
      });

      return {
        success: true,
        product: {
          id: product.id,
          name: product.name,
          currentStock: product.current_stock
        },
        movements: movements.map(m => ({
          id: m.id,
          type: m.type,
          quantity: m.quantity,
          previousStock: m.previous_stock,
          newStock: m.new_stock,
          reference: m.reference,
          notes: m.notes,
          date: m.created_at
        }))
      };
    } catch (error) {
      logger.error('Failed to get product stock history', {
        error: error.message,
        productId,
        companyId
      });
      throw error;
    }
  }

  async bulkAdjustStock(adjustments, companyId, userId) {
    const transaction = await sequelize.transaction();
    const results = [];

    try {
      for (const adjustment of adjustments) {
        const { productId, type, quantity, reference, notes } = adjustment;

        const product = await Product.findOne({
          where: { id: productId, company_id: companyId },
          transaction
        });

        if (!product) {
          results.push({
            productId,
            success: false,
            error: 'Product not found'
          });
          continue;
        }

        const adjustQuantity = parseInt(quantity);
        const newStock = type === 'in'
          ? product.current_stock + adjustQuantity
          : product.current_stock - adjustQuantity;

        if (newStock < 0) {
          results.push({
            productId,
            success: false,
            error: 'Insufficient stock'
          });
          continue;
        }

        await product.update({ current_stock: newStock }, { transaction });

        await StockMovement.create({
          product_id: productId,
          company_id: companyId,
          user_id: userId,
          type,
          quantity: adjustQuantity,
          previous_stock: product.current_stock,
          new_stock: newStock,
          reference,
          notes
        }, { transaction });

        results.push({
          productId,
          success: true,
          newStock
        });
      }

      await transaction.commit();

      logger.info('Bulk stock adjustment completed', {
        totalAdjustments: adjustments.length,
        successful: results.filter(r => r.success).length,
        companyId
      });

      return {
        success: true,
        results,
        totalProcessed: adjustments.length,
        successful: results.filter(r => r.success).length,
        failed: results.filter(r => !r.success).length
      };
    } catch (error) {
      if (!transaction.finished) {
        await transaction.rollback();
      }
      logger.error('Bulk stock adjustment failed', {
        error: error.message,
        companyId
      });
      throw error;
    }
  }

  async getStockMovements(companyId, filters = {}, limit = 100) {
    try {
      const whereClause = { company_id: companyId };

      if (filters.productId) {
        whereClause.product_id = filters.productId;
      }

      if (filters.type) {
        whereClause.type = filters.type;
      }

      if (filters.dateFrom || filters.dateTo) {
        whereClause.created_at = {};
        if (filters.dateFrom) {
          whereClause.created_at[Op.gte] = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          whereClause.created_at[Op.lte] = new Date(filters.dateTo);
        }
      }

      const movements = await StockMovement.findAll({
        where: whereClause,
        order: [['created_at', 'DESC']],
        limit
      });

      return {
        success: true,
        count: movements.length,
        movements: movements.map(m => ({
          id: m.id,
          productId: m.product_id,
          type: m.type,
          quantity: m.quantity,
          previousStock: m.previous_stock,
          newStock: m.new_stock,
          reference: m.reference,
          notes: m.notes,
          date: m.created_at
        }))
      };
    } catch (error) {
      logger.error('Failed to get stock movements', {
        error: error.message,
        companyId
      });
      throw error;
    }
  }
}

export default new StockService();

