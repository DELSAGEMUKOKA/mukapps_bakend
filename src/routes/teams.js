// src/routes/teams.routes.js
import express from 'express';
import * as teamController from '../controllers/teamController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { companyIsolationMiddleware } from '../middleware/companyIsolation.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { teamSchema } from '../utils/validators.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);
router.use(companyIsolationMiddleware);

// ======================================================
// ✅ ROUTES GET - Accessibles à tous
// ======================================================

/**
 * GET /api/v1/teams
 * Récupérer toutes les équipes
 * ✅ Accessible à tous
 */
router.get('/', teamController.getTeams);

/**
 * GET /api/v1/teams/:id
 * Récupérer une équipe par ID
 * ✅ Accessible à tous
 */
router.get('/:id', teamController.getTeamById);

/**
 * GET /api/v1/teams/:id/members
 * Récupérer les membres d'une équipe
 * ✅ Accessible à tous
 */
router.get('/:id/members', teamController.getTeamMembers);

/**
 * GET /api/v1/teams/:id/stats
 * Récupérer les statistiques d'une équipe
 * ✅ Accessible à tous
 */
router.get('/:id/stats', teamController.getTeamStats);

// ======================================================
// ✅ ROUTES POST/PUT/DELETE - Admin et manager seulement
// ======================================================

/**
 * POST /api/v1/teams
 * Créer une nouvelle équipe
 * ✅ Admin et manager seulement
 */
router.post(
  '/', 
  requireRole('admin', 'manager'),
  validateRequest(teamSchema.create), 
  teamController.createTeam
);

/**
 * PUT /api/v1/teams/:id
 * Mettre à jour une équipe
 * ✅ Admin et manager seulement
 */
router.put(
  '/:id', 
  requireRole('admin', 'manager'),
  validateRequest(teamSchema.update), 
  teamController.updateTeam
);

/**
 * DELETE /api/v1/teams/:id
 * Supprimer une équipe
 * ✅ Admin seulement
 */
router.delete(
  '/:id', 
  requireRole('admin'),
  teamController.deleteTeam
);

// ======================================================
// ✅ ROUTES DE GESTION DES MEMBRES - Admin et manager seulement
// ======================================================

/**
 * POST /api/v1/teams/:id/members
 * Ajouter un membre à une équipe
 * ✅ Admin et manager seulement
 */
router.post(
  '/:id/members', 
  requireRole('admin', 'manager'),
  validateRequest(teamSchema.addMember), 
  teamController.addTeamMember
);

/**
 * PUT /api/v1/teams/:id/members/:memberId
 * Mettre à jour un membre d'équipe
 * ✅ Admin et manager seulement
 */
router.put(
  '/:id/members/:memberId', 
  requireRole('admin', 'manager'),
  validateRequest(teamSchema.updateMember), 
  teamController.updateTeamMember
);

/**
 * DELETE /api/v1/teams/:id/members/:memberId
 * Retirer un membre d'une équipe
 * ✅ Admin et manager seulement
 */
router.delete(
  '/:id/members/:memberId', 
  requireRole('admin', 'manager'),
  teamController.removeTeamMember
);

export default router;