# Multi-Tenant System Validation Tests

## Overview

This document provides step-by-step test scenarios to validate that the multi-tenant inventory management system properly isolates data between companies and enforces role-based access control.

**Test Environment:** Use Postman, Insomnia, or curl to execute these API calls.

---

## Test Scenario 1: Company Registration and Data Isolation

### Objective
Verify that two companies can be created independently and their data remains completely isolated.

### Step 1.1: Register Company A

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "admin@companya.com",
  "password": "SecurePass123!",
  "companyName": "Company A",
  "phone": "+1234567890"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "<user_id_a>",
      "name": "John Doe",
      "email": "admin@companya.com",
      "role": "admin",
      "emailVerified": false
    },
    "company": {
      "id": "<company_id_a>",
      "name": "Company A"
    },
    "token": "<token_a>",
    "refreshToken": "<refresh_token_a>"
  },
  "message": "Registration successful"
}
```

**✅ Save:** `token_a`, `company_id_a`, `user_id_a`

---

### Step 1.2: Register Company B

**Endpoint:** `POST /api/v1/auth/register`

**Request Body:**
```json
{
  "name": "Jane Smith",
  "email": "admin@companyb.com",
  "password": "SecurePass456!",
  "companyName": "Company B",
  "phone": "+0987654321"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "<user_id_b>",
      "name": "Jane Smith",
      "email": "admin@companyb.com",
      "role": "admin",
      "emailVerified": false
    },
    "company": {
      "id": "<company_id_b>",
      "name": "Company B"
    },
    "token": "<token_b>",
    "refreshToken": "<refresh_token_b>"
  },
  "message": "Registration successful"
}
```

**✅ Save:** `token_b`, `company_id_b`, `user_id_b`

---

### Step 1.3: Test Same Email in Different Companies

**Objective:** Verify that the same email can be used in different companies.

**Endpoint:** `POST /api/v1/users`
**Authorization:** `Bearer <token_a>`

**Request Body:**
```json
{
  "name": "Bob Wilson",
  "email": "bob@example.com",
  "password": "Password123!",
  "role": "cashier",
  "phone": "+1111111111"
}
```

**Expected Response:** ✅ User created successfully in Company A

---

**Endpoint:** `POST /api/v1/users`
**Authorization:** `Bearer <token_b>`

**Request Body:**
```json
{
  "name": "Bob Wilson Jr",
  "email": "bob@example.com",
  "password": "Password456!",
  "role": "supervisor",
  "phone": "+2222222222"
}
```

**Expected Response:** ✅ User created successfully in Company B

**✅ Validation:** Same email `bob@example.com` exists in both companies with different roles.

---

### Step 1.4: Test Duplicate Email in Same Company

**Objective:** Verify that duplicate emails are prevented within the same company.

**Endpoint:** `POST /api/v1/users`
**Authorization:** `Bearer <token_a>`

**Request Body:**
```json
{
  "name": "Bob Duplicate",
  "email": "bob@example.com",
  "password": "Password789!",
  "role": "operator"
}
```

**Expected Response:** ❌ Error
```json
{
  "success": false,
  "error": {
    "message": "Email already exists in your company"
  }
}
```

**✅ Validation:** Duplicate prevention works within the same company.

---

## Test Scenario 2: Product Data Isolation

### Step 2.1: Create Product in Company A

**Endpoint:** `POST /api/v1/products`
**Authorization:** `Bearer <token_a>`

**Request Body:**
```json
{
  "name": "Laptop Dell XPS 15",
  "barcode": "PROD-001",
  "description": "High-performance laptop",
  "purchase_price": 1000,
  "selling_price": 1500,
  "current_stock": 10,
  "min_stock_level": 5,
  "unit": "piece"
}
```

**Expected Response:** ✅ Product created
**✅ Save:** `product_id_a`

---

### Step 2.2: Create Product with Same Barcode in Company B

**Endpoint:** `POST /api/v1/products`
**Authorization:** `Bearer <token_b>`

**Request Body:**
```json
{
  "name": "Monitor Samsung 27-inch",
  "barcode": "PROD-001",
  "description": "4K monitor",
  "purchase_price": 300,
  "selling_price": 450,
  "current_stock": 20,
  "min_stock_level": 5,
  "unit": "piece"
}
```

**Expected Response:** ✅ Product created (same barcode allowed in different companies)
**✅ Save:** `product_id_b`

---

### Step 2.3: Test Cross-Company Product Access

**Objective:** Verify Company A cannot access Company B's products.

**Endpoint:** `GET /api/v1/products/<product_id_b>`
**Authorization:** `Bearer <token_a>` (Company A's token)

**Expected Response:** ❌ 404 Not Found
```json
{
  "success": false,
  "message": "Product not found"
}
```

**✅ Validation:** Company A cannot see Company B's product.

---

### Step 2.4: List Products Per Company

**Endpoint:** `GET /api/v1/products`
**Authorization:** `Bearer <token_a>`

**Expected Response:** ✅ Returns only Company A's products

---

**Endpoint:** `GET /api/v1/products`
**Authorization:** `Bearer <token_b>`

**Expected Response:** ✅ Returns only Company B's products

**✅ Validation:** Each company sees only its own products.

---

## Test Scenario 3: Invoice Data Isolation

### Step 3.1: Create Category in Company A

**Endpoint:** `POST /api/v1/categories`
**Authorization:** `Bearer <token_a>`

**Request Body:**
```json
{
  "name": "Electronics",
  "description": "Electronic devices and accessories"
}
```

**Expected Response:** ✅ Category created
**✅ Save:** `category_id_a`

---

### Step 3.2: Update Product with Category

**Endpoint:** `PUT /api/v1/products/<product_id_a>`
**Authorization:** `Bearer <token_a>`

**Request Body:**
```json
{
  "name": "Laptop Dell XPS 15",
  "barcode": "PROD-001",
  "category_id": "<category_id_a>",
  "purchase_price": 1000,
  "selling_price": 1500,
  "current_stock": 10,
  "min_stock_level": 5,
  "unit": "piece"
}
```

---

### Step 3.3: Create Customer in Company A

**Endpoint:** `POST /api/v1/customers`
**Authorization:** `Bearer <token_a>`

**Request Body:**
```json
{
  "name": "Customer Alpha",
  "email": "customer@alpha.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York"
}
```

**Expected Response:** ✅ Customer created
**✅ Save:** `customer_id_a`

---

### Step 3.4: Create Invoice in Company A

**Endpoint:** `POST /api/v1/invoices`
**Authorization:** `Bearer <token_a>`

**Request Body:**
```json
{
  "customer_id": "<customer_id_a>",
  "items": [
    {
      "product_id": "<product_id_a>",
      "quantity": 2,
      "unit_price": 1500,
      "discount": 0
    }
  ],
  "payment_method": "cash",
  "payment_status": "paid",
  "notes": "First sale"
}
```

**Expected Response:** ✅ Invoice created with invoice number `INV-001`
**✅ Save:** `invoice_id_a`

---

### Step 3.5: Create Invoice with Same Number in Company B

**First create a product and customer in Company B:**

**Create Customer:**
```
POST /api/v1/customers
Authorization: Bearer <token_b>

{
  "name": "Customer Beta",
  "email": "customer@beta.com",
  "phone": "+0987654321",
  "address": "456 Oak Ave",
  "city": "Los Angeles"
}
```
**✅ Save:** `customer_id_b`

---

**Create Invoice:**
```
POST /api/v1/invoices
Authorization: Bearer <token_b>

{
  "customer_id": "<customer_id_b>",
  "items": [
    {
      "product_id": "<product_id_b>",
      "quantity": 3,
      "unit_price": 450,
      "discount": 0
    }
  ],
  "payment_method": "card",
  "payment_status": "paid"
}
```

**Expected Response:** ✅ Invoice created with invoice number `INV-001` (same as Company A)

**✅ Validation:** Both companies can have the same invoice number.

---

### Step 3.6: Test Cross-Company Invoice Access

**Endpoint:** `GET /api/v1/invoices/<invoice_id_b>`
**Authorization:** `Bearer <token_a>` (Company A's token)

**Expected Response:** ❌ 404 Not Found

**✅ Validation:** Company A cannot access Company B's invoices.

---

## Test Scenario 4: Role-Based Access Control

### Step 4.1: Create Users with Different Roles in Company A

**Create Supervisor:**
```
POST /api/v1/users
Authorization: Bearer <token_a>

{
  "name": "Supervisor Alice",
  "email": "alice@companya.com",
  "password": "Password123!",
  "role": "supervisor"
}
```
**✅ Save:** `supervisor_token_a` (login with this user to get token)

---

**Create Operator:**
```
POST /api/v1/users
Authorization: Bearer <token_a>

{
  "name": "Operator Charlie",
  "email": "charlie@companya.com",
  "password": "Password123!",
  "role": "operator"
}
```
**✅ Save:** `operator_token_a`

---

**Create Cashier:**
```
POST /api/v1/users
Authorization: Bearer <token_a>

{
  "name": "Cashier David",
  "email": "david@companya.com",
  "password": "Password123!",
  "role": "cashier"
}
```
**✅ Save:** `cashier_token_a`

---

### Step 4.2: Test ADMIN Permissions

**Endpoint:** `POST /api/v1/users`
**Authorization:** `Bearer <token_a>` (ADMIN)

**Expected Result:** ✅ Can create users

---

**Endpoint:** `DELETE /api/v1/products/<product_id>`
**Authorization:** `Bearer <token_a>` (ADMIN)

**Expected Result:** ✅ Can delete products

---

### Step 4.3: Test SUPERVISOR Permissions

**Login as Supervisor:**
```
POST /api/v1/auth/login

{
  "email": "alice@companya.com",
  "password": "Password123!"
}
```
**✅ Save:** `supervisor_token_a`

---

**Endpoint:** `POST /api/v1/products`
**Authorization:** `Bearer <supervisor_token_a>`

**Expected Result:** ✅ Can create products

---

**Endpoint:** `POST /api/v1/users`
**Authorization:** `Bearer <supervisor_token_a>`

**Expected Result:** ❌ 403 Forbidden (Only admins can create users)

---

### Step 4.4: Test OPERATOR Permissions

**Login as Operator:**
```
POST /api/v1/auth/login

{
  "email": "charlie@companya.com",
  "password": "Password123!"
}
```
**✅ Save:** `operator_token_a`

---

**Endpoint:** `POST /api/v1/invoices`
**Authorization:** `Bearer <operator_token_a>`

**Expected Result:** ✅ Can create invoices

---

**Endpoint:** `POST /api/v1/products`
**Authorization:** `Bearer <operator_token_a>`

**Expected Result:** ❌ 403 Forbidden (Operators can only create invoices)

---

### Step 4.5: Test CASHIER Permissions

**Login as Cashier:**
```
POST /api/v1/auth/login

{
  "email": "david@companya.com",
  "password": "Password123!"
}
```
**✅ Save:** `cashier_token_a`

---

**Endpoint:** `POST /api/v1/customers`
**Authorization:** `Bearer <cashier_token_a>`

**Expected Result:** ✅ Can add customers

---

**Endpoint:** `DELETE /api/v1/customers/<customer_id>`
**Authorization:** `Bearer <cashier_token_a>`

**Expected Result:** ❌ 403 Forbidden (Cashiers cannot delete customers)

---

**Endpoint:** `POST /api/v1/invoices`
**Authorization:** `Bearer <cashier_token_a>`

**Expected Result:** ✅ Can create invoices

---

## Test Scenario 5: Authentication Token Validation

### Step 5.1: Get Current User Profile

**Endpoint:** `GET /api/v1/auth/me`
**Authorization:** `Bearer <token_a>`

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "<user_id_a>",
    "name": "John Doe",
    "email": "admin@companya.com",
    "role": "admin",
    "company_id": "<company_id_a>",
    "is_active": true
  }
}
```

**✅ Validation:** JWT properly contains userId, email, role, and companyId.

---

### Step 5.2: Refresh Token

**Endpoint:** `POST /api/v1/auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "<refresh_token_a>"
}
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "token": "<new_token_a>",
    "refreshToken": "<new_refresh_token_a>"
  }
}
```

**✅ Validation:** Token refresh works correctly.

---

### Step 5.3: Test Expired/Invalid Token

**Endpoint:** `GET /api/v1/products`
**Authorization:** `Bearer invalid_token_xyz`

**Expected Response:** ❌ 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "message": "Invalid token"
  }
}
```

---

### Step 5.4: Test Request Without Token

**Endpoint:** `GET /api/v1/products`
**No Authorization Header**

**Expected Response:** ❌ 401 Unauthorized
```json
{
  "success": false,
  "error": {
    "message": "Authentication required"
  }
}
```

---

## Test Scenario 6: Company Context Validation

### Step 6.1: Test Company Isolation Middleware

**Endpoint:** `GET /api/v1/products`
**Authorization:** `Bearer <token_a>`

**Expected Behavior:**
- Middleware extracts `companyId` from JWT
- Automatically filters products by `company_id = companyId`
- Returns only Company A's products

**✅ Validation:** No products from Company B are visible.

---

### Step 6.2: Test Manual Company ID Injection (Security Test)

**Objective:** Verify that users cannot manually inject another company's ID.

**Endpoint:** `GET /api/v1/products?company_id=<company_id_b>`
**Authorization:** `Bearer <token_a>`

**Expected Behavior:**
- Query parameter `company_id` should be IGNORED
- Middleware enforces `req.user.companyId` from JWT
- Returns only Company A's products

**✅ Validation:** Cannot bypass company isolation.

---

## Test Scenario 7: Stock Movements Isolation

### Step 7.1: Create Stock Movement in Company A

**Endpoint:** `POST /api/v1/stock/movements`
**Authorization:** `Bearer <token_a>`

**Request Body:**
```json
{
  "product_id": "<product_id_a>",
  "type": "in",
  "quantity": 50,
  "reference": "Purchase Order #001",
  "notes": "Restocking inventory"
}
```

**Expected Response:** ✅ Stock movement created

---

### Step 7.2: List Stock Movements

**Endpoint:** `GET /api/v1/stock/movements`
**Authorization:** `Bearer <token_a>`

**Expected Response:** ✅ Returns only Company A's stock movements

---

**Endpoint:** `GET /api/v1/stock/movements`
**Authorization:** `Bearer <token_b>`

**Expected Response:** ✅ Returns only Company B's stock movements

---

## Test Scenario 8: Expense Tracking Isolation

### Step 8.1: Create Expense in Company A

**Endpoint:** `POST /api/v1/expenses`
**Authorization:** `Bearer <token_a>`

**Request Body:**
```json
{
  "title": "Office Supplies",
  "description": "Pens, paper, folders",
  "amount": 150.50,
  "category": "Office",
  "date": "2026-02-14",
  "payment_method": "cash"
}
```

**Expected Response:** ✅ Expense created

---

### Step 8.2: List Expenses

**Endpoint:** `GET /api/v1/expenses`
**Authorization:** `Bearer <token_a>`

**Expected Response:** ✅ Returns only Company A's expenses

---

**Endpoint:** `GET /api/v1/expenses`
**Authorization:** `Bearer <token_b>`

**Expected Response:** ✅ Returns only Company B's expenses (should be empty)

---

## Test Scenario 9: Reports and Dashboard Isolation

### Step 9.1: Get Dashboard for Company A

**Endpoint:** `GET /api/v1/reports/dashboard`
**Authorization:** `Bearer <token_a>`

**Expected Response:**
- Shows Company A's statistics only
- Total products, invoices, customers from Company A
- No data from Company B

---

### Step 9.2: Get Sales Report

**Endpoint:** `GET /api/v1/reports/sales?startDate=2026-02-01&endDate=2026-02-28`
**Authorization:** `Bearer <token_a>`

**Expected Response:**
- Sales data for Company A only
- Invoice totals from Company A
- No data from Company B

---

## Test Scenario 10: Database Constraint Validation

### Step 10.1: Verify Unique Constraints in Database

**Direct SQL Query:**
```sql
-- Check products barcode constraint
SELECT
  COUNT(*) as count,
  barcode,
  company_id
FROM products
WHERE barcode IS NOT NULL
GROUP BY barcode, company_id
HAVING COUNT(*) > 1;
```

**Expected Result:** 0 rows (no duplicates within same company)

---

```sql
-- Check if same barcode exists in different companies
SELECT
  barcode,
  COUNT(DISTINCT company_id) as company_count
FROM products
WHERE barcode IS NOT NULL
GROUP BY barcode
HAVING COUNT(DISTINCT company_id) > 1;
```

**Expected Result:** Shows barcodes used by multiple companies (this is ALLOWED)

---

```sql
-- Check users email constraint
SELECT
  COUNT(*) as count,
  email,
  company_id
FROM users
GROUP BY email, company_id
HAVING COUNT(*) > 1;
```

**Expected Result:** 0 rows (no duplicates within same company)

---

```sql
-- Check if same email exists in different companies
SELECT
  email,
  COUNT(DISTINCT company_id) as company_count
FROM users
GROUP BY email
HAVING COUNT(DISTINCT company_id) > 1;
```

**Expected Result:** Shows emails used in multiple companies (this is ALLOWED)

---

## Summary Checklist

### ✅ Database Structure
- [ ] All tables use UUID primary keys
- [ ] All business tables have `company_id` column
- [ ] Foreign keys correctly defined
- [ ] `UNIQUE(email, company_id)` on users table
- [ ] `UNIQUE(barcode, company_id)` on products table
- [ ] `UNIQUE(invoice_number, company_id)` on invoices table

### ✅ Authentication Module
- [ ] `/auth/register` creates company, admin user, and trial subscription
- [ ] `/auth/login` validates credentials and returns tokens
- [ ] `/auth/me` returns current user information
- [ ] `/auth/refresh` generates new access token
- [ ] JWT contains: `userId`, `email`, `role`, `companyId`
- [ ] Access tokens valid for 7 days
- [ ] Refresh tokens valid for 30 days

### ✅ Middleware
- [ ] `authenticate` middleware extracts JWT
- [ ] `authenticate` injects `req.user` with `userId`, `role`, `companyId`
- [ ] `companyIsolationMiddleware` validates company context
- [ ] All business routes protected with both middlewares

### ✅ User Management
- [ ] Admin can create users in their company
- [ ] Admin cannot create users in another company
- [ ] Users list filtered by company_id
- [ ] Role management (admin, supervisor, operator, cashier)
- [ ] Deactivate/activate users
- [ ] Change password functionality

### ✅ Data Isolation
- [ ] Company A cannot see Company B's products
- [ ] Company A cannot see Company B's invoices
- [ ] Company A cannot see Company B's customers
- [ ] Company A cannot see Company B's expenses
- [ ] Company A cannot see Company B's stock movements
- [ ] Same barcode allowed in different companies
- [ ] Same invoice number allowed in different companies
- [ ] Same email allowed in different companies (different users)

### ✅ Role-Based Access Control
- [ ] ADMIN: Full access to company data
- [ ] SUPERVISOR: Product management + invoices + viewing
- [ ] OPERATOR: Invoice creation only
- [ ] CASHIER: Limited invoice/customer creation, no deletion

---

## Test Execution Report Template

```
Date: ______________
Tester: ______________

| Test Scenario | Status | Notes |
|--------------|--------|-------|
| 1. Company Registration | ⬜ Pass ⬜ Fail | |
| 2. Product Isolation | ⬜ Pass ⬜ Fail | |
| 3. Invoice Isolation | ⬜ Pass ⬜ Fail | |
| 4. Role-Based Access | ⬜ Pass ⬜ Fail | |
| 5. Token Validation | ⬜ Pass ⬜ Fail | |
| 6. Company Context | ⬜ Pass ⬜ Fail | |
| 7. Stock Movements | ⬜ Pass ⬜ Fail | |
| 8. Expense Tracking | ⬜ Pass ⬜ Fail | |
| 9. Reports Isolation | ⬜ Pass ⬜ Fail | |
| 10. Database Constraints | ⬜ Pass ⬜ Fail | |

Overall System Status: ⬜ Production Ready ⬜ Needs Fixes

Issues Found:
1. ___________________________
2. ___________________________
3. ___________________________
```

---

**Document Version:** 1.0
**Last Updated:** 2026-02-14
**Status:** Ready for Testing
