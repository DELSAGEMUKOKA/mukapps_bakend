// src/routes/customers.routes.js
import express from 'express';
import * as customerController from '../controllers/customerController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { companyIsolationMiddleware } from '../middleware/companyIsolation.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { customerSchema } from '../utils/validators.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);
router.use(companyIsolationMiddleware);

// ======================================================
// ✅ ROUTES GET - Accessibles à tous (admin, supervisor, cashier)
// ======================================================

/**
 * GET /api/v1/customers
 * Récupérer tous les clients
 * ✅ Accessible à tous (les caissiers ont besoin de voir les clients)
 */
router.get('/', customerController.getCustomers);

/**
 * GET /api/v1/customers/:id
 * Récupérer un client par ID
 * ✅ Accessible à tous
 */
router.get('/:id', customerController.getCustomerById);

/**
 * GET /api/v1/customers/:id/stats
 * Statistiques d'un client
 * ✅ Accessible à tous
 */
router.get('/:id/stats', customerController.getCustomerStats);

// ======================================================
// ✅ ROUTES POST/PUT/DELETE - Admin et supervisor seulement
// ======================================================

/**
 * POST /api/v1/customers
 * Créer un nouveau client
 * ✅ Admin et supervisor seulement (les caissiers peuvent-ils créer des clients ?)
 * Si les caissiers doivent pouvoir créer des clients, changer en requireRole('admin', 'supervisor', 'cashier')
 */
router.post('/', 
  requireRole('admin', 'supervisor', 'cashier'),
  validateRequest(customerSchema.create), 
  customerController.createCustomer
);

/**
 * PUT /api/v1/customers/:id
 * Mettre à jour un client
 * ✅ Admin et supervisor seulement
 */
router.put('/:id', 
  requireRole('admin', 'supervisor'),
  validateRequest(customerSchema.update), 
  customerController.updateCustomer
);

/**
 * DELETE /api/v1/customers/:id
 * Supprimer un client
 * ✅ Admin seulement
 */
router.delete('/:id', 
  requireRole('admin'),
  customerController.deleteCustomer
);

export default router;