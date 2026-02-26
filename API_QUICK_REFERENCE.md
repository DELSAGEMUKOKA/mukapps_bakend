# API Quick Reference Card

Quick reference for testing the Inventory Management API with Insomnia/Postman.

## Base Configuration

```
Base URL: http://localhost:5000/api/v1
Health Check: http://localhost:5000/health
```

## Authentication Flow

### 1. Register (No Auth Required)
```
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123",
  "companyName": "My Company",
  "phone": "+1234567890"
}

Response: { token, user, company }
```

### 2. Login (No Auth Required)
```
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}

Response: { token, user }
```

### 3. Get Current User (Auth Required)
```
GET /auth/me
Authorization: Bearer {token}

Response: { user }
```

### 4. Logout (Auth Required)
```
POST /auth/logout
Authorization: Bearer {token}

Response: { message: "Logged out successfully" }
```

## Products

### Create Product
```
POST /products
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Laptop Dell XPS 15",
  "barcode": "DELL-001",
  "description": "15-inch laptop",
  "purchasePrice": 800,
  "sellingPrice": 1200,
  "currentStock": 10,
  "minStockLevel": 3,
  "unit": "piece"
}
```

### Get All Products
```
GET /products?page=1&limit=20&search=laptop
Authorization: Bearer {token}
```

### Get Product by ID
```
GET /products/{id}
Authorization: Bearer {token}
```

### Get Product by Barcode
```
GET /products/barcode/{barcode}
Authorization: Bearer {token}
```

### Update Product
```
PUT /products/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "sellingPrice": 1300,
  "currentStock": 15
}
```

### Delete Product
```
DELETE /products/{id}
Authorization: Bearer {token}
```

## Categories

### Create Category
```
POST /categories
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Electronics",
  "description": "Electronic devices"
}
```

### Get All Categories
```
GET /categories
Authorization: Bearer {token}
```

### Update Category
```
PUT /categories/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Electronics"
}
```

### Delete Category
```
DELETE /categories/{id}
Authorization: Bearer {token}
```

## Customers

### Create Customer
```
POST /customers
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Jane Smith",
  "email": "jane@customer.com",
  "phone": "+1234567890",
  "address": "123 Main St"
}
```

### Get All Customers
```
GET /customers?page=1&limit=20&search=jane
Authorization: Bearer {token}
```

### Get Customer by ID
```
GET /customers/{id}
Authorization: Bearer {token}
```

### Update Customer
```
PUT /customers/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "address": "456 New Street"
}
```

## Invoices

### Create Invoice
```
POST /invoices
Authorization: Bearer {token}
Content-Type: application/json

{
  "customerId": "customer-uuid",
  "items": [
    {
      "productId": "product-uuid",
      "quantity": 2,
      "unitPrice": 1200,
      "taxRate": 10,
      "discount": 0
    }
  ],
  "paymentMethod": "cash",
  "paymentStatus": "paid",
  "discount": 0,
  "notes": "Thank you"
}
```

### Get All Invoices
```
GET /invoices?page=1&limit=20&paymentStatus=paid
Authorization: Bearer {token}
```

### Get Invoice by ID
```
GET /invoices/{id}
Authorization: Bearer {token}
```

### Cancel Invoice
```
POST /invoices/{id}/cancel
Authorization: Bearer {token}
```

## Expenses

### Create Expense
```
POST /expenses
Authorization: Bearer {token}
Content-Type: application/json

{
  "category": "Rent",
  "amount": 1500,
  "description": "Office rent",
  "expenseDate": "2024-01-01"
}
```

### Get All Expenses
```
GET /expenses?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

### Update Expense
```
PUT /expenses/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "amount": 1600
}
```

### Delete Expense
```
DELETE /expenses/{id}
Authorization: Bearer {token}
```

## Stock Management

### Add Stock
```
POST /stock/in
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product-uuid",
  "quantity": 50,
  "reason": "Purchase order #123",
  "notes": "From supplier ABC"
}
```

### Remove Stock
```
POST /stock/out
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product-uuid",
  "quantity": 10,
  "reason": "Damaged goods"
}
```

### Adjust Stock
```
POST /stock/adjust
Authorization: Bearer {token}
Content-Type: application/json

{
  "productId": "product-uuid",
  "newQuantity": 100,
  "reason": "Physical count"
}
```

### Get Stock Movements
```
GET /stock/movements?productId={id}&limit=50
Authorization: Bearer {token}
```

### Get Low Stock Alerts
```
GET /stock/low-stock
Authorization: Bearer {token}
```

## Reports

### Sales Report
```
GET /reports/sales?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

### Inventory Report
```
GET /reports/inventory
Authorization: Bearer {token}
```

### Profit/Loss Report
```
GET /reports/profit?period=monthly&year=2024
Authorization: Bearer {token}
```

### Expense Report
```
GET /reports/expenses?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}
```

### Dashboard Summary
```
GET /reports/dashboard
Authorization: Bearer {token}
```

## Users

### Create User
```
POST /users
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Staff User",
  "email": "staff@company.com",
  "password": "SecurePass123",
  "role": "operator",
  "phone": "+1234567890"
}
```

### Get All Users
```
GET /users
Authorization: Bearer {token}
```

### Update User
```
PUT /users/{id}
Authorization: Bearer {token}
Content-Type: application/json

{
  "role": "supervisor"
}
```

### Delete User
```
DELETE /users/{id}
Authorization: Bearer {token}
```

## Teams

### Create Team
```
POST /teams
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Sales Team",
  "description": "Sales department"
}
```

### Get All Teams
```
GET /teams
Authorization: Bearer {token}
```

## Companies

### Get Company Info
```
GET /companies/me
Authorization: Bearer {token}
```

### Update Company
```
PUT /companies/me
Authorization: Bearer {token}
Content-Type: application/json

{
  "name": "Updated Company Name",
  "address": "123 Business St",
  "phone": "+1234567890"
}
```

## Query Parameters

### Pagination
```
?page=1&limit=20
```

### Search
```
?search=laptop
```

### Filtering
```
?paymentStatus=paid
?startDate=2024-01-01&endDate=2024-12-31
?category=Electronics
```

### Sorting
```
?sortBy=createdAt&order=DESC
```

## Common Headers

```
Content-Type: application/json
Authorization: Bearer {your-jwt-token}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error description",
    "details": {}
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
      "itemsPerPage": 20
    }
  }
}
```

## HTTP Status Codes

- `200 OK` - Success
- `201 Created` - Resource created
- `400 Bad Request` - Validation error
- `401 Unauthorized` - Not authenticated
- `403 Forbidden` - Not authorized
- `404 Not Found` - Resource not found
- `409 Conflict` - Duplicate resource
- `500 Internal Server Error` - Server error

## Role-Based Access

| Role | Permissions |
|------|-------------|
| **Admin** | Full access to all endpoints |
| **Supervisor** | Manage products, invoices, expenses, reports |
| **Operator** | Create/edit products, customers, invoices |
| **Cashier** | Create invoices, view products |

## Testing Workflow

1. **Register** new company → Save token
2. **Create products** → Get product IDs
3. **Create customers** → Get customer IDs
4. **Create invoice** → Uses product & customer IDs
5. **Check reports** → View sales data
6. **Verify database** → Check data in phpMyAdmin

## Quick Test Commands (curl)

### Health Check
```bash
curl http://localhost:5000/health
```

### Register
```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Test User","email":"test@example.com","password":"Test123","companyName":"Test Co"}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Test123"}'
```

### Get Products (with token)
```bash
curl http://localhost:5000/api/v1/products \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

## Tips

1. **Save your token** after registration/login
2. **Use environment variables** in Insomnia for base_url and token
3. **Test in order**: Auth → Products → Customers → Invoices
4. **Check database** after each operation in phpMyAdmin
5. **Monitor logs** in terminal for debugging
6. **Use pagination** for large datasets
7. **Test error cases** with invalid data

## Common Issues

| Issue | Solution |
|-------|----------|
| 401 Unauthorized | Check token is set correctly |
| Token expired | Login again to get new token |
| Validation error | Check required fields |
| Duplicate error | Resource already exists |
| Not found | Verify ID exists in database |
| Port in use | Stop other servers on port 5000 |

## Environment Setup

### Insomnia Environment
```json
{
  "base_url": "http://localhost:5000/api/v1",
  "token": "your-jwt-token-here",
  "product_id": "",
  "customer_id": "",
  "invoice_id": ""
}
```

### .env Configuration
```env
NODE_ENV=development
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_NAME=inventory_management
DB_USER=root
DB_PASSWORD=
JWT_SECRET=your-jwt-secret
```

---

**Last Updated**: 2024-02-05
**API Version**: v1
**Base URL**: http://localhost:5000/api/v1

For detailed documentation, see [TESTING_GUIDE.md](TESTING_GUIDE.md)
