// src/utils/helpers.js
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'SERVER_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  constructor(details) {
    super('Validation failed', 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

export class NotFoundError extends AppError {
  constructor(resource) {
    // ✅ CORRIGÉ: Ne pas ajouter "not found" ici car le message complet sera formaté
    super(resource, 404, 'NOT_FOUND');
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

export class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
  }
}

export class ConflictError extends AppError {
  constructor(message = 'Resource conflict') {
    super(message, 409, 'CONFLICT');
  }
}

export class BadRequestError extends AppError {
  constructor(message = 'Bad request') {
    super(message, 400, 'BAD_REQUEST');
  }
}

export const paginate = (page, limit) => {
  const pageNum = parseInt(page) || 1;
  const limitNum = parseInt(limit) || 20;
  const maxLimit = 100;

  const finalLimit = Math.min(limitNum, maxLimit);
  const offset = (pageNum - 1) * finalLimit;

  return {
    limit: finalLimit,
    offset: Math.max(0, offset),
    page: pageNum
  };
};

export const buildPaginationResponse = (data, page, limit, total) => {
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    pagination: {
      page: parseInt(page),
      limit: parseInt(limit),
      total: parseInt(total),
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1
    }
  };
};

export const generateInvoiceNumber = (prefix = 'INV') => {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
  return `${prefix}-${timestamp}-${random}`;
};

export const generateReferenceNumber = (prefix = 'REF') => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substring(2, 8).toUpperCase();
  return `${prefix}-${timestamp}-${random}`;
};

export const generateSKU = (productName, categoryName = '') => {
  const cleanName = productName
    .substring(0, 3)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

  const cleanCategory = categoryName
    .substring(0, 2)
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '');

  const timestamp = Date.now().toString().slice(-6);
  const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');

  return `${cleanCategory}${cleanName}-${timestamp}-${random}`;
};

export const slugify = (text) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
};

export const capitalize = (str) => {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const titleCase = (str) => {
  if (!str || typeof str !== 'string') return '';

  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
};

export const truncate = (str, length = 100, suffix = '...') => {
  if (!str || str.length <= length) return str;
  return str.substring(0, length).trim() + suffix;
};

export const isEmpty = (value) => {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string') return value.trim().length === 0;
  if (Array.isArray(value)) return value.length === 0;
  if (typeof value === 'object') return Object.keys(value).length === 0;
  return false;
};

export const isNotEmpty = (value) => {
  return !isEmpty(value);
};

export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

export const pick = (obj, keys) => {
  return keys.reduce((result, key) => {
    if (obj && Object.prototype.hasOwnProperty.call(obj, key)) {
      result[key] = obj[key];
    }
    return result;
  }, {});
};

export const omit = (obj, keys) => {
  if (!obj) return {};
  const result = { ...obj };
  keys.forEach(key => delete result[key]);
  return result;
};

export const groupBy = (array, key) => {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
};

export const unique = (array) => {
  return [...new Set(array)];
};

export const uniqueBy = (array, key) => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
};

export const sortBy = (array, key, order = 'asc') => {
  return [...array].sort((a, b) => {
    const aVal = a[key];
    const bVal = b[key];

    if (aVal < bVal) return order === 'asc' ? -1 : 1;
    if (aVal > bVal) return order === 'asc' ? 1 : -1;
    return 0;
  });
};

export const chunk = (array, size) => {
  const chunks = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
};

export const sum = (array, key = null) => {
  if (!key) {
    return array.reduce((total, num) => total + num, 0);
  }
  return array.reduce((total, item) => total + (parseFloat(item[key]) || 0), 0);
};

export const average = (array, key = null) => {
  if (array.length === 0) return 0;
  return sum(array, key) / array.length;
};

export const calculatePercentage = (value, total) => {
  if (total === 0) return 0;
  return ((value / total) * 100).toFixed(2);
};

export const calculateDiscount = (originalPrice, discountPercent) => {
  const discount = (originalPrice * discountPercent) / 100;
  return {
    discountAmount: parseFloat(discount.toFixed(2)),
    finalPrice: parseFloat((originalPrice - discount).toFixed(2))
  };
};

export const calculateTax = (amount, taxPercent) => {
  const tax = (amount * taxPercent) / 100;
  return {
    taxAmount: parseFloat(tax.toFixed(2)),
    totalWithTax: parseFloat((amount + tax).toFixed(2))
  };
};

export const calculateProfitMargin = (sellingPrice, costPrice) => {
  if (sellingPrice === 0) return 0;
  const profit = sellingPrice - costPrice;
  return ((profit / sellingPrice) * 100).toFixed(2);
};

export const calculateMarkup = (sellingPrice, costPrice) => {
  if (costPrice === 0) return 0;
  const markup = sellingPrice - costPrice;
  return ((markup / costPrice) * 100).toFixed(2);
};

export const roundToDecimal = (number, decimals = 2) => {
  return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
};

export const formatBytes = (bytes, decimals = 2) => {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
};

export const sleep = (ms) => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

export const retry = async (fn, maxAttempts = 3, delay = 1000) => {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (attempt === maxAttempts) {
        throw error;
      }
      await sleep(delay * attempt);
    }
  }
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const throttle = (func, limit) => {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
};

export const randomInt = (min, max) => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randomElement = (array) => {
  return array[Math.floor(Math.random() * array.length)];
};

export const shuffle = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const generateColor = () => {
  return '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');
};

export const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-z0-9._-]/gi, '_')
    .replace(/_{2,}/g, '_')
    .toLowerCase();
};

export const getFileExtension = (filename) => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2);
};

export const removeFileExtension = (filename) => {
  return filename.replace(/\.[^/.]+$/, '');
};

export const isValidJSON = (str) => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

export const parseJSON = (str, defaultValue = null) => {
  try {
    return JSON.parse(str);
  } catch {
    return defaultValue;
  }
};

export const mergeObjects = (...objects) => {
  return Object.assign({}, ...objects);
};

export const filterObject = (obj, predicate) => {
  if (!obj) return {};
  return Object.keys(obj)
    .filter(key => predicate(obj[key], key))
    .reduce((result, key) => {
      result[key] = obj[key];
      return result;
    }, {});
};

export const mapObject = (obj, mapper) => {
  if (!obj) return {};
  return Object.keys(obj).reduce((result, key) => {
    result[key] = mapper(obj[key], key);
    return result;
  }, {});
};

export const invertObject = (obj) => {
  if (!obj) return {};
  return Object.keys(obj).reduce((result, key) => {
    result[obj[key]] = key;
    return result;
  }, {});
};

export const createSuccessResponse = (data, message = 'Success') => {
  return {
    success: true,
    message,
    data
  };
};

export const createErrorResponse = (message, errors = null) => {
  const response = {
    success: false,
    message
  };

  if (errors) {
    response.errors = errors;
  }

  return response;
};

export default {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError,
  ConflictError,
  BadRequestError,
  paginate,
  buildPaginationResponse,
  generateInvoiceNumber,
  generateReferenceNumber,
  generateSKU,
  slugify,
  capitalize,
  titleCase,
  truncate,
  isEmpty,
  isNotEmpty,
  deepClone,
  pick,
  omit,
  groupBy,
  unique,
  uniqueBy,
  sortBy,
  chunk,
  sum,
  average,
  calculatePercentage,
  calculateDiscount,
  calculateTax,
  calculateProfitMargin,
  calculateMarkup,
  roundToDecimal,
  formatBytes,
  sleep,
  retry,
  debounce,
  throttle,
  randomInt,
  randomElement,
  shuffle,
  generateColor,
  sanitizeFilename,
  getFileExtension,
  removeFileExtension,
  isValidJSON,
  parseJSON,
  mergeObjects,
  filterObject,
  mapObject,
  invertObject,
  createSuccessResponse,
  createErrorResponse
};