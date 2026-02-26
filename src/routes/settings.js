// src/routes/settings.routes.js
import express from 'express';
import settingsController from '../controllers/settingsController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { companyIsolationMiddleware } from '../middleware/companyIsolation.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { settingsSchema } from '../utils/validators.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);
router.use(companyIsolationMiddleware);

// ======================================================
// ✅ ROUTES GET - Accessibles à tous (mais c'est sensible)
// ======================================================

/**
 * GET /api/v1/settings
 * Récupérer les paramètres de l'entreprise
 * ✅ Accessible à tous (nécessaire pour l'affichage)
 */
router.get('/', settingsController.getSettings);

/**
 * GET /api/v1/settings/company
 * Récupérer les informations de l'entreprise
 * ✅ Accessible à tous
 */
router.get('/company', settingsController.getCompanyInfo);

/**
 * GET /api/v1/settings/invoice
 * Récupérer les paramètres de facturation
 * ✅ Accessible à tous (nécessaire pour générer des factures)
 */
router.get('/invoice', settingsController.getInvoiceSettings);

/**
 * GET /api/v1/settings/notifications
 * Récupérer les paramètres de notifications
 * ✅ Accessible à tous
 */
router.get('/notifications', settingsController.getNotificationSettings);

// ======================================================
// ✅ ROUTES PUT - Admin seulement
// ======================================================

/**
 * PUT /api/v1/settings
 * Mettre à jour les paramètres généraux
 * ✅ Admin seulement
 */
router.put(
  '/', 
  requireRole('admin'),
  validateRequest(settingsSchema.update),
  settingsController.updateSettings
);

/**
 * PUT /api/v1/settings/company
 * Mettre à jour les informations de l'entreprise
 * ✅ Admin seulement
 */
router.put(
  '/company', 
  requireRole('admin'),
  validateRequest(settingsSchema.updateCompany),
  settingsController.updateCompanyInfo
);

/**
 * PUT /api/v1/settings/invoice
 * Mettre à jour les paramètres de facturation
 * ✅ Admin seulement
 */
router.put(
  '/invoice', 
  requireRole('admin'),
  validateRequest(settingsSchema.updateInvoice),
  settingsController.updateInvoiceSettings
);

/**
 * PUT /api/v1/settings/notifications
 * Mettre à jour les paramètres de notifications
 * ✅ Admin seulement
 */
router.put(
  '/notifications', 
  requireRole('admin'),
  validateRequest(settingsSchema.updateNotifications),
  settingsController.updateNotificationSettings
);

// ======================================================
// ✅ ROUTES POST (pour les actions spéciales)
// ======================================================

/**
 * POST /api/v1/settings/reset
 * Réinitialiser les paramètres
 * ✅ Admin seulement
 */
router.post(
  '/reset', 
  requireRole('admin'),
  settingsController.resetSettings
);

export default router;