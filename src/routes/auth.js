// src/routes/auth.js
import express from 'express';
import authController from '../controllers/authController.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { authSchema } from '../utils/validators.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

// Routes publiques (avec rate limiting)
router.post('/register', authLimiter, validateRequest(authSchema.register), authController.register);
router.post('/login', authLimiter, validateRequest(authSchema.login), authController.login);
router.post('/refresh', authLimiter, validateRequest(authSchema.refresh), authController.refreshToken);

// Routes de gestion des mots de passe (publiques avec rate limiting)
router.post('/forgot-password', authLimiter, validateRequest(authSchema.forgotPassword), authController.forgotPassword);
router.post('/reset-password', authLimiter, validateRequest(authSchema.resetPassword), authController.resetPassword);
router.get('/verify-reset-token/:token', authController.verifyResetToken); // Vérifier la validité du token

// Routes de vérification d'email
router.post('/verify-email', authLimiter, validateRequest(authSchema.verifyEmail), authController.verifyEmail);
router.post('/resend-verification', authLimiter, validateRequest(authSchema.resendVerification), authController.resendVerification);

// Routes protégées (nécessitent authentification)
router.get('/me', authenticate, authController.me);
router.put('/me', authenticate, validateRequest(authSchema.updateProfile), authController.updateProfile);
router.post('/change-password', authenticate, validateRequest(authSchema.changePassword), authController.changePassword);
router.post('/logout', authenticate, authController.logout);

export default router;