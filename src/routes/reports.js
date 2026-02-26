// src/routes/reports.routes.js
import express from 'express';
import reportController from '../controllers/reportController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { companyIsolationMiddleware } from '../middleware/companyIsolation.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { reportSchema } from '../utils/validators.js';
import { 
  reportUserFilter, 
  addFilterStats 
} from '../middleware/userFilter.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);
router.use(companyIsolationMiddleware);

// ======================================================
// MIDDLEWARES DE FILTRAGE
// ======================================================

// ✅ Applique le filtre utilisateur à toutes les routes de rapports
// - Caissier: voit uniquement ses propres données
// - Admin/Supervisor: voit toutes les données
router.use(reportUserFilter);

// ✅ Ajoute des statistiques de filtrage (utile en développement)
if (process.env.NODE_ENV === 'development') {
  router.use(addFilterStats);
}

// ======================================================
// ROUTES ACCESSIBLES À TOUS (avec filtrage)
// ======================================================

/**
 * GET /api/v1/reports/dashboard
 * Tableau de bord - Filtré selon le rôle
 * - Caissier: voit ses propres stats
 * - Admin/Supervisor: voit stats globales
 */
router.get('/dashboard', reportController.getDashboard);

/**
 * GET /api/v1/reports/stock/low
 * Produits en stock faible - Non filtré (produits partagés)
 */
router.get('/stock/low', reportController.getLowStockReport);

/**
 * GET /api/v1/reports/stock/out
 * Produits en rupture - Non filtré (produits partagés)
 */
router.get('/stock/out', reportController.getOutOfStockReport);

// ======================================================
// RAPPORTS ACCESSIBLES À ADMIN ET SUPERVISOR SEULEMENT
// ======================================================

/**
 * GET /api/v1/reports/sales
 * Rapport des ventes - Filtré par utilisateur
 */
router.get(
  '/sales', 
  requireRole('admin', 'supervisor'),
  validateRequest(reportSchema.dateRange), 
  reportController.getSalesReport
);

/**
 * GET /api/v1/reports/profit
 * Rapport des profits - Filtré par utilisateur
 */
router.get(
  '/profit', 
  requireRole('admin', 'supervisor'),
  validateRequest(reportSchema.dateRange), 
  reportController.getProfitReport
);

/**
 * GET /api/v1/reports/inventory
 * Rapport d'inventaire - Non filtré (produits partagés)
 */
router.get(
  '/inventory', 
  requireRole('admin', 'supervisor'),
  reportController.getInventoryReport
);

/**
 * GET /api/v1/reports/stock
 * Alias pour inventory
 */
router.get(
  '/stock', 
  requireRole('admin', 'supervisor'),
  reportController.getInventoryReport
);

/**
 * GET /api/v1/reports/top-products
 * Top produits - Filtré par utilisateur
 */
router.get(
  '/top-products', 
  requireRole('admin', 'supervisor'),
  validateRequest(reportSchema.dateRange), 
  reportController.getTopProducts
);

/**
 * GET /api/v1/reports/low-performing
 * Produits les moins performants - Filtré par utilisateur
 */
router.get(
  '/low-performing', 
  requireRole('admin', 'supervisor'),
  validateRequest(reportSchema.dateRange), 
  reportController.getLowPerformingProducts
);

/**
 * GET /api/v1/reports/revenue-trend
 * Tendance des revenus - Filtré par utilisateur
 */
router.get(
  '/revenue-trend', 
  requireRole('admin', 'supervisor'),
  validateRequest(reportSchema.dateRange), 
  reportController.getRevenueTrend
);

/**
 * GET /api/v1/reports/activity
 * Activité récente - Filtrée par utilisateur
 */
router.get(
  '/activity', 
  requireRole('admin', 'supervisor'),
  reportController.getActivityReport
);

// ======================================================
// RAPPORTS ACCESSIBLES À ADMIN SEULEMENT
// ======================================================

/**
 * GET /api/v1/reports/cashier-stats
 * Statistiques par caissier - Admin seulement
 */
router.get(
  '/cashier-stats', 
  requireRole('admin'),
  reportController.getCashierStats
);

/**
 * GET /api/v1/reports/expenses
 * Rapport des dépenses - Admin seulement
 */
router.get(
  '/expenses', 
  requireRole('admin'),
  validateRequest(reportSchema.dateRange), 
  reportController.getExpenseReport
);

/**
 * GET /api/v1/reports/customers
 * Rapport des clients - Admin seulement
 */
router.get(
  '/customers', 
  requireRole('admin'),
  reportController.getCustomerReport
);

/**
 * GET /api/v1/reports/profit-loss
 * Rapport profits/pertes - Admin seulement
 */
router.get(
  '/profit-loss', 
  requireRole('admin'),
  reportController.getProfitLossReport
);

/**
 * GET /api/v1/reports/export
 * Exporter un rapport - Admin seulement
 */
router.get(
  '/export', 
  requireRole('admin'),
  validateRequest(reportSchema.export), 
  reportController.exportReport
);

export default router;