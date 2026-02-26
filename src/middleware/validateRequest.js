// src/middleware/validateRequest.js
import { ValidationError } from '../utils/helpers.js';

/**
 * Middleware de validation des requêtes
 * Supporte les deux formats: camelCase et snake_case
 */
export const validateRequest = (schema) => {
  return (req, res, next) => {
    // Préparer le corps pour la validation en supportant les deux formats
    const bodyForValidation = JSON.parse(JSON.stringify(req.body));
    
    // Mapper les champs généraux
    bodyForValidation.purchase_price = req.body.purchase_price !== undefined 
      ? req.body.purchase_price 
      : req.body.costPrice;
    
    bodyForValidation.selling_price = req.body.selling_price !== undefined 
      ? req.body.selling_price 
      : req.body.price;
    
    bodyForValidation.category_id = req.body.category_id !== undefined 
      ? req.body.category_id 
      : req.body.categoryId;
    
    bodyForValidation.current_stock = req.body.current_stock !== undefined 
      ? req.body.current_stock 
      : req.body.currentStock;
    
    bodyForValidation.min_stock_level = req.body.min_stock_level !== undefined 
      ? req.body.min_stock_level 
      : req.body.minStockLevel;
    
    bodyForValidation.track_stock = req.body.track_stock !== undefined 
      ? req.body.track_stock 
      : req.body.trackStock;

    // Mapper les champs de facture
    bodyForValidation.customer_id = req.body.customer_id !== undefined 
      ? req.body.customer_id 
      : req.body.customerId;

    // Mapper les champs pour les mouvements de stock
    bodyForValidation.product_id = req.body.product_id !== undefined 
      ? req.body.product_id 
      : req.body.productId;
    
    bodyForValidation.from_product_id = req.body.from_product_id !== undefined 
      ? req.body.from_product_id 
      : req.body.fromProductId;
    
    bodyForValidation.to_product_id = req.body.to_product_id !== undefined 
      ? req.body.to_product_id 
      : req.body.toProductId;

    // Mapper les champs pour l'ajustement de stock
    bodyForValidation.new_stock = req.body.new_stock !== undefined 
      ? req.body.new_stock 
      : req.body.newStock;

    // Mapper les items de facture
    if (req.body.items && Array.isArray(req.body.items)) {
      bodyForValidation.items = req.body.items.map(item => ({
        ...item,
        product_id: item.product_id || item.productId,
        unit_price: item.unit_price || item.unitPrice,
        productId: undefined,  // Nettoyer pour éviter les doublons
        unitPrice: undefined
      }));
    }

    // Valider avec le corps préparé
    const { error, value } = schema.validate(bodyForValidation, {
      abortEarly: false,
      stripUnknown: true,
      allowUnknown: true
    });

    if (error) {
      const details = {};
      error.details.forEach(detail => {
        details[detail.path.join('.')] = detail.message;
      });
      
      const validationError = new ValidationError('Validation failed');
      validationError.details = details;
      return next(validationError);
    }

    // Restaurer les champs dans le format attendu par les contrôleurs
    const restoredBody = { ...value };

    // Restaurer les champs généraux
    if (value.purchase_price !== undefined) restoredBody.costPrice = value.purchase_price;
    if (value.selling_price !== undefined) restoredBody.price = value.selling_price;
    if (value.category_id !== undefined) restoredBody.categoryId = value.category_id;
    if (value.current_stock !== undefined) restoredBody.currentStock = value.current_stock;
    if (value.min_stock_level !== undefined) restoredBody.minStockLevel = value.min_stock_level;
    if (value.track_stock !== undefined) restoredBody.trackStock = value.track_stock;

    // Restaurer les champs de facture
    if (value.customer_id !== undefined) restoredBody.customerId = value.customer_id;

    // Restaurer les champs pour les mouvements de stock
    if (value.product_id !== undefined) restoredBody.productId = value.product_id;
    if (value.from_product_id !== undefined) restoredBody.fromProductId = value.from_product_id;
    if (value.to_product_id !== undefined) restoredBody.toProductId = value.to_product_id;

    // Restaurer les champs pour l'ajustement de stock
    if (value.new_stock !== undefined) restoredBody.newStock = value.new_stock;

    // Restaurer les items
    if (value.items && Array.isArray(value.items)) {
      restoredBody.items = value.items.map(item => ({
        productId: item.product_id,
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: item.unit_price,
        total: item.total
      }));
    }

    // Ajouter les champs originaux non mappés
    req.body = {
      ...restoredBody,
      ...req.body
    };

    next();
  };
};

/**
 * Schéma de validation pour les produits
 */
export const productValidationSchema = {
  validate: (data) => {
    const errors = {};
    
    const name = data.name;
    const sellingPrice = data.selling_price;
    const purchasePrice = data.purchase_price;
    
    if (!name) {
      errors.name = '"name" is required';
    }
    
    if (!sellingPrice) {
      errors.selling_price = '"selling_price" is required';
    }
    
    if (!purchasePrice) {
      errors.purchase_price = '"purchase_price" is required';
    }
    
    if (Object.keys(errors).length > 0) {
      const error = new ValidationError('Validation failed');
      error.details = errors;
      throw error;
    }
    
    return true;
  }
};

/**
 * Schéma de validation pour les catégories
 */
export const categoryValidationSchema = {
  validate: (data) => {
    const errors = {};
    
    if (!data.name) {
      errors.name = '"name" is required';
    }
    
    if (Object.keys(errors).length > 0) {
      const error = new ValidationError('Validation failed');
      error.details = errors;
      throw error;
    }
    
    return true;
  }
};

/**
 * Schéma de validation pour les clients
 */
export const customerValidationSchema = {
  validate: (data) => {
    const errors = {};
    
    if (!data.name) {
      errors.name = '"name" is required';
    }
    
    if (data.email && !isValidEmail(data.email)) {
      errors.email = '"email" must be a valid email';
    }
    
    if (Object.keys(errors).length > 0) {
      const error = new ValidationError('Validation failed');
      error.details = errors;
      throw error;
    }
    
    return true;
  }
};

/**
 * Schéma de validation pour les factures
 */
export const invoiceValidationSchema = {
  validate: (data) => {
    const errors = {};
    
    // Accepter les deux formats pour customer_id
    if (!data.customer_id && !data.customerId) {
      errors.customer_id = '"customer_id" is required';
    }
    
    // Valider les items
    if (!data.items || !Array.isArray(data.items) || data.items.length === 0) {
      errors.items = '"items" must be a non-empty array';
    } else {
      data.items.forEach((item, index) => {
        // Accepter les deux formats pour product_id
        if (!item.product_id && !item.productId) {
          errors[`items[${index}].product_id`] = 'product_id is required';
        }
        
        if (!item.quantity) {
          errors[`items[${index}].quantity`] = 'quantity is required';
        }
        
        // Accepter les deux formats pour unit_price
        if (!item.unit_price && !item.unitPrice) {
          errors[`items[${index}].unit_price`] = 'unit_price is required';
        }
        
        if (!item.total) {
          errors[`items[${index}].total`] = 'total is required';
        }
      });
    }
    
    if (Object.keys(errors).length > 0) {
      const error = new ValidationError('Validation failed');
      error.details = errors;
      throw error;
    }
    
    return true;
  }
};

/**
 * Schéma de validation pour les mouvements de stock
 */
export const stockMovementValidationSchema = {
  validate: (data) => {
    const errors = {};
    
    // Accepter les deux formats pour product_id
    if (!data.product_id && !data.productId) {
      errors.product_id = '"product_id" is required';
    }
    
    if (!data.type || !['in', 'out', 'adjustment'].includes(data.type)) {
      errors.type = '"type" must be one of: in, out, adjustment';
    }
    
    if (!data.quantity || data.quantity <= 0) {
      errors.quantity = '"quantity" must be a positive number';
    }
    
    if (Object.keys(errors).length > 0) {
      const error = new ValidationError('Validation failed');
      error.details = errors;
      throw error;
    }
    
    return true;
  }
};

/**
 * Schéma de validation pour le transfert de stock
 */
export const stockTransferValidationSchema = {
  validate: (data) => {
    const errors = {};
    
    if (!data.from_product_id && !data.fromProductId) {
      errors.from_product_id = '"from_product_id" is required';
    }
    
    if (!data.to_product_id && !data.toProductId) {
      errors.to_product_id = '"to_product_id" is required';
    }
    
    if (!data.quantity || data.quantity <= 0) {
      errors.quantity = '"quantity" must be a positive number';
    }
    
    if (Object.keys(errors).length > 0) {
      const error = new ValidationError('Validation failed');
      error.details = errors;
      throw error;
    }
    
    return true;
  }
};

/**
 * Schéma de validation pour l'ajustement de stock
 */
export const stockAdjustValidationSchema = {
  validate: (data) => {
    const errors = {};
    
    if (!data.product_id && !data.productId) {
      errors.product_id = '"product_id" is required';
    }
    
    if (!data.new_stock && !data.newStock && data.newStock !== 0) {
      errors.new_stock = '"new_stock" is required';
    }
    
    if (Object.keys(errors).length > 0) {
      const error = new ValidationError('Validation failed');
      error.details = errors;
      throw error;
    }
    
    return true;
  }
};

// Helper function pour valider les emails
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Export par défaut pour compatibilité avec les imports sans accolades
export default validateRequest;