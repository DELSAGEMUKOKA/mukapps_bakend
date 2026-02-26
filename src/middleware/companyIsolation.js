import logger from '../utils/logger.js';

export const companyIsolationMiddleware = (req, res, next) => {
  if (!req.user || !req.user.companyId) {
    logger.warn('Request without company context', {
      path: req.path,
      method: req.method,
      userId: req.user?.id
    });

    return res.status(403).json({
      success: false,
      error: {
        code: 'COMPANY_CONTEXT_REQUIRED',
        message: 'Company context is required for this operation'
      }
    });
  }

  logger.debug('Company isolation check passed', {
    companyId: req.user.companyId,
    userId: req.user.id,
    path: req.path
  });

  next();
};

export const validateCompanyAccess = (resourceCompanyId, userCompanyId, resourceName = 'Resource') => {
  if (!resourceCompanyId || !userCompanyId) {
    throw new Error('Company validation requires both resource and user company IDs');
  }

  if (resourceCompanyId !== userCompanyId) {
    logger.warn('Unauthorized cross-company access attempt', {
      resourceCompanyId,
      userCompanyId,
      resourceName
    });

    throw new Error(`Access denied: ${resourceName} belongs to a different company`);
  }

  return true;
};

export const ensureCompanyFilter = (queryObject, companyId) => {
  if (!companyId) {
    throw new Error('Company ID is required for data filtering');
  }

  return {
    ...queryObject,
    company_id: companyId
  };
};

export default {
  companyIsolationMiddleware,
  validateCompanyAccess,
  ensureCompanyFilter
};
