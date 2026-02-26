// src/routes/expenses.routes.js
import express from 'express';
import expenseController from '../controllers/expenseController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { companyIsolationMiddleware } from '../middleware/companyIsolation.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { expenseSchema } from '../utils/validators.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);
router.use(companyIsolationMiddleware);

// ======================================================
// ✅ ROUTES GET - Accessibles à tous (admin, supervisor, cashier)
// ======================================================

/**
 * GET /api/v1/expenses
 * Récupérer toutes les dépenses
 * ✅ Accessible à tous (les caissiers peuvent voir les dépenses)
 */
router.get('/', expenseController.getExpenses);

/**
 * GET /api/v1/expenses/stats
 * Statistiques des dépenses
 * ✅ Accessible à tous
 */
router.get('/stats', expenseController.getExpenseStats);

/**
 * GET /api/v1/expenses/categories
 * Liste des catégories de dépenses
 * ✅ Accessible à tous
 */
router.get('/categories', expenseController.getExpenseCategories);

/**
 * GET /api/v1/expenses/:id
 * Récupérer une dépense par ID
 * ✅ Accessible à tous
 */
router.get('/:id', expenseController.getExpenseById);

// ======================================================
// ✅ ROUTES POST - Admin et supervisor seulement
// ======================================================

/**
 * POST /api/v1/expenses
 * Créer une nouvelle dépense
 * ✅ Admin et supervisor seulement (les caissiers ne peuvent pas créer de dépenses)
 */
router.post(
  '/', 
  requireRole('admin', 'supervisor'),
  validateRequest(expenseSchema.create),
  expenseController.createExpense
);

// ======================================================
// ✅ ROUTES PUT - Admin et supervisor selon le cas
// ======================================================

/**
 * PUT /api/v1/expenses/:id
 * Mettre à jour une dépense
 * ✅ Admin et supervisor seulement
 */
router.put(
  '/:id', 
  requireRole('admin', 'supervisor'),
  validateRequest(expenseSchema.update),
  expenseController.updateExpense
);

/**
 * ✅ PUT /api/v1/expenses/:id/approve
 * Approuver une dépense
 * ✅ Admin et supervisor seulement
 */
router.put(
  '/:id/approve', 
  requireRole('admin', 'supervisor'),
  expenseController.approveExpense
);

/**
 * ✅ PUT /api/v1/expenses/:id/reject
 * Rejeter une dépense
 * ✅ Admin et supervisor seulement
 */
router.put(
  '/:id/reject', 
  requireRole('admin', 'supervisor'),
  expenseController.rejectExpense
);

// ======================================================
// ✅ ROUTES DELETE - Admin seulement
// ======================================================

/**
 * DELETE /api/v1/expenses/:id
 * Supprimer une dépense
 * ✅ Admin seulement
 */
router.delete(
  '/:id', 
  requireRole('admin'),
  expenseController.deleteExpense
);

export default router;