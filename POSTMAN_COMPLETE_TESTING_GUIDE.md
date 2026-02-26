# Complete Postman Testing Guide - Inventory Management System

**Version:** 1.0
**Date:** 2026-02-14
**Purpose:** Comprehensive end-to-end testing guide for multi-tenant SaaS backend

---

##

 Table of Contents

1. [Environment Preparation](#1-environment-preparation)
2. [Complete Test Scenario - Logical Order](#2-complete-test-scenario---logical-order)
3. [Authentication Routes](#3-authentication-routes)
4. [User Management Routes](#4-user-management-routes)
5. [Category Routes](#5-category-routes)
6. [Product Routes](#6-product-routes)
7. [Customer Routes](#7-customer-routes)
8. [Invoice Routes](#8-invoice-routes)
9. [Stock Routes](#9-stock-routes)
10. [Expense Routes](#10-expense-routes)
11. [Report Routes](#11-report-routes)
12. [Multi-Tenant Isolation Tests](#12-multi-tenant-isolation-tests)
13. [Security Tests](#13-security-tests)
14. [Using Postman Collection](#14-using-postman-collection)

---

## 1. Environment Preparation

### 1.1 Base URL Configuration

**Development:** `http://localhost:5000/api/v1`
**Production:** `https://your-domain.com/api/v1`

### 1.2 Postman Environment Variables

Create a new environment called **"Inventory API - Testing"** with these variables:

| Variable | Initial Value | Description |
|----------|--------------|-------------|
| `base_url` | `http://localhost:5000/api/v1` | API base URL |
| `access_token_a` | ` ` | Company A admin token |
| `refresh_token_a` | `` | Company A refresh token |
| `company_id_a` | `` | Company A UUID |
| `user_id_a` | `` | Company A admin user UUID |
| `access_token_b` | `` | Company B admin token |
| `company_id_b` | `` | Company B UUID |
| `supervisor_token` | `` | Supervisor role token |
| `operator_token` | `` | Operator role token |
| `cashier_token` | `` | Cashier role token |
| `category_id` | `` | Test category UUID |
| `product_id` | `` | Test product UUID |
| `customer_id` | `` | Test customer UUID |
| `invoice_id` | `` | Test invoice UUID |
| `expense_id` | `` | Test expense UUID |

### 1.3 Automatic Token Management

Add this script to your **Login** request's **Tests** tab:

```javascript
// Save Company A tokens
if (pm.response.code === 200) {
    const response = pm.response.json();

    if (response.success && response.data.token) {
        pm.environment.set("access_token_a", response.data.token);
        pm.environment.set("refresh_token_a", response.data.refreshToken);
        pm.environment.set("user_id_a", response.data.user.id);

        if (response.data.user.companyId) {
            pm.environment.set("company_id_a", response.data.user.companyId);
        } else if (response.data.company) {
            pm.environment.set("company_id_a", response.data.company.id);
        }

        console.log("✅ Company A tokens saved successfully");
        console.log("Access Token:", response.data.token.substring(0, 20) + "...");
    }
}
```

### 1.4 Standard Headers Configuration

**For all authenticated requests:**

```
Content-Type: application/json
Authorization: Bearer {{access_token_a}}
```

**For registration/login (no auth):**

```
Content-Type: application/json
```

---

## 2. Complete Test Scenario - Logical Order

### Test Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│  PHASE 1: COMPANY A SETUP                           │
├─────────────────────────────────────────────────────┤
│  1. Register Company A                              │
│  2. Login Company A Admin                           │
│  3. Get Profile (Verify JWT)                        │
│  4. Create Supervisor User                          │
│  5. Create Operator User                            │
│  6. Create Cashier User                             │
│  7. List All Users                                  │
└─────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────┐
│  PHASE 2: BUSINESS DATA CREATION                    │
├─────────────────────────────────────────────────────┤
│  8. Create Category (Electronics)                   │
│  9. Create Product (Laptop)                         │
│ 10. Create Customer (Alpha Corp)                    │
│ 11. Create Invoice (2 laptops sold)                 │
│ 12. Verify Stock Deduction                          │
│ 13. Create Expense (Office Rent)                    │
└─────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────┐
│  PHASE 3: COMPANY B SETUP & ISOLATION               │
├─────────────────────────────────────────────────────┤
│ 14. Register Company B                              │
│ 15. Login Company B Admin                           │
│ 16. Create Product with Same Barcode                │
│ 17. Test: Access Company A Product (Should Fail)    │
│ 18. Test: List Products (Should See Only B's)       │
└─────────────────────────────────────────────────────┘
           ↓
┌─────────────────────────────────────────────────────┐
│  PHASE 4: SECURITY & PERMISSION TESTS               │
├─────────────────────────────────────────────────────┤
│ 19. Test: No Token → 401                            │
│ 20. Test: Invalid Token → 401                       │
│ 21. Test: Supervisor Create User → 403              │
│ 22. Test: Operator Create Product → 403             │
│ 23. Test: Cashier Delete Customer → 403             │
└─────────────────────────────────────────────────────┘
```

### Estimated Testing Time

- **Quick validation:** 15 minutes (skip some steps)
- **Complete testing:** 30-40 minutes
- **With security tests:** 45-60 minutes

---

## 3. Authentication Routes

### 3.1 Register Company A

**Purpose:** Create first company with admin user and trial subscription

**Request:**
```http
POST {{base_url}}/auth/register
Content-Type: application/json
```

**Body:**
```json
{
  "name": "John Doe",
  "email": "admin@companya.com",
  "password": "SecurePass123!",
  "companyName": "Company A - Electronics Store",
  "phone": "+1234567890"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "admin@companya.com",
      "role": "admin",
      "emailVerified": false
    },
    "company": {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "Company A - Electronics Store"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  },
  "message": "Registration successful"
}
```

**What Happens:**
- ✅ Creates `companies` record
- ✅ Creates `users` record with role='admin'
- ✅ Creates `subscriptions` record (14-day trial)
- ✅ Password hashed with bcrypt
- ✅ Returns JWT with 7-day expiration

**Tests Tab Script:**
```javascript
pm.test("Status is 201", () => pm.response.to.have.status(201));
pm.test("Has token", () => pm.expect(pm.response.json().data.token).to.exist);

// Save tokens
const res = pm.response.json();
if (res.success) {
    pm.environment.set("access_token_a", res.data.token);
    pm.environment.set("refresh_token_a", res.data.refreshToken);
    pm.environment.set("user_id_a", res.data.user.id);
    pm.environment.set("company_id_a", res.data.company.id);
}
```

---

### 3.2 Login Company A Admin

**Request:**
```http
POST {{base_url}}/auth/login
Content-Type: application/json
```

**Body:**
```json
{
  "email": "admin@companya.com",
  "password": "SecurePass123!"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "John Doe",
      "email": "admin@companya.com",
      "role": "admin",
      "companyId": "550e8400-e29b-41d4-a716-446655440001",
      "emailVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Security Features:**
- Account locking after 5 failed attempts (15 min lockout)
- Checks `is_active` status
- Updates `last_login` timestamp
- Resets `failed_login_attempts` on success

**Error Scenarios:**

**Wrong Password (401):**
```json
{
  "success": false,
  "error": {
    "message": "Invalid email or password"
  }
}
```

**Account Locked (401):**
```json
{
  "success": false,
  "error": {
    "message": "Account locked due to too many failed attempts. Try again in 15 minutes"
  }
}
```

---

### 3.3 Get Current User Profile

**Request:**
```http
GET {{base_url}}/auth/me
Authorization: Bearer {{access_token_a}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "name": "John Doe",
    "email": "admin@companya.com",
    "role": "admin",
    "company_id": "550e8400-e29b-41d4-a716-446655440001",
    "phone": "+1234567890",
    "is_active": true,
    "email_verified": false,
    "last_login": "2026-02-14T10:30:00.000Z",
    "created_at": "2026-02-14T09:00:00.000Z"
  }
}
```

**Tests:**
```javascript
pm.test("User has companyId", () => {
    const user = pm.response.json().data;
    pm.expect(user.company_id).to.exist;
});
```

---

### 3.4 Refresh Access Token

**Request:**
```http
POST {{base_url}}/auth/refresh
Content-Type: application/json
```

**Body:**
```json
{
  "refreshToken": "{{refresh_token_a}}"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "new-access-token",
    "refreshToken": "new-refresh-token"
  }
}
```

---

## 4. User Management Routes

### 4.1 Create Supervisor User

**Request:**
```http
POST {{base_url}}/users
Authorization: Bearer {{access_token_a}}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Alice Supervisor",
  "email": "alice@companya.com",
  "password": "SupervisorPass123!",
  "role": "supervisor",
  "phone": "+1234567891"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid-here",
    "name": "Alice Supervisor",
    "email": "alice@companya.com",
    "role": "supervisor",
    "company_id": "550e8400-e29b-41d4-a716-446655440001",
    "is_active": true,
    "created_at": "2026-02-14T10:00:00.000Z"
  },
  "message": "User created successfully"
}
```

**Key Points:**
- ✅ `company_id` automatically inherited from admin's JWT
- ✅ Email unique within company (not global)
- ✅ Password hashed automatically

**Tests:**
```javascript
pm.test("User has correct company_id", () => {
    const user = pm.response.json().data;
    const companyId = pm.environment.get("company_id_a");
    pm.expect(user.company_id).to.eql(companyId);
});
```

---

### 4.2 Create Operator User

**Body:**
```json
{
  "name": "Charlie Operator",
  "email": "charlie@companya.com",
  "password": "OperatorPass123!",
  "role": "operator"
}
```

---

### 4.3 Create Cashier User

**Body:**
```json
{
  "name": "David Cashier",
  "email": "david@companya.com",
  "password": "CashierPass123!",
  "role": "cashier"
}
```

---

### 4.4 List All Users

**Request:**
```http
GET {{base_url}}/users?page=1&limit=20
Authorization: Bearer {{access_token_a}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-1",
      "name": "John Doe",
      "email": "admin@companya.com",
      "role": "admin",
      "is_active": true,
      "last_login": "2026-02-14T10:30:00.000Z"
    },
    {
      "id": "uuid-2",
      "name": "Alice Supervisor",
      "email": "alice@companya.com",
      "role": "supervisor",
      "is_active": true
    }
  ],
  "pagination": {
    "total": 4,
    "page": 1,
    "limit": 20
  }
}
```

**Data Isolation Verified:**
- ✅ Returns ONLY users from Company A
- ✅ Filtered by `company_id = req.user.companyId`

---

### 4.5 Update User Role (Admin Only)

**Request:**
```http
PUT {{base_url}}/users/{{user_id}}/role
Authorization: Bearer {{access_token_a}}
Content-Type: application/json
```

**Body:**
```json
{
  "role": "supervisor"
}
```

**Permission:** Admin only

---

### 4.6 Deactivate User (Admin Only)

**Request:**
```http
POST {{base_url}}/users/{{user_id}}/deactivate
Authorization: Bearer {{access_token_a}}
```

---

### 4.7 Delete User (Admin Only)

**Request:**
```http
DELETE {{base_url}}/users/{{user_id}}
Authorization: Bearer {{access_token_a}}
```

**Protection:**
- ❌ Cannot delete own account
- ❌ Cannot delete users from other companies

---

## 5. Category Routes

### 5.1 Create Category

**Request:**
```http
POST {{base_url}}/categories
Authorization: Bearer {{access_token_a}}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "icon": "📱"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "category-uuid",
    "name": "Electronics",
    "description": "Electronic devices and accessories",
    "icon": "📱",
    "company_id": "company-uuid",
    "created_at": "2026-02-14T10:00:00.000Z"
  },
  "message": "Category created successfully"
}
```

**Tests:**
```javascript
const res = pm.response.json();
if (res.success) {
    pm.environment.set("category_id", res.data.id);
}
```

---

### 5.2 List Categories

**Request:**
```http
GET {{base_url}}/categories
Authorization: Bearer {{access_token_a}}
```

---

### 5.3 Delete Category (Admin Only)

**Request:**
```http
DELETE {{base_url}}/categories/{{category_id}}
Authorization: Bearer {{access_token_a}}
```

---

## 6. Product Routes

### 6.1 Create Product

**Request:**
```http
POST {{base_url}}/products
Authorization: Bearer {{access_token_a}}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Laptop Dell XPS 15",
  "barcode": "PROD-001",
  "category_id": "{{category_id}}",
  "description": "High-performance laptop with Intel i7 processor",
  "purchase_price": 1000.00,
  "selling_price": 1500.00,
  "current_stock": 10,
  "min_stock_level": 5,
  "unit": "piece",
  "sku": "LAPTOP-XPS-15",
  "location": "Warehouse A - Shelf 3"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "product-uuid",
    "name": "Laptop Dell XPS 15",
    "barcode": "PROD-001",
    "category_id": "category-uuid",
    "purchase_price": 1000.00,
    "selling_price": 1500.00,
    "current_stock": 10,
    "min_stock_level": 5,
    "company_id": "company-uuid",
    "created_at": "2026-02-14T10:00:00.000Z"
  },
  "message": "Product created successfully"
}
```

**Constraints:**
- ✅ Barcode unique within company (not global)
- ✅ SKU unique within company (optional)

**Tests:**
```javascript
const res = pm.response.json();
if (res.success) {
    pm.environment.set("product_id", res.data.id);
}
```

---

### 6.2 List Products

**Request:**
```http
GET {{base_url}}/products?page=1&limit=20&search=laptop
Authorization: Bearer {{access_token_a}}
```

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search in name/barcode
- `category_id` - Filter by category
- `minPrice` - Minimum price
- `maxPrice` - Maximum price

---

### 6.3 Get Product by Barcode

**Request:**
```http
GET {{base_url}}/products/barcode/PROD-001
Authorization: Bearer {{access_token_a}}
```

**Use Case:** Point-of-sale barcode scanning

---

### 6.4 Get Low Stock Products

**Request:**
```http
GET {{base_url}}/products/low-stock
Authorization: Bearer {{access_token_a}}
```

**Returns:** Products where `current_stock <= min_stock_level`

---

### 6.5 Update Product (Admin/Supervisor)

**Request:**
```http
PUT {{base_url}}/products/{{product_id}}
Authorization: Bearer {{access_token_a}}
Content-Type: application/json
```

**Body:**
```json
{
  "selling_price": 1600.00,
  "description": "Updated description"
}
```

---

### 6.6 Delete Product (Admin Only)

**Request:**
```http
DELETE {{base_url}}/products/{{product_id}}
Authorization: Bearer {{access_token_a}}
```

---

## 7. Customer Routes

### 7.1 Create Customer

**Request:**
```http
POST {{base_url}}/customers
Authorization: Bearer {{access_token_a}}
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Customer Alpha Corp",
  "email": "contact@alphacorp.com",
  "phone": "+1234567890",
  "address": "123 Business Street",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "zip_code": "10001",
  "tax_id": "12-3456789"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "customer-uuid",
    "name": "Customer Alpha Corp",
    "email": "contact@alphacorp.com",
    "phone": "+1234567890",
    "company_id": "company-uuid",
    "created_at": "2026-02-14T10:00:00.000Z"
  },
  "message": "Customer created successfully"
}
```

**Tests:**
```javascript
const res = pm.response.json();
if (res.success) {
    pm.environment.set("customer_id", res.data.id);
}
```

---

### 7.2 List Customers

**Request:**
```http
GET {{base_url}}/customers?page=1&limit=20&search=alpha
Authorization: Bearer {{access_token_a}}
```

---

### 7.3 Get Customer Statistics

**Request:**
```http
GET {{base_url}}/customers/{{customer_id}}/stats
Authorization: Bearer {{access_token_a}}
```

**Returns:**
- Total invoices
- Total amount spent
- Average order value
- Last purchase date

---

### 7.4 Delete Customer (Admin/Supervisor Only)

**Request:**
```http
DELETE {{base_url}}/customers/{{customer_id}}
Authorization: Bearer {{access_token_a}}
```

**Permission:** Admin, Supervisor (Cashier cannot delete)

---

## 8. Invoice Routes

### 8.1 Create Invoice

**Request:**
```http
POST {{base_url}}/invoices
Authorization: Bearer {{access_token_a}}
Content-Type: application/json
```

**Body:**
```json
{
  "customer_id": "{{customer_id}}",
  "items": [
    {
      "product_id": "{{product_id}}",
      "quantity": 2,
      "unit_price": 1500.00,
      "discount": 50.00,
      "tax": 0
    }
  ],
  "payment_method": "cash",
  "payment_status": "paid",
  "notes": "First sale - thank you!",
  "discount": 0,
  "tax": 0
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "invoice-uuid",
    "invoice_number": "INV-001",
    "customer_id": "customer-uuid",
    "subtotal": 3000.00,
    "discount": 100.00,
    "tax": 0,
    "total": 2900.00,
    "payment_method": "cash",
    "payment_status": "paid",
    "company_id": "company-uuid",
    "items": [
      {
        "product_id": "product-uuid",
        "product_name": "Laptop Dell XPS 15",
        "quantity": 2,
        "unit_price": 1500.00,
        "discount": 50.00,
        "total": 2900.00
      }
    ],
    "created_at": "2026-02-14T10:00:00.000Z"
  },
  "message": "Invoice created successfully"
}
```

**What Happens Automatically:**
1. ✅ Generates unique invoice number (INV-001, INV-002, etc.)
2. ✅ Calculates subtotal, discount, tax, and total
3. ✅ Creates `invoice_items` records
4. ✅ **Deducts stock from products** (10 → 8 laptops)
5. ✅ Creates `stock_movements` records (type: 'out')
6. ✅ All operations in a database transaction

**Tests:**
```javascript
pm.test("Invoice number generated", () => {
    const invoice = pm.response.json().data;
    pm.expect(invoice.invoice_number).to.match(/^INV-\d+$/);
});

const res = pm.response.json();
if (res.success) {
    pm.environment.set("invoice_id", res.data.id);
}
```

---

### 8.2 Verify Stock Deduction

**Request:**
```http
GET {{base_url}}/products/{{product_id}}
Authorization: Bearer {{access_token_a}}
```

**Expected:** `current_stock` should be 8 (was 10, sold 2)

**Tests:**
```javascript
pm.test("Stock deducted correctly", () => {
    const product = pm.response.json().data;
    pm.expect(product.current_stock).to.eql(8);
});
```

---

### 8.3 List Invoices

**Request:**
```http
GET {{base_url}}/invoices?page=1&limit=20
Authorization: Bearer {{access_token_a}}
```

**Query Parameters:**
- `customer_id` - Filter by customer
- `payment_status` - Filter by status (paid, pending, etc.)
- `startDate` - Date range start
- `endDate` - Date range end

---

### 8.4 Get Invoice Statistics

**Request:**
```http
GET {{base_url}}/invoices/stats?startDate=2026-02-01&endDate=2026-02-28
Authorization: Bearer {{access_token_a}}
```

**Returns:**
- Total invoices
- Total sales
- Paid amount
- Pending amount
- Payment method breakdown

---

### 8.5 Delete Invoice (Admin Only)

**Request:**
```http
DELETE {{base_url}}/invoices/{{invoice_id}}
Authorization: Bearer {{access_token_a}}
```

**What Happens:**
1. ✅ Deletes invoice and invoice_items
2. ✅ **Restores product stock** (8 → 10 laptops)
3. ✅ Creates stock_movement records (type: 'in')
4. ✅ All operations in a transaction

---

## 9. Stock Routes

### 9.1 Create Stock Movement

**Request:**
```http
POST {{base_url}}/stock/movements
Authorization: Bearer {{access_token_a}}
Content-Type: application/json
```

**Body:**
```json
{
  "product_id": "{{product_id}}",
  "type": "in",
  "quantity": 50,
  "reference": "Purchase Order #PO-001",
  "notes": "Restocking inventory from supplier"
}
```

**Movement Types:**
- `in` - Stock incoming (purchase, return)
- `out` - Stock outgoing (sale, damage)

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "movement-uuid",
    "product_id": "product-uuid",
    "type": "in",
    "quantity": 50,
    "reference": "Purchase Order #PO-001",
    "previous_stock": 8,
    "new_stock": 58,
    "user_id": "user-uuid",
    "company_id": "company-uuid",
    "created_at": "2026-02-14T10:00:00.000Z"
  },
  "message": "Stock movement created successfully"
}
```

---

### 9.2 List Stock Movements

**Request:**
```http
GET {{base_url}}/stock/movements?product_id={{product_id}}
Authorization: Bearer {{access_token_a}}
```

---

### 9.3 Get Stock Valuation

**Request:**
```http
GET {{base_url}}/stock/valuation
Authorization: Bearer {{access_token_a}}
```

**Returns:**
- Total products count
- Total units in stock
- Purchase value (cost)
- Selling value (potential revenue)
- Potential profit

---

## 10. Expense Routes

### 10.1 Create Expense

**Request:**
```http
POST {{base_url}}/expenses
Authorization: Bearer {{access_token_a}}
Content-Type: application/json
```

**Body:**
```json
{
  "title": "Office Rent - February 2026",
  "description": "Monthly office space rental",
  "amount": 2500.00,
  "category": "Rent",
  "date": "2026-02-01",
  "payment_method": "transfer",
  "reference": "RENT-FEB-2026",
  "notes": "Paid to landlord via bank transfer"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "expense-uuid",
    "title": "Office Rent - February 2026",
    "amount": 2500.00,
    "category": "Rent",
    "date": "2026-02-01",
    "status": "pending",
    "company_id": "company-uuid",
    "created_at": "2026-02-14T10:00:00.000Z"
  },
  "message": "Expense created successfully"
}
```

**Tests:**
```javascript
const res = pm.response.json();
if (res.success) {
    pm.environment.set("expense_id", res.data.id);
}
```

---

### 10.2 List Expenses

**Request:**
```http
GET {{base_url}}/expenses?category=Rent&status=approved
Authorization: Bearer {{access_token_a}}
```

---

### 10.3 Approve Expense (Admin/Supervisor)

**Request:**
```http
POST {{base_url}}/expenses/{{expense_id}}/approve
Authorization: Bearer {{access_token_a}}
```

---

### 10.4 Get Expense Statistics

**Request:**
```http
GET {{base_url}}/expenses/stats?startDate=2026-02-01&endDate=2026-02-28
Authorization: Bearer {{access_token_a}}
```

**Returns:**
- Total expenses
- Breakdown by category
- Pending vs approved amounts

---

## 11. Report Routes

### 11.1 Get Dashboard

**Request:**
```http
GET {{base_url}}/reports/dashboard?startDate=2026-02-01&endDate=2026-02-28
Authorization: Bearer {{access_token_a}}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "sales": {
      "total": 50000.00,
      "count": 25,
      "average": 2000.00
    },
    "products": {
      "total": 100,
      "low_stock": 5,
      "out_of_stock": 2
    },
    "customers": {
      "total": 50,
      "active": 30
    },
    "expenses": {
      "total": 15000.00
    },
    "profit": {
      "gross": 35000.00,
      "net": 20000.00,
      "margin": 40
    }
  }
}
```

---

### 11.2 Get Sales Report

**Request:**
```http
GET {{base_url}}/reports/sales?startDate=2026-02-01&endDate=2026-02-28&groupBy=day
Authorization: Bearer {{access_token_a}}
```

**Returns:**
- Total sales
- Daily/weekly/monthly breakdown
- Payment method breakdown
- Average order value

---

### 11.3 Get Profit Report

**Request:**
```http
GET {{base_url}}/reports/profit?startDate=2026-02-01&endDate=2026-02-28
Authorization: Bearer {{access_token_a}}
```

---

### 11.4 Get Inventory Report

**Request:**
```http
GET {{base_url}}/reports/inventory
Authorization: Bearer {{access_token_a}}
```

---

## 12. Multi-Tenant Isolation Tests

### 12.1 Register Company B

**Request:**
```http
POST {{base_url}}/auth/register
Content-Type: application/json
```

**Body:**
```json
{
  "name": "Jane Smith",
  "email": "admin@companyb.com",
  "password": "SecurePass456!",
  "companyName": "Company B - Furniture Store",
  "phone": "+0987654321"
}
```

**Tests:**
```javascript
const res = pm.response.json();
if (res.success) {
    pm.environment.set("access_token_b", res.data.token);
    pm.environment.set("company_id_b", res.data.company.id);
}
```

---

### 12.2 Test: Same Barcode in Different Companies

**Step 1: Create product with "PROD-001" in Company B**
```http
POST {{base_url}}/products
Authorization: Bearer {{access_token_b}}

{
  "name": "Monitor Samsung 27-inch",
  "barcode": "PROD-001",
  "purchase_price": 300,
  "selling_price": 450,
  "current_stock": 20
}
```

**Expected:** ✅ **Success** (same barcode allowed in different companies)

---

### 12.3 Test: Cross-Company Product Access

**Try to access Company A's product from Company B:**
```http
GET {{base_url}}/products/{{product_id}}
Authorization: Bearer {{access_token_b}}
```

**Expected Response (404):**
```json
{
  "success": false,
  "message": "Product not found"
}
```

**Tests:**
```javascript
pm.test("Cannot access other company's product", () => {
    pm.response.to.have.status(404);
});

pm.test("Generic error message", () => {
    const msg = pm.response.json().message;
    pm.expect(msg).to.include("not found");
});
```

---

### 12.4 Test: List Products Isolation

**From Company A:**
```http
GET {{base_url}}/products
Authorization: Bearer {{access_token_a}}
```

**Expected:** Returns only Company A's products (Laptop)

**From Company B:**
```http
GET {{base_url}}/products
Authorization: Bearer {{access_token_b}}
```

**Expected:** Returns only Company B's products (Monitor)

---

### 12.5 Test: Same Email in Different Companies

**Create user in Company A:**
```http
POST {{base_url}}/users
Authorization: Bearer {{access_token_a}}

{
  "name": "Bob Wilson",
  "email": "bob@example.com",
  "password": "Password123!",
  "role": "cashier"
}
```

**Expected:** ✅ Success

**Create user with same email in Company B:**
```http
POST {{base_url}}/users
Authorization: Bearer {{access_token_b}}

{
  "name": "Bob Wilson Jr",
  "email": "bob@example.com",
  "password": "Password456!",
  "role": "supervisor"
}
```

**Expected:** ✅ **Success** (same email allowed in different companies)

---

## 13. Security Tests

### 13.1 Test: No Token → 401

**Request:**
```http
GET {{base_url}}/products
(No Authorization header)
```

**Expected Response (401):**
```json
{
  "success": false,
  "error": {
    "message": "Authentication required"
  }
}
```

**Tests:**
```javascript
pm.test("Returns 401 without token", () => {
    pm.response.to.have.status(401);
});
```

---

### 13.2 Test: Invalid Token → 401

**Request:**
```http
GET {{base_url}}/products
Authorization: Bearer invalid_token_xyz_12345
```

**Expected Response (401):**
```json
{
  "success": false,
  "error": {
    "message": "Invalid token"
  }
}
```

---

### 13.3 Test: Supervisor Cannot Create Users

**Step 1: Login as supervisor**
```http
POST {{base_url}}/auth/login

{
  "email": "alice@companya.com",
  "password": "SupervisorPass123!"
}
```

**Save:** `supervisor_token`

**Step 2: Try to create user**
```http
POST {{base_url}}/users
Authorization: Bearer {{supervisor_token}}

{
  "name": "Test User",
  "email": "test@companya.com",
  "password": "Password123!",
  "role": "cashier"
}
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Only admins can create users"
}
```

**Tests:**
```javascript
pm.test("Returns 403 for non-admin", () => {
    pm.response.to.have.status(403);
});
```

---

### 13.4 Test: Operator Cannot Create Products

**Login as operator, then:**
```http
POST {{base_url}}/products
Authorization: Bearer {{operator_token}}

{
  "name": "Test Product",
  "barcode": "TEST-001",
  "purchase_price": 100,
  "selling_price": 150
}
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

---

### 13.5 Test: Cashier Cannot Delete Customers

**Login as cashier, then:**
```http
DELETE {{base_url}}/customers/{{customer_id}}
Authorization: Bearer {{cashier_token}}
```

**Expected Response (403):**
```json
{
  "success": false,
  "message": "Insufficient permissions"
}
```

---

### 13.6 Test: Cannot Change Own Role

**Request:**
```http
PUT {{base_url}}/users/{{user_id_a}}/role
Authorization: Bearer {{access_token_a}}

{
  "role": "admin"
}
```

**Expected Response (400):**
```json
{
  "success": false,
  "error": {
    "message": "Cannot change your own role"
  }
}
```

---

### 13.7 Test: Cannot Deactivate Own Account

**Request:**
```http
POST {{base_url}}/users/{{user_id_a}}/deactivate
Authorization: Bearer {{access_token_a}}
```

**Expected Response (400):**
```json
{
  "success": false,
  "error": {
    "message": "Cannot deactivate your own account"
  }
}
```

---

## 14. Using Postman Collection

### 14.1 Import Files

**Step 1: Import Collection**
1. Open Postman
2. Click **Import** button (top left)
3. Select `docs/api/postman_collection.json`
4. Collection appears in left sidebar

**Step 2: Import Environment**
1. Click gear icon ⚙️ (top right)
2. Click **Import**
3. Select `docs/api/postman_environment.json`
4. Select "Inventory API - Testing" from dropdown

### 14.2 Run Collection

**Option 1: Manual Testing**
- Click requests one by one
- Click **Send**
- Review responses

**Option 2: Collection Runner (Automated)**
1. Click **Runner** button
2. Select "Inventory Management API" collection
3. Select "Inventory API - Testing" environment
4. Order: Sequential
5. Click **Run**

### 14.3 Test Execution Order

**Recommended Order for Complete Validation:**

1. **Phase 1: Company A Setup** (Requests 1-7)
   - Register Company A
   - Login
   - Get Profile
   - Create Supervisor
   - Create Operator
   - Create Cashier
   - List Users

2. **Phase 2: Data Creation** (Requests 8-13)
   - Create Category
   - Create Product
   - Create Customer
   - Create Invoice
   - Verify Stock
   - Create Expense

3. **Phase 3: Company B & Isolation** (Requests 14-18)
   - Register Company B
   - Login Company B
   - Create Product (same barcode)
   - Test cross-company access
   - Test list isolation

4. **Phase 4: Security Tests** (Requests 19-25)
   - Test no token
   - Test invalid token
   - Test role permissions
   - Test self-modification prevention

### 14.4 Common Issues & Solutions

**Issue: "Authentication required"**
- **Solution:** Re-run login request, token auto-saves

**Issue: "Product not found" (404)**
- **Check:** Are you using the correct company's token?
- **Remember:** Resources belong to specific companies

**Issue: "Insufficient permissions" (403)**
- **Check:** Your user's role
- **Reference:** Role permission matrix in documentation

**Issue: "Email already exists in your company"**
- **Normal:** This is the expected behavior
- **Remember:** Same email allowed in different companies

### 14.5 Newman CLI (Automated Testing)

**Install Newman:**
```bash
npm install -g newman
```

**Run Collection:**
```bash
newman run docs/api/postman_collection.json \
  -e docs/api/postman_environment.json \
  --reporters cli,json \
  --reporter-json-export results.json
```

**With HTML Report:**
```bash
npm install -g newman-reporter-htmlextra

newman run docs/api/postman_collection.json \
  -e docs/api/postman_environment.json \
  -r htmlextra \
  --reporter-htmlextra-export report.html
```

---

## Summary

### What This Guide Covers

✅ **50+ API Endpoints** documented with examples
✅ **40+ Test Scenarios** for validation
✅ **Complete Test Flow** from registration to reports
✅ **Multi-Tenant Isolation** tests
✅ **Security & Permission** tests
✅ **Automatic Token Management** scripts
✅ **Exportable Postman Collection** included

### Test Completion Checklist

**Authentication:**
- [ ] Register Company A
- [ ] Login Company A
- [ ] Get profile
- [ ] Refresh token

**User Management:**
- [ ] Create supervisor
- [ ] Create operator
- [ ] Create cashier
- [ ] List users
- [ ] Update role
- [ ] Deactivate user

**Business Data:**
- [ ] Create category
- [ ] Create product
- [ ] Create customer
- [ ] Create invoice
- [ ] Verify stock deduction
- [ ] Create expense

**Multi-Tenant Isolation:**
- [ ] Register Company B
- [ ] Test same barcode in different companies
- [ ] Test cross-company product access (should fail)
- [ ] Test same email in different companies
- [ ] Verify data lists are isolated

**Security:**
- [ ] Test without token (401)
- [ ] Test invalid token (401)
- [ ] Test supervisor create user (403)
- [ ] Test operator create product (403)
- [ ] Test cashier delete customer (403)
- [ ] Test cannot change own role (400)
- [ ] Test cannot deactivate own account (400)

### Next Steps

1. **Run Quick Validation** (15 min)
   - Register → Login → Create Product → Create Invoice

2. **Run Full Validation** (45 min)
   - Complete test flow from Phase 1-4

3. **Run Security Tests** (15 min)
   - All permission and isolation tests

4. **Automate with Newman** (CI/CD integration)
   - Add to deployment pipeline

---

**Files Included:**
- `POSTMAN_COMPLETE_TESTING_GUIDE.md` (this file)
- `docs/api/postman_collection.json` (importable collection)
- `docs/api/postman_environment.json` (environment variables)

**Document Version:** 1.0
**Last Updated:** 2026-02-14
**Status:** Ready for Production Testing
**Prepared by:** System Development Team
