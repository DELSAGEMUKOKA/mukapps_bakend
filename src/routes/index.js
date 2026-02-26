import express from 'express';
import authRoutes from './auth.js';
import productRoutes from './products.js';
import invoiceRoutes from './invoices.js';
import categoryRoutes from './categories.js';
import customerRoutes from './customers.js';
import expenseRoutes from './expenses.js';
import stockRoutes from './stock.js';
import userRoutes from './users.js';
import companyRoutes from './companies.js';
import reportRoutes from './reports.js';

import teamRoutes from './teams.js';
import subscriptionRoutes from './subscriptions.js';
import settingsRoutes from './settings.js';  
import maxicashSubscriptionRoutes from './maxicashSubscriptions.js';
import cleanupRoutes from './cleanup.js';


const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Inventory Management System API',
    version: '1.0.0',
    environment: process.env.NODE_ENV || 'development',
    documentation: {
      auth: {
        path: '/api/v1/auth',
        description: 'Authentication and user management',
        endpoints: ['register', 'login', 'logout', 'refresh', 'forgot-password', 'reset-password']
      },
      products: {
        path: '/api/v1/products',
        description: 'Product inventory management',
        endpoints: ['CRUD operations', 'search', 'barcode lookup', 'stock management']
      },
      invoices: {
        path: '/api/v1/invoices',
        description: 'Invoice and billing management',
        endpoints: ['CRUD operations', 'PDF generation', 'payment tracking', 'status management']
      },
      categories: {
        path: '/api/v1/categories',
        description: 'Product category management',
        endpoints: ['CRUD operations']
      },
      customers: {
        path: '/api/v1/customers',
        description: 'Customer relationship management',
        endpoints: ['CRUD operations', 'statistics', 'invoices']
      },
      expenses: {
        path: '/api/v1/expenses',
        description: 'Expense tracking and approval',
        endpoints: ['CRUD operations', 'approval workflow', 'statistics']
      },
      stock: {
        path: '/api/v1/stock',
        description: 'Stock movement and inventory tracking',
        endpoints: ['movements', 'adjustments', 'transfers', 'low stock alerts', 'valuation']
      },
      users: {
        path: '/api/v1/users',
        description: 'User account management',
        endpoints: ['CRUD operations', 'role management', 'activation/deactivation']
      },
      companies: {
        path: '/api/v1/companies',
        description: 'Company profile and settings',
        endpoints: ['profile', 'settings', 'statistics', 'activity']
      },
      reports: {
        path: '/api/v1/reports',
        description: 'Business intelligence and reporting',
        endpoints: ['dashboard', 'sales', 'profit', 'inventory', 'customers', 'trends']
      },
      teams: {
        path: '/api/v1/teams',
        description: 'Team and member management',
        endpoints: ['CRUD operations', 'member management', 'statistics']
      },
      subscriptions: {
        path: '/api/v1/subscriptions',
        description: 'Subscription and billing management',
        endpoints: ['plans', 'upgrades', 'downgrades', 'usage tracking', 'invoices']
      },
      maxicashSubscriptions: {
        path: '/api/v1/maxicash-subscriptions',
        description: 'MaxiCash payment integration for subscriptions',
        endpoints: ['plans', 'initiate payment', 'verify payment', 'active subscription', 'cancel', 'auto-renew']
      },
      cleanup: {
        path: '/api/v1/cleanup',
        description: 'Automated data cleanup and maintenance (Admin only)',
        endpoints: ['manual invoice cleanup', 'statistics', 'scheduler status']
      }
    }
  });
});

router.use('/auth', authRoutes);
router.use('/products', productRoutes);
router.use('/invoices', invoiceRoutes);
router.use('/categories', categoryRoutes);
router.use('/customers', customerRoutes);
router.use('/expenses', expenseRoutes);
router.use('/stock', stockRoutes);
router.use('/users', userRoutes);
router.use('/companies', companyRoutes);
router.use('/reports', reportRoutes);
router.use('/teams', teamRoutes);
router.use('/subscriptions', subscriptionRoutes);
router.use('/maxicash-subscriptions', maxicashSubscriptionRoutes);
router.use('/cleanup', cleanupRoutes);
router.use('/settings', settingsRoutes); 

router.get('/health', (req, res) => {
  res.json({ success: true, message: 'API is running', timestamp: new Date().toISOString() });
});

export default router;
