# API Testing - Complete Documentation Index

**All Testing Resources in One Place**

---

## 📚 Available Testing Guides

### 🚀 Quick Start (Recommended First)
**`POSTMAN_QUICK_START.md`**
- Get started in 5 minutes
- Import Postman collection
- Run first tests
- Verify system works

### 📖 Complete Testing Guide
**`POSTMAN_COMPLETE_TESTING_GUIDE.md`**
- 50+ endpoints documented
- Request/response examples
- Security tests
- Multi-tenant isolation tests
- Step-by-step workflows

### ✅ System Validation
**`SYSTEM_FOUNDATION_VALIDATION.md`**
- Complete validation report
- Database structure verification
- Security audit
- Multi-tenant isolation confirmation

### 🧪 Manual Test Scenarios
**`MULTI_TENANT_VALIDATION_TESTS.md`**
- Step-by-step test procedures
- Company isolation tests
- Role permission tests
- Database constraint validation

---

## 📦 Postman Collection Files

| File | Purpose |
|------|---------|
| `docs/api/postman_collection_v2.json` | Importable Postman collection with 23 requests |
| `docs/api/postman_environment.json` | Pre-configured environment variables |

---

## 🎯 Getting Started

### Step 1: Import to Postman
```
1. Open Postman
2. Import: docs/api/postman_collection_v2.json
3. Import: docs/api/postman_environment.json
4. Select environment: "Inventory API - Testing"
```

### Step 2: Start Server
```bash
npm start
```

### Step 3: Run Basic Test
```
1. Authentication → 1.1 Register Company A
2. Categories → 3.1 Create Category
3. Products → 4.1 Create Product
4. Customers → 5.1 Create Customer
5. Invoices → 6.1 Create Invoice
6. Invoices → 6.3 Verify Stock Deduction
```

**Result:** System validated! ✅

---

## 🔑 Authentication

```bash
POST /api/v1/auth/login
{
  "email": "admin@example.com",
  "password": "your_password"
}
```

**Remember:** All endpoints need `Authorization: Bearer YOUR_TOKEN` header!

---

## 📋 Invoices

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/invoices` | Create invoice |
| GET | `/invoices` | List all invoices |
| GET | `/invoices/:id` | Get invoice details |
| GET | `/invoices/search?q=INV` | Search invoices |
| GET | `/invoices/stats` | Invoice statistics |
| GET | `/invoices/pending` | Pending invoices |
| GET | `/invoices/overdue` | Overdue invoices |
| GET | `/invoices/:id/pdf` | Download PDF |
| PUT | `/invoices/:id` | Update invoice |
| POST | `/invoices/:id/send` | Email invoice |
| POST | `/invoices/:id/pay` | Record payment |
| POST | `/invoices/:id/cancel` | Cancel invoice |
| POST | `/invoices/:id/void` | Void (Admin/Manager) |
| DELETE | `/invoices/:id` | Delete (Admin) |

### Create Invoice Example
```json
{
  "customerId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 5,
      "unitPrice": 29.99,
      "taxRate": 15,
      "discount": 0
    }
  ],
  "paymentMethod": "cash",
  "paymentStatus": "paid",
  "discount": 0,
  "notes": "Optional notes"
}
```

---

## 📊 Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/reports/dashboard` | Dashboard overview |
| GET | `/reports/sales` | Sales report |
| GET | `/reports/profit` | Profit report |
| GET | `/reports/inventory` | Inventory report |
| GET | `/reports/customers` | Customer report |
| GET | `/reports/expenses` | Expenses report |
| GET | `/reports/top-products` | Best sellers |
| GET | `/reports/low-performing` | Worst sellers |
| GET | `/reports/revenue-trend` | Revenue trends |
| GET | `/reports/export` | Export report |

### Query Parameters
```
?period=month
?startDate=2024-01-01&endDate=2024-12-31
?limit=10
```

**Valid periods:** `today`, `week`, `month`, `year`, `custom`

---

## 📦 Stock

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/stock/movements` | Create movement |
| GET | `/stock/movements` | List movements |
| GET | `/stock/movements/:id` | Get movement |
| GET | `/stock/low-stock` | Low stock alert |
| GET | `/stock/out-of-stock` | Out of stock |
| GET | `/stock/valuation` | Stock value |
| GET | `/stock/history/:productId` | Product history |
| POST | `/stock/adjust` | Adjust (Admin/Manager) |
| POST | `/stock/transfer` | Transfer stock |

### Create Movement Example
```json
{
  "productId": "uuid",
  "type": "in",
  "quantity": 100,
  "reason": "New stock received",
  "reference": "PO-2024-001"
}
```

**Movement types:** `in`, `out`, `adjustment`, `transfer`, `return`

### Adjust Stock Example
```json
{
  "productId": "uuid",
  "newStock": 150,
  "reason": "Physical count correction"
}
```

---

## 👥 Users

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/users` | Create user (Admin) |
| GET | `/users` | List all users |
| GET | `/users/profile` | Current user |
| GET | `/users/:id` | Get user |
| PUT | `/users/:id` | Update user |
| PUT | `/users/:id/password` | Change password |
| PUT | `/users/:id/role` | Update role (Admin) |
| POST | `/users/:id/deactivate` | Deactivate (Admin) |
| POST | `/users/:id/activate` | Activate (Admin) |
| DELETE | `/users/:id` | Delete (Admin) |

### Create User Example
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "role": "cashier",
  "phone": "+1234567890"
}
```

**Valid roles:** `admin`, `manager`, `cashier`

---

## 🔧 Quick Setup for Testing

### 1. Login and Get Token
```bash
POST /api/v1/auth/login
```
Save the `token` from response.

### 2. Create Test Data

**Product:**
```bash
POST /api/v1/products
{
  "name": "Test Product",
  "sellingPrice": 29.99,
  "purchasePrice": 15.00,
  "currentStock": 100
}
```

**Customer:**
```bash
POST /api/v1/customers
{
  "name": "Test Customer",
  "email": "test@example.com"
}
```

### 3. Test Invoice Flow
1. Create invoice → Get invoice ID
2. View invoice details
3. Generate PDF
4. Record payment
5. View stats

### 4. Test Stock Flow
1. Create stock movement
2. Check low stock
3. View valuation
4. Adjust stock

### 5. Test Reports
1. View dashboard
2. Get sales report
3. Export as PDF

---

## 💡 Common Query Parameters

### Pagination
```
?page=1&limit=20
```

### Search
```
?search=keyword
?q=search_term
```

### Filters
```
?status=active
?role=admin
?paymentStatus=paid
?type=in
```

### Date Range
```
?startDate=2024-01-01&endDate=2024-12-31
?period=month
```

---

## ✅ Response Format

### Success (200/201)
```json
{
  "success": true,
  "data": { ... },
  "message": "Operation successful"
}
```

### Error (4xx/5xx)
```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": { ... }
  }
}
```

---

## 🎯 Role Access Matrix

| Feature | Admin | Manager | Cashier |
|---------|-------|---------|---------|
| View Invoices | ✅ | ✅ | ✅ |
| Create Invoice | ✅ | ✅ | ✅ |
| Void Invoice | ✅ | ✅ | ❌ |
| Delete Invoice | ✅ | ❌ | ❌ |
| View Reports | ✅ | ✅ | ✅ |
| Stock Movements | ✅ | ✅ | ✅ |
| Adjust Stock | ✅ | ✅ | ❌ |
| Manage Users | ✅ | ❌ | ❌ |

---

## 📱 Postman Import

Import the collection:
```
Postman_Complete_API_Collection.json
```

Set variables:
- `base_url`: http://localhost:5000/api/v1
- `token`: Your JWT token
- `product_id`: Test product UUID
- `customer_id`: Test customer UUID

---

## 🚀 Testing Order

1. **Auth** → Login → Get token
2. **Setup** → Create products & customers
3. **Invoices** → Create, view, update, pay
4. **Stock** → Movements, adjustments, transfers
5. **Reports** → Dashboard, sales, inventory
6. **Users** → Create, update, manage (if admin)

---

## 📚 All Documentation Files

### Testing & Validation
- **`POSTMAN_QUICK_START.md`** - 5-minute quick start
- **`POSTMAN_COMPLETE_TESTING_GUIDE.md`** - Complete endpoint documentation (200+ pages)
- **`SYSTEM_FOUNDATION_VALIDATION.md`** - System validation report
- **`MULTI_TENANT_VALIDATION_TESTS.md`** - Manual test scenarios
- **`FOUNDATION_QUICK_REFERENCE.md`** - System status overview
- **`API_TESTING_QUICK_REFERENCE.md`** - This file

### API & Database
- **`API_QUICK_REFERENCE.md`** - API endpoints reference
- **`API_FIELD_NAMING_GUIDE.md`** - Field naming conventions
- **`DATABASE_AND_MODELS_SUMMARY.md`** - Database schema
- **`BACKEND_SPECIFICATION.md`** - Backend architecture

### Setup & Configuration
- **`QUICK_START_CHECKLIST.md`** - Setup checklist
- **`SETUP.md`** - Detailed setup instructions
- **`README.md`** - Project overview

---

## 🎉 You're All Set!

Choose your path:

**New to the system?** → Start with `POSTMAN_QUICK_START.md`

**Need complete reference?** → See `POSTMAN_COMPLETE_TESTING_GUIDE.md`

**Validating security?** → Check `MULTI_TENANT_VALIDATION_TESTS.md`

**System overview?** → Read `SYSTEM_FOUNDATION_VALIDATION.md`
