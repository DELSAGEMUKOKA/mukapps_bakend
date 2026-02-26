import logger from '../utils/logger.js';
import env from '../config/env.js';

export const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'SERVER_ERROR';

  if (statusCode >= 500) {
    logger.error('Server Error:', {
      error: err.message,
      stack: err.stack,
      url: req.url,
      method: req.method,
      user: req.user?.id
    });
  } else {
    logger.warn('Client Error:', {
      error: message,
      code: code,
      url: req.url,
      user: req.user?.id
    });
  }

  if (err.code === 'PGRST116') {
    statusCode = 404;
    message = 'Resource not found';
    code = 'NOT_FOUND';
  }

  if (err.code === '23505') {
    statusCode = 409;
    message = 'Resource already exists';
    code = 'DUPLICATE';
  }

  res.status(statusCode).json({
    success: false,
    error: {
      code: code,
      message: message,
      ...(env.isDevelopment && { stack: err.stack }),
      ...(err.details && { details: err.details })
    }
  });
};

export default errorHandler;
