# Frontend Integration Guide
## Inventory Management System API

**Version:** 1.0.0
**Last Updated:** February 17, 2026
**API Base URL (Development):** `http://localhost:5000/api/v1`
**API Base URL (Production):** `https://your-domain.com/api/v1`

---

## Table of Contents

1. [Quick Start](#quick-start)
2. [Authentication System](#authentication-system)
3. [API Response Format](#api-response-format)
4. [Complete API Endpoints](#complete-api-endpoints)
5. [Data Models & Structures](#data-models--structures)
6. [Business Rules](#business-rules)
7. [Error Handling](#error-handling)
8. [Testing Tools](#testing-tools)

---

## 1. Quick Start

### 1.1 Environment Configuration

```javascript
// Development
const API_BASE_URL = 'http://localhost:5000/api/v1';

// Production
const API_BASE_URL = 'https://your-domain.com/api/v1';

// Health Check
const HEALTH_CHECK = 'http://localhost:5000/health';
```

### 1.2 Required Headers

```javascript
// For authenticated requests
const headers = {
  'Content-Type': 'application/json',
  'Authorization': `Bearer ${accessToken}`
};

// For public requests (login, register)
const headers = {
  'Content-Type': 'application/json'
};
```

### 1.3 Basic Request Example

```javascript
// Using fetch
const response = await fetch(`${API_BASE_URL}/products`, {
  method: 'GET',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${accessToken}`
  }
});

const data = await response.json();

if (data.success) {
  console.log('Products:', data.data);
} else {
  console.error('Error:', data.error);
}
```

---

## 2. Authentication System

### 2.1 Token Management

The API uses **JWT (JSON Web Tokens)** for authentication.

**Token Structure:**
- **Access Token**: Valid for 7 days (configurable)
- **Refresh Token**: Valid for 30 days (configurable)

**Token Storage Recommendations:**
- Store in memory (React state, Vuex, Redux)
- Or use `localStorage` (less secure but convenient)
- Never store in cookies without `httpOnly` flag

### 2.2 Registration Flow

**Endpoint:** `POST /auth/register`

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@company.com",
  "password": "SecurePass123!",
  "companyName": "My Company Inc",
  "phone": "+1234567890"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Registration successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-here",
      "name": "John Doe",
      "email": "john@company.com",
      "role": "admin",
      "company_id": "company-uuid",
      "is_active": true
    },
    "company": {
      "id": "company-uuid",
      "name": "My Company Inc",
      "is_active": true
    }
  }
}
```

**Password Requirements:**
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character (!@#$%^&*)

### 2.3 Login Flow

**Endpoint:** `POST /auth/login`

**Request Body:**
```json
{
  "email": "john@company.com",
  "password": "SecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": "uuid-here",
      "name": "John Doe",
      "email": "john@company.com",
      "role": "admin",
      "company_id": "company-uuid",
      "is_active": true,
      "last_login": "2026-02-17T10:30:00Z"
    }
  }
}
```

### 2.4 Get Current User

**Endpoint:** `GET /auth/me`
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "John Doe",
    "email": "john@company.com",
    "role": "admin",
    "company_id": "company-uuid",
    "phone": "+1234567890",
    "is_active": true,
    "last_login": "2026-02-17T10:30:00Z",
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

### 2.5 Token Refresh

**Endpoint:** `POST /auth/refresh`

**Request Body:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "token": "new-access-token-here",
    "refreshToken": "new-refresh-token-here"
  }
}
```

### 2.6 Logout

**Endpoint:** `POST /auth/logout`
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

### 2.7 Forgot Password

**Endpoint:** `POST /auth/forgot-password`

**Request Body:**
```json
{
  "email": "john@company.com"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset email sent"
}
```

### 2.8 Reset Password

**Endpoint:** `POST /auth/reset-password`

**Request Body:**
```json
{
  "token": "reset-token-from-email",
  "password": "NewSecurePass123!"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "message": "Password reset successful"
}
```

---

## 3. API Response Format

### 3.1 Standard Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    // Response data here
  }
}
```

### 3.2 Standard Error Response

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional error details (optional)
    }
  }
}
```

### 3.3 Paginated Response

```json
{
  "success": true,
  "data": {
    "items": [
      // Array of items
    ],
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

### 3.4 HTTP Status Codes

| Status Code | Meaning | Usage |
|------------|---------|-------|
| **200** | OK | Successful GET, PUT, PATCH, DELETE |
| **201** | Created | Successful POST (resource created) |
| **204** | No Content | Successful DELETE (no response body) |
| **400** | Bad Request | Validation error, invalid input |
| **401** | Unauthorized | Missing or invalid token |
| **403** | Forbidden | Insufficient permissions |
| **404** | Not Found | Resource doesn't exist |
| **409** | Conflict | Duplicate resource (unique constraint) |
| **422** | Unprocessable Entity | Validation failed |
| **429** | Too Many Requests | Rate limit exceeded |
| **500** | Internal Server Error | Server error |

---

## 4. Complete API Endpoints

### 4.1 Authentication Endpoints

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | No | Register new company & admin user |
| POST | `/auth/login` | No | Login with email & password |
| GET | `/auth/me` | Yes | Get current user info |
| POST | `/auth/refresh` | No | Refresh access token |
| POST | `/auth/logout` | Yes | Logout (invalidate token) |
| POST | `/auth/forgot-password` | No | Request password reset |
| POST | `/auth/reset-password` | No | Reset password with token |

### 4.2 Products Endpoints

#### Create Product
**POST** `/products`
**Authentication:** Required
**Roles:** admin, supervisor, operator

**Request Body:**
```json
{
  "name": "Laptop Dell XPS 15",
  "barcode": "PROD-001",
  "description": "High-performance laptop",
  "category_id": "category-uuid",
  "purchase_price": 1000.00,
  "selling_price": 1500.00,
  "current_stock": 10,
  "min_stock_level": 5,
  "unit": "piece",
  "sku": "DELL-XPS-15",
  "location": "Warehouse A, Shelf 3"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Product created successfully",
  "data": {
    "id": "product-uuid",
    "name": "Laptop Dell XPS 15",
    "barcode": "PROD-001",
    "description": "High-performance laptop",
    "category_id": "category-uuid",
    "purchase_price": "1000.00",
    "selling_price": "1500.00",
    "current_stock": 10,
    "min_stock_level": 5,
    "unit": "piece",
    "sku": "DELL-XPS-15",
    "location": "Warehouse A, Shelf 3",
    "company_id": "company-uuid",
    "created_at": "2026-02-17T10:30:00Z",
    "updated_at": "2026-02-17T10:30:00Z"
  }
}
```

#### List Products
**GET** `/products?page=1&limit=20&search=laptop&category_id=uuid&sort_by=name&order=asc`
**Authentication:** Required

**Query Parameters:**
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 20, max: 100)
- `search` (optional): Search in name, barcode, SKU
- `category_id` (optional): Filter by category
- `low_stock` (optional): true/false - show only low stock items
- `sort_by` (optional): name, selling_price, current_stock, created_at
- `order` (optional): asc, desc

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "product-uuid",
        "name": "Laptop Dell XPS 15",
        "barcode": "PROD-001",
        "selling_price": "1500.00",
        "current_stock": 10,
        "min_stock_level": 5,
        "is_low_stock": false,
        "category": {
          "id": "category-uuid",
          "name": "Electronics"
        }
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "itemsPerPage": 20
    }
  }
}
```

#### Get Product by ID
**GET** `/products/:id`
**Authentication:** Required

#### Get Product by Barcode
**GET** `/products/barcode/:barcode`
**Authentication:** Required

#### Update Product
**PUT** `/products/:id`
**Authentication:** Required
**Roles:** admin, supervisor, operator

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Product Name",
  "selling_price": 1600.00,
  "current_stock": 15
}
```

#### Delete Product
**DELETE** `/products/:id`
**Authentication:** Required
**Roles:** admin, supervisor

### 4.3 Categories Endpoints

#### Create Category
**POST** `/categories`
**Authentication:** Required
**Roles:** admin, supervisor

**Request Body:**
```json
{
  "name": "Electronics",
  "description": "Electronic devices and accessories",
  "icon": "📱"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "category-uuid",
    "name": "Electronics",
    "description": "Electronic devices and accessories",
    "icon": "📱",
    "company_id": "company-uuid",
    "created_at": "2026-02-17T10:30:00Z"
  }
}
```

#### List Categories
**GET** `/categories`
**Authentication:** Required

#### Update Category
**PUT** `/categories/:id`
**Authentication:** Required
**Roles:** admin, supervisor

#### Delete Category
**DELETE** `/categories/:id`
**Authentication:** Required
**Roles:** admin

### 4.4 Customers Endpoints

#### Create Customer
**POST** `/customers`
**Authentication:** Required

**Request Body:**
```json
{
  "name": "Customer Corp",
  "email": "contact@customer.com",
  "phone": "+1234567890",
  "address": "123 Business Street",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "postal_code": "10001",
  "tax_id": "TAX-123"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "customer-uuid",
    "name": "Customer Corp",
    "email": "contact@customer.com",
    "phone": "+1234567890",
    "address": "123 Business Street",
    "city": "New York",
    "total_purchases": "0.00",
    "is_vip": false,
    "created_at": "2026-02-17T10:30:00Z"
  }
}
```

#### List Customers
**GET** `/customers?page=1&limit=20&search=corp&is_vip=true`
**Authentication:** Required

#### Get Customer by ID
**GET** `/customers/:id`
**Authentication:** Required

#### Get Customer Statistics
**GET** `/customers/:id/stats`
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "total_invoices": 45,
    "total_spent": "15000.00",
    "average_order_value": "333.33",
    "last_purchase_date": "2026-02-15T14:20:00Z",
    "is_vip": true,
    "invoices_by_status": {
      "paid": 42,
      "pending": 2,
      "cancelled": 1
    }
  }
}
```

#### Update Customer
**PUT** `/customers/:id`
**Authentication:** Required

#### Delete Customer
**DELETE** `/customers/:id`
**Authentication:** Required
**Roles:** admin

### 4.5 Invoices Endpoints

#### Create Invoice
**POST** `/invoices`
**Authentication:** Required

**Request Body:**
```json
{
  "customer_id": "customer-uuid",
  "items": [
    {
      "product_id": "product-uuid",
      "quantity": 2,
      "unit_price": 1500.00,
      "tax_rate": 10,
      "discount": 50.00
    }
  ],
  "payment_method": "cash",
  "payment_status": "paid",
  "notes": "First invoice"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "invoice-uuid",
    "invoice_number": "INV-20260217-0001",
    "customer_id": "customer-uuid",
    "subtotal": "3000.00",
    "tax": "300.00",
    "discount": "100.00",
    "total": "3200.00",
    "payment_method": "cash",
    "payment_status": "paid",
    "date": "2026-02-17T10:30:00Z",
    "items": [
      {
        "id": "item-uuid",
        "product_id": "product-uuid",
        "quantity": 2,
        "unit_price": "1500.00",
        "tax_rate": "10.00",
        "discount": "50.00",
        "total": "2900.00",
        "product": {
          "name": "Laptop Dell XPS 15",
          "barcode": "PROD-001"
        }
      }
    ],
    "customer": {
      "name": "Customer Corp",
      "email": "contact@customer.com"
    }
  }
}
```

#### List Invoices
**GET** `/invoices?page=1&limit=20&payment_status=paid&customer_id=uuid&date_from=2026-01-01&date_to=2026-12-31`
**Authentication:** Required

**Query Parameters:**
- `page`, `limit`: Pagination
- `customer_id`: Filter by customer
- `payment_status`: paid, pending, cancelled, refunded
- `payment_method`: cash, card, transfer, check
- `date_from`, `date_to`: Date range filter

#### Get Invoice by ID
**GET** `/invoices/:id`
**Authentication:** Required

#### Get Invoice PDF
**GET** `/invoices/:id/pdf`
**Authentication:** Required

**Returns:** PDF file download

#### Cancel Invoice
**POST** `/invoices/:id/cancel`
**Authentication:** Required
**Roles:** admin, supervisor

**Success Response (200):**
```json
{
  "success": true,
  "message": "Invoice cancelled successfully",
  "data": {
    "id": "invoice-uuid",
    "payment_status": "cancelled",
    "updated_at": "2026-02-17T10:30:00Z"
  }
}
```

### 4.6 Expenses Endpoints

#### Create Expense
**POST** `/expenses`
**Authentication:** Required

**Request Body:**
```json
{
  "title": "Office Rent",
  "description": "Monthly office rent payment",
  "amount": 1500.00,
  "category": "rent",
  "payment_method": "transfer",
  "date": "2026-02-01",
  "receipt_url": "https://example.com/receipt.pdf"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "expense-uuid",
    "expense_number": "EXP-20260217-0001",
    "title": "Office Rent",
    "amount": "1500.00",
    "category": "rent",
    "payment_method": "transfer",
    "date": "2026-02-01",
    "status": "pending",
    "created_at": "2026-02-17T10:30:00Z"
  }
}
```

**Expense Categories:**
- `rent`, `utilities`, `salaries`, `supplies`, `marketing`, `transport`, `maintenance`, `other`

**Expense Status:**
- `pending` - Awaiting approval
- `approved` - Approved by admin/supervisor
- `rejected` - Rejected

#### List Expenses
**GET** `/expenses?page=1&limit=20&category=rent&status=approved&date_from=2026-01-01&date_to=2026-12-31`
**Authentication:** Required

#### Get Expense by ID
**GET** `/expenses/:id`
**Authentication:** Required

#### Approve Expense
**POST** `/expenses/:id/approve`
**Authentication:** Required
**Roles:** admin, supervisor

#### Reject Expense
**POST** `/expenses/:id/reject`
**Authentication:** Required
**Roles:** admin, supervisor

**Request Body:**
```json
{
  "reason": "Missing receipt"
}
```

#### Update Expense
**PUT** `/expenses/:id`
**Authentication:** Required

#### Delete Expense
**DELETE** `/expenses/:id`
**Authentication:** Required
**Roles:** admin

### 4.7 Stock Management Endpoints

#### Add Stock (Stock In)
**POST** `/stock/in`
**Authentication:** Required
**Roles:** admin, supervisor, operator

**Request Body:**
```json
{
  "product_id": "product-uuid",
  "quantity": 50,
  "reason": "Purchase order #123",
  "reference": "PO-123",
  "notes": "From Supplier ABC"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "message": "Stock added successfully",
  "data": {
    "id": "movement-uuid",
    "product_id": "product-uuid",
    "type": "in",
    "quantity": 50,
    "previous_stock": 10,
    "new_stock": 60,
    "reason": "Purchase order #123",
    "reference": "PO-123",
    "created_at": "2026-02-17T10:30:00Z"
  }
}
```

#### Remove Stock (Stock Out)
**POST** `/stock/out`
**Authentication:** Required
**Roles:** admin, supervisor, operator

**Request Body:**
```json
{
  "product_id": "product-uuid",
  "quantity": 10,
  "reason": "Damaged goods",
  "notes": "Items damaged during transport"
}
```

#### Adjust Stock
**POST** `/stock/adjust`
**Authentication:** Required
**Roles:** admin, supervisor

**Request Body:**
```json
{
  "product_id": "product-uuid",
  "new_quantity": 100,
  "reason": "Physical inventory count",
  "notes": "Annual stock count 2026"
}
```

#### Get Stock Movements
**GET** `/stock/movements?product_id=uuid&type=in&page=1&limit=50&date_from=2026-01-01`
**Authentication:** Required

**Query Parameters:**
- `product_id`: Filter by product
- `type`: in, out, adjustment, sale
- `page`, `limit`: Pagination
- `date_from`, `date_to`: Date range

#### Get Low Stock Alerts
**GET** `/stock/low-stock`
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "product-uuid",
      "name": "Product Name",
      "current_stock": 3,
      "min_stock_level": 10,
      "deficit": 7,
      "barcode": "PROD-001"
    }
  ]
}
```

#### Get Stock Valuation
**GET** `/stock/valuation`
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "total_products": 150,
    "total_items": 1250,
    "purchase_value": "125000.00",
    "selling_value": "187500.00",
    "potential_profit": "62500.00",
    "low_stock_items": 12
  }
}
```

### 4.8 Reports Endpoints

#### Dashboard Summary
**GET** `/reports/dashboard`
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "today": {
      "sales": "5000.00",
      "invoices": 12,
      "expenses": "500.00",
      "profit": "4500.00"
    },
    "this_month": {
      "sales": "150000.00",
      "invoices": 340,
      "expenses": "25000.00",
      "profit": "125000.00"
    },
    "inventory": {
      "total_products": 150,
      "total_value": "187500.00",
      "low_stock_items": 12
    },
    "top_products": [
      {
        "id": "product-uuid",
        "name": "Product Name",
        "sales_count": 45,
        "revenue": "15000.00"
      }
    ],
    "recent_invoices": [
      // Last 5 invoices
    ]
  }
}
```

#### Sales Report
**GET** `/reports/sales?start_date=2026-01-01&end_date=2026-12-31&group_by=day`
**Authentication:** Required

**Query Parameters:**
- `start_date`, `end_date`: Date range (required)
- `group_by`: day, week, month
- `payment_status`: Filter by status
- `customer_id`: Filter by customer

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_sales": "150000.00",
      "total_invoices": 340,
      "average_order_value": "441.18",
      "tax_collected": "15000.00"
    },
    "by_period": [
      {
        "period": "2026-02-01",
        "sales": "5000.00",
        "invoices": 12
      }
    ],
    "by_payment_method": {
      "cash": "80000.00",
      "card": "50000.00",
      "transfer": "20000.00"
    },
    "top_customers": [
      {
        "customer_id": "uuid",
        "name": "Customer Name",
        "total_spent": "10000.00",
        "invoices": 25
      }
    ]
  }
}
```

#### Inventory Report
**GET** `/reports/inventory`
**Authentication:** Required

#### Profit/Loss Report
**GET** `/reports/profit?period=monthly&year=2026`
**Authentication:** Required

**Query Parameters:**
- `period`: daily, weekly, monthly
- `year`: Year (required for monthly)
- `start_date`, `end_date`: Date range

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "summary": {
      "total_revenue": "150000.00",
      "total_expenses": "25000.00",
      "gross_profit": "75000.00",
      "net_profit": "50000.00",
      "profit_margin": "33.33"
    },
    "by_period": [
      {
        "period": "2026-01",
        "revenue": "50000.00",
        "expenses": "8000.00",
        "profit": "17000.00"
      }
    ]
  }
}
```

#### Expense Report
**GET** `/reports/expenses?start_date=2026-01-01&end_date=2026-12-31&category=rent`
**Authentication:** Required

### 4.9 Users Endpoints

#### Create User
**POST** `/users`
**Authentication:** Required
**Roles:** admin

**Request Body:**
```json
{
  "name": "Staff User",
  "email": "staff@company.com",
  "password": "SecurePass123!",
  "role": "cashier",
  "phone": "+1234567890"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid",
    "name": "Staff User",
    "email": "staff@company.com",
    "role": "cashier",
    "company_id": "company-uuid",
    "is_active": true,
    "created_at": "2026-02-17T10:30:00Z"
  }
}
```

#### List Users
**GET** `/users?page=1&limit=20&role=cashier&is_active=true`
**Authentication:** Required
**Roles:** admin, supervisor

#### Get User by ID
**GET** `/users/:id`
**Authentication:** Required
**Roles:** admin, supervisor

#### Update User
**PUT** `/users/:id`
**Authentication:** Required
**Roles:** admin

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Name",
  "role": "supervisor",
  "is_active": true
}
```

#### Activate User
**POST** `/users/:id/activate`
**Authentication:** Required
**Roles:** admin

#### Deactivate User
**POST** `/users/:id/deactivate`
**Authentication:** Required
**Roles:** admin

#### Delete User
**DELETE** `/users/:id`
**Authentication:** Required
**Roles:** admin

### 4.10 Company Endpoints

#### Get Company Profile
**GET** `/companies/me`
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "company-uuid",
    "name": "My Company Inc",
    "email": "contact@company.com",
    "phone": "+1234567890",
    "address": "123 Business St",
    "city": "New York",
    "state": "NY",
    "country": "USA",
    "postal_code": "10001",
    "tax_id": "TAX-123",
    "logo_url": "https://example.com/logo.png",
    "website": "https://company.com",
    "is_active": true,
    "created_at": "2026-01-01T00:00:00Z"
  }
}
```

#### Update Company Profile
**PUT** `/companies/me`
**Authentication:** Required
**Roles:** admin

**Request Body:** (all fields optional)
```json
{
  "name": "Updated Company Name",
  "phone": "+1234567890",
  "address": "456 New Address",
  "logo_url": "https://example.com/new-logo.png"
}
```

#### Get Company Statistics
**GET** `/companies/me/stats`
**Authentication:** Required
**Roles:** admin, supervisor

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "users": {
      "total": 10,
      "active": 8,
      "by_role": {
        "admin": 2,
        "supervisor": 3,
        "operator": 3,
        "cashier": 2
      }
    },
    "products": {
      "total": 150,
      "low_stock": 12,
      "total_value": "187500.00"
    },
    "sales": {
      "today": "5000.00",
      "this_month": "150000.00",
      "total_invoices": 340
    },
    "customers": {
      "total": 85,
      "vip": 12
    }
  }
}
```

### 4.11 Teams Endpoints

#### Create Team
**POST** `/teams`
**Authentication:** Required
**Roles:** admin

**Request Body:**
```json
{
  "name": "Sales Team",
  "description": "Sales department team",
  "members": ["user-uuid-1", "user-uuid-2"]
}
```

#### List Teams
**GET** `/teams`
**Authentication:** Required

#### Get Team by ID
**GET** `/teams/:id`
**Authentication:** Required

#### Update Team
**PUT** `/teams/:id`
**Authentication:** Required
**Roles:** admin

#### Add Team Member
**POST** `/teams/:id/members`
**Authentication:** Required
**Roles:** admin

**Request Body:**
```json
{
  "user_id": "user-uuid"
}
```

#### Remove Team Member
**DELETE** `/teams/:id/members/:user_id`
**Authentication:** Required
**Roles:** admin

#### Delete Team
**DELETE** `/teams/:id`
**Authentication:** Required
**Roles:** admin

### 4.12 Subscriptions Endpoints

#### Get Current Subscription
**GET** `/subscriptions/current`
**Authentication:** Required
**Roles:** admin

#### Get Subscription Plans
**GET** `/subscriptions/plans`
**Authentication:** Required

**Success Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "basic",
      "name": "Basic Plan",
      "price": "29.99",
      "currency": "USD",
      "interval": "monthly",
      "features": [
        "Up to 1000 products",
        "5 users",
        "Basic reports",
        "Email support"
      ]
    },
    {
      "id": "premium",
      "name": "Premium Plan",
      "price": "79.99",
      "currency": "USD",
      "interval": "monthly",
      "features": [
        "Unlimited products",
        "Unlimited users",
        "Advanced reports",
        "Priority support",
        "API access"
      ]
    }
  ]
}
```

#### Upgrade Subscription
**POST** `/subscriptions/upgrade`
**Authentication:** Required
**Roles:** admin

**Request Body:**
```json
{
  "plan_id": "premium"
}
```

#### Cancel Subscription
**POST** `/subscriptions/cancel`
**Authentication:** Required
**Roles:** admin

---

## 5. Data Models & Structures

### 5.1 User Model

```typescript
interface User {
  id: string;                    // UUID
  name: string;                  // Max 100 chars
  email: string;                 // Max 100 chars, valid email
  role: 'admin' | 'supervisor' | 'operator' | 'cashier';
  company_id: string;            // UUID, foreign key
  phone?: string;                // Max 20 chars
  is_active: boolean;            // Default: true
  failed_login_attempts: number; // Default: 0
  locked_until?: Date;           // Account lock timestamp
  last_login?: Date;
  email_verified: boolean;       // Default: false
  created_at: Date;
  updated_at: Date;
}
```

### 5.2 Product Model

```typescript
interface Product {
  id: string;                    // UUID
  name: string;                  // Max 100 chars, required
  barcode?: string;              // Max 50 chars, unique per company
  description?: string;          // Text
  category_id?: string;          // UUID, foreign key
  purchase_price: number;        // Decimal(10,2), default: 0
  selling_price: number;         // Decimal(10,2), default: 0
  current_stock: number;         // Integer, default: 0
  min_stock_level: number;       // Integer, default: 0
  unit: string;                  // Max 20 chars, default: 'piece'
  image_url?: string;            // Max 255 chars
  sku?: string;                  // Max 50 chars, unique per company
  location?: string;             // Max 200 chars
  company_id: string;            // UUID, foreign key
  created_at: Date;
  updated_at: Date;
}
```

### 5.3 Customer Model

```typescript
interface Customer {
  id: string;                    // UUID
  name: string;                  // Max 100 chars, required
  email?: string;                // Max 100 chars, valid email
  phone?: string;                // Max 20 chars
  address?: string;              // Max 255 chars
  city?: string;                 // Max 100 chars
  state?: string;                // Max 100 chars
  country?: string;              // Max 100 chars
  postal_code?: string;          // Max 20 chars
  tax_id?: string;               // Max 50 chars
  total_purchases: number;       // Decimal(12,2), computed
  is_vip: boolean;               // Default: false
  company_id: string;            // UUID, foreign key
  created_at: Date;
  updated_at: Date;
}
```

### 5.4 Invoice Model

```typescript
interface Invoice {
  id: string;                    // UUID
  invoice_number: string;        // Auto-generated: INV-YYYYMMDD-####
  customer_id?: string;          // UUID, foreign key (optional)
  user_id: string;               // UUID, foreign key
  company_id: string;            // UUID, foreign key
  date: Date;                    // Default: now()
  subtotal: number;              // Decimal(12,2)
  tax: number;                   // Decimal(12,2)
  discount: number;              // Decimal(12,2)
  total: number;                 // Decimal(12,2)
  payment_method: 'cash' | 'card' | 'transfer' | 'check';
  payment_status: 'pending' | 'paid' | 'cancelled' | 'refunded';
  notes?: string;                // Text
  created_at: Date;
  updated_at: Date;

  // Relations
  items: InvoiceItem[];
  customer?: Customer;
  user: User;
}

interface InvoiceItem {
  id: string;                    // UUID
  invoice_id: string;            // UUID, foreign key
  product_id: string;            // UUID, foreign key
  quantity: number;              // Integer, required
  unit_price: number;            // Decimal(10,2), required
  tax_rate: number;              // Decimal(5,2), default: 0
  discount: number;              // Decimal(10,2), default: 0
  total: number;                 // Decimal(12,2), required
  created_at: Date;
  updated_at: Date;

  // Relations
  product: Product;
}
```

### 5.5 Category Model

```typescript
interface Category {
  id: string;                    // UUID
  name: string;                  // Max 50 chars, required
  description?: string;          // Max 255 chars
  icon?: string;                 // Max 50 chars (emoji or icon name)
  company_id: string;            // UUID, foreign key
  created_at: Date;
  updated_at: Date;
}
```

### 5.6 Expense Model

```typescript
interface Expense {
  id: string;                    // UUID
  expense_number: string;        // Auto-generated: EXP-YYYYMMDD-####
  title: string;                 // Max 100 chars, required
  description?: string;          // Text
  amount: number;                // Decimal(10,2), required
  category: 'rent' | 'utilities' | 'salaries' | 'supplies' |
            'marketing' | 'transport' | 'maintenance' | 'other';
  payment_method: 'cash' | 'card' | 'transfer' | 'check';
  date: Date;                    // Required
  status: 'pending' | 'approved' | 'rejected';
  approved_by?: string;          // UUID, user_id
  rejected_reason?: string;      // Text
  receipt_url?: string;          // Max 255 chars
  company_id: string;            // UUID, foreign key
  user_id: string;               // UUID, foreign key (creator)
  created_at: Date;
  updated_at: Date;
}
```

### 5.7 Stock Movement Model

```typescript
interface StockMovement {
  id: string;                    // UUID
  product_id: string;            // UUID, foreign key
  type: 'in' | 'out' | 'adjustment' | 'sale';
  quantity: number;              // Integer, required
  previous_stock: number;        // Integer
  new_stock: number;             // Integer
  reason?: string;               // Max 255 chars
  reference?: string;            // Max 100 chars (PO number, invoice number, etc.)
  notes?: string;                // Text
  company_id: string;            // UUID, foreign key
  user_id: string;               // UUID, foreign key
  created_at: Date;

  // Relations
  product: Product;
  user: User;
}
```

### 5.8 Company Model

```typescript
interface Company {
  id: string;                    // UUID
  name: string;                  // Max 100 chars, required
  email?: string;                // Max 100 chars
  phone?: string;                // Max 20 chars
  address?: string;              // Max 255 chars
  city?: string;                 // Max 100 chars
  state?: string;                // Max 100 chars
  country?: string;              // Max 100 chars
  postal_code?: string;          // Max 20 chars
  tax_id?: string;               // Max 50 chars
  logo_url?: string;             // Max 255 chars
  website?: string;              // Max 255 chars
  currency: string;              // Max 3 chars, default: 'USD'
  timezone: string;              // Max 50 chars, default: 'UTC'
  is_active: boolean;            // Default: true
  created_at: Date;
  updated_at: Date;
}
```

### 5.9 Subscription Model

```typescript
interface Subscription {
  id: string;                    // UUID
  company_id: string;            // UUID, foreign key
  plan_type: 'free' | 'basic' | 'premium' | 'enterprise';
  status: 'active' | 'cancelled' | 'expired' | 'trial';
  start_date: Date;
  end_date?: Date;
  trial_ends_at?: Date;
  payment_method?: 'maxicash' | 'card' | 'bank';
  amount?: number;               // Decimal(10,2)
  max_users?: number;
  max_products?: number;
  features: string[];            // JSON array
  created_at: Date;
  updated_at: Date;
}
```

### 5.10 Team Model

```typescript
interface Team {
  id: string;                    // UUID
  name: string;                  // Max 100 chars, required
  description?: string;          // Max 255 chars
  company_id: string;            // UUID, foreign key
  created_at: Date;
  updated_at: Date;

  // Relations
  members: User[];
}
```

---

## 6. Business Rules

### 6.1 Multi-Tenancy & Data Isolation

**Critical Security Rule:**

All data is **strictly isolated by company_id**. Users can ONLY access data belonging to their own company.

**Implementation:**
- Every request automatically filters by `company_id` from JWT token
- Cross-company access returns `404 Not Found` (not 403 Forbidden)
- Same barcode/SKU can exist in multiple companies
- Email is unique per company (not globally)

**Example:**
```
Company A can have: email="john@test.com"
Company B can have: email="john@test.com"
Both are valid and isolated
```

### 6.2 User Roles & Permissions

| Role | Permissions |
|------|-------------|
| **admin** | Full access to all features and data |
| **supervisor** | Manage inventory, approve expenses, view all reports, cannot manage users or company settings |
| **operator** | Create/edit products, customers, invoices, stock movements; view basic reports |
| **cashier** | Create invoices, view products and customers (read-only); no access to expenses, reports, or settings |

**Permission Matrix:**

| Feature | Admin | Supervisor | Operator | Cashier |
|---------|-------|------------|----------|---------|
| Users Management | ✅ | ❌ | ❌ | ❌ |
| Company Settings | ✅ | ❌ | ❌ | ❌ |
| Subscriptions | ✅ | ❌ | ❌ | ❌ |
| Products (Create/Edit) | ✅ | ✅ | ✅ | ❌ |
| Products (View) | ✅ | ✅ | ✅ | ✅ |
| Products (Delete) | ✅ | ✅ | ❌ | ❌ |
| Customers (Create/Edit) | ✅ | ✅ | ✅ | ❌ |
| Customers (View) | ✅ | ✅ | ✅ | ✅ |
| Invoices (Create) | ✅ | ✅ | ✅ | ✅ |
| Invoices (Cancel) | ✅ | ✅ | ❌ | ❌ |
| Expenses (Create) | ✅ | ✅ | ✅ | ❌ |
| Expenses (Approve/Reject) | ✅ | ✅ | ❌ | ❌ |
| Stock Management | ✅ | ✅ | ✅ | ❌ |
| Reports | ✅ | ✅ | ✅ (basic) | ❌ |
| Teams | ✅ | ❌ | ❌ | ❌ |

### 6.3 Stock Management Rules

**Automatic Stock Deduction:**
- Creating an invoice **automatically deducts** product stock
- Quantity must be available (current_stock >= quantity)
- Creates a stock movement record with type='sale'

**Stock Adjustment:**
- `stock/in`: Increases stock (purchase orders, returns)
- `stock/out`: Decreases stock (damaged, lost, theft)
- `stock/adjust`: Sets exact quantity (physical count)

**Low Stock Alerts:**
- Products with `current_stock <= min_stock_level` are flagged
- GET `/stock/low-stock` returns all low-stock products

### 6.4 Invoice Rules

**Invoice Number Generation:**
- Format: `INV-YYYYMMDD-####`
- Example: `INV-20260217-0001`
- Auto-incremented per day per company

**Calculations:**
```
Item Total = (unit_price * quantity) - discount + (unit_price * quantity * tax_rate / 100)
Invoice Subtotal = Sum of (unit_price * quantity) for all items
Invoice Tax = Sum of tax amounts for all items
Invoice Total = Subtotal + Tax - Discount
```

**Payment Status:**
- `pending`: Invoice created, awaiting payment
- `paid`: Payment completed
- `cancelled`: Invoice cancelled, stock restored
- `refunded`: Payment refunded, stock restored

**Cancellation:**
- Only `pending` and `paid` invoices can be cancelled
- Cancelling restores product stock
- Creates stock movement record

### 6.5 Expense Rules

**Approval Workflow:**
1. User creates expense (status: `pending`)
2. Admin/Supervisor reviews expense
3. Approve → status: `approved`
4. Reject → status: `rejected` (with reason)

**Only approved expenses** are included in profit/loss calculations.

### 6.6 Customer VIP Status

**Auto-calculation:**
- Customer becomes VIP when `total_purchases >= VIP_THRESHOLD`
- Default threshold: $1000 (configurable in .env)
- Updated automatically on each invoice

### 6.7 Pagination

**Default Behavior:**
- Default `limit`: 20 items
- Maximum `limit`: 100 items
- Default `page`: 1

**Query Parameters:**
```
?page=2&limit=50
```

**Response includes pagination metadata:**
```json
{
  "pagination": {
    "currentPage": 2,
    "totalPages": 10,
    "totalItems": 500,
    "itemsPerPage": 50,
    "hasNextPage": true,
    "hasPrevPage": true
  }
}
```

### 6.8 Search & Filtering

**Search Implementation:**
- Case-insensitive
- Searches multiple fields (name, barcode, SKU, email, etc.)
- Uses SQL LIKE with wildcards

**Example:**
```
GET /products?search=laptop
Searches in: name, barcode, sku, description
```

**Date Filtering:**
```
GET /invoices?date_from=2026-01-01&date_to=2026-12-31
```

**Status Filtering:**
```
GET /invoices?payment_status=paid
GET /expenses?status=approved
```

### 6.9 Rate Limiting

**Limits:**
- General API: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes

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

### 6.10 Field Naming Convention

**CRITICAL: All database fields use snake_case, NOT camelCase**

```javascript
// ✅ CORRECT
{
  "product_id": "uuid",
  "purchase_price": 100.00,
  "selling_price": 150.00,
  "current_stock": 50
}

// ❌ WRONG
{
  "productId": "uuid",
  "purchasePrice": 100.00,
  "sellingPrice": 150.00,
  "currentStock": 50
}
```

**See `API_FIELD_NAMING_GUIDE.md` for complete reference.**

---

## 7. Error Handling

### 7.1 Error Response Structure

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message",
    "details": {
      // Additional context (optional)
    }
  }
}
```

### 7.2 Common Error Codes

| Code | Status | Description |
|------|--------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `MISSING_REQUIRED_FIELD` | 400 | Required field not provided |
| `INVALID_FORMAT` | 400 | Field format is invalid |
| `UNAUTHORIZED` | 401 | Missing or invalid token |
| `TOKEN_EXPIRED` | 401 | Access token expired |
| `INVALID_CREDENTIALS` | 401 | Wrong email or password |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `DUPLICATE_ENTRY` | 409 | Resource already exists |
| `INSUFFICIENT_STOCK` | 422 | Not enough stock for operation |
| `INVALID_OPERATION` | 422 | Operation not allowed |
| `RATE_LIMIT_EXCEEDED` | 429 | Too many requests |
| `INTERNAL_SERVER_ERROR` | 500 | Server error |
| `DATABASE_ERROR` | 500 | Database operation failed |

### 7.3 Validation Errors

**Example:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Validation failed",
    "details": {
      "email": "Invalid email format",
      "password": "Password must be at least 8 characters",
      "purchase_price": "Must be a positive number"
    }
  }
}
```

### 7.4 Authentication Errors

**Missing Token (401):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Authentication required"
  }
}
```

**Invalid Token (401):**
```json
{
  "success": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Invalid or expired token"
  }
}
```

**Insufficient Permissions (403):**
```json
{
  "success": false,
  "error": {
    "code": "FORBIDDEN",
    "message": "Insufficient permissions to perform this action"
  }
}
```

### 7.5 Resource Errors

**Not Found (404):**
```json
{
  "success": false,
  "error": {
    "code": "NOT_FOUND",
    "message": "Product not found"
  }
}
```

**Duplicate Entry (409):**
```json
{
  "success": false,
  "error": {
    "code": "DUPLICATE_ENTRY",
    "message": "Product with this barcode already exists",
    "details": {
      "field": "barcode",
      "value": "PROD-001"
    }
  }
}
```

### 7.6 Business Logic Errors

**Insufficient Stock (422):**
```json
{
  "success": false,
  "error": {
    "code": "INSUFFICIENT_STOCK",
    "message": "Not enough stock available",
    "details": {
      "product_id": "product-uuid",
      "required": 10,
      "available": 5
    }
  }
}
```

---

## 8. Testing Tools

### 8.1 Postman Collection

**Location:** `docs/api/postman_collection_v2.json`

**How to Import:**
1. Open Postman
2. Click "Import"
3. Select `postman_collection_v2.json`
4. Import `postman_environment.json` for environment variables

**Collection Includes:**
- Authentication flows
- CRUD operations for all resources
- Multi-tenant isolation tests
- Security tests
- Error scenario tests

### 8.2 Postman Environment

**Location:** `docs/api/postman_environment.json`

**Environment Variables:**
```json
{
  "base_url": "http://localhost:5000/api/v1",
  "access_token_a": "",
  "refresh_token_a": "",
  "company_id_a": "",
  "product_id": "",
  "customer_id": "",
  "invoice_id": ""
}
```

**Tokens are automatically saved** after successful login/register.

### 8.3 Testing Workflow

**Recommended Order:**

1. **Health Check**
   - GET `/health`

2. **Register Company**
   - POST `/auth/register`
   - Saves token automatically

3. **Create Categories**
   - POST `/categories`

4. **Create Products**
   - POST `/products`
   - Save product IDs

5. **Create Customers**
   - POST `/customers`
   - Save customer IDs

6. **Create Invoice**
   - POST `/invoices`
   - Uses product & customer IDs
   - Verify stock deduction

7. **View Reports**
   - GET `/reports/dashboard`

8. **Multi-Tenant Test**
   - Register second company
   - Verify data isolation

### 8.4 Health Check

**Endpoint:** `GET /health`

**Response:**
```json
{
  "success": true,
  "message": "API is running",
  "timestamp": "2026-02-17T10:30:00Z"
}
```

### 8.5 API Root

**Endpoint:** `GET /api/v1`

**Response:**
```json
{
  "success": true,
  "message": "Inventory Management System API",
  "version": "1.0.0",
  "environment": "development",
  "documentation": {
    "auth": {...},
    "products": {...},
    "invoices": {...}
    // Complete endpoint listing
  }
}
```

---

## 9. Best Practices for Frontend Integration

### 9.1 Token Management

```javascript
// Store tokens
localStorage.setItem('access_token', token);
localStorage.setItem('refresh_token', refreshToken);

// Get token
const token = localStorage.getItem('access_token');

// Clear on logout
localStorage.removeItem('access_token');
localStorage.removeItem('refresh_token');
```

### 9.2 Automatic Token Refresh

```javascript
// Axios interceptor example
axios.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    if (error.response.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem('refresh_token');
      const { data } = await axios.post('/auth/refresh', { refreshToken });

      localStorage.setItem('access_token', data.data.token);
      localStorage.setItem('refresh_token', data.data.refreshToken);

      originalRequest.headers['Authorization'] = `Bearer ${data.data.token}`;
      return axios(originalRequest);
    }

    return Promise.reject(error);
  }
);
```

### 9.3 API Client Setup

```javascript
// api.js
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api/v1';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to requests
apiClient.interceptors.request.use(config => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle errors globally
apiClient.interceptors.response.use(
  response => response.data,
  error => {
    if (error.response?.status === 401) {
      // Redirect to login
      window.location.href = '/login';
    }
    return Promise.reject(error.response?.data || error);
  }
);

export default apiClient;
```

### 9.4 Usage Examples

```javascript
// products.js
import apiClient from './api';

// Get products
export const getProducts = async (params) => {
  return await apiClient.get('/products', { params });
};

// Create product
export const createProduct = async (data) => {
  return await apiClient.post('/products', data);
};

// Update product
export const updateProduct = async (id, data) => {
  return await apiClient.put(`/products/${id}`, data);
};

// Delete product
export const deleteProduct = async (id) => {
  return await apiClient.delete(`/products/${id}`);
};
```

### 9.5 Error Handling

```javascript
// In component
try {
  const response = await createProduct(formData);
  if (response.success) {
    showSuccessMessage('Product created');
    navigate('/products');
  }
} catch (error) {
  if (error.error?.code === 'DUPLICATE_ENTRY') {
    showError('Product with this barcode already exists');
  } else if (error.error?.code === 'VALIDATION_ERROR') {
    setErrors(error.error.details);
  } else {
    showError(error.error?.message || 'An error occurred');
  }
}
```

### 9.6 Pagination Handling

```javascript
const [products, setProducts] = useState([]);
const [pagination, setPagination] = useState({});
const [page, setPage] = useState(1);

useEffect(() => {
  fetchProducts();
}, [page]);

const fetchProducts = async () => {
  const response = await getProducts({ page, limit: 20 });
  setProducts(response.data.items);
  setPagination(response.data.pagination);
};

// Render pagination
const renderPagination = () => (
  <div>
    <button
      disabled={!pagination.hasPrevPage}
      onClick={() => setPage(page - 1)}
    >
      Previous
    </button>
    <span>Page {pagination.currentPage} of {pagination.totalPages}</span>
    <button
      disabled={!pagination.hasNextPage}
      onClick={() => setPage(page + 1)}
    >
      Next
    </button>
  </div>
);
```

### 9.7 Form Data Preparation

```javascript
// Always use snake_case for API fields
const prepareProductData = (formData) => ({
  name: formData.name,
  barcode: formData.barcode,
  category_id: formData.categoryId,        // Convert to snake_case
  purchase_price: formData.purchasePrice,  // Convert to snake_case
  selling_price: formData.sellingPrice,    // Convert to snake_case
  current_stock: formData.currentStock,    // Convert to snake_case
  min_stock_level: formData.minStockLevel  // Convert to snake_case
});

// Submit to API
await createProduct(prepareProductData(formData));
```

### 9.8 Date Formatting

```javascript
// Format dates for API (ISO 8601)
const formatDate = (date) => {
  return new Date(date).toISOString();
};

// Display dates in UI
const displayDate = (isoString) => {
  return new Date(isoString).toLocaleDateString();
};

// Date range filter
const getReportData = async (startDate, endDate) => {
  return await apiClient.get('/reports/sales', {
    params: {
      start_date: formatDate(startDate),
      end_date: formatDate(endDate)
    }
  });
};
```

---

## 10. Additional Resources

### Documentation Files

- `API_QUICK_REFERENCE.md` - Quick endpoint reference
- `API_FIELD_NAMING_GUIDE.md` - Complete field naming guide
- `POSTMAN_TESTING_GUIDE.md` - Detailed Postman testing guide
- `BACKEND_SPECIFICATION.md` - Complete technical specification
- `TESTING_GUIDE.md` - Testing strategy and examples

### Support

For questions or issues:
- Check documentation first
- Review Postman collection examples
- Verify field naming (snake_case)
- Check HTTP status codes and error messages
- Review business rules section

---

## Summary Checklist

✅ **Base URL configured** (development & production)
✅ **Authentication flow understood** (register, login, token refresh)
✅ **Token storage implemented** (localStorage or state management)
✅ **API client setup** (axios/fetch with interceptors)
✅ **Error handling implemented** (global & component-level)
✅ **Field naming convention followed** (snake_case for API)
✅ **Pagination implemented** (with metadata)
✅ **Response format understood** (success/error structure)
✅ **Role-based UI** (show/hide based on user role)
✅ **Multi-tenancy respected** (all data filtered by company_id)
✅ **Postman collection imported** (for testing)
✅ **Date formatting standardized** (ISO 8601)

---

**Last Updated:** February 17, 2026
**Version:** 1.0.0
**Contact:** Mukapps Development Team

For the most up-to-date API documentation, always refer to the `/api/v1` endpoint which provides a complete list of available endpoints and their descriptions.
