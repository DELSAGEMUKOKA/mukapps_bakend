import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';
import env from '../config/env.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase()}]: ${message}`;

    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }

    if (stack) {
      log += `\n${stack}`;
    }

    return log;
  })
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level}]: ${message}`;

    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta, null, 2)}`;
    }

    if (stack) {
      log += `\n${stack}`;
    }

    return log;
  })
);

const transports = [
  new winston.transports.Console({
    format: consoleFormat,
    level: env.isDevelopment ? 'debug' : 'info'
  })
];

if (env.NODE_ENV !== 'test') {
  const logsDir = path.join(process.cwd(), 'logs');

  transports.push(
    new winston.transports.File({
      filename: path.join(logsDir, 'error.log'),
      level: 'error',
      format: logFormat,
      maxsize: 5242880,
      maxFiles: 5
    }),
    new winston.transports.File({
      filename: path.join(logsDir, 'combined.log'),
      format: logFormat,
      maxsize: 5242880,
      maxFiles: 5
    })
  );
}

const logger = winston.createLogger({
  level: env.isDevelopment ? 'debug' : 'info',
  transports,
  exitOnError: false
});

export const logRequest = (req, res, responseTime) => {
  const logData = {
    method: req.method,
    url: req.originalUrl,
    statusCode: res.statusCode,
    responseTime: `${responseTime}ms`,
    ip: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent')
  };

  if (req.user) {
    logData.userId = req.user.id;
    logData.companyId = req.user.companyId;
  }

  if (res.statusCode >= 400) {
    logger.error('HTTP Request Failed', logData);
  } else {
    logger.info('HTTP Request', logData);
  }
};

export const logError = (error, req = null) => {
  const errorData = {
    message: error.message,
    stack: error.stack,
    code: error.code,
    statusCode: error.statusCode
  };

  if (req) {
    errorData.method = req.method;
    errorData.url = req.originalUrl;
    errorData.ip = req.ip || req.connection.remoteAddress;

    if (req.user) {
      errorData.userId = req.user.id;
      errorData.companyId = req.user.companyId;
    }
  }

  logger.error('Application Error', errorData);
};

export const logDatabaseQuery = (query, duration) => {
  logger.debug('Database Query', {
    query: query.substring(0, 200),
    duration: `${duration}ms`
  });
};

export const logAuthentication = (action, userId, success, details = {}) => {
  const logData = {
    action,
    userId,
    success,
    timestamp: new Date().toISOString(),
    ...details
  };

  if (success) {
    logger.info('Authentication Event', logData);
  } else {
    logger.warn('Authentication Failed', logData);
  }
};

export const logSecurityEvent = (event, severity, details) => {
  const logData = {
    event,
    severity,
    timestamp: new Date().toISOString(),
    ...details
  };

  if (severity === 'critical' || severity === 'high') {
    logger.error('Security Event', logData);
  } else {
    logger.warn('Security Event', logData);
  }
};

export const logBusinessEvent = (event, entityType, entityId, userId, details = {}) => {
  logger.info('Business Event', {
    event,
    entityType,
    entityId,
    userId,
    timestamp: new Date().toISOString(),
    ...details
  });
};

export const logPerformance = (operation, duration, metadata = {}) => {
  const logData = {
    operation,
    duration: `${duration}ms`,
    ...metadata
  };

  if (duration > 1000) {
    logger.warn('Slow Operation', logData);
  } else {
    logger.debug('Performance', logData);
  }
};

export const logSystemEvent = (event, details = {}) => {
  logger.info('System Event', {
    event,
    timestamp: new Date().toISOString(),
    ...details
  });
};

export const logDataChange = (table, operation, recordId, userId, changes = {}) => {
  logger.info('Data Change', {
    table,
    operation,
    recordId,
    userId,
    changes,
    timestamp: new Date().toISOString()
  });
};

export const logExternalAPICall = (service, endpoint, method, statusCode, duration) => {
  const logData = {
    service,
    endpoint,
    method,
    statusCode,
    duration: `${duration}ms`
  };

  if (statusCode >= 400) {
    logger.error('External API Call Failed', logData);
  } else {
    logger.debug('External API Call', logData);
  }
};

export const sanitizeLogData = (data) => {
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'apiKey',
    'creditCard',
    'ssn',
    'cvv'
  ];

  const sanitized = { ...data };

  const sanitizeObject = (obj) => {
    Object.keys(obj).forEach(key => {
      if (sensitiveFields.some(field => key.toLowerCase().includes(field.toLowerCase()))) {
        obj[key] = '***REDACTED***';
      } else if (typeof obj[key] === 'object' && obj[key] !== null) {
        sanitizeObject(obj[key]);
      }
    });
  };

  if (typeof sanitized === 'object' && sanitized !== null) {
    sanitizeObject(sanitized);
  }

  return sanitized;
};

logger.logRequest = logRequest;
logger.logError = logError;
logger.logDatabaseQuery = logDatabaseQuery;
logger.logAuthentication = logAuthentication;
logger.logSecurityEvent = logSecurityEvent;
logger.logBusinessEvent = logBusinessEvent;
logger.logPerformance = logPerformance;
logger.logSystemEvent = logSystemEvent;
logger.logDataChange = logDataChange;
logger.logExternalAPICall = logExternalAPICall;
logger.sanitizeLogData = sanitizeLogData;

export default logger;
