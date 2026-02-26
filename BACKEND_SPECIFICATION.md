# Backend Technical Specification
## Inventory Management System - REST API

**Version**: 1.0.0
**Last Updated**: February 2026
**Author**: Mukapps Development Team

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Technical Architecture](#technical-architecture)
3. [System Design](#system-design)
4. [Folder Structure & Responsibilities](#folder-structure--responsibilities)
5. [Business Logic Modeling](#business-logic-modeling)
6. [Data Model & Database Schema](#data-model--database-schema)
7. [API Design](#api-design)
8. [Security Architecture](#security-architecture)
9. [Authentication & Authorization](#authentication--authorization)
10. [Error Handling & Logging](#error-handling--logging)
11. [Performance & Scalability](#performance--scalability)
12. [Testing Strategy](#testing-strategy)
13. [Deployment Architecture](#deployment-architecture)
14. [Implementation Guidelines](#implementation-guidelines)

---

## 1. Executive Summary

### 1.1 Purpose
This document specifies the complete technical architecture for a multi-tenant, cloud-based inventory management system backend. The system supports point-of-sale operations, inventory tracking, customer management, and business analytics.

### 1.2 Technology Stack

| Component | Technology | Version | Justification |
|-----------|-----------|---------|---------------|
| **Runtime** | Node.js | 18+ | Modern JavaScript, async/await, ESM support |
| **Framework** | Express.js | 4.18+ | Mature, lightweight, extensive middleware |
| **Database** | Supabase (PostgreSQL) | Latest | Managed PostgreSQL, built-in auth, RLS |
| **ORM Pattern** | Custom Models | N/A | Direct Supabase client, optimized queries |
| **Authentication** | JWT | 9.0+ | Stateless, scalable, industry standard |
| **Validation** | Joi + Express-Validator | Latest | Schema validation, request sanitization |
| **Security** | Helmet + CORS | Latest | Security headers, CORS management |
| **Logging** | Winston | 3.11+ | Structured logging, multiple transports |
| **Email** | Nodemailer | 6.9+ | SMTP integration, templating |
| **PDF** | PDFKit | 0.13+ | Server-side PDF generation |
| **Rate Limiting** | express-rate-limit | 7.1+ | DDoS protection, abuse prevention |

### 1.3 Core Principles

1. **Multi-Tenancy**: Complete data isolation per company
2. **Security First**: Authentication, authorization, encryption
3. **Scalability**: Horizontal scaling, stateless design
4. **Maintainability**: Clean code, SOLID principles, documentation
5. **Performance**: Optimized queries, caching, pagination
6. **Reliability**: Error handling, logging, monitoring

---

## 2. Technical Architecture

### 2.1 Architecture Pattern

**Layered Architecture (N-Tier)**

```
┌─────────────────────────────────────────────────────────┐
│                     CLIENT LAYER                         │
│          (Web App, Mobile App, Third-party APIs)        │
└─────────────────────────────────────────────────────────┘
                            ↓ HTTPS
┌─────────────────────────────────────────────────────────┐
│                   API GATEWAY LAYER                      │
│        (Rate Limiting, CORS, Security Headers)          │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                 ROUTING & MIDDLEWARE                     │
│     (Authentication, Validation, Error Handling)        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  CONTROLLER LAYER                        │
│           (Request Handling, Response Formatting)        │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                   SERVICE LAYER                          │
│        (Business Logic, Orchestration, Validation)      │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                    MODEL LAYER                           │
│          (Data Access, Query Building, Mapping)         │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                  DATABASE LAYER                          │
│              (Supabase PostgreSQL + RLS)                │
└─────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────┐
│                 EXTERNAL SERVICES                        │
│    (Email SMTP, Payment Gateway, File Storage, SMS)    │
└─────────────────────────────────────────────────────────┘
```

### 2.2 Request Flow

```
1. Client Request
   ↓
2. Middleware Chain
   - CORS Check
   - Rate Limiting
   - Security Headers (Helmet)
   - Request Logging (Morgan)
   - Body Parsing
   ↓
3. Authentication Middleware
   - JWT Verification
   - User Extraction
   - Session Validation
   ↓
4. Authorization Middleware
   - Role Check
   - Permission Validation
   ↓
5. Request Validation
   - Schema Validation (Joi)
   - Input Sanitization
   - Parameter Validation
   ↓
6. Controller
   - Parse Request
   - Call Service Layer
   - Format Response
   ↓
7. Service Layer
   - Business Logic
   - Transaction Management
   - External Service Calls
   ↓
8. Model Layer
   - Database Queries
   - Data Transformation
   - Relationship Loading
   ↓
9. Database
   - Execute Query
   - Apply RLS Policies
   - Return Results
   ↓
10. Response to Client
    - Success/Error Response
    - HTTP Status Code
    - JSON Payload
```

### 2.3 Multi-Tenancy Architecture

**Strategy**: Shared Database with Row-Level Security (RLS)

```
┌─────────────────────────────────────────────────────────┐
│                    COMPANY A                             │
│  Users: [user1, user2]  |  Data: Isolated by company_id │
├─────────────────────────────────────────────────────────┤
│                    COMPANY B                             │
│  Users: [user3, user4]  |  Data: Isolated by company_id │
├─────────────────────────────────────────────────────────┤
│                    COMPANY C                             │
│  Users: [user5, user6]  |  Data: Isolated by company_id │
└─────────────────────────────────────────────────────────┘
                            ↓
              ┌─────────────────────────┐
              │  SHARED DATABASE (RLS)  │
              │  - companies            │
              │  - users                │
              │  - products             │
              │  - invoices             │
              │  - ...                  │
              └─────────────────────────┘

Key Features:
1. Each table has company_id column
2. All queries filtered by company_id
3. RLS policies enforce isolation
4. JWT contains company_id claim
5. Middleware validates company access
```

---

## 3. System Design

### 3.1 Design Patterns

#### 3.1.1 Repository Pattern (via Models)
- **Purpose**: Abstraction layer for data access
- **Implementation**: Model classes encapsulate database operations
- **Benefits**: Testable, maintainable, database-agnostic interface

```javascript
// Example: Product Model
class Product {
  static async findById(id, companyId) {
    // Data access logic
  }

  static async create(data, companyId) {
    // Data creation logic
  }
}
```

#### 3.1.2 Service Layer Pattern
- **Purpose**: Encapsulate business logic
- **Implementation**: Service classes orchestrate operations
- **Benefits**: Reusable, testable, separation of concerns

```javascript
// Example: Auth Service
class AuthService {
  async register(userData) {
    // Business logic for registration
    // - Validate data
    // - Create company
    // - Create user
    // - Create subscription
    // - Send email
    // - Generate tokens
  }
}
```

#### 3.1.3 Middleware Chain Pattern
- **Purpose**: Composable request processing
- **Implementation**: Express middleware functions
- **Benefits**: Modular, reusable, maintainable

```javascript
// Example: Route with middleware chain
router.post('/products',
  authenticate,           // Verify JWT
  requireRole('admin'),   // Check role
  validateRequest(schema), // Validate input
  productController.create // Handle request
);
```

#### 3.1.4 Factory Pattern
- **Purpose**: Object creation abstraction
- **Implementation**: Helper functions for complex object creation
- **Benefits**: Consistent object creation, encapsulated logic

#### 3.1.5 Singleton Pattern
- **Purpose**: Single instance of services
- **Implementation**: Export class instances, not classes
- **Benefits**: Shared state, resource optimization

```javascript
// Service Singleton
class EmailService {
  constructor() { /* initialize */ }
}
export default new EmailService();
```

### 3.2 SOLID Principles Application

#### Single Responsibility Principle (SRP)
- Each class/module has one reason to change
- Models: Data access only
- Services: Business logic only
- Controllers: Request/response handling only
- Middleware: Single concern (auth, validation, etc.)

#### Open/Closed Principle (OCP)
- Open for extension, closed for modification
- Use inheritance and composition
- Plugin architecture for external services

#### Liskov Substitution Principle (LSP)
- Derived classes must be substitutable
- Interface contracts respected
- Consistent return types

#### Interface Segregation Principle (ISP)
- Clients shouldn't depend on unused interfaces
- Small, focused interfaces
- Role-specific endpoints

#### Dependency Inversion Principle (DIP)
- Depend on abstractions, not concretions
- Service layer doesn't depend on specific models
- Configuration injected, not hardcoded

---

## 4. Folder Structure & Responsibilities

### 4.1 Complete Directory Tree

```
backend/
├── src/                              # Source code root
│   ├── config/                       # Configuration files
│   │   ├── database.js              # Supabase client setup
│   │   ├── env.js                   # Environment validation
│   │   └── constants.js             # Application constants
│   │
│   ├── models/                       # Data Access Layer (DAL)
│   │   ├── Company.js               # Company CRUD operations
│   │   ├── User.js                  # User management
│   │   ├── Product.js               # Product inventory
│   │   ├── Category.js              # Category management
│   │   ├── Customer.js              # Customer records
│   │   ├── Invoice.js               # Invoice/sales
│   │   ├── Expense.js               # Expense tracking
│   │   ├── StockMovement.js         # Inventory movements
│   │   ├── Team.js                  # Team organization
│   │   ├── Subscription.js          # Billing & subscriptions
│   │   └── index.js                 # Model exports
│   │
│   ├── controllers/                  # Request Handlers
│   │   ├── authController.js        # Authentication endpoints
│   │   ├── companyController.js     # Company management
│   │   ├── userController.js        # User CRUD
│   │   ├── productController.js     # Product CRUD
│   │   ├── categoryController.js    # Category CRUD
│   │   ├── customerController.js    # Customer CRUD
│   │   ├── invoiceController.js     # Invoice/sales
│   │   ├── expenseController.js     # Expense management
│   │   ├── stockController.js       # Stock movements
│   │   ├── reportController.js      # Analytics & reports
│   │   ├── teamController.js        # Team management
│   │   └── subscriptionController.js # Subscription/billing
│   │
│   ├── routes/                       # API Route Definitions
│   │   ├── index.js                 # Route aggregator
│   │   ├── auth.js                  # /api/v1/auth/*
│   │   ├── companies.js             # /api/v1/companies/*
│   │   ├── users.js                 # /api/v1/users/*
│   │   ├── products.js              # /api/v1/products/*
│   │   ├── categories.js            # /api/v1/categories/*
│   │   ├── customers.js             # /api/v1/customers/*
│   │   ├── invoices.js              # /api/v1/invoices/*
│   │   ├── expenses.js              # /api/v1/expenses/*
│   │   ├── stock.js                 # /api/v1/stock/*
│   │   ├── reports.js               # /api/v1/reports/*
│   │   ├── teams.js                 # /api/v1/teams/*
│   │   └── subscriptions.js         # /api/v1/subscriptions/*
│   │
│   ├── services/                     # Business Logic Layer
│   │   ├── authService.js           # Authentication logic
│   │   ├── emailService.js          # Email notifications
│   │   ├── pdfService.js            # PDF generation
│   │   ├── stockService.js          # Stock calculations
│   │   ├── reportService.js         # Report generation
│   │   ├── paymentService.js        # Payment processing
│   │   └── notificationService.js   # Push notifications
│   │
│   ├── middleware/                   # Express Middleware
│   │   ├── auth.js                  # JWT authentication
│   │   ├── roleCheck.js             # RBAC authorization
│   │   ├── validateRequest.js       # Request validation
│   │   ├── errorHandler.js          # Global error handler
│   │   ├── rateLimiter.js           # Rate limiting
│   │   └── cors.js                  # CORS configuration
│   │
│   ├── utils/                        # Utility Functions
│   │   ├── logger.js                # Winston logger
│   │   ├── validators.js            # Custom validators
│   │   ├── helpers.js               # Helper functions
│   │   ├── encryption.js            # Encryption utilities
│   │   └── dateUtils.js             # Date formatting
│   │
│   ├── database/                     # Database Management
│   │   ├── migrations/              # SQL migration files
│   │   │   ├── 001_initial_schema.sql
│   │   │   ├── 002_add_indexes.sql
│   │   │   └── ...
│   │   └── seeds/                   # Seed data
│   │       ├── defaultRoles.js
│   │       └── testData.js
│   │
│   ├── tests/                        # Test Suites
│   │   ├── unit/                    # Unit tests
│   │   │   ├── models/
│   │   │   ├── services/
│   │   │   └── utils/
│   │   ├── integration/             # Integration tests
│   │   │   ├── auth.test.js
│   │   │   ├── products.test.js
│   │   │   └── ...
│   │   └── helpers/                 # Test utilities
│   │       ├── setup.js
│   │       └── fixtures.js
│   │
│   ├── app.js                        # Express app configuration
│   └── server.js                     # Server entry point
│
├── logs/                             # Application logs
│   ├── error.log                     # Error logs
│   ├── combined.log                  # All logs
│   └── access.log                    # HTTP access logs
│
├── uploads/                          # File uploads (temp)
│   └── .gitkeep
│
├── docs/                             # Documentation
│   ├── api/                          # API documentation
│   │   ├── swagger.yaml
│   │   └── postman_collection.json
│   └── architecture/                 # Architecture diagrams
│
├── .env                              # Environment variables
├── .env.example                      # Environment template
├── .env.test                         # Test environment
├── .gitignore                        # Git ignore rules
├── package.json                      # Dependencies
├── package-lock.json                 # Dependency lock
├── nodemon.json                      # Nodemon config
├── jest.config.js                    # Jest config
├── README.md                         # Documentation
├── SETUP.md                          # Setup guide
├── VERIFICATION.md                   # Verification tests
└── BACKEND_SPECIFICATION.md          # This file
```

### 4.2 Layer Responsibilities

#### 4.2.1 Config Layer (`src/config/`)

**Responsibility**: Centralized configuration management

| File | Purpose | Exports |
|------|---------|---------|
| `database.js` | Supabase client initialization | `supabase` client instance |
| `env.js` | Environment variable validation | `env` object, `validateEnv()` |
| `constants.js` | Application constants | Constants object |

**Key Principles**:
- All configuration in one place
- Environment-specific settings
- Validation on startup
- No hardcoded values in code

**Example**: `database.js`
```javascript
import { createClient } from '@supabase/supabase-js';
import env from './env.js';

export const supabase = createClient(
  env.SUPABASE_URL,
  env.SUPABASE_SERVICE_KEY
);
```

#### 4.2.2 Model Layer (`src/models/`)

**Responsibility**: Data access abstraction

**Principles**:
1. **Single Entity Per Model**: One model per database table
2. **No Business Logic**: Only data access operations
3. **Company Isolation**: All queries filter by company_id
4. **Static Methods**: No instance methods, use static for all operations
5. **Error Propagation**: Throw errors, don't catch
6. **Consistent Interface**: Standard CRUD methods

**Standard Model Interface**:
```javascript
class ModelName {
  // CREATE
  static async create(data, companyId) { }

  // READ
  static async findById(id, companyId) { }
  static async findByCompany(companyId, filters) { }
  static async findAll(filters) { } // Admin only

  // UPDATE
  static async update(id, companyId, data) { }

  // DELETE
  static async delete(id, companyId) { }

  // CUSTOM QUERIES
  static async customQuery(...params) { }
}
```

**Return Patterns**:
- Single record: Return object or null
- Multiple records: Return `{ data: [], count: number }`
- Mutations: Return updated/created record
- Errors: Throw error, let controller handle

#### 4.2.3 Controller Layer (`src/controllers/`)

**Responsibility**: HTTP request/response handling

**Principles**:
1. **Request Parsing**: Extract and validate parameters
2. **Service Orchestration**: Call service layer methods
3. **Response Formatting**: Format success/error responses
4. **No Business Logic**: Delegate to services
5. **Error Handling**: Catch and format errors
6. **Status Codes**: Use appropriate HTTP status codes

**Standard Controller Pattern**:
```javascript
export const controllerName = {
  // GET /resource
  async index(req, res, next) {
    try {
      const { companyId } = req.user;
      const filters = {
        search: req.query.search,
        limit: parseInt(req.query.limit) || 10,
        offset: parseInt(req.query.offset) || 0
      };

      const result = await Model.findByCompany(companyId, filters);

      res.json({
        success: true,
        data: result.data,
        total: result.count,
        page: Math.floor(filters.offset / filters.limit) + 1
      });
    } catch (error) {
      next(error);
    }
  },

  // GET /resource/:id
  async show(req, res, next) { },

  // POST /resource
  async create(req, res, next) { },

  // PUT /resource/:id
  async update(req, res, next) { },

  // DELETE /resource/:id
  async destroy(req, res, next) { }
};
```

**Response Format Standards**:

Success Response:
```json
{
  "success": true,
  "data": { /* resource data */ },
  "message": "Optional success message"
}
```

Error Response:
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { /* optional error details */ }
  }
}
```

Paginated Response:
```json
{
  "success": true,
  "data": [ /* array of resources */ ],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "pages": 15
  }
}
```

#### 4.2.4 Service Layer (`src/services/`)

**Responsibility**: Business logic implementation

**Principles**:
1. **Complex Operations**: Multi-step business processes
2. **Transaction Management**: Handle data consistency
3. **External Integration**: Third-party API calls
4. **Validation**: Business rule validation
5. **Orchestration**: Coordinate multiple models
6. **Stateless**: No instance state

**When to Use Services**:
- ✅ Multi-step operations (register: create company + user + subscription)
- ✅ External service calls (send email, generate PDF)
- ✅ Complex calculations (profit reports, inventory valuation)
- ✅ Business rule validation (subscription limits, stock checks)
- ❌ Simple CRUD operations (use controllers directly with models)

**Example Service**:
```javascript
class InvoiceService {
  async createInvoice(invoiceData, companyId, userId) {
    // 1. Create invoice
    const invoice = await Invoice.create(invoiceData, companyId, userId);

    // 2. Update stock for each item
    for (const item of invoiceData.items) {
      await StockMovement.create({
        productId: item.productId,
        type: 'out',
        quantity: item.quantity,
        reference: invoice.invoice_number
      }, companyId, userId);
    }

    // 3. Update customer purchase total
    if (invoiceData.customerId) {
      await Customer.updatePurchaseTotal(
        invoiceData.customerId,
        companyId,
        invoice.total
      );
    }

    // 4. Send invoice email
    if (invoiceData.sendEmail) {
      await emailService.sendInvoice(invoice);
    }

    return invoice;
  }
}
```

#### 4.2.5 Route Layer (`src/routes/`)

**Responsibility**: API endpoint definitions

**Principles**:
1. **Middleware Chaining**: Apply middleware in correct order
2. **RESTful Design**: Follow REST conventions
3. **Versioning**: Support API versioning
4. **Documentation**: Clear route comments
5. **Validation**: Apply validation middleware

**Standard Route Pattern**:
```javascript
import express from 'express';
import { authenticate, requireRole } from '../middleware/auth.js';
import { validateRequest } from '../middleware/validateRequest.js';
import controller from '../controllers/resourceController.js';
import schema from '../validators/resourceSchema.js';

const router = express.Router();

// Public routes
router.post('/login', validateRequest(schema.login), controller.login);

// Protected routes (require authentication)
router.use(authenticate);

// Standard CRUD
router.get('/', controller.index);
router.get('/:id', controller.show);
router.post('/', requireRole('admin'), validateRequest(schema.create), controller.create);
router.put('/:id', requireRole('admin'), validateRequest(schema.update), controller.update);
router.delete('/:id', requireRole('admin'), controller.destroy);

// Custom routes
router.get('/stats/summary', requireRole('admin'), controller.getSummary);
router.post('/:id/activate', requireRole('admin'), controller.activate);

export default router;
```

**Route Naming Conventions**:
- Use plural nouns for resources: `/products`, `/customers`
- Use hyphens for multi-word resources: `/stock-movements`
- Nested resources: `/invoices/:id/items`
- Actions as sub-resources: `/users/:id/activate`
- Query params for filtering: `/products?category=electronics&limit=20`

#### 4.2.6 Middleware Layer (`src/middleware/`)

**Responsibility**: Request processing pipeline

| Middleware | Purpose | Order |
|------------|---------|-------|
| `cors.js` | CORS headers | 1 |
| `rateLimiter.js` | Rate limiting | 2 |
| `helmet.js` | Security headers | 3 |
| `morgan` | Request logging | 4 |
| `bodyParser` | Parse request body | 5 |
| `auth.js` | JWT verification | 6 |
| `roleCheck.js` | Authorization | 7 |
| `validateRequest.js` | Input validation | 8 |
| `errorHandler.js` | Error handling | Last |

**Middleware Implementation Pattern**:
```javascript
// Example: Authentication Middleware
export const authenticate = async (req, res, next) => {
  try {
    // 1. Extract token
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      throw new AppError('Authentication required', 401);
    }

    // 2. Verify token
    const decoded = authService.verifyToken(token);

    // 3. Load user
    const user = await User.findById(decoded.userId);
    if (!user || !user.is_active) {
      throw new AppError('Invalid authentication', 401);
    }

    // 4. Attach to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      companyId: user.company_id
    };

    next();
  } catch (error) {
    next(error);
  }
};
```

#### 4.2.7 Utils Layer (`src/utils/`)

**Responsibility**: Reusable utility functions

**Principles**:
1. **Pure Functions**: No side effects when possible
2. **Single Purpose**: Each function does one thing
3. **Well-Tested**: High test coverage
4. **Well-Documented**: JSDoc comments

**Common Utilities**:

```javascript
// helpers.js
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'SERVER_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

export const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

export const generateId = () => uuidv4();

export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};
```

---

## 5. Business Logic Modeling

### 5.1 Core Business Entities

#### 5.1.1 Company (Tenant)
```javascript
Company {
  id: UUID
  name: String
  email: String (unique)
  phone: String
  address: String
  city: String
  country: String
  tax_id: String
  currency: String (default: USD)
  timezone: String (default: UTC)
  logo_url: String
  is_active: Boolean
  created_at: Timestamp
  updated_at: Timestamp

  // Relationships
  users: User[]
  products: Product[]
  invoices: Invoice[]
  subscription: Subscription
}
```

**Business Rules**:
1. One company per registration
2. Company email must be unique globally
3. Company is soft-deleted (is_active = false)
4. All related data isolated by company_id

#### 5.1.2 User
```javascript
User {
  id: UUID
  name: String
  email: String (unique)
  password: String (hashed)
  role: Enum (admin, supervisor, operator, cashier)
  company_id: UUID (foreign key)
  phone: String
  avatar_url: String
  is_active: Boolean
  failed_login_attempts: Integer
  locked_until: Timestamp
  last_login: Timestamp
  created_at: Timestamp
  updated_at: Timestamp

  // Relationships
  company: Company
  invoices: Invoice[]
  expenses: Expense[]
}
```

**Business Rules**:
1. Email unique per company
2. Password minimum 8 characters
3. Account locks after 5 failed attempts for 15 minutes
4. Only admin can create users
5. User inherits company_id from creator
6. Soft delete (is_active = false)

**Role Hierarchy**:
```
Admin > Supervisor > Operator > Cashier

Permissions:
- Admin: Full access, user management, settings
- Supervisor: Reports, approve expenses, manage inventory
- Operator: Create/edit products, invoices, customers
- Cashier: Create invoices, view products
```

#### 5.1.3 Product
```javascript
Product {
  id: UUID
  name: String
  barcode: String (unique per company)
  description: String
  category_id: UUID
  purchase_price: Decimal(10,2)
  selling_price: Decimal(10,2)
  current_stock: Integer
  min_stock_level: Integer
  unit: String (piece, kg, liter, etc.)
  image_url: String
  company_id: UUID
  created_at: Timestamp
  updated_at: Timestamp

  // Relationships
  category: Category
  stock_movements: StockMovement[]
  invoice_items: InvoiceItem[]
}
```

**Business Rules**:
1. Barcode unique per company
2. Selling price >= purchase price (warning, not enforced)
3. Stock can't go negative
4. Low stock alert when current_stock <= min_stock_level
5. Soft delete check: Can't delete if in invoices

#### 5.1.4 Invoice (Sales)
```javascript
Invoice {
  id: UUID
  invoice_number: String (unique per company)
  customer_id: UUID (nullable)
  user_id: UUID
  company_id: UUID
  date: Timestamp
  subtotal: Decimal(12,2)
  tax: Decimal(12,2)
  discount: Decimal(12,2)
  total: Decimal(12,2)
  payment_method: Enum (cash, card, mobile, bank_transfer)
  payment_status: Enum (paid, pending, cancelled)
  notes: String
  created_at: Timestamp
  updated_at: Timestamp

  // Relationships
  items: InvoiceItem[]
  customer: Customer
  user: User
}

InvoiceItem {
  id: UUID
  invoice_id: UUID
  product_id: UUID
  quantity: Integer
  unit_price: Decimal(10,2)
  tax_rate: Decimal(5,2)
  discount: Decimal(10,2)
  total: Decimal(12,2)
  created_at: Timestamp
}
```

**Business Rules**:
1. Invoice number auto-generated: `INV-{timestamp}`
2. Total = (subtotal - discount) + tax
3. Creating invoice automatically creates stock movement
4. Can't delete paid invoices (only cancel)
5. Customer total_purchases updated on invoice creation

#### 5.1.5 Subscription
```javascript
Subscription {
  id: UUID
  company_id: UUID
  plan_type: Enum (trial, monthly, yearly)
  status: Enum (active, cancelled, expired)
  start_date: Timestamp
  end_date: Timestamp
  trial_ends_at: Timestamp
  payment_method: String
  amount: Decimal(10,2)
  created_at: Timestamp
  updated_at: Timestamp
}
```

**Business Rules**:
1. New companies start with 14-day trial
2. Trial expires, subscription status = 'expired'
3. Check subscription before major operations
4. Email reminder 7 days before expiry
5. Grace period: 3 days after expiry

### 5.2 Business Processes

#### 5.2.1 User Registration Flow

```
1. Receive Registration Request
   - name, email, password, companyName

2. Validate Input
   - Email format
   - Password strength
   - Required fields

3. Check Email Uniqueness
   - Query users table
   - Throw error if exists

4. Create Company
   - Generate UUID
   - Insert company record
   - Set is_active = true

5. Hash Password
   - bcrypt with 10 rounds

6. Create User as Admin
   - Generate UUID
   - Link to company_id
   - role = 'admin'

7. Create Trial Subscription
   - plan_type = 'trial'
   - start_date = now
   - end_date = now + 14 days
   - trial_ends_at = now + 14 days

8. Generate JWT Tokens
   - Access token (7 days)
   - Refresh token (30 days)
   - Include: userId, email, role, companyId

9. Send Welcome Email
   - Company details
   - Login instructions
   - Trial information

10. Return Response
    - User data (no password)
    - Company data
    - Tokens
```

#### 5.2.2 Invoice Creation Flow

```
1. Receive Invoice Request
   - items[], customerId, paymentMethod, etc.

2. Validate Stock Availability
   - For each item:
     - Check product exists
     - Check current_stock >= quantity
     - Throw error if insufficient

3. Calculate Totals
   - For each item:
     - item_total = (quantity * unit_price * (1 + tax_rate)) - discount
   - subtotal = sum of (quantity * unit_price)
   - tax = sum of tax amounts
   - total = (subtotal - discount) + tax

4. Begin Transaction

5. Create Invoice Record
   - Generate invoice_number
   - Insert invoice

6. Create Invoice Items
   - Insert all items
   - Link to invoice_id

7. Create Stock Movements
   - For each item:
     - type = 'out'
     - quantity = item.quantity
     - reference = invoice_number
     - Update product.current_stock

8. Update Customer Total
   - If customerId:
     - Add invoice.total to customer.total_purchases
     - Check if should become VIP (>= $1000)

9. Commit Transaction

10. Send Email (if requested)
    - Generate PDF
    - Email to customer

11. Return Invoice
    - With items, customer, user data
```

#### 5.2.3 Stock Management Flow

```
Stock Movement Types:
1. IN - Stock arrival (purchase, return)
2. OUT - Stock reduction (sale, damage)
3. ADJUSTMENT - Inventory correction

Process:
1. Create Stock Movement
   - type, quantity, productId, reference

2. Calculate New Stock
   - current = product.current_stock
   - new = current + (type === 'in' ? quantity : -quantity)
   - Check new >= 0

3. Update Product Stock
   - product.current_stock = new
   - product.updated_at = now

4. Check Low Stock Alert
   - If new <= min_stock_level:
     - Send low stock alert email
     - Create notification

5. Log Activity
   - Record in activity_logs
```

### 5.3 Data Validation Rules

#### Input Validation Schema Example (Joi)

```javascript
// Product validation
const productSchema = {
  create: Joi.object({
    name: Joi.string().min(1).max(200).required(),
    barcode: Joi.string().max(50).optional(),
    description: Joi.string().max(1000).optional(),
    categoryId: Joi.string().uuid().optional(),
    purchasePrice: Joi.number().min(0).precision(2).required(),
    sellingPrice: Joi.number().min(0).precision(2).required(),
    currentStock: Joi.number().integer().min(0).default(0),
    minStockLevel: Joi.number().integer().min(0).default(0),
    unit: Joi.string().max(20).default('piece'),
    imageUrl: Joi.string().uri().optional()
  }),

  update: Joi.object({
    name: Joi.string().min(1).max(200),
    barcode: Joi.string().max(50),
    description: Joi.string().max(1000).allow(''),
    categoryId: Joi.string().uuid().allow(null),
    purchasePrice: Joi.number().min(0).precision(2),
    sellingPrice: Joi.number().min(0).precision(2),
    currentStock: Joi.number().integer().min(0),
    minStockLevel: Joi.number().integer().min(0),
    unit: Joi.string().max(20),
    imageUrl: Joi.string().uri().allow('')
  }).min(1)
};
```

---

## 6. Data Model & Database Schema

### 6.1 Entity-Relationship Diagram

```
┌─────────────┐
│ companies   │
└──────┬──────┘
       │ 1
       │
       │ N
┌──────┴──────────────────────────────┐
│                                     │
┌──────▼──────┐                ┌─────▼──────┐
│ users       │                │ products   │
└──────┬──────┘                └─────┬──────┘
       │ 1                           │ N
       │                             │
       │ N                           │
┌──────▼──────┐                ┌─────▼──────────┐
│ invoices    │                │ stock_movements│
└──────┬──────┘                └────────────────┘
       │ 1
       │
       │ N
┌──────▼──────────┐
│ invoice_items   │
└─────────────────┘
```

### 6.2 Database Tables

See `database/migrations/001_initial_schema.sql` for complete schema.

**Key Tables**:
1. companies - 12 columns
2. users - 14 columns
3. categories - 6 columns
4. products - 13 columns
5. customers - 10 columns
6. invoices - 14 columns
7. invoice_items - 8 columns
8. expenses - 11 columns
9. stock_movements - 8 columns
10. teams - 5 columns
11. team_members - 5 columns
12. subscriptions - 10 columns
13. settings - 10 columns
14. activity_logs - 9 columns

### 6.3 Database Constraints

**Primary Keys**: All tables use UUID

**Foreign Keys**:
```sql
-- User belongs to Company
ALTER TABLE users ADD CONSTRAINT fk_user_company
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- Product belongs to Company
ALTER TABLE products ADD CONSTRAINT fk_product_company
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- Product has Category
ALTER TABLE products ADD CONSTRAINT fk_product_category
  FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL;

-- Invoice belongs to Company
ALTER TABLE invoices ADD CONSTRAINT fk_invoice_company
  FOREIGN KEY (company_id) REFERENCES companies(id) ON DELETE CASCADE;

-- Invoice has User
ALTER TABLE invoices ADD CONSTRAINT fk_invoice_user
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Invoice has Customer
ALTER TABLE invoices ADD CONSTRAINT fk_invoice_customer
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL;
```

**Unique Constraints**:
```sql
-- Company email unique globally
ALTER TABLE companies ADD CONSTRAINT unique_company_email UNIQUE (email);

-- User email unique globally
ALTER TABLE users ADD CONSTRAINT unique_user_email UNIQUE (email);

-- Barcode unique per company
ALTER TABLE products ADD CONSTRAINT unique_product_barcode
  UNIQUE (barcode, company_id);

-- Category name unique per company
ALTER TABLE categories ADD CONSTRAINT unique_category_name
  UNIQUE (name, company_id);

-- Invoice number unique per company
ALTER TABLE invoices ADD CONSTRAINT unique_invoice_number
  UNIQUE (invoice_number, company_id);
```

**Check Constraints**:
```sql
-- User roles
ALTER TABLE users ADD CONSTRAINT check_user_role
  CHECK (role IN ('admin', 'supervisor', 'operator', 'cashier'));

-- Product stock non-negative
ALTER TABLE products ADD CONSTRAINT check_product_stock
  CHECK (current_stock >= 0);

-- Invoice payment method
ALTER TABLE invoices ADD CONSTRAINT check_payment_method
  CHECK (payment_method IN ('cash', 'card', 'mobile', 'bank_transfer'));

-- Invoice payment status
ALTER TABLE invoices ADD CONSTRAINT check_payment_status
  CHECK (payment_status IN ('paid', 'pending', 'cancelled'));

-- Stock movement type
ALTER TABLE stock_movements ADD CONSTRAINT check_movement_type
  CHECK (type IN ('in', 'out', 'adjustment'));

-- Subscription status
ALTER TABLE subscriptions ADD CONSTRAINT check_subscription_status
  CHECK (status IN ('active', 'cancelled', 'expired'));
```

### 6.4 Indexes for Performance

```sql
-- User lookups
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_company ON users(company_id);
CREATE INDEX idx_users_role ON users(company_id, role);

-- Product searches
CREATE INDEX idx_products_company ON products(company_id);
CREATE INDEX idx_products_barcode ON products(barcode);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_name ON products USING gin(to_tsvector('english', name));
CREATE INDEX idx_products_low_stock ON products(company_id)
  WHERE current_stock <= min_stock_level;

-- Invoice queries
CREATE INDEX idx_invoices_company ON invoices(company_id);
CREATE INDEX idx_invoices_customer ON invoices(customer_id);
CREATE INDEX idx_invoices_date ON invoices(date DESC);
CREATE INDEX idx_invoices_status ON invoices(company_id, payment_status);
CREATE INDEX idx_invoices_number ON invoices(invoice_number);

-- Stock movement history
CREATE INDEX idx_stock_movements_product ON stock_movements(product_id);
CREATE INDEX idx_stock_movements_company ON stock_movements(company_id);
CREATE INDEX idx_stock_movements_date ON stock_movements(created_at DESC);

-- Activity logs
CREATE INDEX idx_activity_logs_company ON activity_logs(company_id);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_date ON activity_logs(created_at DESC);
```

### 6.5 Row-Level Security (RLS) Policies

**Example Policies**:

```sql
-- Users can only see their company's data
CREATE POLICY "Users can view own company users"
  ON users FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Only admins can create users
CREATE POLICY "Admins can create users"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role = 'admin'
      AND company_id = NEW.company_id
    )
  );

-- Users can view their company's products
CREATE POLICY "Users can view company products"
  ON products FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

-- Admin/Supervisor can create products
CREATE POLICY "Authorized users can create products"
  ON products FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE id = auth.uid()
      AND role IN ('admin', 'supervisor')
      AND company_id = NEW.company_id
    )
  );
```

---

## 7. API Design

### 7.1 RESTful API Principles

**Resource Naming**:
- Use plural nouns: `/products`, `/customers`
- Lowercase with hyphens: `/stock-movements`
- Nested resources: `/invoices/:id/items`
- Actions as sub-resources: `/users/:id/activate`

**HTTP Methods**:
- `GET` - Retrieve resource(s)
- `POST` - Create new resource
- `PUT` - Update entire resource
- `PATCH` - Partial update
- `DELETE` - Remove resource

**Status Codes**:
- `200` - Success
- `201` - Created
- `204` - No Content (successful delete)
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (not authorized)
- `404` - Not Found
- `409` - Conflict (duplicate)
- `422` - Unprocessable Entity (business rule violation)
- `429` - Too Many Requests (rate limit)
- `500` - Internal Server Error

### 7.2 API Versioning

**URL Versioning**: `/api/v1/products`

**Version Migration Strategy**:
1. Maintain v1 for 6 months after v2 release
2. Deprecation warnings in response headers
3. Client SDK auto-migration support

### 7.3 API Endpoints Reference

#### Authentication (`/api/v1/auth`)

```
POST   /auth/register          Register new user & company
POST   /auth/login             Login with email/password
POST   /auth/logout            Logout (invalidate token)
GET    /auth/me                Get current user
POST   /auth/refresh           Refresh access token
POST   /auth/forgot-password   Request password reset
POST   /auth/reset-password    Reset password with token
POST   /auth/verify-email      Verify email address
```

#### Products (`/api/v1/products`)

```
GET    /products               List all products (paginated, filtered)
GET    /products/:id           Get product by ID
POST   /products               Create new product
PUT    /products/:id           Update product
DELETE /products/:id           Delete product
GET    /products/barcode/:code Get product by barcode
GET    /products/low-stock     Get low stock products
POST   /products/:id/stock     Update stock quantity
GET    /products/:id/movements Get stock movement history
POST   /products/bulk          Bulk create products
PUT    /products/bulk          Bulk update products
```

#### Invoices (`/api/v1/invoices`)

```
GET    /invoices               List all invoices
GET    /invoices/:id           Get invoice with items
POST   /invoices               Create new invoice
PUT    /invoices/:id           Update invoice
DELETE /invoices/:id           Delete invoice
GET    /invoices/:id/pdf       Generate invoice PDF
POST   /invoices/:id/email     Email invoice to customer
POST   /invoices/:id/cancel    Cancel invoice
GET    /invoices/stats         Get invoice statistics
```

#### Reports (`/api/v1/reports`)

```
GET    /reports/sales          Sales summary report
GET    /reports/profit         Profit & loss report
GET    /reports/inventory      Inventory valuation
GET    /reports/customers      Customer analysis
GET    /reports/top-products   Best-selling products
GET    /reports/expenses       Expense breakdown
GET    /reports/dashboard      Dashboard statistics
POST   /reports/custom         Generate custom report
GET    /reports/:id/pdf        Download report as PDF
```

### 7.4 Query Parameters

**Pagination**:
```
?limit=20&offset=0
?page=2&per_page=20
```

**Filtering**:
```
?status=active
?category=electronics
?min_price=100&max_price=500
?created_after=2024-01-01
```

**Searching**:
```
?search=laptop
?q=john+doe
```

**Sorting**:
```
?sort=name
?sort=-created_at (descending)
?sort=price,name
```

**Field Selection**:
```
?fields=id,name,price
?include=category,supplier
```

**Example**:
```
GET /api/v1/products?
    search=laptop&
    category=electronics&
    min_price=500&
    sort=-created_at&
    limit=20&
    offset=0
```

### 7.5 Request/Response Examples

#### Create Product

**Request**:
```http
POST /api/v1/products
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Content-Type: application/json

{
  "name": "Laptop Dell XPS 15",
  "barcode": "123456789012",
  "description": "15-inch laptop, Intel i7, 16GB RAM",
  "categoryId": "550e8400-e29b-41d4-a716-446655440000",
  "purchasePrice": 800.00,
  "sellingPrice": 1200.00,
  "currentStock": 10,
  "minStockLevel": 5,
  "unit": "piece"
}
```

**Response**:
```http
HTTP/1.1 201 Created
Content-Type: application/json

{
  "success": true,
  "data": {
    "id": "660e8400-e29b-41d4-a716-446655440000",
    "name": "Laptop Dell XPS 15",
    "barcode": "123456789012",
    "description": "15-inch laptop, Intel i7, 16GB RAM",
    "categoryId": "550e8400-e29b-41d4-a716-446655440000",
    "purchasePrice": 800.00,
    "sellingPrice": 1200.00,
    "currentStock": 10,
    "minStockLevel": 5,
    "unit": "piece",
    "imageUrl": null,
    "companyId": "440e8400-e29b-41d4-a716-446655440000",
    "createdAt": "2024-01-15T10:30:00.000Z",
    "updatedAt": "2024-01-15T10:30:00.000Z"
  },
  "message": "Product created successfully"
}
```

#### Error Response

```http
HTTP/1.1 400 Bad Request
Content-Type: application/json

{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "sellingPrice": "Selling price must be greater than or equal to 0",
      "name": "Name is required"
    }
  }
}
```

---

## 8. Security Architecture

### 8.1 Security Layers

```
┌─────────────────────────────────────────┐
│     1. Network Security (HTTPS/TLS)     │
├─────────────────────────────────────────┤
│     2. Rate Limiting & DDoS Protection  │
├─────────────────────────────────────────┤
│     3. Input Validation & Sanitization  │
├─────────────────────────────────────────┤
│     4. Authentication (JWT)             │
├─────────────────────────────────────────┤
│     5. Authorization (RBAC)             │
├─────────────────────────────────────────┤
│     6. Data Encryption                  │
├─────────────────────────────────────────┤
│     7. SQL Injection Prevention         │
├─────────────────────────────────────────┤
│     8. XSS Prevention                   │
├─────────────────────────────────────────┤
│     9. CSRF Protection                  │
├─────────────────────────────────────────┤
│     10. Database RLS                    │
└─────────────────────────────────────────┘
```

### 8.2 Authentication Security

**Password Policy**:
- Minimum 8 characters
- Must contain: uppercase, lowercase, number
- Hashed with bcrypt (10 rounds)
- Never stored in plain text
- Never logged or displayed

**JWT Strategy**:
```javascript
// Token Payload
{
  userId: "uuid",
  email: "user@example.com",
  role: "admin",
  companyId: "uuid",
  iat: 1642000000,
  exp: 1642604800
}

// Access Token: 7 days
// Refresh Token: 30 days
// Stored in httpOnly cookie (web) or secure storage (mobile)
```

**Account Protection**:
- Max 5 failed attempts
- 15-minute lockout
- Email notification on lockout
- Password reset via email token
- Token expiry: 1 hour

### 8.3 Authorization (RBAC)

**Role Matrix**:

| Resource | Admin | Supervisor | Operator | Cashier |
|----------|-------|------------|----------|---------|
| Users | CRUD | R | R | R |
| Products | CRUD | CRUD | CRUD | R |
| Categories | CRUD | CRUD | R | R |
| Customers | CRUD | CRUD | CRUD | R |
| Invoices | CRUD | CRUD | CR | CR |
| Expenses | CRUD | CRUD | CR | - |
| Reports | ALL | ALL | Limited | - |
| Settings | CRUD | R | - | - |
| Teams | CRUD | R | - | - |
| Subscriptions | CRUD | R | - | - |

**Permission Implementation**:
```javascript
const permissions = {
  admin: ['*'],
  supervisor: [
    'products:*',
    'categories:*',
    'customers:*',
    'invoices:*',
    'expenses:*',
    'reports:*',
    'users:read',
    'settings:read'
  ],
  operator: [
    'products:create',
    'products:read',
    'products:update',
    'customers:*',
    'invoices:create',
    'invoices:read',
    'expenses:create',
    'expenses:read'
  ],
  cashier: [
    'products:read',
    'customers:read',
    'invoices:create',
    'invoices:read'
  ]
};
```

### 8.4 Data Security

**Encryption**:
- Passwords: bcrypt hashing
- Sensitive fields: AES-256 encryption
- Data in transit: TLS 1.3
- Data at rest: Database encryption

**Data Sanitization**:
```javascript
// Input sanitization
const sanitize = (input) => {
  return DOMPurify.sanitize(input, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: []
  });
};

// SQL Injection Prevention
// Use parameterized queries (Supabase handles this)
await supabase
  .from('products')
  .select()
  .eq('company_id', companyId) // Parameterized
  .ilike('name', `%${sanitize(search)}%`); // Sanitized
```

**CORS Policy**:
```javascript
const corsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = env.ALLOWED_ORIGINS;
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
```

### 8.5 Security Headers (Helmet)

```javascript
helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  frameguard: { action: 'deny' },
  noSniff: true,
  xssFilter: true
})
```

### 8.6 Rate Limiting

```javascript
// General API rate limit
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: 'Too many requests, please try again later'
});

// Auth endpoints (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,
  message: 'Too many authentication attempts'
});

// Apply
app.use('/api/', generalLimiter);
app.use('/api/v1/auth/', authLimiter);
```

---

## 9. Authentication & Authorization

### 9.1 JWT Token Structure

**Access Token** (7 days):
```json
{
  "header": {
    "alg": "HS256",
    "typ": "JWT"
  },
  "payload": {
    "userId": "550e8400-e29b-41d4-a716-446655440000",
    "email": "admin@company.com",
    "role": "admin",
    "companyId": "440e8400-e29b-41d4-a716-446655440000",
    "iat": 1642000000,
    "exp": 1642604800
  },
  "signature": "HMACSHA256(...)"
}
```

**Refresh Token** (30 days):
```json
{
  "userId": "550e8400-e29b-41d4-a716-446655440000",
  "email": "admin@company.com",
  "type": "refresh",
  "iat": 1642000000,
  "exp": 1644592000
}
```

### 9.2 Authentication Flow

```
┌─────────┐                                    ┌─────────┐
│ Client  │                                    │ Server  │
└────┬────┘                                    └────┬────┘
     │                                              │
     │  POST /auth/login                            │
     │  {email, password}                           │
     ├─────────────────────────────────────────────>│
     │                                              │
     │                                         Validate
     │                                         Credentials
     │                                              │
     │                                         Generate
     │                                          Tokens
     │                                              │
     │  200 OK                                      │
     │  {user, accessToken, refreshToken}           │
     │<─────────────────────────────────────────────┤
     │                                              │
     │  Store tokens                                │
     │  (Cookie/LocalStorage)                       │
     │                                              │
     │  GET /api/v1/products                        │
     │  Authorization: Bearer {accessToken}         │
     ├─────────────────────────────────────────────>│
     │                                              │
     │                                         Verify JWT
     │                                         Extract User
     │                                              │
     │  200 OK {products}                           │
     │<─────────────────────────────────────────────┤
     │                                              │
     │  (Token Expires)                             │
     │                                              │
     │  POST /auth/refresh                          │
     │  {refreshToken}                              │
     ├─────────────────────────────────────────────>│
     │                                              │
     │                                         Verify
     │                                         Refresh Token
     │                                              │
     │                                         Generate New
     │                                         Access Token
     │                                              │
     │  200 OK {accessToken}                        │
     │<─────────────────────────────────────────────┤
     │                                              │
```

### 9.3 Authorization Middleware

```javascript
// Check user has specific role
export const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return next(new AppError('Authentication required', 401));
    }

    if (!roles.includes(req.user.role)) {
      return next(new AppError(
        `Access denied. Required role: ${roles.join(' or ')}`,
        403
      ));
    }

    next();
  };
};

// Check user has specific permission
export const requirePermission = (permission) => {
  return (req, res, next) => {
    const userPermissions = permissions[req.user.role];

    const hasPermission = userPermissions.includes('*') ||
      userPermissions.includes(permission) ||
      userPermissions.some(p => {
        const regex = new RegExp('^' + p.replace('*', '.*') + '$');
        return regex.test(permission);
      });

    if (!hasPermission) {
      return next(new AppError('Insufficient permissions', 403));
    }

    next();
  };
};

// Usage
router.post('/products',
  authenticate,
  requireRole('admin', 'supervisor'),
  requirePermission('products:create'),
  productController.create
);
```

---

## 10. Error Handling & Logging

### 10.1 Error Handling Strategy

**Error Types**:

```javascript
// Custom Error Class
class AppError extends Error {
  constructor(message, statusCode = 500, code = 'SERVER_ERROR') {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Validation Error
class ValidationError extends AppError {
  constructor(details) {
    super('Validation failed', 400, 'VALIDATION_ERROR');
    this.details = details;
  }
}

// Not Found Error
class NotFoundError extends AppError {
  constructor(resource) {
    super(`${resource} not found`, 404, 'NOT_FOUND');
  }
}

// Unauthorized Error
class UnauthorizedError extends AppError {
  constructor(message = 'Authentication required') {
    super(message, 401, 'UNAUTHORIZED');
  }
}

// Forbidden Error
class ForbiddenError extends AppError {
  constructor(message = 'Access denied') {
    super(message, 403, 'FORBIDDEN');
  }
}
```

**Global Error Handler**:

```javascript
export const errorHandler = (err, req, res, next) => {
  // Default to 500
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal server error';
  let code = err.code || 'SERVER_ERROR';

  // Log error
  if (statusCode >= 500) {
    logger.error('Server Error:', {
      error: err,
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

  // Handle specific errors
  if (err.code === 'PGRST116') {
    // Supabase not found
    statusCode = 404;
    message = 'Resource not found';
    code = 'NOT_FOUND';
  }

  if (err.code === '23505') {
    // PostgreSQL unique violation
    statusCode = 409;
    message = 'Resource already exists';
    code = 'DUPLICATE';
  }

  // Send response
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
```

### 10.2 Logging Strategy

**Winston Configuration**:

```javascript
import winston from 'winston';
import env from '../config/env.js';

const logLevels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4
};

const logColors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue'
};

winston.addColors(logColors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

const consoleFormat = winston.format.combine(
  winston.format.colorize({ all: true }),
  winston.format.printf(({ timestamp, level, message, ...meta }) => {
    return `${timestamp} [${level}]: ${message} ${
      Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''
    }`;
  })
);

const transports = [
  // Console logging
  new winston.transports.Console({
    format: consoleFormat,
    level: env.isDevelopment ? 'debug' : 'info'
  }),

  // Error file logging
  new winston.transports.File({
    filename: 'logs/error.log',
    level: 'error',
    format,
    maxsize: 5242880, // 5MB
    maxFiles: 5
  }),

  // Combined file logging
  new winston.transports.File({
    filename: 'logs/combined.log',
    format,
    maxsize: 5242880,
    maxFiles: 5
  })
];

const logger = winston.createLogger({
  levels: logLevels,
  format,
  transports,
  exitOnError: false
});

export default logger;
```

**Logging Examples**:

```javascript
// Info logging
logger.info('User logged in', {
  userId: user.id,
  email: user.email,
  ip: req.ip
});

// Error logging
logger.error('Database query failed', {
  error: error.message,
  query: queryString,
  userId: req.user?.id
});

// HTTP request logging (Morgan)
app.use(morgan('combined', {
  stream: {
    write: (message) => logger.http(message.trim())
  }
}));
```

### 10.3 Activity Logging

Track user actions for audit trail:

```javascript
const logActivity = async (req, action, entityType, entityId, details = {}) => {
  try {
    await supabase
      .from('activity_logs')
      .insert({
        user_id: req.user?.id,
        company_id: req.user?.companyId,
        action,
        entity_type: entityType,
        entity_id: entityId,
        details,
        ip_address: req.ip,
        user_agent: req.get('user-agent'),
        created_at: new Date().toISOString()
      });
  } catch (error) {
    logger.error('Activity logging failed:', error);
  }
};

// Usage
await logActivity(req, 'CREATE', 'product', product.id, {
  name: product.name,
  barcode: product.barcode
});
```

---

## 11. Performance & Scalability

### 11.1 Performance Optimization

**Database Optimization**:
1. **Indexes**: All foreign keys and frequently queried columns
2. **Query Optimization**: Use specific selects, avoid `SELECT *`
3. **Pagination**: Always paginate large result sets
4. **Eager Loading**: Use Supabase's select syntax for relationships
5. **Query Caching**: Cache frequently accessed data

**Example Optimized Query**:
```javascript
// Bad - No pagination, selects all columns
const { data } = await supabase
  .from('products')
  .select('*')
  .eq('company_id', companyId);

// Good - Paginated, specific columns, filtered
const { data, count } = await supabase
  .from('products')
  .select('id, name, barcode, selling_price, current_stock', { count: 'exact' })
  .eq('company_id', companyId)
  .gte('current_stock', 1)
  .range(offset, offset + limit - 1)
  .order('name', { ascending: true });
```

**Caching Strategy**:

```javascript
import NodeCache from 'node-cache';

// Cache for 5 minutes
const cache = new NodeCache({ stdTTL: 300 });

export const cacheMiddleware = (duration) => {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      return next();
    }

    const key = req.originalUrl;
    const cached = cache.get(key);

    if (cached) {
      return res.json(cached);
    }

    const originalJson = res.json.bind(res);
    res.json = (body) => {
      cache.set(key, body, duration);
      return originalJson(body);
    };

    next();
  };
};

// Usage
router.get('/products',
  authenticate,
  cacheMiddleware(300), // 5 minutes
  productController.index
);
```

### 11.2 Scalability Patterns

**Horizontal Scaling**:
- Stateless API design (no session storage)
- JWT tokens (no server-side session)
- Database connection pooling
- Load balancer ready

**Vertical Scaling**:
- Efficient algorithms
- Minimal memory usage
- Async operations (avoid blocking)
- Worker threads for heavy tasks

**Database Scaling**:
- Read replicas for reports
- Partitioning by company_id
- Archive old data
- Optimize queries

**Microservices Readiness**:
```
Current Monolith:
┌─────────────────────────────────┐
│         API Server              │
│  ┌────────┐  ┌────────────┐    │
│  │ Auth   │  │ Products   │    │
│  ├────────┤  ├────────────┤    │
│  │Invoice │  │ Reports    │    │
│  └────────┘  └────────────┘    │
└─────────────────────────────────┘

Future Microservices:
┌──────────┐  ┌───────────┐  ┌─────────┐
│Auth      │  │Inventory  │  │Billing  │
│Service   │  │Service    │  │Service  │
└──────────┘  └───────────┘  └─────────┘
      │              │              │
      └──────────────┴──────────────┘
                     │
              ┌──────▼──────┐
              │API Gateway  │
              └─────────────┘
```

---

## 12. Testing Strategy

### 12.1 Test Pyramid

```
        ┌───────────────┐
       /  E2E Tests (5%) \
      /────────────────────\
     /  Integration (15%)   \
    /────────────────────────\
   /   Unit Tests (80%)       \
  /──────────────────────────────\
```

### 12.2 Unit Tests

**Test Models**:
```javascript
// tests/unit/models/Product.test.js
describe('Product Model', () => {
  describe('create', () => {
    it('should create a product with valid data', async () => {
      const productData = {
        name: 'Test Product',
        barcode: '123456',
        purchasePrice: 100,
        sellingPrice: 150
      };

      const product = await Product.create(productData, companyId);

      expect(product).toHaveProperty('id');
      expect(product.name).toBe('Test Product');
    });

    it('should throw error for duplicate barcode', async () => {
      await expect(
        Product.create({ barcode: existingBarcode }, companyId)
      ).rejects.toThrow();
    });
  });
});
```

**Test Services**:
```javascript
// tests/unit/services/authService.test.js
describe('AuthService', () => {
  describe('register', () => {
    it('should create company, user, and subscription', async () => {
      const userData = {
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        companyName: 'Test Company'
      };

      const result = await authService.register(userData);

      expect(result).toHaveProperty('user');
      expect(result).toHaveProperty('company');
      expect(result).toHaveProperty('token');
      expect(result.user.role).toBe('admin');
    });
  });
});
```

### 12.3 Integration Tests

```javascript
// tests/integration/products.test.js
import request from 'supertest';
import app from '../../src/app.js';

describe('Product API', () => {
  let authToken;

  beforeAll(async () => {
    // Login and get token
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'admin@test.com', password: 'password' });

    authToken = res.body.token;
  });

  describe('POST /api/v1/products', () => {
    it('should create a new product', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Test Product',
          purchasePrice: 100,
          sellingPrice: 150
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('id');
    });

    it('should return 401 without auth', async () => {
      const res = await request(app)
        .post('/api/v1/products')
        .send({ name: 'Test' });

      expect(res.status).toBe(401);
    });
  });
});
```

### 12.4 Test Coverage Goals

| Layer | Target Coverage |
|-------|----------------|
| Models | 90%+ |
| Services | 85%+ |
| Controllers | 80%+ |
| Middleware | 90%+ |
| Utils | 95%+ |
| Overall | 85%+ |

---

## 13. Deployment Architecture

### 13.1 Deployment Environments

```
Development → Staging → Production

┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐
│  Development    │  │    Staging      │  │   Production    │
├─────────────────┤  ├─────────────────┤  ├─────────────────┤
│ Local machine   │  │ AWS/Heroku      │  │ AWS/Heroku      │
│ SQLite/Supabase │  │ Supabase        │  │ Supabase        │
│ Hot reload      │  │ Like production │  │ Load balanced   │
│ Debug logs      │  │ Testing         │  │ Monitoring      │
└─────────────────┘  └─────────────────┘  └─────────────────┘
```

### 13.2 Production Architecture

```
                        ┌──────────────┐
                        │   Clients    │
                        └──────┬───────┘
                               │
                        ┌──────▼───────┐
                        │  CloudFlare  │
                        │  (CDN/WAF)   │
                        └──────┬───────┘
                               │
                        ┌──────▼───────┐
                        │Load Balancer │
                        └──────┬───────┘
                               │
                ┌──────────────┼──────────────┐
                │              │              │
         ┌──────▼─────┐ ┌─────▼──────┐ ┌────▼──────┐
         │ API Server │ │ API Server │ │API Server │
         │  Instance  │ │  Instance  │ │ Instance  │
         └──────┬─────┘ └─────┬──────┘ └────┬──────┘
                │              │              │
                └──────────────┼──────────────┘
                               │
                    ┌──────────▼─────────┐
                    │   Supabase DB      │
                    │  (PostgreSQL)      │
                    └────────────────────┘
                               │
                    ┌──────────▼─────────┐
                    │External Services   │
                    │ - Email (SMTP)     │
                    │ - Payment Gateway  │
                    │ - File Storage     │
                    └────────────────────┘
```

### 13.3 Environment Variables

```bash
# .env.production
NODE_ENV=production
PORT=5000

# Database
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_KEY=eyJhbGc...

# JWT
JWT_SECRET=super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=super-secret-refresh-key
JWT_REFRESH_EXPIRES_IN=30d

# CORS
CORS_ORIGIN=https://app.yourdomain.com
ALLOWED_ORIGINS=https://app.yourdomain.com,https://www.yourdomain.com

# Email
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASSWORD=SG.xxx
EMAIL_FROM=noreply@yourdomain.com

# Payment
MAXICASH_API_KEY=xxx
MAXICASH_API_SECRET=xxx
MAXICASH_BASE_URL=https://api.maxicash.com

# Monitoring
SENTRY_DSN=https://xxx@sentry.io/xxx

# Frontend
FRONTEND_URL=https://app.yourdomain.com
```

### 13.4 Deployment Checklist

**Pre-Deployment**:
- [ ] All tests passing
- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Security audit completed
- [ ] Performance testing done
- [ ] Documentation updated
- [ ] Backup strategy in place

**Deployment**:
- [ ] Deploy to staging first
- [ ] Run smoke tests
- [ ] Monitor error rates
- [ ] Check performance metrics
- [ ] Verify all endpoints
- [ ] Test authentication
- [ ] Deploy to production
- [ ] Monitor for 24 hours

**Post-Deployment**:
- [ ] Verify production health
- [ ] Check error logs
- [ ] Monitor performance
- [ ] User acceptance testing
- [ ] Rollback plan ready
- [ ] Communication to users

---

## 14. Implementation Guidelines

### 14.1 Development Workflow

```
1. Create Feature Branch
   git checkout -b feature/product-import

2. Implement Feature
   - Write tests first (TDD)
   - Implement functionality
   - Follow coding standards

3. Run Tests
   npm test
   npm run lint

4. Commit Changes
   git commit -m "feat: add product import functionality"

5. Push & Create PR
   git push origin feature/product-import

6. Code Review
   - At least 1 approval required
   - All tests must pass
   - No linting errors

7. Merge to Main
   - Squash and merge
   - Delete feature branch

8. Deploy
   - Auto-deploy to staging
   - Manual deploy to production
```

### 14.2 Coding Standards

**Naming Conventions**:
```javascript
// Files: camelCase
productController.js
authService.js

// Classes: PascalCase
class ProductService { }

// Functions/Variables: camelCase
const getUserById = () => { }
const productCount = 10;

// Constants: UPPER_SNAKE_CASE
const MAX_FILE_SIZE = 5242880;
const DEFAULT_PAGE_SIZE = 20;

// Database Tables: snake_case
products
stock_movements
invoice_items
```

**Code Style**:
```javascript
// Use ES6+ features
const user = { name, email };
const products = data.map(p => ({ ...p, price: p.price * 1.1 }));

// Async/await over promises
const product = await Product.findById(id);

// Destructuring
const { name, email } = req.body;
const { companyId } = req.user;

// Arrow functions
const double = (x) => x * 2;

// Template literals
const message = `Welcome ${user.name}!`;

// Optional chaining
const city = user?.address?.city;

// Nullish coalescing
const port = process.env.PORT ?? 5000;
```

**Error Handling**:
```javascript
// Always use try-catch in async functions
export const createProduct = async (req, res, next) => {
  try {
    const product = await Product.create(req.body, req.user.companyId);
    res.status(201).json({ success: true, data: product });
  } catch (error) {
    next(error);
  }
};

// Throw custom errors
if (!product) {
  throw new NotFoundError('Product');
}

// Validate input
if (!req.body.name) {
  throw new ValidationError({ name: 'Name is required' });
}
```

### 14.3 Git Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add product barcode scanning
fix: resolve invoice total calculation bug
docs: update API documentation
refactor: simplify user authentication
test: add unit tests for Product model
chore: update dependencies
perf: optimize product search query
style: format code with prettier
```

### 14.4 Code Review Checklist

**Functionality**:
- [ ] Code works as intended
- [ ] Edge cases handled
- [ ] Error handling implemented
- [ ] Input validation present

**Code Quality**:
- [ ] Follows coding standards
- [ ] No code duplication
- [ ] Proper naming conventions
- [ ] Comments where needed
- [ ] No commented-out code

**Testing**:
- [ ] Unit tests added
- [ ] All tests passing
- [ ] Test coverage adequate

**Security**:
- [ ] No sensitive data exposed
- [ ] Input properly sanitized
- [ ] Authorization checks present
- [ ] SQL injection prevented

**Performance**:
- [ ] No N+1 queries
- [ ] Proper indexing used
- [ ] Pagination implemented
- [ ] No blocking operations

---

## 15. Conclusion

This specification provides a complete blueprint for implementing a robust, scalable, and secure backend for the inventory management system. Key takeaways:

**Core Strengths**:
1. ✅ **Multi-Tenancy**: Complete data isolation per company
2. ✅ **Security**: Multiple layers of protection
3. ✅ **Scalability**: Stateless design, ready for horizontal scaling
4. ✅ **Maintainability**: Clean architecture, well-organized code
5. ✅ **Performance**: Optimized queries, caching, pagination
6. ✅ **Reliability**: Comprehensive error handling and logging

**Next Steps**:
1. Implement remaining controllers (categories, customers, invoices, etc.)
2. Add comprehensive test suite
3. Set up CI/CD pipeline
4. Create API documentation (Swagger)
5. Performance testing and optimization
6. Security audit
7. Production deployment

**Success Metrics**:
- API response time < 200ms (95th percentile)
- Test coverage > 85%
- Zero security vulnerabilities
- 99.9% uptime
- Support 1000+ concurrent users

---

**Document Control**:
- Version: 1.0.0
- Status: Final
- Last Updated: February 2026
- Next Review: March 2026
