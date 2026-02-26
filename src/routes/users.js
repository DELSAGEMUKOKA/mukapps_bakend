// src/routes/users.routes.js
import express from 'express';
import * as userController from '../controllers/userController.js';
import { authenticate, requireRole } from '../middleware/auth.js';
import { companyIsolationMiddleware } from '../middleware/companyIsolation.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { userSchema } from '../utils/validators.js';

const router = express.Router();

// Toutes les routes nécessitent une authentification
router.use(authenticate);
router.use(companyIsolationMiddleware);

// ======================================================
// ROUTES PROFIL PERSONNEL - Accessibles à tous
// ======================================================
router.get('/profile', userController.getCurrentUserProfile);
router.put('/profile', 
  validateRequest(userSchema.updateProfile), 
  userController.updateUser  // Note: utilise updateUser pour le profil
);
router.post('/profile/change-password',  // Changé en POST pour plus de sécurité
  validateRequest(userSchema.changePassword), 
  userController.changePassword
);

// ======================================================
// ROUTES ADMIN SEULEMENT - Gestion des utilisateurs
// ======================================================
router.get('/', requireRole('admin'), userController.getUsers);
router.get('/:id', requireRole('admin'), userController.getUserById);
router.post('/', 
  requireRole('admin'), 
  validateRequest(userSchema.create), 
  userController.createUser
);

router.put('/:id', 
  requireRole('admin'), 
  validateRequest(userSchema.update), 
  userController.updateUser
);

router.put('/:id/role', 
  requireRole('admin'), 
  validateRequest(userSchema.updateRole), 
  userController.updateUserRole
);

router.post('/:id/deactivate', 
  requireRole('admin'), 
  userController.deactivateUser
);

router.post('/:id/activate', 
  requireRole('admin'), 
  userController.activateUser
);

router.delete('/:id', 
  requireRole('admin'), 
  userController.deleteUser
);

// Route pour changer le mot de passe d'un utilisateur (admin)
router.post('/:id/change-password', 
  requireRole('admin'), 
  validateRequest(userSchema.changePassword), 
  userController.changePassword
);

export default router;