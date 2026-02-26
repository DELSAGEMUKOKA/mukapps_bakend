// src/routes/invoices.routes.js
import express from 'express';
import invoiceController from '../controllers/invoiceController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { companyIsolationMiddleware } from '../middleware/companyIsolation.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { invoiceSchema } from '../utils/validators.js';
import { 
  invoiceUserFilter, 
  checkResourceOwnership,
  addFilterStats 
} from '../middleware/userFilter.js';
import Invoice from '../models/Invoice.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);
router.use(companyIsolationMiddleware);

// ======================================================
// MIDDLEWARES DE FILTRAGE
// ======================================================

// ✅ Applique le filtre utilisateur à toutes les routes de factures
// - Caissier: ne voit que ses propres factures
// - Admin/Supervisor: voit toutes les factures
router.use(invoiceUserFilter);

// ✅ Ajoute des statistiques de filtrage (utile en développement)
if (process.env.NODE_ENV === 'development') {
  router.use(addFilterStats);
}

// ======================================================
// ROUTES GET - Accessibles selon le rôle
// ======================================================

/**
 * GET /api/v1/invoices
 * Récupérer toutes les factures (filtrées selon le rôle)
 * - Caissier: voit ses propres factures
 * - Admin/Supervisor: voit toutes les factures
 */
router.get('/', invoiceController.getInvoices);

/**
 * GET /api/v1/invoices/stats
 * Statistiques des factures (filtrées selon le rôle)
 * - Caissier: ses propres stats
 * - Admin/Supervisor: stats globales + par caissier
 */
router.get('/stats', invoiceController.getInvoiceStats);

/**
 * GET /api/v1/invoices/cashier-stats
 * Statistiques par caissier (admin/supervisor seulement)
 */
router.get(
  '/cashier-stats', 
  requireRole('admin', 'supervisor'),
  invoiceController.getCashierStats
);

/**
 * GET /api/v1/invoices/customer/:customerId
 * Factures d'un client (filtrées selon le rôle)
 */
router.get('/customer/:customerId', invoiceController.getCustomerInvoices);

/**
 * GET /api/v1/invoices/:id
 * Récupérer une facture par ID avec vérification de propriété
 * - Vérifie que le caissier possède cette facture
 * - Admin/Supervisor: pas de vérification
 */
router.get(
  '/:id', 
  checkResourceOwnership(Invoice), // ✅ Vérifie la propriété pour les caissiers
  invoiceController.getInvoiceById
);

// ======================================================
// ROUTES POST
// ======================================================

/**
 * POST /api/v1/invoices
 * Créer une nouvelle facture (accessible à tous)
 * - La facture sera automatiquement associée à l'utilisateur connecté
 */
router.post(
  '/', 
  validateRequest(invoiceSchema.create),
  invoiceController.createInvoice
);

// ======================================================
// ROUTES PUT
// ======================================================

/**
 * PUT /api/v1/invoices/:id
 * Mettre à jour une facture avec vérification de propriété
 */
router.put(
  '/:id', 
  checkResourceOwnership(Invoice), // ✅ Vérifie la propriété pour les caissiers
  validateRequest(invoiceSchema.update),
  invoiceController.updateInvoice
);

/**
 * PUT /api/v1/invoices/:id/cancel
 * Annuler une facture avec vérification de propriété
 * - Caissier: peut annuler ses propres factures
 * - Admin/Supervisor: peut annuler toutes les factures
 */
router.put(
  '/:id/cancel', 
  checkResourceOwnership(Invoice), // ✅ Vérifie la propriété pour les caissiers
  invoiceController.cancelInvoice
);

// ======================================================
// ROUTES DELETE - Admin seulement
// ======================================================

/**
 * DELETE /api/v1/invoices/:id
 * Supprimer une facture (admin seulement)
 */
router.delete(
  '/:id', 
  requireRole('admin'),
  invoiceController.deleteInvoice
);

export default router;