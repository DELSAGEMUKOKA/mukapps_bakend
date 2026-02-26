// src/routes/subscriptions.routes.js
import express from 'express';
import subscriptionController from '../controllers/subscriptionController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { companyIsolationMiddleware } from '../middleware/companyIsolation.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { subscriptionSchema } from '../utils/validators.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);
router.use(companyIsolationMiddleware);

// ======================================================
// ✅ ROUTES GET - Accessibles à tous
// ======================================================

/**
 * GET /api/v1/subscriptions/current
 * Récupérer l'abonnement actuel
 * ✅ Accessible à tous (tout le monde peut voir son abonnement)
 */
router.get('/current', subscriptionController.getCurrentSubscription);

/**
 * GET /api/v1/subscriptions/history
 * Récupérer l'historique des abonnements
 * ✅ Accessible à tous
 */
router.get('/history', subscriptionController.getSubscriptionHistory);

/**
 * GET /api/v1/subscriptions/stats
 * Récupérer les statistiques d'utilisation
 * ✅ Accessible à tous
 */
router.get('/stats', subscriptionController.getUsageStats);

/**
 * GET /api/v1/subscriptions/invoices
 * Récupérer les factures d'abonnement
 * ✅ Accessible à tous
 */
router.get('/invoices', subscriptionController.getSubscriptionInvoices);

/**
 * GET /api/v1/subscriptions/plans
 * Récupérer les plans disponibles
 * ✅ Accessible à tous
 */
router.get('/plans', subscriptionController.getPlans);

// ======================================================
// ✅ ROUTES PUT - Admin seulement
// ======================================================

/**
 * PUT /api/v1/subscriptions
 * Mettre à jour l'abonnement
 * ✅ Admin seulement
 */
router.put(
  '/',
  requireRole('admin'),
  validateRequest(subscriptionSchema.update),
  subscriptionController.updateSubscription
);

// ======================================================
// ✅ ROUTES POST - Admin seulement
// ======================================================

/**
 * POST /api/v1/subscriptions/renew
 * Renouveler l'abonnement
 * ✅ Admin seulement
 */
router.post(
  '/renew',
  requireRole('admin'),
  validateRequest(subscriptionSchema.renew),
  subscriptionController.renewSubscription
);

/**
 * POST /api/v1/subscriptions/cancel
 * Annuler l'abonnement
 * ✅ Admin seulement
 */
router.post(
  '/cancel',
  requireRole('admin'),
  subscriptionController.cancelSubscription
);

/**
 * POST /api/v1/subscriptions/upgrade
 * Upgrade l'abonnement
 * ✅ Admin seulement
 */
router.post(
  '/upgrade',
  requireRole('admin'),
  validateRequest(subscriptionSchema.upgrade),
  subscriptionController.upgradeSubscription
);

/**
 * POST /api/v1/subscriptions/downgrade
 * Downgrade l'abonnement
 * ✅ Admin seulement
 */
router.post(
  '/downgrade',
  requireRole('admin'),
  validateRequest(subscriptionSchema.downgrade),
  subscriptionController.downgradeSubscription
);

export default router;