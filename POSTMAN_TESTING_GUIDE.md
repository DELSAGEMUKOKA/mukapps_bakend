# API Testing Guide - Postman/Insomnia

Complete guide for testing all backend endpoints using Postman or Insomnia.

## Table of Contents

1. [Setup](#setup)
2. [Authentication Flow](#authentication-flow)
3. [Testing MaxiCash Subscriptions](#testing-maxicash-subscriptions)
4. [Testing Other Endpoints](#testing-other-endpoints)
5. [Common Issues](#common-issues)

## Setup

### Option 1: Postman

1. **Download Postman**: https://www.postman.com/downloads/
2. **Import Collection**: You can manually create requests or import from the provided JSON
3. **Set Environment Variables**:
   - `base_url`: `http://localhost:5000`
   - `token`: Will be set automatically after login

### Option 2: Insomnia

1. **Download Insomnia**: https://insomnia.rest/download
2. **Create New Request Collection**
3. **Set Base Environment**:
   - `base_url`: `http://localhost:5000`

### Start the Server

```bash
# Make sure server is running
npm start

# Verify it's running
curl http://localhost:5000/api/v1/health
```

## Authentication Flow

All protected endpoints require authentication. You must login first to get a JWT token.

### 1. Register a New Company (First Time)

**POST** `{{base_url}}/api/v1/auth/register`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "John Admin",
  "email": "admin@test.com",
  "password": "SecurePass123!",
  "companyName": "Test Company Inc",
  "phone": "+1234567890"
}
```

**Note:** Registration creates both the company and the admin user. The user's email is used as both user and company email.

**Expected Response (201):**
```json
{
  "success": true,
  "message": "Company and admin user registered successfully",
  "data": {
    "user": {
      "id": "uuid-here",
      "name": "John Admin",
      "email": "admin@test.com",
      "role": "admin"
    },
    "company": {
      "id": "uuid-here",
      "name": "Test Company Inc"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

**Action:** Copy the `token` value for subsequent requests.

### 2. Login (If Already Registered)

**POST** `{{base_url}}/api/v1/auth/login`

**Headers:**
```
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "email": "admin@test.com",
  "password": "SecurePass123!"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid-here",
      "email": "admin@test.com",
      "name": "John Admin",
      "role": "admin"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "..."
  }
}
```

**Action:** Copy the `token` value. Use it in the Authorization header for all protected routes.

### 3. Setting Authorization Header

For all subsequent requests, add:

**Header:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

In Postman:
- Go to Authorization tab
- Select "Bearer Token"
- Paste your token

In Insomnia:
- Go to Auth tab
- Select "Bearer Token"
- Paste your token

## Testing MaxiCash Subscriptions

### 1. Get Available Plans

**GET** `{{base_url}}/api/v1/maxicash-subscriptions/plans`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "free",
      "name": "Free Plan",
      "price": 0,
      "currency": "USD",
      "duration": 30,
      "features": [
        "Up to 50 products",
        "Up to 20 invoices per month",
        "1 user",
        "Basic reports",
        "Community support"
      ],
      "limits": {
        "products": 50,
        "invoices": 20,
        "users": 1,
        "storage": 100
      }
    },
    {
      "id": "basic",
      "name": "Basic Plan",
      "price": 29.99,
      "currency": "USD",
      "duration": 30,
      "features": [...],
      "limits": {...}
    }
  ]
}
```

### 2. Check Current Active Subscription

**GET** `{{base_url}}/api/v1/maxicash-subscriptions/active`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Expected Response (200 - No Subscription):**
```json
{
  "success": true,
  "data": null,
  "message": "No active subscription found"
}
```

**Expected Response (200 - Has Subscription):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "company_id": "uuid-here",
    "plan_type": "basic",
    "status": "active",
    "start_date": "2024-01-01T00:00:00Z",
    "end_date": "2024-02-01T00:00:00Z",
    "amount": 29.99,
    "plan": "Basic Plan",
    "features": [...],
    "daysRemaining": 30,
    "isExpired": false,
    "isActive": true
  }
}
```

### 3. Initiate Subscription Payment

**POST** `{{base_url}}/api/v1/maxicash-subscriptions/initiate`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "planId": "basic",
  "customerPhone": "+1234567890",
  "autoRenew": false
}
```

**Important Notes:**
- Must be admin user
- Phone number must be in international format
- Valid planIds: `free`, `basic`, `premium`, `enterprise`
- If using real MaxiCash credentials, you'll receive SMS notification

**Expected Response (200 - Success):**
```json
{
  "success": true,
  "message": "Subscription activated successfully",
  "data": {
    "subscriptionId": "uuid-here",
    "plan": "Basic Plan",
    "amount": 29.99,
    "currency": "USD",
    "status": "active",
    "transactionId": "MC-xxx-xxx",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-02-01T00:00:00Z",
    "autoRenew": false
  }
}
```

**Expected Response (400 - Payment Failed):**
```json
{
  "success": false,
  "message": "Payment failed",
  "error": "User did not approve payment",
  "data": {
    "subscriptionId": "uuid-here",
    "reference": "SUB-xxx-xxx"
  }
}
```

**Expected Response (403 - Not Admin):**
```json
{
  "success": false,
  "message": "Only admins can initiate subscription payments"
}
```

### 4. Verify Payment Transaction

**GET** `{{base_url}}/api/v1/maxicash-subscriptions/verify/TRANSACTION_ID`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Example:**
```
GET /api/v1/maxicash-subscriptions/verify/MC-12345-67890
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Payment verified and subscription activated",
  "data": {
    "subscriptionId": "uuid-here",
    "status": "active",
    "transactionId": "MC-12345-67890",
    "amount": 29.99
  }
}
```

### 5. Get Subscription History

**GET** `{{base_url}}/api/v1/maxicash-subscriptions/history`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid-here",
      "plan_type": "basic",
      "planName": "Basic Plan",
      "status": "active",
      "amount": 29.99,
      "start_date": "2024-01-01T00:00:00Z",
      "end_date": "2024-02-01T00:00:00Z",
      "created_at": "2024-01-01T00:00:00Z"
    },
    {
      "id": "uuid-here-2",
      "plan_type": "free",
      "planName": "Free Plan",
      "status": "expired",
      "amount": 0,
      "start_date": "2023-12-01T00:00:00Z",
      "end_date": "2023-12-31T00:00:00Z"
    }
  ]
}
```

### 6. Update Auto-Renewal

**PUT** `{{base_url}}/api/v1/maxicash-subscriptions/SUBSCRIPTION_ID/auto-renew`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "autoRenew": true
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Auto-renew enabled successfully",
  "data": {
    "subscriptionId": "uuid-here",
    "autoRenew": true,
    "nextBillingDate": "2024-02-01T00:00:00Z"
  }
}
```

### 7. Cancel Subscription

**POST** `{{base_url}}/api/v1/maxicash-subscriptions/SUBSCRIPTION_ID/cancel`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Expected Response (200):**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "data": {
    "subscriptionId": "uuid-here",
    "status": "cancelled"
  }
}
```

## Testing Other Endpoints

### Products

#### Create Product

**POST** `{{base_url}}/api/v1/products`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Test Product",
  "barcode": "1234567890",
  "description": "A test product",
  "category_id": "category-uuid",
  "purchase_price": 10.00,
  "selling_price": 15.00,
  "current_stock": 100,
  "min_stock_level": 10,
  "unit": "piece"
}
```

**Note:** Use snake_case for all field names. The `category_id` is optional.

#### Get All Products

**GET** `{{base_url}}/api/v1/products`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
```
?page=1&limit=20&search=test
```

### Customers

#### Create Customer

**POST** `{{base_url}}/api/v1/customers`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "address": "123 Customer St",
  "city": "New York"
}
```

**Note:** All fields except `name` are optional.

#### Get All Customers

**GET** `{{base_url}}/api/v1/customers`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

### Invoices

#### Create Invoice

**POST** `{{base_url}}/api/v1/invoices`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "customer_id": "customer-uuid",
  "items": [
    {
      "product_id": "product-uuid",
      "quantity": 2,
      "unit_price": 15.00,
      "tax_rate": 10,
      "discount": 0
    }
  ],
  "tax": 2.70,
  "discount": 0,
  "payment_method": "cash",
  "payment_status": "paid",
  "notes": "Test invoice"
}
```

**Note:**
- Use snake_case for field names
- `customer_id` is optional (can be null for walk-in customers)
- `payment_method` options: 'cash', 'card', 'transfer', 'check'
- `payment_status` options: 'pending', 'paid', 'cancelled', 'refunded'

#### Get All Invoices

**GET** `{{base_url}}/api/v1/invoices`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

### Categories

#### Create Category

**POST** `{{base_url}}/api/v1/categories`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Electronics",
  "description": "Electronic products"
}
```

### Expenses

#### Create Expense

**POST** `{{base_url}}/api/v1/expenses`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "title": "Office Supplies",
  "description": "Purchased printer paper",
  "amount": 50.00,
  "category": "supplies",
  "payment_method": "card",
  "date": "2024-01-15"
}
```

**Note:**
- Use `payment_method` (snake_case)
- `payment_method` options: 'cash', 'card', 'transfer', 'check'
- `date` is optional (defaults to current date)

### Reports

#### Get Dashboard

**GET** `{{base_url}}/api/v1/reports/dashboard`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
```
?startDate=2024-01-01&endDate=2024-01-31
```

#### Get Sales Report

**GET** `{{base_url}}/api/v1/reports/sales`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters:**
```
?startDate=2024-01-01&endDate=2024-01-31&groupBy=day
```

### Users

#### Create User

**POST** `{{base_url}}/api/v1/users`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Jane Cashier",
  "email": "jane@company.com",
  "password": "SecurePass123!",
  "role": "cashier",
  "phone": "+1234567890"
}
```

**Note:**
- Valid roles: 'admin', 'manager', 'cashier'
- Only admins can create users
- `phone` is optional

#### Get All Users

**GET** `{{base_url}}/api/v1/users`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

### Company

#### Get Company Profile

**GET** `{{base_url}}/api/v1/companies/profile`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

#### Update Company Profile

**PUT** `{{base_url}}/api/v1/companies/profile`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Updated Company Name",
  "phone": "+1234567890",
  "address": "456 New Address",
  "city": "Los Angeles"
}
```

## Common Issues

### 1. "Authentication required" or 401 Error

**Problem:** Missing or invalid token

**Solution:**
- Ensure you logged in and got a token
- Check that Authorization header is set: `Bearer YOUR_TOKEN`
- Token might have expired, login again

### 2. "Only admins can..." or 403 Error

**Problem:** Insufficient permissions

**Solution:**
- Endpoint requires admin role
- Login with admin user
- Check user role in database

### 3. "MaxiCash credentials not configured"

**Problem:** Environment variables not set

**Solution:**
- Add to `.env` file:
```env
MAXICASH_MERCHANT_ID=your_id
MAXICASH_MERCHANT_PASSWORD=your_password
MAXICASH_ENVIRONMENT=sandbox
```
- Restart server

### 4. Connection Refused / Server Not Running

**Problem:** Server is not running

**Solution:**
```bash
npm start
```

### 5. "Active subscription required"

**Problem:** Trying to access protected route without subscription

**Solution:**
- Subscribe to a plan first
- Use `/initiate` endpoint to start subscription

### 6. CORS Errors

**Problem:** Browser blocking requests

**Solution:**
- Use Postman/Insomnia (not browser)
- Or ensure CORS is configured in backend

## Testing Workflow Example

### Complete Test Flow

```bash
# 1. Start server
npm start

# 2. Register company (first time)
POST /api/v1/auth/register
# Copy token from response

# 3. Check available plans
GET /api/v1/maxicash-subscriptions/plans
# Authorization: Bearer {token}

# 4. Check current subscription
GET /api/v1/maxicash-subscriptions/active
# Authorization: Bearer {token}

# 5. Subscribe to Basic plan
POST /api/v1/maxicash-subscriptions/initiate
# Authorization: Bearer {token}
# Body: {"planId":"basic","customerPhone":"+1234567890"}

# 6. Create a product
POST /api/v1/products
# Authorization: Bearer {token}
# Body: {"name":"Product 1","sellingPrice":10}

# 7. Create a customer
POST /api/v1/customers
# Authorization: Bearer {token}
# Body: {"name":"Customer 1","email":"customer@test.com"}

# 8. Create an invoice
POST /api/v1/invoices
# Authorization: Bearer {token}
# Body: {invoice data with items}

# 9. View dashboard
GET /api/v1/reports/dashboard
# Authorization: Bearer {token}
```

## Postman Collection Export

You can create a collection with all these requests. Here's a sample structure:

```
📁 Inventory Management API
├── 📁 Authentication
│   ├── Register
│   ├── Login
│   └── Refresh Token
├── 📁 MaxiCash Subscriptions
│   ├── Get Plans
│   ├── Get Active Subscription
│   ├── Initiate Payment
│   ├── Verify Payment
│   ├── Get History
│   ├── Update Auto-Renew
│   └── Cancel Subscription
├── 📁 Products
│   ├── Create Product
│   ├── Get All Products
│   ├── Get Product by ID
│   └── Update Product
├── 📁 Customers
├── 📁 Invoices
├── 📁 Categories
├── 📁 Expenses
├── 📁 Reports
└── 📁 Users
```

## Tips for Efficient Testing

1. **Use Environment Variables** in Postman/Insomnia:
   - `{{base_url}}` = `http://localhost:5000`
   - `{{token}}` = Your JWT token
   - `{{company_id}}` = Your company ID

2. **Save Requests** for reuse

3. **Use Tests Tab** in Postman to automatically extract tokens:
```javascript
// In Tests tab of login request
pm.environment.set("token", pm.response.json().data.token);
```

4. **Create Folders** to organize requests by feature

5. **Use Pre-request Scripts** to automate token refresh

## Summary

You now have everything needed to test the entire backend API:

✅ Authentication endpoints
✅ MaxiCash subscription endpoints
✅ Product management
✅ Customer management
✅ Invoice management
✅ Reporting endpoints
✅ User management
✅ Company settings

All endpoints require authentication except `/auth/register` and `/auth/login`.

Happy testing! 🚀
