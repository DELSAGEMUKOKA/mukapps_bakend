import express from 'express';
import cleanupController from '../controllers/cleanupController.js';
import { authenticate } from '../middleware/auth.js';
import { checkRole } from '../middleware/roleCheck.js';
import { validateRequest } from '../middleware/validateRequest.js';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const cleanupSchema = Joi.object({
  days_old: Joi.number().integer().min(1).max(365).default(32),
  dry_run: Joi.boolean().default(false)
});

// All cleanup routes require authentication and admin role
router.use(authenticate);
router.use(checkRole(['admin']));

// Manual cleanup trigger
router.post('/invoices', validateRequest(cleanupSchema), cleanupController.cleanupInvoices);

// Get cleanup statistics
router.get('/stats', cleanupController.getStats);

// Reset statistics
router.post('/reset-stats', cleanupController.resetStats);

// Get scheduler status
router.get('/scheduler', cleanupController.getSchedulerStatus);

export default router;
