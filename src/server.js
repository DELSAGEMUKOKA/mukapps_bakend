import app from './app.js';
import env from './config/env.js';
import logger from './utils/logger.js';
import syncDatabase from './config/syncDatabase.js';
import sequelize, { convertToInnoDB } from './config/database.js';
import schedulerService from './services/schedulerService.js';
import { fileURLToPath } from 'url';
import path from 'path';
import fs from 'fs';
import os from 'os';

// Import des routes existantes
import authRoutes from './routes/auth.js';
import userRoutes from './routes/users.js';
import companyRoutes from './routes/companies.js';
import productRoutes from './routes/products.js';
import categoryRoutes from './routes/categories.js';
import customerRoutes from './routes/customers.js';
import invoiceRoutes from './routes/invoices.js';
import expenseRoutes from './routes/expenses.js';
import stockRoutes from './routes/stock.js';
import reportRoutes from './routes/reports.js';
import subscriptionRoutes from './routes/subscriptions.js';
import settingsRoutes from './routes/settings.js';

// ⚠️ Commenter les routes qui n'existent pas encore
// import roleRoutes from './routes/roles.js';
// import adminActionRoutes from './routes/adminActions.js';
// import loginAttemptRoutes from './routes/loginAttempts.js';
// import userPinRoutes from './routes/userPins.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = env.PORT || 5000;
let isShuttingDown = false;

const validateEnvironment = () => {
  logger.info('Validating environment configuration...');

  const requiredEnvVars = [
    'DB_HOST',
    'DB_NAME',
    'DB_USER',
    'JWT_SECRET'
  ];

  const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    logger.error('Missing required environment variables:', missingVars);
    throw new Error(`Missing required environment variables: ${missingVars.join(', ')}`);
  }

  logger.info('Environment validation passed');
};

const ensureDirectories = () => {
  logger.info('Ensuring required directories exist...');

  const directories = [
    path.join(process.cwd(), 'uploads'),
    path.join(process.cwd(), 'logs')
  ];

  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
      logger.info(`Created directory: ${dir}`);
    }
  });

  logger.info('Directory check completed');
};

const checkDatabaseConnection = async () => {
  logger.info('Testing database connection...');

  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');

    const [results] = await sequelize.query('SELECT VERSION() as version');
    if (results && results[0]) {
      logger.info(`Database version: ${results[0].version}`);
    }

    return true;
  } catch (error) {
    logger.error('Unable to connect to database:', error);
    throw error;
  }
};

const ensureInnoDB = async () => {
  try {
    logger.info('Checking database storage engines...');
    
    const converted = await convertToInnoDB();
    
    if (converted) {
      logger.info('Storage engine check completed');
    } else {
      logger.warn('Some tables could not be converted to InnoDB');
    }
    
    return converted;
  } catch (error) {
    logger.error('Error checking storage engines:', error);
    throw error;
  }
};

const displayStartupBanner = () => {
  const banner = `
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║           INVENTORY MANAGEMENT SYSTEM API                     ║
║                    Version 1.0.0                              ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
  `;

  console.log(banner);
};

const displaySystemInfo = () => {
  logger.info('System Information:');
  logger.info(`  Node.js: ${process.version}`);
  logger.info(`  Platform: ${process.platform} (${process.arch})`);
  logger.info(`  Environment: ${env.NODE_ENV}`);
  logger.info(`  Memory: ${Math.round(process.memoryUsage().heapTotal / 1024 / 1024)} MB`);
  logger.info(`  CPU Cores: ${os.cpus().length}`);
  logger.info(`  Process ID: ${process.pid}`);
};

const displayConnectionInfo = () => {
  logger.info('Connection Information:');
  logger.info(`  Database: MySQL (${process.env.DB_HOST}:${process.env.DB_PORT})`);
  logger.info(`  Database Name: ${process.env.DB_NAME}`);
  logger.info(`  Server Port: ${PORT}`);
};

const startServer = async () => {
  try {
    displayStartupBanner();

    logger.info('='.repeat(65));
    logger.info('Starting Inventory Management System...');
    logger.info('='.repeat(65));

    validateEnvironment();

    ensureDirectories();

    displaySystemInfo();

    displayConnectionInfo();

    await checkDatabaseConnection();

    await ensureInnoDB();

    logger.info('Synchronizing database schema...');
    await syncDatabase(false);
    logger.info('Database schema synchronized successfully');

    logger.info('Initializing scheduler service...');
    await schedulerService.initialize();
    logger.info('Scheduler service initialized');

    // ======================================================
    // CONFIGURATION DES ROUTES
    // ======================================================
    
    // Routes principales
    app.use('/api/v1/auth', authRoutes);
    app.use('/api/v1/users', userRoutes);
    app.use('/api/v1/companies', companyRoutes);
    app.use('/api/v1/products', productRoutes);
    app.use('/api/v1/categories', categoryRoutes);
    app.use('/api/v1/customers', customerRoutes);
    app.use('/api/v1/invoices', invoiceRoutes);
    app.use('/api/v1/expenses', expenseRoutes);
    app.use('/api/v1/stock', stockRoutes);
    app.use('/api/v1/reports', reportRoutes);
    app.use('/api/v1/subscriptions', subscriptionRoutes);
    app.use('/api/v1/settings', settingsRoutes);  // ✅ Route settings activée
    
    // ⚠️ Routes commentées (à décommenter quand les fichiers seront créés)
    // app.use('/api/v1/roles', roleRoutes);
    // app.use('/api/v1/admin-actions', adminActionRoutes);
    // app.use('/api/v1/login-attempts', loginAttemptRoutes);
    // app.use('/api/v1/user-pins', userPinRoutes);

    const server = app.listen(PORT, () => {
      logger.info('='.repeat(65));
      logger.info('Server Started Successfully!');
      logger.info('='.repeat(65));
      logger.info(`  Status: RUNNING`);
      logger.info(`  Mode: ${env.NODE_ENV.toUpperCase()}`);
      logger.info(`  Port: ${PORT}`);
      logger.info('');
      logger.info('Available Endpoints:');
      logger.info(`  🏠 Home:        http://localhost:${PORT}/`);
      logger.info(`  🚀 API:         http://localhost:${PORT}/api/v1`);
      logger.info(`  ❤️  Health:      http://localhost:${PORT}/health`);
      logger.info('');
      logger.info('API Routes:');
      logger.info(`  🔐 Auth:        http://localhost:${PORT}/api/v1/auth`);
      logger.info(`  👥 Users:       http://localhost:${PORT}/api/v1/users`);
      logger.info(`  🏢 Companies:   http://localhost:${PORT}/api/v1/companies`);
      logger.info(`  📦 Products:    http://localhost:${PORT}/api/v1/products`);
      logger.info(`  🏷️  Categories:  http://localhost:${PORT}/api/v1/categories`);
      logger.info(`  👤 Customers:   http://localhost:${PORT}/api/v1/customers`);
      logger.info(`  🧾 Invoices:    http://localhost:${PORT}/api/v1/invoices`);
      logger.info(`  💰 Expenses:    http://localhost:${PORT}/api/v1/expenses`);
      logger.info(`  📊 Reports:     http://localhost:${PORT}/api/v1/reports`);
      logger.info(`  📈 Stock:       http://localhost:${PORT}/api/v1/stock`);
      logger.info(`  ⚙️ Settings:    http://localhost:${PORT}/api/v1/settings`);
      logger.info(`  📋 Subscriptions: http://localhost:${PORT}/api/v1/subscriptions`);
      logger.info('='.repeat(65));

      if (logger.logSystemEvent) {
        logger.logSystemEvent('server_started', {
          port: PORT,
          environment: env.NODE_ENV,
          nodeVersion: process.version,
          pid: process.pid
        });
      }
    });

    server.setTimeout(120000);

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${PORT} is already in use`);
      } else {
        logger.error('Server error:', error);
      }
      process.exit(1);
    });

    server.keepAliveTimeout = 65000;
    server.headersTimeout = 66000;

    return server;
  } catch (error) {
    logger.error('Failed to start server:', {
      error: error.message,
      stack: error.stack
    });
    
    if (error.message.includes('Foreign key constraint')) {
      console.log('');
      console.log('⚠️  ERREUR DE CLÉ ÉTRANGÈRE DÉTECTÉE');
      console.log('📋 Solution: Vérifiez que:');
      console.log('   1. Toutes les tables sont en InnoDB');
      console.log('   2. Les types de données correspondent');
      console.log('');
    }
    
    process.exit(1);
  }
};

const server = await startServer();

const gracefulShutdown = async (signal) => {
  if (isShuttingDown) {
    logger.warn('Shutdown already in progress...');
    return;
  }

  isShuttingDown = true;

  logger.info('='.repeat(65));
  logger.info(`Received ${signal} signal. Starting graceful shutdown...`);
  logger.info('='.repeat(65));

  if (logger.logSystemEvent) {
    logger.logSystemEvent('server_shutdown_initiated', { signal });
  }

  const shutdownTimeout = setTimeout(() => {
    logger.error('Graceful shutdown timeout exceeded. Forcing shutdown...');
    process.exit(1);
  }, 15000);

  try {
    logger.info('Stopping scheduler service...');
    schedulerService.stop();
    logger.info('Scheduler service stopped');

    logger.info('Stopping HTTP server...');
    await new Promise((resolve, reject) => {
      server.close((err) => {
        if (err) {
          logger.error('Error closing HTTP server:', err);
          reject(err);
        } else {
          logger.info('HTTP server closed successfully');
          resolve();
        }
      });
    });

    logger.info('Closing database connections...');
    await sequelize.close();
    logger.info('Database connections closed successfully');

    clearTimeout(shutdownTimeout);

    logger.info('='.repeat(65));
    logger.info('Graceful shutdown completed successfully');
    logger.info('='.repeat(65));

    if (logger.logSystemEvent) {
      logger.logSystemEvent('server_shutdown_completed', {
        signal,
        uptime: process.uptime()
      });
    }

    process.exit(0);
  } catch (error) {
    logger.error('Error during graceful shutdown:', error);
    clearTimeout(shutdownTimeout);
    process.exit(1);
  }
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

process.on('unhandledRejection', (reason, promise) => {
  logger.error('Unhandled Promise Rejection:', {
    reason: reason instanceof Error ? reason.message : reason,
    stack: reason instanceof Error ? reason.stack : undefined,
    promise
  });

  if (logger.logSecurityEvent) {
    logger.logSecurityEvent('unhandled_rejection', 'high', {
      reason: reason instanceof Error ? reason.message : String(reason)
    });
  }
});

process.on('uncaughtException', (error, origin) => {
  logger.error('Uncaught Exception:', {
    error: error.message,
    stack: error.stack,
    origin
  });

  if (logger.logSecurityEvent) {
    logger.logSecurityEvent('uncaught_exception', 'critical', {
      error: error.message,
      origin
    });
  }

  gracefulShutdown('UNCAUGHT_EXCEPTION');
});

process.on('warning', (warning) => {
  logger.warn('Node.js Warning:', {
    name: warning.name,
    message: warning.message,
    stack: warning.stack
  });
});

if (env.isDevelopment) {
  process.on('exit', (code) => {
    logger.info(`Process exiting with code: ${code}`);
  });
}

export default server;