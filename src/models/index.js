// src/models/index.js
import sequelize from '../config/database.js';
import Company from './Company.js';
import User from './User.js';
import Product from './Product.js';
import Category from './Category.js';
import Customer from './Customer.js';
import Invoice from './Invoice.js';
import Expense from './Expense.js';
import StockMovement from './StockMovement.js';
import Subscription from './Subscription.js';
import Settings from './Settings.js';
import Role from './Role.js';
import AdminAction from './AdminAction.js';
import LoginAttempt from './LoginAttempt.js';
import UserPin from './UserPin.js';

// ======================================================
// COMPANY ASSOCIATIONS
// ======================================================
Company.hasMany(User, { foreignKey: 'company_id', as: 'users' });
Company.hasMany(Product, { foreignKey: 'companyId', as: 'products' });
Company.hasMany(Category, { foreignKey: 'companyId', as: 'categories' });
Company.hasMany(Customer, { foreignKey: 'companyId', as: 'customers' });
Company.hasMany(Invoice, { foreignKey: 'companyId', as: 'invoices' });
Company.hasMany(Expense, { foreignKey: 'companyId', as: 'expenses' });
Company.hasMany(StockMovement, { foreignKey: 'companyId', as: 'stockMovements' });
Company.hasMany(Role, { foreignKey: 'companyId', as: 'roles' });
Company.hasMany(UserPin, { foreignKey: 'companyId', as: 'userPins' });
Company.hasOne(Settings, { foreignKey: 'companyId', as: 'settings' });
// CORRIGÉ: companyId au lieu de company_id
Company.hasMany(Subscription, { foreignKey: 'companyId', as: 'subscriptions' });

// ======================================================
// USER ASSOCIATIONS
// ======================================================
User.belongsTo(Company, { foreignKey: 'company_id', as: 'company' });
User.hasMany(Invoice, { foreignKey: 'userId', as: 'invoices' });
User.hasMany(Expense, { foreignKey: 'userId', as: 'expenses' });
User.hasMany(StockMovement, { foreignKey: 'userId', as: 'stockMovements' });
User.hasMany(AdminAction, { foreignKey: 'adminId', as: 'adminActions' });
User.hasMany(AdminAction, { foreignKey: 'targetUserId', as: 'targetedActions' });
User.hasMany(LoginAttempt, { foreignKey: 'userId', as: 'loginAttempts' });
User.hasOne(UserPin, { foreignKey: 'userId', as: 'pin' });
// CORRIGÉ: userId au lieu de user_id
User.hasMany(Subscription, { foreignKey: 'userId', as: 'userSubscriptions' });

// ======================================================
// SUBSCRIPTION ASSOCIATIONS
// ======================================================
// CORRIGÉ: companyId au lieu de company_id et userId au lieu de user_id
Subscription.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
Subscription.belongsTo(User, { foreignKey: 'userId', as: 'subscriber' });

// ======================================================
// CATEGORY ASSOCIATIONS
// ======================================================
Category.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
Category.hasMany(Product, { foreignKey: 'categoryId', as: 'products' });

// ======================================================
// PRODUCT ASSOCIATIONS
// ======================================================
Product.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
Product.belongsTo(Category, { foreignKey: 'categoryId', as: 'category' });
Product.hasMany(StockMovement, { foreignKey: 'productId', as: 'stockMovements' });

// ======================================================
// CUSTOMER ASSOCIATIONS
// ======================================================
Customer.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
Customer.hasMany(Invoice, { foreignKey: 'customerId', as: 'invoices' });

// ======================================================
// INVOICE ASSOCIATIONS
// ======================================================
Invoice.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
Invoice.belongsTo(Customer, { foreignKey: 'customerId', as: 'customer' });
Invoice.belongsTo(User, { foreignKey: 'userId', as: 'creator' });

// ======================================================
// EXPENSE ASSOCIATIONS
// ======================================================
Expense.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Expense.belongsTo(User, { foreignKey: 'approvedBy', as: 'approver' });
Expense.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// ======================================================
// STOCK MOVEMENT ASSOCIATIONS
// ======================================================
StockMovement.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
StockMovement.belongsTo(Product, { foreignKey: 'productId', as: 'product' });
StockMovement.belongsTo(User, { foreignKey: 'userId', as: 'creator' });

// ======================================================
// SETTINGS ASSOCIATIONS
// ======================================================
Settings.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// ======================================================
// ROLE ASSOCIATIONS
// ======================================================
Role.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });

// ======================================================
// ADMIN ACTION ASSOCIATIONS
// ======================================================
AdminAction.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
AdminAction.belongsTo(User, { foreignKey: 'adminId', as: 'admin' });
AdminAction.belongsTo(User, { foreignKey: 'targetUserId', as: 'targetUser' });

// ======================================================
// LOGIN ATTEMPT ASSOCIATIONS
// ======================================================
LoginAttempt.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
LoginAttempt.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// ======================================================
// USER PIN ASSOCIATIONS
// ======================================================
UserPin.belongsTo(Company, { foreignKey: 'companyId', as: 'company' });
UserPin.belongsTo(User, { foreignKey: 'userId', as: 'user' });

// Export all models
export {
  sequelize,
  Company,
  User,
  Product,
  Category,
  Customer,
  Invoice,
  Expense,
  StockMovement,
  Subscription,
  Settings,
  Role,
  AdminAction,
  LoginAttempt,
  UserPin
};