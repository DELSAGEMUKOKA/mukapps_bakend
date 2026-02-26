import express from 'express';
import * as maxicashSubController from '../controllers/maxicashSubscriptionController.js';
import { authenticate } from '../middleware/auth.js';
import { companyIsolationMiddleware } from '../middleware/companyIsolation.js';
import { checkRole } from '../middleware/roleCheck.js';
import { validateRequest } from '../middleware/validateRequest.js';
import Joi from 'joi';

const router = express.Router();

const initiatePaymentSchema = Joi.object({
  planId: Joi.string().valid('free', 'basic', 'pro', 'enterprise').required(),
  customerPhone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).required()
    .messages({
      'string.pattern.base': 'Please provide a valid phone number in international format'
    }),
  autoRenew: Joi.boolean().optional().default(false)
});

const updateAutoRenewSchema = Joi.object({
  autoRenew: Joi.boolean().required()
});

router.use(authenticate);
router.use(companyIsolationMiddleware);

router.get('/plans', maxicashSubController.getAvailablePlans);

router.get('/active', maxicashSubController.getActiveSubscription);

router.get('/history', maxicashSubController.getSubscriptionHistory);

router.post(
  '/initiate',
  checkRole(['admin']),
  validateRequest(initiatePaymentSchema),
  maxicashSubController.initiateSubscriptionPayment
);

router.get(
  '/verify/:transactionId',
  maxicashSubController.verifySubscriptionPayment
);

router.post(
  '/:subscriptionId/cancel',
  checkRole(['admin']),
  maxicashSubController.cancelSubscription
);

router.put(
  '/:subscriptionId/auto-renew',
  checkRole(['admin']),
  validateRequest(updateAutoRenewSchema),
  maxicashSubController.updateAutoRenew
);

export default router;
