// src/routes/products.routes.js
import express from 'express';
import productController from '../controllers/productController.js';
import { authenticate, requireRole, requireAdmin } from '../middleware/auth.js';
import { companyIsolationMiddleware } from '../middleware/companyIsolation.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { productSchema } from '../utils/validators.js';

const router = express.Router();

// ✅ Toutes les routes nécessitent une authentification
router.use(authenticate);
router.use(companyIsolationMiddleware);

// ======================================================
// ✅ ROUTES GET (lecture) - Accessibles à tous les rôles
// ======================================================
router.get('/', productController.index);
router.get('/search', productController.search);
router.get('/barcode/:barcode', productController.getByBarcode);
router.get('/category/:categoryId', productController.getByCategory);
router.get('/low-stock', productController.getLowStock);
router.get('/out-of-stock', productController.getOutOfStock);
router.get('/:id', productController.show);
router.get('/:id/history', productController.getHistory);

// ======================================================
// ✅ ROUTES POST (création) - Admin et SDupervisor seulement
// ======================================================
router.post(
  '/', 
  requireRole('admin', 'supervisor'),  // ✅ Admin et supervisor peuvent créer
  validateRequest(productSchema.create), 
  productController.create
);

// ======================================================
// ✅ ROUTES BULK - Admin seulement
// ======================================================
router.post(
  '/bulk', 
  requireRole('admin'),  // ✅ Seulement admin pour les opérations en masse
  validateRequest(productSchema.bulkCreate), 
  productController.bulkCreate
);

// ======================================================
// ✅ ROUTES PUT (mise à jour) - Admin et Supervisor seulement
// ======================================================
router.put(
  '/:id', 
  requireRole('admin', 'supervisor'),  // ✅ Admin et supervisor peuvent modifier
  validateRequest(productSchema.update), 
  productController.update
);

// Routes spécifiques pour prix et stock
router.put(
  '/:id/price', 
  requireRole('admin', 'supervisor'),  // ✅ Admin et supervisor peuvent modifier le prix
  validateRequest(productSchema.updatePrice), 
  productController.updatePrice
);

router.put(
  '/:id/stock', 
  requireRole('admin', 'supervisor'),  // ✅ Admin et supervisor peuvent ajuster le stock
  validateRequest(productSchema.updateStock), 
  productController.updateStock
);

// ======================================================
// ✅ ROUTES DELETE (suppression) - Admin seulement
// ======================================================
router.delete(
  '/:id', 
  requireRole('admin'),  // ✅ Seulement admin peut supprimer
  productController.destroy
);

// Bulk delete - Admin seulement
router.post(
  '/bulk-delete', 
  requireRole('admin'),  // ✅ Seulement admin pour suppression en masse
  validateRequest(productSchema.bulkDelete), 
  productController.bulkDelete
);

export default router;