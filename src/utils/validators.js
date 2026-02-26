// src/utils/validators.js
import Joi from 'joi';

export const authSchema = {
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  }),
  register: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    companyName: Joi.string().min(2).max(200).required(),
    company_name: Joi.string().min(2).max(200),
    phone: Joi.string().optional().allow('', null)
  }).xor('companyName', 'company_name'),
  refresh: Joi.object({
    refreshToken: Joi.string().required()
  }),
  forgotPassword: Joi.object({
    email: Joi.string().email().required()
  }),
  resetPassword: Joi.object({
    token: Joi.string().required(),
    password: Joi.string().min(6).required()
  }),
  verifyEmail: Joi.object({
    token: Joi.string().required()
  }),
  resendVerification: Joi.object({
    email: Joi.string().email().required()
  }),
  updateProfile: Joi.object({
    name: Joi.string().min(2).max(200),
    phone: Joi.string().optional(),
    avatar: Joi.string().uri().optional()
  }).min(1),
  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required()
  })
};

export const loginSchema = authSchema.login;
export const registerSchema = authSchema.register;

export const productSchema = {
  create: Joi.object({
    name: Joi.string().min(1).max(200).required(),
    barcode: Joi.string().max(50).optional(),
    description: Joi.string().max(1000).optional(),
    category_id: Joi.string().uuid().optional().allow(null),
    purchase_price: Joi.number().min(0).precision(2).required(),
    selling_price: Joi.number().min(0).precision(2).required(),
    current_stock: Joi.number().integer().min(0).default(0),
    min_stock_level: Joi.number().integer().min(0).default(0),
    unit: Joi.string().max(20).default('piece'),
    image_url: Joi.string().uri().optional().allow('', null),
    sku: Joi.string().max(50).optional(),
    location: Joi.string().max(200).optional()
  }),
  update: Joi.object({
    name: Joi.string().min(1).max(200),
    barcode: Joi.string().max(50),
    description: Joi.string().max(1000).allow(''),
    category_id: Joi.string().uuid().allow(null),
    purchase_price: Joi.number().min(0).precision(2),
    selling_price: Joi.number().min(0).precision(2),
    current_stock: Joi.number().integer().min(0),
    min_stock_level: Joi.number().integer().min(0),
    unit: Joi.string().max(20),
    image_url: Joi.string().uri().allow('', null),
    sku: Joi.string().max(50).allow('', null),
    location: Joi.string().max(200).allow('', null)
  }).min(1),
  bulkCreate: Joi.object({
    products: Joi.array().items(
      Joi.object({
        name: Joi.string().min(1).max(200).required(),
        barcode: Joi.string().max(50).optional(),
        description: Joi.string().max(1000).optional(),
        category_id: Joi.string().uuid().optional().allow(null),
        purchase_price: Joi.number().min(0).precision(2).required(),
        selling_price: Joi.number().min(0).precision(2).required(),
        current_stock: Joi.number().integer().min(0).default(0),
        min_stock_level: Joi.number().integer().min(0).default(0),
        unit: Joi.string().max(20).default('piece'),
        image_url: Joi.string().uri().optional().allow('', null),
        sku: Joi.string().max(50).optional(),
        location: Joi.string().max(200).optional()
      })
    ).min(1).required()
  }),
  updatePrice: Joi.object({
    purchase_price: Joi.number().min(0).precision(2),
    selling_price: Joi.number().min(0).precision(2)
  }).min(1),
  updateStock: Joi.object({
    current_stock: Joi.number().integer().min(0).required(),
    reason: Joi.string().max(500).optional()
  }),
  bulkDelete: Joi.object({
    ids: Joi.array().items(Joi.string().uuid()).min(1).required()
  })
};

export const categorySchema = {
  create: Joi.object({
    name: Joi.string().min(1).max(100).required(),
    description: Joi.string().max(500).optional()
  }),
  update: Joi.object({
    name: Joi.string().min(1).max(100),
    description: Joi.string().max(500).allow('')
  }).min(1)
};

export const customerSchema = {
  create: Joi.object({
    name: Joi.string().min(1).max(200).required(),
    email: Joi.string().email().optional().allow('', null),
    phone: Joi.string().max(50).optional().allow('', null),
    address: Joi.string().max(500).optional().allow('', null),
    city: Joi.string().max(100).optional().allow('', null),
    state: Joi.string().max(100).optional().allow('', null),
    country: Joi.string().max(100).optional().allow('', null),
    zip_code: Joi.string().max(20).optional().allow('', null),
    tax_id: Joi.string().max(50).optional().allow('', null)
  }),
  update: Joi.object({
    name: Joi.string().min(1).max(200),
    email: Joi.string().email().allow('', null),
    phone: Joi.string().max(50).allow('', null),
    address: Joi.string().max(500).allow('', null),
    city: Joi.string().max(100).allow('', null),
    state: Joi.string().max(100).allow('', null),
    country: Joi.string().max(100).allow('', null),
    zip_code: Joi.string().max(20).allow('', null),
    tax_id: Joi.string().max(50).allow('', null)
  }).min(1)
};

export const invoiceSchema = {
  create: Joi.object({
    customer_id: Joi.string().uuid().optional().allow(null),
    items: Joi.array().items(
      Joi.object({
        product_id: Joi.string().uuid().required(),
        quantity: Joi.number().integer().min(1).required(),
        unit_price: Joi.number().min(0).precision(2).required(),
        tax: Joi.number().min(0).precision(2).default(0),
        discount: Joi.number().min(0).precision(2).default(0)
      })
    ).min(1).required(),
    payment_method: Joi.string().valid('cash', 'card', 'transfer', 'check').default('cash'),
    payment_status: Joi.string().valid('paid', 'pending', 'cancelled', 'refunded').default('paid'),
    discount: Joi.number().min(0).precision(2).default(0),
    tax: Joi.number().min(0).precision(2).default(0),
    notes: Joi.string().max(1000).optional().allow('', null),
    due_date: Joi.date().optional()
  }),
  update: Joi.object({
    customer_id: Joi.string().uuid().allow(null),
    payment_method: Joi.string().valid('cash', 'card', 'transfer', 'check'),
    payment_status: Joi.string().valid('paid', 'pending', 'cancelled', 'refunded'),
    discount: Joi.number().min(0).precision(2),
    tax: Joi.number().min(0).precision(2),
    notes: Joi.string().max(1000).allow('', null),
    due_date: Joi.date().allow(null)
  }).min(1),
  payment: Joi.object({
    amount: Joi.number().min(0).precision(2).required(),
    payment_method: Joi.string().valid('cash', 'card', 'transfer', 'check').required(),
    notes: Joi.string().max(500).optional().allow('', null)
  })
};

export const expenseSchema = {
  create: Joi.object({
    title: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(1000).optional().allow('', null),
    amount: Joi.number().min(0).precision(2).required(),
    category: Joi.string().max(100).optional().allow('', null),
    date: Joi.date().optional(),
    payment_method: Joi.string().valid('cash', 'card', 'transfer', 'check').default('cash'),
    reference: Joi.string().max(100).optional().allow('', null),
    notes: Joi.string().max(500).optional().allow('', null)
  }),
  update: Joi.object({
    title: Joi.string().min(1).max(200),
    description: Joi.string().max(1000).allow('', null),
    amount: Joi.number().min(0).precision(2),
    category: Joi.string().max(100).allow('', null),
    date: Joi.date(),
    payment_method: Joi.string().valid('cash', 'card', 'transfer', 'check'),
    reference: Joi.string().max(100).allow('', null),
    notes: Joi.string().max(500).allow('', null),
    status: Joi.string().valid('pending', 'approved', 'rejected').optional()
  }).min(1)
};

// ✅ SCHÉMAS DE STOCK CORRIGÉS
export const stockSchema = {
  movement: Joi.object({
    productId: Joi.string().uuid().required(),
    type: Joi.string().valid('in', 'out', 'adjustment').required(),
    quantity: Joi.number().integer().min(1).required(),
    reference: Joi.string().max(100).optional().allow('', null),
    notes: Joi.string().max(500).optional().allow('', null)
  }),
  adjust: Joi.object({
    productId: Joi.string().uuid().required(),
    newStock: Joi.number().integer().min(0).required(),
    reason: Joi.string().max(500).required()
  }),
  transfer: Joi.object({
    fromProductId: Joi.string().uuid().required(),
    toProductId: Joi.string().uuid().required(),
    quantity: Joi.number().integer().min(1).required(),
    notes: Joi.string().max(500).optional().allow('', null)
  })
};

// ✅ SCHÉMAS POUR LES PARAMÈTRES
export const settingsSchema = {
  update: Joi.object({
    currency: Joi.string().max(3).optional(),
    timezone: Joi.string().max(50).optional(),
    dateFormat: Joi.string().max(20).optional(),
    invoicePrefix: Joi.string().max(10).optional(),
    invoiceFooter: Joi.string().max(500).optional().allow(''),
    taxRate: Joi.number().min(0).max(100).optional(),
    lowStockThreshold: Joi.number().integer().min(0).optional(),
    emailNotifications: Joi.boolean().optional(),
    smsNotifications: Joi.boolean().optional(),
    lowStockAlerts: Joi.boolean().optional(),
    dailyReports: Joi.boolean().optional()
  }).min(1),

  updateCompany: Joi.object({
    name: Joi.string().min(2).max(200).optional(),
    email: Joi.string().email().optional().allow(''),
    phone: Joi.string().max(50).optional().allow(''),
    address: Joi.string().max(500).optional().allow(''),
    city: Joi.string().max(100).optional().allow(''),
    country: Joi.string().max(100).optional().allow(''),
    taxId: Joi.string().max(50).optional().allow(''),
    logo: Joi.string().uri().optional().allow('')
  }).min(1),

  updateInvoice: Joi.object({
    invoicePrefix: Joi.string().max(10).optional(),
    invoiceFooter: Joi.string().max(500).optional().allow(''),
    taxRate: Joi.number().min(0).max(100).optional(),
    dateFormat: Joi.string().max(20).optional(),
    currency: Joi.string().max(3).optional()
  }).min(1),

  updateNotifications: Joi.object({
    emailNotifications: Joi.boolean().optional(),
    smsNotifications: Joi.boolean().optional(),
    lowStockAlerts: Joi.boolean().optional(),
    dailyReports: Joi.boolean().optional()
  }).min(1)
};

export const teamSchema = {
  create: Joi.object({
    name: Joi.string().min(1).max(200).required(),
    description: Joi.string().max(1000).optional().allow('', null)
  }),
  update: Joi.object({
    name: Joi.string().min(1).max(200),
    description: Joi.string().max(1000).allow('', null)
  }).min(1),
  addMember: Joi.object({
    user_id: Joi.string().uuid().required(),
    role: Joi.string().valid('admin', 'supervisor', 'operator', 'cashier').default('cashier')
  }),
  updateMember: Joi.object({
    role: Joi.string().valid('admin', 'supervisor', 'operator', 'cashier').required()
  })
};

export const userSchema = {
  create: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
    role: Joi.string().valid('admin', 'supervisor', 'operator', 'cashier').default('cashier'),
    phone: Joi.string().optional().allow('', null)
  }),
  update: Joi.object({
    name: Joi.string().min(2).max(200),
    email: Joi.string().email(),
    phone: Joi.string().allow('', null),
    avatar: Joi.string().uri().allow('', null)
  }).min(1),
  changePassword: Joi.object({
    password: Joi.string().min(6).required()
  }),
  updateRole: Joi.object({
    role: Joi.string().valid('admin', 'supervisor', 'operator', 'cashier').required()
  })
};

export const reportSchema = {
  dateRange: Joi.object({
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    period: Joi.string().valid('today', 'week', 'month', 'year', 'custom').optional()
  }),
  export: Joi.object({
    type: Joi.string().valid('sales', 'profit', 'inventory', 'customers', 'expenses').required(),
    format: Joi.string().valid('pdf', 'excel', 'csv').default('pdf'),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional()
  })
};

export const companySchema = {
  update: Joi.object({
    name: Joi.string().min(2).max(200),
    email: Joi.string().email().allow('', null),
    phone: Joi.string().max(50).allow('', null),
    address: Joi.string().max(500).allow('', null),
    city: Joi.string().max(100).allow('', null),
    state: Joi.string().max(100).allow('', null),
    country: Joi.string().max(100).allow('', null),
    zip_code: Joi.string().max(20).allow('', null),
    tax_id: Joi.string().max(50).allow('', null),
    logo_url: Joi.string().uri().allow('', null)
  }).min(1),
  updateSettings: Joi.object({
    currency: Joi.string().max(3),
    timezone: Joi.string().max(50),
    date_format: Joi.string().max(20),
    language: Joi.string().max(10),
    low_stock_threshold: Joi.number().integer().min(0),
    auto_backup: Joi.boolean(),
    email_notifications: Joi.boolean()
  }).min(1)
};

// ✅ SCHÉMAS SUBSCRIPTIONS CORRIGÉS
export const subscriptionSchema = {
  update: Joi.object({
    plan: Joi.string().valid('free', 'basic', 'premium', 'enterprise').required(),
    billingCycle: Joi.string().valid('monthly', 'yearly').default('monthly'),
    paymentMethod: Joi.string().valid('card', 'paypal', 'bank_transfer').optional()
  }),

  renew: Joi.object({
    paymentMethod: Joi.string().valid('card', 'paypal', 'bank_transfer').optional()
  }),

  upgrade: Joi.object({
    plan: Joi.string().valid('basic', 'premium', 'enterprise').required(),
    billingCycle: Joi.string().valid('monthly', 'yearly').optional()
  }),

  downgrade: Joi.object({
    plan: Joi.string().valid('free', 'basic', 'premium').required()
  })
};

export const validateEmail = (email) => {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

export const validatePassword = (password) => {
  if (!password || typeof password !== 'string') return false;

  const minLength = 6;
  const hasLetter = /[a-zA-Z]/.test(password);
  const hasNumber = /\d/.test(password);

  return password.length >= minLength && hasLetter && hasNumber;
};

export const validatePhone = (phone) => {
  if (!phone || typeof phone !== 'string') return false;

  const phoneRegex = /^[\d\s\-\+\(\)]+$/;
  const digitsOnly = phone.replace(/\D/g, '');

  return phoneRegex.test(phone) && digitsOnly.length >= 7 && digitsOnly.length <= 15;
};

export const validateSKU = (sku) => {
  if (!sku || typeof sku !== 'string') return false;

  const skuRegex = /^[A-Za-z0-9\-_]{3,50}$/;
  return skuRegex.test(sku);
};

export const validatePrice = (price) => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price;

  if (isNaN(numPrice) || numPrice < 0 || !isFinite(numPrice)) {
    return false;
  }

  const decimalPlaces = (numPrice.toString().split('.')[1] || '').length;
  return decimalPlaces <= 2;
};

export const validateUrl = (url) => {
  if (!url || typeof url !== 'string') return false;

  try {
    const urlObj = new URL(url);
    return ['http:', 'https:'].includes(urlObj.protocol);
  } catch {
    return false;
  }
};

export const validateUUID = (uuid) => {
  if (!uuid || typeof uuid !== 'string') return false;

  const uuidRegex = /^[0-9a-f]{6}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const validateDateRange = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);

  if (isNaN(start.getTime()) || isNaN(end.getTime())) {
    return false;
  }

  return start <= end;
};

export const validateQuantity = (quantity) => {
  const num = typeof quantity === 'string' ? parseInt(quantity) : quantity;
  return Number.isInteger(num) && num >= 0;
};

export const validatePercentage = (percentage) => {
  const num = typeof percentage === 'string' ? parseFloat(percentage) : percentage;
  return !isNaN(num) && num >= 0 && num <= 100;
};

export const validateTaxNumber = (taxNumber) => {
  if (!taxNumber || typeof taxNumber !== 'string') return true;

  return taxNumber.length >= 5 && taxNumber.length <= 50;
};

export const validatePostalCode = (postalCode) => {
  if (!postalCode || typeof postalCode !== 'string') return true;

  return /^[A-Za-z0-9\s\-]{3,10}$/.test(postalCode);
};

export const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;

  return input
    .replace(/[<>]/g, '')
    .trim();
};

export const sanitizeEmail = (email) => {
  if (typeof email !== 'string') return email;

  return email.toLowerCase().trim();
};

export const sanitizePhone = (phone) => {
  if (typeof phone !== 'string') return phone;

  return phone.replace(/[^\d\+\-\s\(\)]/g, '').trim();
};

export const validateFileType = (filename, allowedTypes) => {
  if (!filename || typeof filename !== 'string') return false;

  const extension = filename.split('.').pop().toLowerCase();
  return allowedTypes.includes(extension);
};

export const validateFileSize = (fileSize, maxSize = 5 * 1024 * 1024) => {
  return fileSize > 0 && fileSize <= maxSize;
};

export const validateInvoiceStatus = (status) => {
  const validStatuses = ['pending', 'paid', 'partial', 'overdue', 'cancelled'];
  return validStatuses.includes(status);
};

export const validatePaymentMethod = (method) => {
  const validMethods = ['cash', 'card', 'mobile', 'bank_transfer', 'check'];
  return validMethods.includes(method);
};

export const validateRole = (role) => {
  const validRoles = ['admin', 'manager', 'user', 'viewer'];
  return validRoles.includes(role);
};

export const validateStockMovementType = (type) => {
  const validTypes = ['in', 'out', 'adjustment', 'transfer', 'return'];
  return validTypes.includes(type);
};

export const validatePaginationParams = (page, limit) => {
  const pageNum = parseInt(page);
  const limitNum = parseInt(limit);

  const isValidPage = !isNaN(pageNum) && pageNum > 0;
  const isValidLimit = !isNaN(limitNum) && limitNum > 0 && limitNum <= 100;

  return {
    isValid: isValidPage && isValidLimit,
    page: isValidPage ? pageNum : 1,
    limit: isValidLimit ? limitNum : 20
  };
};

export const validateSearchQuery = (query) => {
  if (!query || typeof query !== 'string') return '';

  return query
    .trim()
    .replace(/[<>]/g, '')
    .substring(0, 100);
};

export const validateSortParams = (sortBy, sortOrder, allowedFields) => {
  const validOrder = ['asc', 'desc', 'ASC', 'DESC'];

  const isValidField = allowedFields.includes(sortBy);
  const isValidOrder = validOrder.includes(sortOrder);

  return {
    isValid: isValidField && isValidOrder,
    sortBy: isValidField ? sortBy : allowedFields[0],
    sortOrder: isValidOrder ? sortOrder.toUpperCase() : 'DESC'
  };
};

export default {
  authSchema,
  loginSchema,
  registerSchema,
  productSchema,
  categorySchema,
  customerSchema,
  invoiceSchema,
  expenseSchema,
  stockSchema,
  settingsSchema,
  teamSchema,
  userSchema,
  reportSchema,
  companySchema,
  subscriptionSchema,
  validateEmail,
  validatePassword,
  validatePhone,
  validateSKU,
  validatePrice,
  validateUrl,
  validateUUID,
  validateDateRange,
  validateQuantity,
  validatePercentage,
  validateTaxNumber,
  validatePostalCode,
  sanitizeInput,
  sanitizeEmail,
  sanitizePhone,
  validateFileType,
  validateFileSize,
  validateInvoiceStatus,
  validatePaymentMethod,
  validateRole,
  validateStockMovementType,
  validatePaginationParams,
  validateSearchQuery,
  validateSortParams
};