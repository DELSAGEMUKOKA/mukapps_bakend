# Frontend Quick Start Guide
## Inventory Management System API Integration

**For:** Frontend Developers
**Last Updated:** February 17, 2026

---

## 📋 What You Need

All the documentation and tools necessary for frontend integration are ready:

### 1. **Complete API Documentation**
📁 **File:** `FRONTEND_INTEGRATION_GUIDE.md` (in project root)

**Contains:**
- ✅ All API endpoints with examples
- ✅ Request/response formats
- ✅ Authentication flows
- ✅ Complete data models
- ✅ Business rules
- ✅ Error handling
- ✅ Best practices

### 2. **Postman Collection**
📁 **Files:**
- `docs/api/postman_collection_v2.json`
- `docs/api/postman_environment.json`

**How to use:**
1. Import collection into Postman
2. Import environment file
3. Run requests sequentially
4. Tokens saved automatically

### 3. **Field Naming Reference**
📁 **File:** `API_FIELD_NAMING_GUIDE.md` (in project root)

**⚠️ CRITICAL:** All API fields use `snake_case`, not `camelCase`

```javascript
// ✅ CORRECT
{ "product_id": "uuid", "purchase_price": 100 }

// ❌ WRONG
{ "productId": "uuid", "purchasePrice": 100 }
```

### 4. **Quick Reference Card**
📁 **File:** `API_QUICK_REFERENCE.md` (in project root)

Quick copy-paste examples for all endpoints.

---

## 🚀 Getting Started (5 Minutes)

### Step 1: Configure Base URL

```javascript
// Development
const API_BASE_URL = 'http://localhost:5000/api/v1';

// Production
const API_BASE_URL = 'https://your-domain.com/api/v1';
```

### Step 2: Test Health Check

```bash
curl http://localhost:5000/health
```

**Expected:**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2026-02-17T10:30:00Z"
}
```

### Step 3: Register a Test Company

```javascript
POST /api/v1/auth/register

{
  "name": "Test User",
  "email": "test@company.com",
  "password": "SecurePass123!",
  "companyName": "Test Company",
  "phone": "+1234567890"
}
```

**You'll receive:**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "...",
    "user": { ... },
    "company": { ... }
  }
}
```

**Save the token!** You'll need it for all subsequent requests.

### Step 4: Test Authenticated Request

```javascript
GET /api/v1/products
Headers: {
  "Authorization": "Bearer YOUR_TOKEN_HERE",
  "Content-Type": "application/json"
}
```

---

## 📊 API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful",
  "data": { ... }
}
```

### Error Response
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

### Paginated Response
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

---

## 🔐 Authentication Flow

### Registration
```
POST /auth/register
→ Receives token + user + company
→ Store token
→ User is automatically admin
```

### Login
```
POST /auth/login
→ Receives token + user
→ Store token
```

### Using Token
```javascript
headers: {
  "Authorization": `Bearer ${token}`,
  "Content-Type": "application/json"
}
```

### Token Refresh
```
POST /auth/refresh
Body: { "refreshToken": "..." }
→ Receives new tokens
```

**Token Validity:**
- Access Token: 7 days
- Refresh Token: 30 days

---

## 🛠️ Setting Up API Client (React Example)

```javascript
// api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Add token to all requests
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors
apiClient.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // Token expired - redirect to login
      localStorage.removeItem('access_token');
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data);
  }
);

export default apiClient;
```

### Usage

```javascript
// services/products.js
import apiClient from './api';

export const getProducts = (params) =>
  apiClient.get('/products', { params });

export const createProduct = (data) =>
  apiClient.post('/products', data);

export const updateProduct = (id, data) =>
  apiClient.put(`/products/${id}`, data);

export const deleteProduct = (id) =>
  apiClient.delete(`/products/${id}`);
```

---

## 📦 Key Endpoints

### Authentication
```
POST   /auth/register       - Register company + admin
POST   /auth/login          - Login
GET    /auth/me             - Get current user
POST   /auth/refresh        - Refresh token
POST   /auth/logout         - Logout
```

### Products
```
GET    /products            - List products (paginated)
POST   /products            - Create product
GET    /products/:id        - Get product
GET    /products/barcode/:barcode - Find by barcode
PUT    /products/:id        - Update product
DELETE /products/:id        - Delete product
```

### Customers
```
GET    /customers           - List customers
POST   /customers           - Create customer
GET    /customers/:id       - Get customer
GET    /customers/:id/stats - Customer statistics
PUT    /customers/:id       - Update customer
DELETE /customers/:id       - Delete customer
```

### Invoices
```
GET    /invoices            - List invoices
POST   /invoices            - Create invoice
GET    /invoices/:id        - Get invoice
GET    /invoices/:id/pdf    - Download PDF
POST   /invoices/:id/cancel - Cancel invoice
```

### Categories
```
GET    /categories          - List all categories
POST   /categories          - Create category
PUT    /categories/:id      - Update category
DELETE /categories/:id      - Delete category
```

### Stock
```
POST   /stock/in            - Add stock
POST   /stock/out           - Remove stock
POST   /stock/adjust        - Adjust stock
GET    /stock/movements     - Stock history
GET    /stock/low-stock     - Low stock alerts
GET    /stock/valuation     - Total stock value
```

### Reports
```
GET    /reports/dashboard   - Dashboard summary
GET    /reports/sales       - Sales report
GET    /reports/inventory   - Inventory report
GET    /reports/profit      - Profit/loss report
GET    /reports/expenses    - Expense report
```

### Users
```
GET    /users               - List users
POST   /users               - Create user
GET    /users/:id           - Get user
PUT    /users/:id           - Update user
POST   /users/:id/activate  - Activate user
POST   /users/:id/deactivate - Deactivate user
DELETE /users/:id           - Delete user
```

### Company
```
GET    /companies/me        - Get company profile
PUT    /companies/me        - Update company
GET    /companies/me/stats  - Company statistics
```

---

## 👥 User Roles

| Role | Description | Key Permissions |
|------|-------------|----------------|
| **admin** | Full system access | Everything |
| **supervisor** | Manager level | Products, invoices, expenses, reports |
| **operator** | Staff level | Products, customers, invoices, stock |
| **cashier** | Point-of-sale | Create invoices, view products |

**Implement role-based UI:**
```javascript
const canCreateUser = user.role === 'admin';
const canApproveExpense = ['admin', 'supervisor'].includes(user.role);
const canDeleteProduct = ['admin', 'supervisor'].includes(user.role);
```

---

## 🔄 Common Workflows

### 1. Create Invoice Workflow
```
1. GET /products         → Display product list
2. GET /customers        → Display customer list
3. User selects products + customer
4. POST /invoices        → Create invoice
   - Stock automatically deducted
   - Invoice number auto-generated
5. GET /invoices/:id/pdf → Download receipt
```

### 2. Product Management Workflow
```
1. GET /categories       → Load categories for dropdown
2. POST /products        → Create product
3. GET /products         → List products
4. PUT /products/:id     → Update product
5. DELETE /products/:id  → Delete product
```

### 3. Stock Management Workflow
```
1. POST /stock/in        → Receive new stock
2. GET /stock/low-stock  → Check low stock alerts
3. POST /stock/adjust    → Physical count adjustment
4. GET /stock/movements  → View history
```

---

## ⚠️ Critical Rules

### 1. Field Naming (MUST FOLLOW)
```javascript
// ✅ API expects snake_case
{
  "product_id": "uuid",
  "purchase_price": 100,
  "selling_price": 150,
  "current_stock": 50,
  "min_stock_level": 10
}

// ❌ camelCase will fail
{
  "productId": "uuid",
  "purchasePrice": 100
}
```

### 2. Multi-Tenancy
- All data automatically filtered by company
- Users can ONLY see their company's data
- Same email can exist in different companies
- Same barcode can exist in different companies

### 3. Stock Management
- Creating invoice automatically deducts stock
- Cancelling invoice restores stock
- Must check stock availability before invoice

### 4. Pagination
- Default limit: 20
- Maximum limit: 100
- Always includes pagination metadata

### 5. Date Format
- Send: ISO 8601 (`2026-02-17T10:30:00Z`)
- Receive: ISO 8601
- Use JavaScript `toISOString()`

---

## 🎯 Testing Checklist

- [ ] Health check works
- [ ] Register new company works
- [ ] Login works and returns token
- [ ] Token stored in localStorage/state
- [ ] Authenticated requests work
- [ ] Token refresh works
- [ ] Logout clears token
- [ ] Create product works
- [ ] List products with pagination works
- [ ] Create customer works
- [ ] Create invoice works and deducts stock
- [ ] Error handling displays user-friendly messages
- [ ] Role-based UI elements show/hide correctly
- [ ] Search and filters work
- [ ] Reports display data correctly

---

## 📚 Documentation Files

**In project root:**
- `FRONTEND_INTEGRATION_GUIDE.md` - **MAIN DOCUMENTATION (200+ pages)**
- `API_QUICK_REFERENCE.md` - Quick copy-paste examples
- `API_FIELD_NAMING_GUIDE.md` - Complete field reference
- `BACKEND_SPECIFICATION.md` - Technical architecture

**In docs/api folder:**
- `postman_collection_v2.json` - Postman collection
- `postman_environment.json` - Environment variables
- `swagger.yaml` - OpenAPI specification

---

## 🆘 Common Issues

### Issue: 401 Unauthorized
**Solution:** Check token is valid and included in Authorization header

### Issue: 404 Not Found
**Solution:** Verify endpoint URL and resource ID

### Issue: 409 Duplicate Entry
**Solution:** Resource already exists (barcode, email, etc.)

### Issue: 422 Insufficient Stock
**Solution:** Not enough stock to create invoice

### Issue: Validation Error
**Solution:** Check field names (snake_case) and required fields

### Issue: CORS Error
**Solution:** Backend has CORS enabled, check request format

---

## 🎨 UI/UX Recommendations

### Forms
- Show validation errors inline
- Use loading states during API calls
- Show success messages after operations
- Disable submit buttons during submission

### Lists
- Implement pagination controls
- Add search/filter functionality
- Show loading skeleton during fetch
- Display empty state when no data

### Error Handling
- Show user-friendly error messages
- Log technical errors to console
- Provide retry options
- Handle network errors gracefully

### Data Display
- Format currency: $1,234.56
- Format dates: Feb 17, 2026
- Format phone: +1 (234) 567-890
- Show status badges (paid, pending, etc.)

---

## 🚦 Next Steps

1. ✅ **Import Postman Collection**
   - Test all endpoints
   - Understand request/response formats

2. ✅ **Setup API Client**
   - Configure axios/fetch
   - Add token interceptor
   - Handle errors globally

3. ✅ **Implement Authentication**
   - Login/register forms
   - Token storage
   - Protected routes

4. ✅ **Build Core Features**
   - Product management
   - Customer management
   - Invoice creation
   - Dashboard/reports

5. ✅ **Implement Role-Based UI**
   - Show/hide based on user.role
   - Disable actions user can't perform

6. ✅ **Add Search & Filters**
   - Product search
   - Date range filters
   - Status filters

7. ✅ **Polish UI/UX**
   - Loading states
   - Error messages
   - Success feedback
   - Empty states

---

## 📞 Support

**Need Help?**
1. Check `FRONTEND_INTEGRATION_GUIDE.md` (main documentation)
2. Review Postman collection examples
3. Verify field naming in `API_FIELD_NAMING_GUIDE.md`
4. Test with Postman first before implementing in code

---

## ✨ Summary

**You have everything you need:**

✅ Complete API documentation
✅ Postman collection for testing
✅ Field naming reference
✅ Request/response examples
✅ Authentication guide
✅ Error handling patterns
✅ Business rules explained
✅ All data models documented

**Start with:**
1. Import Postman collection → Test endpoints
2. Read `FRONTEND_INTEGRATION_GUIDE.md` → Understand API
3. Setup API client → Implement authentication
4. Build features → Follow examples

**Remember:**
- Use `snake_case` for API fields
- Include Authorization header
- Handle errors gracefully
- Test with Postman first

---

**Happy Coding! 🚀**

For detailed information, see: `FRONTEND_INTEGRATION_GUIDE.md`
