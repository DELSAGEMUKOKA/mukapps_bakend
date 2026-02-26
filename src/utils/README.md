# Utils Documentation

Comprehensive utility functions for the Inventory Management System.

## Table of Contents

- [Encryption](#encryption)
- [Validators](#validators)
- [Date Utils](#date-utils)
- [Logger](#logger)
- [Helpers](#helpers)

---

## Encryption

Security and encryption utilities for password hashing, token generation, and data protection.

### Password Management

```javascript
import { hashPassword, comparePassword, verifyPassword } from './utils/encryption.js';

const hashedPassword = await hashPassword('MyPassword123');

const isValid = await comparePassword('MyPassword123', hashedPassword);

const passwordCheck = verifyPassword('MyPassword123');
```

### JWT Tokens

```javascript
import {
  generateToken,
  generateAccessToken,
  generateRefreshToken,
  verifyToken
} from './utils/encryption.js';

const accessToken = generateAccessToken(user);

const refreshToken = generateRefreshToken(user);

const decoded = verifyToken(token);
```

### Token Generation

```javascript
import {
  generateRandomToken,
  generateNumericOTP,
  generatePasswordResetToken,
  generateEmailVerificationToken
} from './utils/encryption.js';

const token = generateRandomToken(32);
const otp = generateNumericOTP(6);
const resetToken = generatePasswordResetToken();
```

### Data Encryption

```javascript
import { encryptData, decryptData, hashData } from './utils/encryption.js';

const encrypted = encryptData({ secret: 'data' });
const decrypted = decryptData(encrypted);
const hashed = hashData('sensitive-string');
```

### Data Masking

```javascript
import { maskEmail, maskPhone } from './utils/encryption.js';

const masked = maskEmail('user@example.com');
const maskedPhone = maskPhone('+1234567890');
```

---

## Validators

Validation functions and Joi schemas for data validation.

### Email & Password

```javascript
import { validateEmail, validatePassword } from './utils/validators.js';

if (validateEmail('user@example.com')) {
  // Valid email
}

if (validatePassword('SecurePass123')) {
  // Valid password
}
```

### Product Validation

```javascript
import { validateSKU, validatePrice, validateQuantity } from './utils/validators.js';

validateSKU('PROD-001');
validatePrice(99.99);
validateQuantity(10);
```

### Joi Schemas

```javascript
import {
  loginSchema,
  registerSchema,
  productSchema,
  customerSchema,
  invoiceSchema
} from './utils/validators.js';

const { error, value } = productSchema.create.validate(data);
```

### Sanitization

```javascript
import { sanitizeInput, sanitizeEmail, sanitizePhone } from './utils/validators.js';

const clean = sanitizeInput(userInput);
const cleanEmail = sanitizeEmail(email);
```

### Pagination & Search

```javascript
import { validatePaginationParams, validateSearchQuery } from './utils/validators.js';

const { isValid, page, limit } = validatePaginationParams(1, 20);
const searchQuery = validateSearchQuery(query);
```

---

## Date Utils

Comprehensive date and time manipulation utilities.

### Date Manipulation

```javascript
import {
  addDays,
  addMinutes,
  addHours,
  addMonths,
  addYears
} from './utils/dateUtils.js';

const futureDate = addDays(new Date(), 7);
const later = addMinutes(new Date(), 30);
```

### Date Formatting

```javascript
import { formatDate, formatDateTime, formatTime } from './utils/dateUtils.js';

formatDate(new Date());
formatDate(new Date(), 'DD/MM/YYYY');
formatDateTime(new Date());
formatTime(new Date());
```

### Currency & Numbers

```javascript
import { formatCurrency, formatNumber } from './utils/dateUtils.js';

const price = formatCurrency(99.99);
const num = formatNumber(1234567.89, 2);
```

### Date Comparison

```javascript
import {
  isExpired,
  isToday,
  isFuture,
  isPast,
  getDaysDifference
} from './utils/dateUtils.js';

if (isExpired(expiryDate)) {
  // Date has passed
}

const days = getDaysDifference(date1, date2);
```

### Date Ranges

```javascript
import {
  getStartOfDay,
  getEndOfDay,
  getStartOfMonth,
  getDateRange
} from './utils/dateUtils.js';

const today = {
  from: getStartOfDay(),
  to: getEndOfDay()
};

const range = getDateRange('thisMonth');
const last7Days = getDateRange('7days');
```

### Relative Time

```javascript
import { getRelativeTime } from './utils/dateUtils.js';

const relative = getRelativeTime(pastDate);
```

---

## Logger

Winston-based logging system with multiple transports and log levels.

### Basic Logging

```javascript
import logger from './utils/logger.js';

logger.info('Application started');
logger.error('Error occurred', { error });
logger.warn('Warning message');
logger.debug('Debug information');
```

### HTTP Request Logging

```javascript
import { logRequest } from './utils/logger.js';

logRequest(req, res, responseTime);
```

### Error Logging

```javascript
import { logError } from './utils/logger.js';

try {
  // Code
} catch (error) {
  logError(error, req);
}
```

### Authentication Logging

```javascript
import { logAuthentication } from './utils/logger.js';

logAuthentication('login', userId, true, { ip: req.ip });
```

### Security Events

```javascript
import { logSecurityEvent } from './utils/logger.js';

logSecurityEvent('unauthorized_access', 'high', {
  ip: req.ip,
  endpoint: req.path
});
```

### Business Events

```javascript
import { logBusinessEvent } from './utils/logger.js';

logBusinessEvent('invoice_created', 'invoice', invoiceId, userId, {
  amount: total
});
```

### Performance Logging

```javascript
import { logPerformance } from './utils/logger.js';

const start = Date.now();
// Operation
logPerformance('query_execution', Date.now() - start);
```

---

## Helpers

General utility functions for common operations.

### Error Classes

```javascript
import {
  AppError,
  ValidationError,
  NotFoundError,
  UnauthorizedError,
  ForbiddenError
} from './utils/helpers.js';

throw new NotFoundError('Product');
throw new ValidationError({ field: 'email', message: 'Invalid' });
```

### Pagination

```javascript
import { paginate, buildPaginationResponse } from './utils/helpers.js';

const { limit, offset, page } = paginate(1, 20);

const response = buildPaginationResponse(data, page, limit, total);
```

### ID Generation

```javascript
import {
  generateInvoiceNumber,
  generateReferenceNumber,
  generateSKU
} from './utils/helpers.js';

const invoiceNum = generateInvoiceNumber('INV');
const refNum = generateReferenceNumber('REF');
const sku = generateSKU('Product Name', 'Electronics');
```

### String Manipulation

```javascript
import { slugify, capitalize, titleCase, truncate } from './utils/helpers.js';

const slug = slugify('Hello World');
const capitalized = capitalize('hello');
const title = titleCase('hello world');
const short = truncate(longText, 100);
```

### Object Operations

```javascript
import { pick, omit, deepClone, isEmpty } from './utils/helpers.js';

const selected = pick(user, ['id', 'name', 'email']);
const filtered = omit(user, ['password', 'token']);
const cloned = deepClone(object);

if (isEmpty(value)) {
  // Value is empty
}
```

### Array Operations

```javascript
import { groupBy, unique, sortBy, chunk } from './utils/helpers.js';

const grouped = groupBy(products, 'category');
const uniqueItems = unique(array);
const sorted = sortBy(products, 'price', 'desc');
const chunks = chunk(array, 10);
```

### Mathematical Operations

```javascript
import {
  sum,
  average,
  calculatePercentage,
  calculateDiscount,
  calculateTax
} from './utils/helpers.js';

const total = sum(items, 'price');
const avg = average(items, 'price');
const percentage = calculatePercentage(50, 200);

const { discountAmount, finalPrice } = calculateDiscount(100, 10);
const { taxAmount, totalWithTax } = calculateTax(100, 15);
```

### Financial Calculations

```javascript
import {
  calculateProfitMargin,
  calculateMarkup
} from './utils/helpers.js';

const margin = calculateProfitMargin(100, 60);
const markup = calculateMarkup(100, 60);
```

### Async Utilities

```javascript
import { sleep, retry } from './utils/helpers.js';

await sleep(1000);

const result = await retry(async () => {
  return await fetchData();
}, 3, 1000);
```

### Random Utilities

```javascript
import { randomInt, randomElement, shuffle } from './utils/helpers.js';

const num = randomInt(1, 100);
const item = randomElement(array);
const shuffled = shuffle(array);
```

### File Operations

```javascript
import {
  sanitizeFilename,
  getFileExtension,
  formatBytes
} from './utils/helpers.js';

const safe = sanitizeFilename('my file.txt');
const ext = getFileExtension('document.pdf');
const size = formatBytes(1024000);
```

### Response Builders

```javascript
import { createSuccessResponse, createErrorResponse } from './utils/helpers.js';

return createSuccessResponse(data, 'Operation successful');
return createErrorResponse('Operation failed', errors);
```

---

## Best Practices

1. **Security**
   - Always hash passwords before storage
   - Use secure tokens for authentication
   - Sanitize user inputs
   - Mask sensitive data in logs

2. **Validation**
   - Validate all user inputs
   - Use Joi schemas for complex validations
   - Sanitize data before processing

3. **Error Handling**
   - Use custom error classes
   - Log errors with context
   - Return appropriate HTTP status codes

4. **Performance**
   - Use pagination for large datasets
   - Cache frequently accessed data
   - Monitor slow operations

5. **Logging**
   - Log important events
   - Avoid logging sensitive data
   - Use appropriate log levels

## Examples

### Complete User Registration Flow

```javascript
import { hashPassword, generateEmailVerificationToken } from './utils/encryption.js';
import { validateEmail, validatePassword } from './utils/validators.js';
import { BadRequestError, createSuccessResponse } from './utils/helpers.js';
import logger from './utils/logger.js';

async function registerUser(data) {
  if (!validateEmail(data.email)) {
    throw new BadRequestError('Invalid email format');
  }

  if (!validatePassword(data.password)) {
    throw new BadRequestError('Weak password');
  }

  const hashedPassword = await hashPassword(data.password);
  const verificationToken = generateEmailVerificationToken();

  const user = await User.create({
    ...data,
    password: hashedPassword,
    emailVerificationToken: verificationToken
  });

  logger.logBusinessEvent('user_registered', 'user', user.id);

  return createSuccessResponse({ user }, 'Registration successful');
}
```

### Complete Invoice Creation

```javascript
import { generateInvoiceNumber } from './utils/helpers.js';
import { formatDate, formatCurrency } from './utils/dateUtils.js';
import { validatePrice, validateQuantity } from './utils/validators.js';
import logger from './utils/logger.js';

async function createInvoice(data, userId) {
  const invoiceNumber = generateInvoiceNumber('INV');

  data.items.forEach(item => {
    if (!validatePrice(item.price)) {
      throw new ValidationError('Invalid price');
    }
    if (!validateQuantity(item.quantity)) {
      throw new ValidationError('Invalid quantity');
    }
  });

  const invoice = await Invoice.create({
    ...data,
    invoiceNumber,
    createdBy: userId,
    date: new Date()
  });

  logger.logBusinessEvent('invoice_created', 'invoice', invoice.id, userId, {
    amount: invoice.total,
    customer: invoice.customerId
  });

  return invoice;
}
```
