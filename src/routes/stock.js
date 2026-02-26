// src/routes/stock.routes.js
import express from 'express';
import stockController from '../controllers/stockController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { companyIsolationMiddleware } from '../middleware/companyIsolation.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { stockSchema } from '../utils/validators.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);
router.use(companyIsolationMiddleware);

// ======================================================
// ROUTES GET - Accessibles à tous (admin, supervisor, cashier)
// ======================================================
router.get('/movements', stockController.getStockMovements);
router.get('/movements/:id', stockController.getStockMovementById);
router.get('/low-stock', stockController.getLowStockProducts);
router.get('/out-of-stock', stockController.getOutOfStockProducts);
router.get('/valuation', stockController.getStockValuation);
router.get('/history/:productId', stockController.getProductStockHistory);

// ======================================================
// ROUTES DE CRÉATION DE MOUVEMENT - Admin et supervisor seulement
// ======================================================
router.post('/movements', 
  requireRole('admin', 'supervisor'),  // ✅ Admin et supervisor peuvent créer des mouvements
  validateRequest(stockSchema.movement), 
  stockController.createStockMovement
);

// ======================================================
// ROUTES D'AJUSTEMENT - Admin et supervisor seulement
// ======================================================
router.post('/adjust', 
  requireRole('admin', 'supervisor'),  // ✅ Admin et supervisor peuvent ajuster
  validateRequest(stockSchema.adjust), 
  stockController.adjustStock
);

// ======================================================
// ROUTES DE TRANSFERT - Admin et supervisor seulement
// ======================================================
router.post('/transfer', 
  requireRole('admin', 'supervisor'),  // ✅ Admin et supervisor peuvent transférer
  validateRequest(stockSchema.transfer), 
  stockController.transferStock
);

export default router;