import express from 'express';
import * as companyController from '../controllers/companyController.js';
import { authenticate } from '../middleware/auth.js';
import { companyIsolationMiddleware } from '../middleware/companyIsolation.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { companySchema } from '../utils/validators.js';
import { checkRole } from '../middleware/roleCheck.js';

const router = express.Router();

router.use(authenticate);
router.use(companyIsolationMiddleware);

router.get('/', companyController.getCompany);
router.put('/', checkRole(['admin']), validateRequest(companySchema.update), companyController.updateCompany);
router.get('/stats', companyController.getCompanyStats);
router.get('/settings', companyController.getCompanySettings);
router.put('/settings', checkRole(['admin']), validateRequest(companySchema.updateSettings), companyController.updateCompanySettings);
router.get('/activity', companyController.getCompanyActivity);

export default router;
