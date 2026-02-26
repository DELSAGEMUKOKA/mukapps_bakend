import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import corsMiddleware from './middleware/cors.js';
import { generalLimiter } from './middleware/rateLimiter.js';
import { errorHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';
import logger from './utils/logger.js';
import env from './config/env.js';
import sequelize from './config/database.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.set('trust proxy', 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));

app.use(corsMiddleware);

app.disable('x-powered-by');

app.use((req, res, next) => {
  req.id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  req.startTime = Date.now();
  res.setHeader('X-Request-Id', req.id);
  next();
});

app.use(morgan('combined', {
  stream: {
    write: (message) => logger.http(message.trim())
  },
  skip: (req) => req.url === '/health'
}));

app.use(express.json({
  limit: '10mb',
  verify: (req, res, buf, encoding) => {
    try {
      JSON.parse(buf);
    } catch (e) {
      res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_JSON',
          message: 'Invalid JSON payload'
        }
      });
      throw new Error('Invalid JSON');
    }
  }
}));

app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

app.use((req, res, next) => {
  res.on('finish', () => {
    const responseTime = Date.now() - req.startTime;

    if (req.url !== '/health') {
      logger.logRequest(req, res, responseTime);
    }

    if (responseTime > 5000) {
      logger.warn('Slow request detected', {
        method: req.method,
        url: req.originalUrl,
        responseTime: `${responseTime}ms`,
        requestId: req.id
      });
    }
  });
  next();
});

app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Inventory Management System API',
    version: '1.0.0',
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString(),
    documentation: '/api/v1',
    endpoints: {
      auth: '/api/v1/auth',
      users: '/api/v1/users',
      companies: '/api/v1/companies',
      teams: '/api/v1/teams',
      products: '/api/v1/products',
      categories: '/api/v1/categories',
      customers: '/api/v1/customers',
      invoices: '/api/v1/invoices',
      expenses: '/api/v1/expenses',
      reports: '/api/v1/reports',
      stock: '/api/v1/stock',
      subscriptions: '/api/v1/subscriptions',
      settings: '/api/v1/settings'  // ✅ AJOUTÉ
    },
    healthCheck: '/health'
  });
});

app.get('/health', async (req, res) => {
  try {
    const startTime = Date.now();
    await sequelize.authenticate();
    const dbResponseTime = Date.now() - startTime;

    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    res.json({
      success: true,
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: Math.floor(process.uptime()),
      uptimeHuman: formatUptime(process.uptime()),
      environment: env.NODE_ENV,
      version: '1.0.0',
      database: {
        status: 'connected',
        responseTime: `${dbResponseTime}ms`
      },
      memory: {
        heapUsed: Math.round(memoryUsage.heapUsed / 1024 / 1024),
        heapTotal: Math.round(memoryUsage.heapTotal / 1024 / 1024),
        rss: Math.round(memoryUsage.rss / 1024 / 1024),
        external: Math.round(memoryUsage.external / 1024 / 1024),
        unit: 'MB'
      },
      cpu: {
        user: Math.round(cpuUsage.user / 1000),
        system: Math.round(cpuUsage.system / 1000),
        unit: 'ms'
      },
      node: {
        version: process.version,
        platform: process.platform,
        arch: process.arch
      }
    });
  } catch (error) {
    logger.error('Health check failed:', error);
    res.status(503).json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: {
        code: 'SERVICE_UNAVAILABLE',
        message: 'Database connection failed',
        details: env.isDevelopment ? error.message : undefined
      }
    });
  }
});

app.get('/api/v1', (req, res) => {
  res.json({
    success: true,
    message: 'Inventory Management API v1',
    version: '1.0.0',
    availableEndpoints: {
      authentication: {
        register: 'POST /api/v1/auth/register',
        login: 'POST /api/v1/auth/login',
        logout: 'POST /api/v1/auth/logout',
        refresh: 'POST /api/v1/auth/refresh',
        profile: 'GET /api/v1/auth/profile'
      },
      users: {
        list: 'GET /api/v1/users',
        get: 'GET /api/v1/users/:id',
        create: 'POST /api/v1/users',
        update: 'PUT /api/v1/users/:id',
        delete: 'DELETE /api/v1/users/:id'
      },
      companies: {
        list: 'GET /api/v1/companies',
        get: 'GET /api/v1/companies/:id',
        create: 'POST /api/v1/companies',
        update: 'PUT /api/v1/companies/:id'
      },
      products: {
        list: 'GET /api/v1/products',
        get: 'GET /api/v1/products/:id',
        create: 'POST /api/v1/products',
        update: 'PUT /api/v1/products/:id',
        delete: 'DELETE /api/v1/products/:id'
      },
      categories: {
        list: 'GET /api/v1/categories',
        get: 'GET /api/v1/categories/:id',
        create: 'POST /api/v1/categories',
        update: 'PUT /api/v1/categories/:id',
        delete: 'DELETE /api/v1/categories/:id'
      },
      customers: {
        list: 'GET /api/v1/customers',
        get: 'GET /api/v1/customers/:id',
        create: 'POST /api/v1/customers',
        update: 'PUT /api/v1/customers/:id',
        delete: 'DELETE /api/v1/customers/:id'
      },
      invoices: {
        list: 'GET /api/v1/invoices',
        get: 'GET /api/v1/invoices/:id',
        create: 'POST /api/v1/invoices',
        update: 'PUT /api/v1/invoices/:id',
        delete: 'DELETE /api/v1/invoices/:id'
      },
      expenses: {
        list: 'GET /api/v1/expenses',
        get: 'GET /api/v1/expenses/:id',
        create: 'POST /api/v1/expenses',
        update: 'PUT /api/v1/expenses/:id',
        delete: 'DELETE /api/v1/expenses/:id',
        approve: 'PUT /api/v1/expenses/:id/approve',
        reject: 'PUT /api/v1/expenses/:id/reject'
      },
      stock: {
        movements: 'GET /api/v1/stock/movements',
        getMovement: 'GET /api/v1/stock/movements/:id',
        createMovement: 'POST /api/v1/stock/movements',
        lowStock: 'GET /api/v1/stock/low-stock',
        outOfStock: 'GET /api/v1/stock/out-of-stock',
        valuation: 'GET /api/v1/stock/valuation',
        adjust: 'POST /api/v1/stock/adjust',
        transfer: 'POST /api/v1/stock/transfer'
      },
      reports: {
        dashboard: 'GET /api/v1/reports/dashboard',
        sales: 'GET /api/v1/reports/sales',
        inventory: 'GET /api/v1/reports/inventory',
        profit: 'GET /api/v1/reports/profit',
        expenses: 'GET /api/v1/reports/expenses',
        customers: 'GET /api/v1/reports/customers',
        topProducts: 'GET /api/v1/reports/top-products'
      },
      subscriptions: {
        current: 'GET /api/v1/subscriptions/current',
        history: 'GET /api/v1/subscriptions/history',
        plans: 'GET /api/v1/subscriptions/plans',
        update: 'PUT /api/v1/subscriptions',
        cancel: 'POST /api/v1/subscriptions/cancel',
        renew: 'POST /api/v1/subscriptions/renew'
      },
      settings: {  // ✅ AJOUTÉ
        get: 'GET /api/v1/settings',
        update: 'PUT /api/v1/settings',
        getCompany: 'GET /api/v1/settings/company',
        updateCompany: 'PUT /api/v1/settings/company',
        getInvoice: 'GET /api/v1/settings/invoice',
        updateInvoice: 'PUT /api/v1/settings/invoice',
        getNotifications: 'GET /api/v1/settings/notifications',
        updateNotifications: 'PUT /api/v1/settings/notifications',
        reset: 'POST /api/v1/settings/reset'
      }
    },
    documentation: 'https://docs.example.com'
  });
});

app.use('/api/v1', generalLimiter);
app.use('/api/v1', routes);  // ✅ Les routes settings sont incluses dans routes/index.js

app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      code: 'NOT_FOUND',
      message: `Route ${req.method} ${req.originalUrl} not found`,
      timestamp: new Date().toISOString(),
      requestId: req.id
    }
  });
});

app.use(errorHandler);

function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);

  const parts = [];
  if (days > 0) parts.push(`${days}d`);
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);

  return parts.join(' ');
}

export default app;