# Frontend Developer Package
## Complete Integration Resources for Inventory Management System API

**Package Version:** 1.0.0
**Last Updated:** February 17, 2026
**Status:** ✅ Production Ready

---

## 📦 What's Included

This complete package contains everything your frontend team needs to integrate with the Inventory Management System API:

✅ **Complete API Documentation** (200+ pages)
✅ **Postman Collection** (50+ pre-configured requests)
✅ **Field Naming Guide** (Avoid common mistakes)
✅ **Quick Reference Cards** (Copy-paste examples)
✅ **Data Models & Structures** (TypeScript interfaces)
✅ **Business Rules** (Multi-tenancy, permissions, workflows)
✅ **Authentication Guide** (JWT token management)
✅ **Error Handling** (All error codes & responses)
✅ **Testing Tools** (Postman, Swagger/OpenAPI)
✅ **Best Practices** (Code examples, patterns)

---

## 🚀 Quick Start (5 Minutes)

### 1. API Base URLs

```javascript
// Development
const API_BASE_URL = 'http://localhost:5000/api/v1';

// Production
const API_BASE_URL = 'https://your-domain.com/api/v1';

// Health Check
const HEALTH_URL = 'http://localhost:5000/health';
```

### 2. Test API Connection

```bash
curl http://localhost:5000/health
```

**Expected Response:**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2026-02-17T10:30:00Z"
}
```

### 3. Import Postman Collection

1. Open Postman
2. Import `docs/api/postman_collection_v2.json`
3. Import `docs/api/postman_environment.json`
4. Run "1.1 Register Company A"
5. Token saved automatically ✨

### 4. Read Main Documentation

📖 **Start here:** `FRONTEND_INTEGRATION_GUIDE.md`

---

## 📚 Documentation Index

### 🎯 Essential Documents (Start Here)

| Document | Purpose | Location |
|----------|---------|----------|
| **Frontend Integration Guide** | Main API documentation (200+ pages) | `FRONTEND_INTEGRATION_GUIDE.md` |
| **Frontend Quick Start** | Get started in 5 minutes | `docs/FRONTEND_QUICK_START.md` |
| **API Quick Reference** | Copy-paste endpoint examples | `API_QUICK_REFERENCE.md` |
| **Field Naming Guide** | Critical! Avoid field name errors | `API_FIELD_NAMING_GUIDE.md` |

### 📖 Comprehensive Documentation

| Document | Purpose | Location |
|----------|---------|----------|
| **Backend Specification** | Complete technical architecture | `BACKEND_SPECIFICATION.md` |
| **Testing Guide** | Testing strategies & examples | `TESTING_GUIDE.md` |
| **Postman Testing Guide** | Detailed Postman usage | `POSTMAN_TESTING_GUIDE.md` |
| **User Creation Guide** | User management & roles | `USER_CREATION_GUIDE.md` |

### 🔧 Testing Tools

| Tool | Purpose | Location |
|------|---------|----------|
| **Postman Collection v2** | 50+ pre-configured API requests | `docs/api/postman_collection_v2.json` |
| **Postman Environment** | Environment variables | `docs/api/postman_environment.json` |
| **Swagger/OpenAPI Spec** | OpenAPI 3.0 specification | `docs/api/swagger.yaml` |
| **API Tools README** | Guide for testing tools | `docs/api/README.md` |

### 📋 Reference Documents

| Document | Purpose | Location |
|----------|---------|----------|
| **Database & Models Summary** | Database schema overview | `DATABASE_AND_MODELS_SUMMARY.md` |
| **Foundation Quick Reference** | System foundation | `FOUNDATION_QUICK_REFERENCE.md` |
| **MaxiCash Integration** | Payment integration guide | `MAXICASH_INTEGRATION_SUMMARY.md` |
| **Cleanup System** | Automated data cleanup | `AUTOMATED_CLEANUP_140_DAYS.md` |

---

## 📊 API Overview

### Base Information

```
Protocol: HTTPS
Format: JSON
Authentication: JWT Bearer Token
Base URL (Dev): http://localhost:5000/api/v1
Base URL (Prod): https://your-domain.com/api/v1
```

### Standard Response Format

**Success:**
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { ... }
  }
}
```

**Paginated:**
```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE |
| 201 | Created | Successful POST |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 409 | Conflict | Duplicate resource |
| 422 | Unprocessable | Business logic error |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Server Error | Internal error |

---

## 🔐 Authentication

### Token Management

**Token Types:**
- **Access Token:** Valid for 7 days
- **Refresh Token:** Valid for 30 days

**Required Header:**
```javascript
{
  "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "Content-Type": "application/json"
}
```

### Authentication Endpoints

```
POST   /auth/register       Register company + admin user
POST   /auth/login          Login with email/password
GET    /auth/me             Get current user info
POST   /auth/refresh        Refresh access token
POST   /auth/logout         Logout (invalidate token)
POST   /auth/forgot-password Request password reset
POST   /auth/reset-password  Reset password with token
```

### Authentication Flow

```
1. Register/Login
   ↓
2. Receive token + refreshToken
   ↓
3. Store tokens (localStorage/state)
   ↓
4. Include token in Authorization header
   ↓
5. Token expires after 7 days
   ↓
6. Use refresh token to get new access token
   ↓
7. Repeat step 4
```

**Example Code:**
```javascript
// Login
const response = await fetch(`${API_URL}/auth/login`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email, password })
});

const { data } = await response.json();

// Store tokens
localStorage.setItem('access_token', data.token);
localStorage.setItem('refresh_token', data.refreshToken);

// Use token
const headers = {
  'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
  'Content-Type': 'application/json'
};
```

---

## 📦 Complete Endpoint List

### Authentication (7 endpoints)
```
POST   /auth/register
POST   /auth/login
GET    /auth/me
POST   /auth/refresh
POST   /auth/logout
POST   /auth/forgot-password
POST   /auth/reset-password
```

### Products (6 endpoints)
```
GET    /products
POST   /products
GET    /products/:id
GET    /products/barcode/:barcode
PUT    /products/:id
DELETE /products/:id
```

### Categories (4 endpoints)
```
GET    /categories
POST   /categories
PUT    /categories/:id
DELETE /categories/:id
```

### Customers (5 endpoints)
```
GET    /customers
POST   /customers
GET    /customers/:id
GET    /customers/:id/stats
PUT    /customers/:id
DELETE /customers/:id
```

### Invoices (5 endpoints)
```
GET    /invoices
POST   /invoices
GET    /invoices/:id
GET    /invoices/:id/pdf
POST   /invoices/:id/cancel
```

### Expenses (6 endpoints)
```
GET    /expenses
POST   /expenses
GET    /expenses/:id
POST   /expenses/:id/approve
POST   /expenses/:id/reject
PUT    /expenses/:id
DELETE /expenses/:id
```

### Stock Management (6 endpoints)
```
POST   /stock/in
POST   /stock/out
POST   /stock/adjust
GET    /stock/movements
GET    /stock/low-stock
GET    /stock/valuation
```

### Reports (6 endpoints)
```
GET    /reports/dashboard
GET    /reports/sales
GET    /reports/inventory
GET    /reports/profit
GET    /reports/expenses
GET    /reports/customers
```

### Users (7 endpoints)
```
GET    /users
POST   /users
GET    /users/:id
PUT    /users/:id
POST   /users/:id/activate
POST   /users/:id/deactivate
DELETE /users/:id
```

### Company (3 endpoints)
```
GET    /companies/me
PUT    /companies/me
GET    /companies/me/stats
```

### Teams (6 endpoints)
```
GET    /teams
POST   /teams
GET    /teams/:id
PUT    /teams/:id
POST   /teams/:id/members
DELETE /teams/:id/members/:user_id
DELETE /teams/:id
```

### Subscriptions (4 endpoints)
```
GET    /subscriptions/current
GET    /subscriptions/plans
POST   /subscriptions/upgrade
POST   /subscriptions/cancel
```

**Total: 70+ API endpoints**

---

## 🎯 Key Data Models

### User
```typescript
{
  id: string;                    // UUID
  name: string;
  email: string;
  role: 'admin' | 'supervisor' | 'operator' | 'cashier';
  company_id: string;
  phone?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}
```

### Product
```typescript
{
  id: string;
  name: string;
  barcode?: string;
  description?: string;
  category_id?: string;
  purchase_price: number;        // Decimal(10,2)
  selling_price: number;         // Decimal(10,2)
  current_stock: number;
  min_stock_level: number;
  unit: string;                  // Default: 'piece'
  sku?: string;
  location?: string;
  company_id: string;
  created_at: Date;
  updated_at: Date;
}
```

### Customer
```typescript
{
  id: string;
  name: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postal_code?: string;
  tax_id?: string;
  total_purchases: number;       // Computed
  is_vip: boolean;               // Auto-calculated
  company_id: string;
  created_at: Date;
  updated_at: Date;
}
```

### Invoice
```typescript
{
  id: string;
  invoice_number: string;        // Auto: INV-YYYYMMDD-####
  customer_id?: string;
  user_id: string;
  company_id: string;
  date: Date;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: 'cash' | 'card' | 'transfer' | 'check';
  payment_status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  notes?: string;
  items: InvoiceItem[];
  created_at: Date;
  updated_at: Date;
}
```

**See `FRONTEND_INTEGRATION_GUIDE.md` for all 10+ data models.**

---

## ⚠️ Critical Rules

### 1. Field Naming Convention (MUST FOLLOW)

**⚠️ ALL API fields use `snake_case`, NOT `camelCase`**

```javascript
// ✅ CORRECT
{
  "product_id": "uuid",
  "purchase_price": 100.00,
  "selling_price": 150.00,
  "current_stock": 50,
  "min_stock_level": 10
}

// ❌ WRONG (Will cause errors)
{
  "productId": "uuid",
  "purchasePrice": 100.00,
  "sellingPrice": 150.00,
  "currentStock": 50,
  "minStockLevel": 10
}
```

**📖 See:** `API_FIELD_NAMING_GUIDE.md` for complete reference.

### 2. Multi-Tenancy & Data Isolation

**Critical Security:**
- All data automatically filtered by `company_id`
- Users can ONLY access their company's data
- Cross-company access returns `404` (not `403`)
- Same barcode/email can exist in multiple companies

**Example:**
```
Company A: barcode="PROD-001" → Product A
Company B: barcode="PROD-001" → Product B
Both are valid and isolated ✅
```

### 3. User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **admin** | Full access to everything |
| **supervisor** | Manage inventory, approve expenses, view reports |
| **operator** | Create/edit products, customers, invoices, stock |
| **cashier** | Create invoices, view products (read-only) |

**Implementation:**
```javascript
// Show/hide based on role
const canDeleteUser = user.role === 'admin';
const canApproveExpense = ['admin', 'supervisor'].includes(user.role);
const canCreateInvoice = ['admin', 'supervisor', 'operator', 'cashier'].includes(user.role);
```

### 4. Stock Management

**Automatic Stock Deduction:**
- Creating invoice automatically deducts product stock
- Cancelling invoice restores product stock
- All stock changes are logged in stock movements

**Rules:**
```
current_stock >= quantity_ordered  (must have stock)
current_stock <= min_stock_level   (low stock alert)
```

### 5. Pagination

**Default Behavior:**
- Default `limit`: 20 items
- Maximum `limit`: 100 items
- Always returns pagination metadata

**Query Parameters:**
```
?page=2&limit=50
```

### 6. Date Format

**Always use ISO 8601:**
```javascript
// Send to API
const dateStr = new Date().toISOString();
// "2026-02-17T10:30:00.000Z"

// Receive from API (already ISO 8601)
const date = new Date(invoice.created_at);
```

### 7. Rate Limiting

**Limits:**
- General API: 100 requests / 15 minutes
- Auth endpoints: 5 requests / 15 minutes

**Response when exceeded (429):**
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Please try again later.",
    "details": {
      "retry_after": 900
    }
  }
}
```

---

## 🛠️ Implementation Guide

### Setup API Client (React + Axios)

```javascript
// src/api/client.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to all requests
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration
apiClient.interceptors.response.use(
  response => response.data,
  async error => {
    const originalRequest = error.config;

    // Try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem('refresh_token');
        const { data } = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          { refreshToken }
        );

        localStorage.setItem('access_token', data.data.token);
        localStorage.setItem('refresh_token', data.data.refreshToken);

        originalRequest.headers.Authorization = `Bearer ${data.data.token}`;
        return axios(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.clear();
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;
```

### Create API Services

```javascript
// src/api/products.js
import apiClient from './client';

export const productService = {
  getAll: (params) => apiClient.get('/products', { params }),

  getById: (id) => apiClient.get(`/products/${id}`),

  getByBarcode: (barcode) => apiClient.get(`/products/barcode/${barcode}`),

  create: (data) => apiClient.post('/products', data),

  update: (id, data) => apiClient.put(`/products/${id}`, data),

  delete: (id) => apiClient.delete(`/products/${id}`)
};

// Usage in component
import { productService } from '@/api/products';

const fetchProducts = async () => {
  try {
    const response = await productService.getAll({ page: 1, limit: 20 });
    setProducts(response.data.items);
    setPagination(response.data.pagination);
  } catch (error) {
    console.error('Error fetching products:', error);
    showError(error.error?.message || 'Failed to load products');
  }
};
```

### Error Handling

```javascript
// src/utils/errorHandler.js
export const handleApiError = (error) => {
  if (!error.error) {
    return 'An unexpected error occurred';
  }

  const { code, message, details } = error.error;

  switch (code) {
    case 'VALIDATION_ERROR':
      return { type: 'validation', message, details };

    case 'UNAUTHORIZED':
    case 'TOKEN_EXPIRED':
      return { type: 'auth', message: 'Please login again' };

    case 'FORBIDDEN':
      return { type: 'permission', message: 'You don\'t have permission' };

    case 'NOT_FOUND':
      return { type: 'notFound', message: 'Resource not found' };

    case 'DUPLICATE_ENTRY':
      return { type: 'duplicate', message, details };

    case 'INSUFFICIENT_STOCK':
      return { type: 'stock', message, details };

    default:
      return { type: 'general', message };
  }
};

// Usage
try {
  await productService.create(formData);
  showSuccess('Product created successfully');
} catch (error) {
  const errorInfo = handleApiError(error);

  if (errorInfo.type === 'validation') {
    setFormErrors(errorInfo.details);
  } else {
    showError(errorInfo.message);
  }
}
```

### Form Data Conversion (camelCase ↔ snake_case)

```javascript
// src/utils/caseConversion.js

// Convert camelCase to snake_case for API
export const toSnakeCase = (obj) => {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
};

// Convert snake_case to camelCase for UI
export const toCamelCase = (obj) => {
  const result = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
    result[camelKey] = value;
  }
  return result;
};

// Usage
const formData = {
  name: 'Product Name',
  purchasePrice: 100,
  sellingPrice: 150,
  currentStock: 50
};

// Convert to API format
const apiData = toSnakeCase(formData);
// { name: 'Product Name', purchase_price: 100, selling_price: 150, current_stock: 50 }

await productService.create(apiData);
```

---

## ✅ Testing Checklist

### Basic Functionality
- [ ] Health check returns 200
- [ ] Registration creates company + user
- [ ] Login returns token
- [ ] Token stored in localStorage/state
- [ ] Authenticated requests work
- [ ] Token refresh works
- [ ] Logout clears token

### CRUD Operations
- [ ] Create product works
- [ ] List products with pagination works
- [ ] Update product works
- [ ] Delete product works
- [ ] Same for customers, categories, etc.

### Business Logic
- [ ] Invoice creation deducts stock
- [ ] Invoice cancellation restores stock
- [ ] Low stock alerts shown
- [ ] Customer VIP status calculated
- [ ] Reports show correct data

### Error Handling
- [ ] Validation errors display inline
- [ ] 401 redirects to login
- [ ] 403 shows permission error
- [ ] 404 shows not found
- [ ] 409 shows duplicate error
- [ ] Network errors handled

### Multi-Tenancy
- [ ] Users only see their company's data
- [ ] Cross-company access blocked

### Role-Based UI
- [ ] Admin sees all features
- [ ] Supervisor sees management features
- [ ] Operator sees limited features
- [ ] Cashier sees minimal features

---

## 📖 Documentation Reading Order

**For Quick Start:**
1. `docs/FRONTEND_QUICK_START.md` (5 min)
2. Import Postman collection (5 min)
3. Test a few endpoints (10 min)
4. Read relevant sections of `FRONTEND_INTEGRATION_GUIDE.md`

**For Complete Understanding:**
1. `FRONTEND_INTEGRATION_GUIDE.md` (Main documentation)
2. `API_FIELD_NAMING_GUIDE.md` (Critical!)
3. `API_QUICK_REFERENCE.md` (Quick examples)
4. `BACKEND_SPECIFICATION.md` (Architecture)
5. `POSTMAN_TESTING_GUIDE.md` (Testing)

**For Specific Features:**
- Authentication: Section 2 of `FRONTEND_INTEGRATION_GUIDE.md`
- Products: Section 4.2 of `FRONTEND_INTEGRATION_GUIDE.md`
- Invoices: Section 4.5 of `FRONTEND_INTEGRATION_GUIDE.md`
- Reports: Section 4.8 of `FRONTEND_INTEGRATION_GUIDE.md`
- Stock: Section 4.7 of `FRONTEND_INTEGRATION_GUIDE.md`

---

## 🆘 Troubleshooting

### Common Issues & Solutions

| Issue | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Token missing/expired | Check Authorization header, refresh token |
| 404 Not Found | Wrong endpoint or ID | Verify URL and resource ID |
| 409 Duplicate Entry | Resource exists | Check barcode/email uniqueness |
| 422 Insufficient Stock | Not enough stock | Check product stock before invoice |
| 400 Validation Error | Wrong field names | Use snake_case, not camelCase |
| CORS Error | Origin not allowed | Backend has CORS enabled, check request |
| Rate Limit | Too many requests | Wait and retry, implement backoff |

### Getting Help

1. **Check Documentation First**
   - `FRONTEND_INTEGRATION_GUIDE.md` (comprehensive)
   - `API_QUICK_REFERENCE.md` (quick examples)
   - `API_FIELD_NAMING_GUIDE.md` (field names)

2. **Test with Postman**
   - Import collection
   - Test endpoint directly
   - Compare with your code

3. **Verify Field Names**
   - Always use `snake_case`
   - Check `API_FIELD_NAMING_GUIDE.md`

4. **Check Error Response**
   - Read `error.code`
   - Read `error.message`
   - Check `error.details`

5. **Review Business Rules**
   - Section 6 of `FRONTEND_INTEGRATION_GUIDE.md`
   - Multi-tenancy rules
   - Role permissions

---

## 📞 Support & Resources

### Documentation Files

**Essential:**
- `FRONTEND_INTEGRATION_GUIDE.md` - Main documentation
- `docs/FRONTEND_QUICK_START.md` - Quick start
- `API_FIELD_NAMING_GUIDE.md` - Field reference
- `API_QUICK_REFERENCE.md` - Endpoint examples

**Testing:**
- `docs/api/postman_collection_v2.json` - Postman collection
- `docs/api/postman_environment.json` - Environment vars
- `docs/api/swagger.yaml` - OpenAPI spec
- `docs/api/README.md` - Testing tools guide

**Reference:**
- `BACKEND_SPECIFICATION.md` - Technical architecture
- `DATABASE_AND_MODELS_SUMMARY.md` - Database schema
- `TESTING_GUIDE.md` - Testing strategies
- `USER_CREATION_GUIDE.md` - User management

### External Resources

- **Postman:** https://www.postman.com
- **Swagger Editor:** https://editor.swagger.io
- **JWT.io:** https://jwt.io (decode tokens)
- **JSON Formatter:** https://jsonformatter.org

---

## ✨ Summary

### What You Have

✅ **70+ API Endpoints** fully documented
✅ **10+ Data Models** with TypeScript interfaces
✅ **50+ Postman Requests** ready to use
✅ **200+ Pages** of documentation
✅ **Authentication System** with JWT
✅ **Multi-Tenancy** with data isolation
✅ **Role-Based Access** control
✅ **Stock Management** with automatic deduction
✅ **Business Reports** and analytics
✅ **Error Handling** with detailed codes
✅ **Rate Limiting** for security
✅ **Pagination** on all list endpoints
✅ **Search & Filtering** capabilities
✅ **Testing Tools** (Postman, Swagger)
✅ **Code Examples** in JavaScript/TypeScript

### Next Steps

1. ✅ **Import Postman Collection**
   - Test all endpoints
   - Understand request/response formats
   - Verify authentication flow

2. ✅ **Read Main Documentation**
   - `FRONTEND_INTEGRATION_GUIDE.md`
   - Focus on sections relevant to your feature
   - Review data models

3. ✅ **Setup API Client**
   - Configure base URL
   - Implement token management
   - Add error handling

4. ✅ **Implement Authentication**
   - Login/register forms
   - Token storage
   - Protected routes

5. ✅ **Build Features**
   - Products management
   - Customer management
   - Invoice creation
   - Reports/dashboard

6. ✅ **Test Thoroughly**
   - Unit tests
   - Integration tests
   - E2E tests
   - Multi-tenant scenarios

7. ✅ **Polish UI/UX**
   - Loading states
   - Error messages
   - Success feedback
   - Empty states

---

## 🎉 Ready to Build!

You have everything needed to build a complete frontend application:

📖 **Documentation:** Complete & detailed
🛠️ **Tools:** Postman collection ready
🔐 **Authentication:** JWT system documented
📊 **Data Models:** All structures defined
✅ **Examples:** Code samples provided
🧪 **Testing:** Full test suite available

**Start building with confidence! 🚀**

---

**Package Version:** 1.0.0
**Last Updated:** February 17, 2026
**Status:** ✅ Production Ready

**Questions?** Check `FRONTEND_INTEGRATION_GUIDE.md` first!
