// src/routes/categories.routes.js
import express from 'express';
import * as categoryController from '../controllers/categoryController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { companyIsolationMiddleware } from '../middleware/companyIsolation.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { categorySchema } from '../utils/validators.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);
router.use(companyIsolationMiddleware);

// ======================================================
// ROUTES GET - Accessibles à tous (admin, supervisor, cashier)
// ======================================================
router.get('/', categoryController.getCategories);
router.get('/:id', categoryController.getCategoryById);

// ======================================================
// ROUTES POST/PUT/DELETE - Admin et supervisor seulement
// ======================================================
router.post('/', 
  requireRole('admin', 'supervisor'),  // ✅ Admin et supervisor peuvent créer
  validateRequest(categorySchema.create), 
  categoryController.createCategory
);

router.put('/:id', 
  requireRole('admin', 'supervisor'),  // ✅ Admin et supervisor peuvent modifier
  validateRequest(categorySchema.update), 
  categoryController.updateCategory
);

// ======================================================
// ROUTES DELETE - Admin seulement
// ======================================================
router.delete('/:id', 
  requireRole('admin'),  // ✅ Seulement admin peut supprimer
  categoryController.deleteCategory
);

export default router;