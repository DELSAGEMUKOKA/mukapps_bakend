# Testing Guide: Insomnia + XAMPP

This guide will help you test the Inventory Management Backend API using Insomnia and XAMPP (MySQL).

## Prerequisites

- **XAMPP** installed with MySQL running
- **Insomnia** installed - [Download here](https://insomnia.rest/download)
- **Node.js 18+** installed
- Project dependencies installed (`npm install`)

## Step 1: Setup XAMPP MySQL Database

### 1.1 Start XAMPP

1. Open XAMPP Control Panel
2. Start **Apache** (optional, for phpMyAdmin)
3. Start **MySQL**

### 1.2 Create Database

#### Option A: Using phpMyAdmin (Recommended)

1. Open browser and go to: `http://localhost/phpmyadmin`
2. Click **New** in the left sidebar
3. Database name: `# Testing Guide: Insomnia + XAMPP

This guide will help you test the Inventory Management Backend API using Insomnia and XAMPP (MySQL).

## Prerequisites

- **XAMPP** installed with MySQL running
- **Insomnia** installed - [Download here](https://insomnia.rest/download)
- **Node.js 18+** installed
- Project dependencies installed (`npm install`)

## Step 1: Setup XAMPP MySQL Database

### 1.1 Start XAMPP

1. Open XAMPP Control Panel
2. Start **Apache** (optional, for phpMyAdmin)
3. Start **MySQL**

### 1.2 Create Database

#### Option A: Using phpMyAdmin (Recommended)

1. Open browser and go to: `http://localhost/phpmyadmin`
2. Click **New** in the left sidebar
3. Database name: `inventory_management`
4. Collation: `utf8mb4_unicode_ci`
5. Click **Create**

#### Option B: Using MySQL Command Line

1. Open XAMPP Control Panel
2. Click **Shell** button
3. Run these commands:

```bash
mysql -u root -p
# Press Enter (default: no password)
```

```sql
CREATE DATABASE inventory_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

SHOW DATABASES;
EXIT;
```

### 1.3 Configure Environment Variables

Edit your `.env` file:

```env
# Database Configuration for XAMPP
DB_HOST=localhost
DB_PORT=3306
DB_NAME=inventory_management
DB_USER=root
DB_PASSWORD=
# Leave password empty (XAMPP default)
```

## Step 2: Start the Backend Server

### 2.1 Install Dependencies

```bash
npm install
```

### 2.2 Start Development Server

```bash
npm run dev
```

You should see:

```
✅ Server started successfully
🚀 Server is running on http://localhost:5000
📊 Environment: development
🗄️  Database connected successfully
```

### 2.3 Verify Database Tables

1. Go to phpMyAdmin: `http://localhost/phpmyadmin`
2. Click on `inventory_management` database
3. You should see 11 tables automatically created:
   - companies
   - users
   - products
   - categories
   - customers
   - invoices
   - invoice_items
   - expenses
   - stock_movements
   - teams
   - subscriptions

## Step 3: Setup Insomnia

### 3.1 Create New Request Collection

1. Open Insomnia
2. Click **Create** → **Request Collection**
3. Name it: `Inventory Management API`

### 3.2 Configure Base Environment

1. Click **No Environment** dropdown
2. Select **Manage Environments**
3. Click **+** to create new environment
4. Name it: `Development`
5. Add this JSON:

```json
{
  "base_url": "http://localhost:5000/api/v1",
  "token": ""
}
```

6. Click **Done**
7. Select **Development** as active environment

## Step 4: Test the API

### Test 1: Health Check

**GET** `http://localhost:5000/health`

Expected Response (200 OK):
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 10,
  "database": {
    "status": "connected"
  }
}
```

### Test 2: Register Company & Admin User

**POST** `{{ _.base_url }}/auth/register`

Headers:
```
Content-Type: application/json
```

Body (JSON):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "TestPass123",
  "companyName": "Test Company",
  "phone": "+1234567890"
}
```

Expected Response (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "company_id": "uuid-here"
    },
    "company": {
      "id": "uuid-here",
      "name": "Test Company",
      "subscription_plan": "free"
    },
    "token": "jwt-token-here"
  }
}
```

**IMPORTANT:** Copy the `token` value!

### Test 3: Update Environment with Token

1. Go to **Manage Environments**
2. Update the `token` field with the token from registration:

```json
{
  "base_url": "http://localhost:5000/api/v1",
  "token": "paste-your-token-here"
}
```

### Test 4: Login

**POST** `{{ _.base_url }}/auth/login`

Headers:
```
Content-Type: application/json
```

Body (JSON):
```json
{
  "email": "john@example.com",
  "password": "TestPass123"
}
```

Expected Response (200 OK):
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "new-jwt-token-here"
  }
}
```

### Test 5: Get Current User (Protected Route)

**GET** `{{ _.base_url }}/auth/me`

Headers:
```
Authorization: Bearer {{ _.token }}
```

Expected Response (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

### Test 6: Create a Product

**POST** `{{ _.base_url }}/products`

Headers:
```
Content-Type: application/json
Authorization: Bearer {{ _.token }}
```

Body (JSON):
```json
{
  "name": "Laptop Dell XPS 15",
  "barcode": "DELL-XPS-15-2024",
  "description": "15-inch laptop with Intel i7",
  "purchasePrice": 800,
  "sellingPrice": 1200,
  "currentStock": 10,
  "minStockLevel": 3,
  "unit": "piece"
}
```

Expected Response (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "product-uuid",
    "name": "Laptop Dell XPS 15",
    "barcode": "DELL-XPS-15-2024",
    "purchasePrice": 800,
    "sellingPrice": 1200,
    "currentStock": 10,
    "minStockLevel": 3
  }
}
```

### Test 7: Get All Products

**GET** `{{ _.base_url }}/products?page=1&limit=20`

Headers:
```
Authorization: Bearer {{ _.token }}
```

Expected Response (200 OK):
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Laptop Dell XPS 15",
        "barcode": "DELL-XPS-15-2024",
        "currentStock": 10,
        "sellingPrice": 1200
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 20
    }
  }
}
```

### Test 8: Get Product by Barcode

**GET** `{{ _.base_url }}/products/barcode/DELL-XPS-15-2024`

Headers:
```
Authorization: Bearer {{ _.token }}
```

### Test 9: Create a Customer

**POST** `{{ _.base_url }}/customers`

Headers:
```
Content-Type: application/json
Authorization: Bearer {{ _.token }}
```

Body (JSON):
```json
{
  "name": "Jane Smith",
  "email": "jane@customer.com",
  "phone": "+1234567890",
  "address": "123 Main St, City"
}
```

### Test 10: Create an Invoice

**POST** `{{ _.base_url }}/invoices`

Headers:
```
Content-Type: application/json
Authorization: Bearer {{ _.token }}
```

Body (JSON):
```json
{
  "customerId": "customer-uuid-from-step-9",
  "items": [
    {
      "productId": "product-uuid-from-step-6",
      "quantity": 2,
      "unitPrice": 1200,
      "taxRate": 10,
      "discount": 0
    }
  ],
  "paymentMethod": "cash",
  "paymentStatus": "paid",
  "discount": 0,
  "notes": "Thank you for your purchase"
}
```

Expected Response: Invoice created with automatic stock deduction

## Step 5: Import Insomnia Collection (Quick Setup)

### 5.1 Create Collection File

Save this as `insomnia-collection.json`:

```json
{
  "resources": [
    {
      "name": "Health Check",
      "method": "GET",
      "url": "http://localhost:5000/health",
      "description": "Check API health status"
    },
    {
      "name": "Register",
      "method": "POST",
      "url": "{{ _.base_url }}/auth/register",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ],
      "body": {
        "mimeType": "application/json",
        "text": "{\n  \"name\": \"John Doe\",\n  \"email\": \"john@example.com\",\n  \"password\": \"TestPass123\",\n  \"companyName\": \"Test Company\",\n  \"phone\": \"+1234567890\"\n}"
      }
    },
    {
      "name": "Login",
      "method": "POST",
      "url": "{{ _.base_url }}/auth/login",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ],
      "body": {
        "mimeType": "application/json",
        "text": "{\n  \"email\": \"john@example.com\",\n  \"password\": \"TestPass123\"\n}"
      }
    },
    {
      "name": "Get Current User",
      "method": "GET",
      "url": "{{ _.base_url }}/auth/me",
      "headers": [
        {
          "name": "Authorization",
          "value": "Bearer {{ _.token }}"
        }
      ]
    },
    {
      "name": "Create Product",
      "method": "POST",
      "url": "{{ _.base_url }}/products",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        },
        {
          "name": "Authorization",
          "value": "Bearer {{ _.token }}"
        }
      ],
      "body": {
        "mimeType": "application/json",
        "text": "{\n  \"name\": \"Laptop Dell XPS 15\",\n  \"barcode\": \"DELL-XPS-15-2024\",\n  \"description\": \"15-inch laptop\",\n  \"purchasePrice\": 800,\n  \"sellingPrice\": 1200,\n  \"currentStock\": 10,\n  \"minStockLevel\": 3,\n  \"unit\": \"piece\"\n}"
      }
    },
    {
      "name": "Get All Products",
      "method": "GET",
      "url": "{{ _.base_url }}/products?page=1&limit=20",
      "headers": [
        {
          "name": "Authorization",
          "value": "Bearer {{ _.token }}"
        }
      ]
    }
  ]
}
```

### 5.2 Import into Insomnia

1. In Insomnia, click **Application** menu
2. Select **Preferences** → **Data** → **Import Data**
3. Select the `insomnia-collection.json` file
4. Click **Import**

## Troubleshooting

### Issue 1: Database Connection Failed

**Error:** `SequelizeConnectionError: connect ECONNREFUSED 127.0.0.1:3306`

**Solution:**
1. Check XAMPP MySQL is running (green light in XAMPP Control Panel)
2. Verify `.env` has correct database settings
3. Test MySQL connection:
   ```bash
   mysql -u root -p -h localhost
   ```

### Issue 2: Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Windows (XAMPP Shell or CMD)
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Or change port in .env
PORT=5001
```

### Issue 3: Token Expired

**Error:** `401 Unauthorized - Token expired`

**Solution:**
1. Login again to get a new token
2. Update token in Insomnia environment
3. Tokens expire after 7 days by default

### Issue 4: Tables Not Created

**Solution:**
1. Stop the server (Ctrl+C)
2. Delete database:
   ```sql
   DROP DATABASE inventory_management;
   CREATE DATABASE inventory_management;
   ```
3. Restart server - tables will be auto-created

### Issue 5: XAMPP MySQL Won't Start

**Solution:**
1. Check if port 3306 is in use by another application
2. Close Skype or other apps using port 3306
3. In XAMPP, click **Config** → **my.ini** and change port to 3307
4. Update `.env` file: `DB_PORT=3307`

## Testing Workflow Tips

### 1. Use Environment Variables

Always use `{{ _.base_url }}` and `{{ _.token }}` instead of hardcoding values.

### 2. Organize Requests in Folders

Create folders in Insomnia:
- 📁 Authentication
  - Register
  - Login
  - Get Me
  - Logout
- 📁 Products
  - Create Product
  - Get Products
  - Get Product by ID
  - Update Product
  - Delete Product
- 📁 Invoices
- 📁 Customers
- 📁 Reports

### 3. Save Response Examples

After successful requests, save the response as an example for reference.

### 4. Use Query Parameters

For GET requests with filters:
```
{{ _.base_url }}/products?search=laptop&page=1&limit=10
```

### 5. Test Error Cases

Try invalid requests to test error handling:
- Invalid credentials
- Missing required fields
- Duplicate entries
- Unauthorized access

## Viewing Data in phpMyAdmin

1. Open: `http://localhost/phpmyadmin`
2. Click `inventory_management` database
3. Click on any table to view data
4. Use **Browse** to see records
5. Use **SQL** tab to run custom queries

### Example Queries

```sql
-- View all companies
SELECT * FROM companies;

-- View all users
SELECT id, name, email, role, company_id FROM users;

-- View all products with stock
SELECT name, barcode, currentStock, minStockLevel
FROM products
WHERE currentStock <= minStockLevel;

-- View invoices with customer names
SELECT i.invoiceNumber, c.name, i.totalAmount, i.paymentStatus
FROM invoices i
JOIN customers c ON i.customerId = c.id;
```

## Quick Reference: Common Endpoints

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/health` | GET | No | API health check |
| `/api/v1/auth/register` | POST | No | Register company & admin |
| `/api/v1/auth/login` | POST | No | Login user |
| `/api/v1/auth/me` | GET | Yes | Get current user |
| `/api/v1/products` | GET | Yes | List products |
| `/api/v1/products` | POST | Yes | Create product |
| `/api/v1/products/:id` | GET | Yes | Get product |
| `/api/v1/products/:id` | PUT | Yes | Update product |
| `/api/v1/products/:id` | DELETE | Yes | Delete product |
| `/api/v1/invoices` | GET | Yes | List invoices |
| `/api/v1/invoices` | POST | Yes | Create invoice |
| `/api/v1/customers` | GET | Yes | List customers |
| `/api/v1/customers` | POST | Yes | Create customer |

## Next Steps

1. Test all CRUD operations for each resource
2. Test pagination and filtering
3. Test role-based access (create users with different roles)
4. Test error cases and validation
5. Monitor logs in terminal for debugging
6. Check MySQL data after each operation in phpMyAdmin

## Need Help?

- Check server logs in terminal
- Review `logs/combined.log` and `logs/error.log`
- Check MySQL error logs in XAMPP
- Verify token is correctly set in Insomnia environment
- Ensure all required fields are provided in request body
`
4. Collation: `utf8mb4_unicode_ci`
5. Click **Create**

#### Option B: Using MySQL Command Line

1. Open XAMPP Control Panel
2. Click **Shell** button
3. Run these commands:

```bash
mysql -u root -p
# Press Enter (default: no password)
```

```sql
CREATE DATABASE inventory_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

SHOW DATABASES;
EXIT;
```

### 1.3 Configure Environment Variables

Edit your `.env` file:

```env
# Database Configuration for XAMPP
DB_HOST=localhost
DB_PORT=3306
DB_NAME=inventory_management
DB_USER=root
DB_PASSWORD=
# Leave password empty (XAMPP default)
```

## Step 2: Start the Backend Server

### 2.1 Install Dependencies

```bash
npm install
```

### 2.2 Start Development Server

```bash
npm run dev
```

You should see:

```
✅ Server started successfully
🚀 Server is running on http://localhost:5000
📊 Environment: development
🗄️  Database connected successfully
```

### 2.3 Verify Database Tables

1. Go to phpMyAdmin: `http://localhost/phpmyadmin`
2. Click on `inventory_management` database
3. You should see 11 tables automatically created:
   - companies
   - users
   - products
   - categories
   - customers
   - invoices
   - invoice_items
   - expenses
   - stock_movements
   - teams
   - subscriptions

## Step 3: Setup Insomnia

### 3.1 Create New Request Collection

1. Open Insomnia
2. Click **Create** → **Request Collection**
3. Name it: `Inventory Management API`

### 3.2 Configure Base Environment

1. Click **No Environment** dropdown
2. Select **Manage Environments**
3. Click **+** to create new environment
4. Name it: `Development`
5. Add this JSON:

```json
{
  "base_url": "http://localhost:5000/api/v1",
  "token": ""
}
```

6. Click **Done**
7. Select **Development** as active environment

## Step 4: Test the API

### Test 1: Health Check

**GET** `http://localhost:5000/health`

Expected Response (200 OK):
```json
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 10,
  "database": {
    "status": "connected"
  }
}
```

### Test 2: Register Company & Admin User

**POST** `{{ _.base_url }}/auth/register`

Headers:
```
Content-Type: application/json
```

Body (JSON):
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "TestPass123",
  "companyName": "Test Company",
  "phone": "+1234567890"
}
```

Expected Response (201 Created):
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "uuid-here",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "admin",
      "company_id": "uuid-here"
    },
    "company": {
      "id": "uuid-here",
      "name": "Test Company",
      "subscription_plan": "free"
    },
    "token": "jwt-token-here"
  }
}
```

**IMPORTANT:** Copy the `token` value!

### Test 3: Update Environment with Token

1. Go to **Manage Environments**
2. Update the `token` field with the token from registration:

```json
{
  "base_url": "http://localhost:5000/api/v1",
  "token": "paste-your-token-here"
}
```

### Test 4: Login

**POST** `{{ _.base_url }}/auth/login`

Headers:
```
Content-Type: application/json
```

Body (JSON):
```json
{
  "email": "john@example.com",
  "password": "TestPass123"
}
```

Expected Response (200 OK):
```json
{
  "success": true,
  "data": {
    "user": { ... },
    "token": "new-jwt-token-here"
  }
}
```

### Test 5: Get Current User (Protected Route)

**GET** `{{ _.base_url }}/auth/me`

Headers:
```
Authorization: Bearer {{ _.token }}
```

Expected Response (200 OK):
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@example.com",
    "role": "admin"
  }
}
```

### Test 6: Create a Product

**POST** `{{ _.base_url }}/products`

Headers:
```
Content-Type: application/json
Authorization: Bearer {{ _.token }}
```

Body (JSON):
```json
{
  "name": "Laptop Dell XPS 15",
  "barcode": "DELL-XPS-15-2024",
  "description": "15-inch laptop with Intel i7",
  "purchasePrice": 800,
  "sellingPrice": 1200,
  "currentStock": 10,
  "minStockLevel": 3,
  "unit": "piece"
}
```

Expected Response (201 Created):
```json
{
  "success": true,
  "data": {
    "id": "product-uuid",
    "name": "Laptop Dell XPS 15",
    "barcode": "DELL-XPS-15-2024",
    "purchasePrice": 800,
    "sellingPrice": 1200,
    "currentStock": 10,
    "minStockLevel": 3
  }
}
```

### Test 7: Get All Products

**GET** `{{ _.base_url }}/products?page=1&limit=20`

Headers:
```
Authorization: Bearer {{ _.token }}
```

Expected Response (200 OK):
```json
{
  "success": true,
  "data": {
    "products": [
      {
        "id": "uuid",
        "name": "Laptop Dell XPS 15",
        "barcode": "DELL-XPS-15-2024",
        "currentStock": 10,
        "sellingPrice": 1200
      }
    ],
    "pagination": {
      "currentPage": 1,
      "totalPages": 1,
      "totalItems": 1,
      "itemsPerPage": 20
    }
  }
}
```

### Test 8: Get Product by Barcode

**GET** `{{ _.base_url }}/products/barcode/DELL-XPS-15-2024`

Headers:
```
Authorization: Bearer {{ _.token }}
```

### Test 9: Create a Customer

**POST** `{{ _.base_url }}/customers`

Headers:
```
Content-Type: application/json
Authorization: Bearer {{ _.token }}
```

Body (JSON):
```json
{
  "name": "Jane Smith",
  "email": "jane@customer.com",
  "phone": "+1234567890",
  "address": "123 Main St, City"
}
```

### Test 10: Create an Invoice

**POST** `{{ _.base_url }}/invoices`

Headers:
```
Content-Type: application/json
Authorization: Bearer {{ _.token }}
```

Body (JSON):
```json
{
  "customerId": "customer-uuid-from-step-9",
  "items": [
    {
      "productId": "product-uuid-from-step-6",
      "quantity": 2,
      "unitPrice": 1200,
      "taxRate": 10,
      "discount": 0
    }
  ],
  "paymentMethod": "cash",
  "paymentStatus": "paid",
  "discount": 0,
  "notes": "Thank you for your purchase"
}
```

Expected Response: Invoice created with automatic stock deduction

## Step 5: Import Insomnia Collection (Quick Setup)

### 5.1 Create Collection File

Save this as `insomnia-collection.json`:

```json
{
  "resources": [
    {
      "name": "Health Check",
      "method": "GET",
      "url": "http://localhost:5000/health",
      "description": "Check API health status"
    },
    {
      "name": "Register",
      "method": "POST",
      "url": "{{ _.base_url }}/auth/register",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ],
      "body": {
        "mimeType": "application/json",
        "text": "{\n  \"name\": \"John Doe\",\n  \"email\": \"john@example.com\",\n  \"password\": \"TestPass123\",\n  \"companyName\": \"Test Company\",\n  \"phone\": \"+1234567890\"\n}"
      }
    },
    {
      "name": "Login",
      "method": "POST",
      "url": "{{ _.base_url }}/auth/login",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        }
      ],
      "body": {
        "mimeType": "application/json",
        "text": "{\n  \"email\": \"john@example.com\",\n  \"password\": \"TestPass123\"\n}"
      }
    },
    {
      "name": "Get Current User",
      "method": "GET",
      "url": "{{ _.base_url }}/auth/me",
      "headers": [
        {
          "name": "Authorization",
          "value": "Bearer {{ _.token }}"
        }
      ]
    },
    {
      "name": "Create Product",
      "method": "POST",
      "url": "{{ _.base_url }}/products",
      "headers": [
        {
          "name": "Content-Type",
          "value": "application/json"
        },
        {
          "name": "Authorization",
          "value": "Bearer {{ _.token }}"
        }
      ],
      "body": {
        "mimeType": "application/json",
        "text": "{\n  \"name\": \"Laptop Dell XPS 15\",\n  \"barcode\": \"DELL-XPS-15-2024\",\n  \"description\": \"15-inch laptop\",\n  \"purchasePrice\": 800,\n  \"sellingPrice\": 1200,\n  \"currentStock\": 10,\n  \"minStockLevel\": 3,\n  \"unit\": \"piece\"\n}"
      }
    },
    {
      "name": "Get All Products",
      "method": "GET",
      "url": "{{ _.base_url }}/products?page=1&limit=20",
      "headers": [
        {
          "name": "Authorization",
          "value": "Bearer {{ _.token }}"
        }
      ]
    }
  ]
}
```

### 5.2 Import into Insomnia

1. In Insomnia, click **Application** menu
2. Select **Preferences** → **Data** → **Import Data**
3. Select the `insomnia-collection.json` file
4. Click **Import**

## Troubleshooting

### Issue 1: Database Connection Failed

**Error:** `SequelizeConnectionError: connect ECONNREFUSED 127.0.0.1:3306`

**Solution:**
1. Check XAMPP MySQL is running (green light in XAMPP Control Panel)
2. Verify `.env` has correct database settings
3. Test MySQL connection:
   ```bash
   mysql -u root -p -h localhost
   ```

### Issue 2: Port Already in Use

**Error:** `Error: listen EADDRINUSE: address already in use :::5000`

**Solution:**
```bash
# Windows (XAMPP Shell or CMD)
netstat -ano | findstr :5000
taskkill /PID <process_id> /F

# Or change port in .env
PORT=5001
```

### Issue 3: Token Expired

**Error:** `401 Unauthorized - Token expired`

**Solution:**
1. Login again to get a new token
2. Update token in Insomnia environment
3. Tokens expire after 7 days by default

### Issue 4: Tables Not Created

**Solution:**
1. Stop the server (Ctrl+C)
2. Delete database:
   ```sql
   DROP DATABASE inventory_management;
   CREATE DATABASE inventory_management;
   ```
3. Restart server - tables will be auto-created

### Issue 5: XAMPP MySQL Won't Start

**Solution:**
1. Check if port 3306 is in use by another application
2. Close Skype or other apps using port 3306
3. In XAMPP, click **Config** → **my.ini** and change port to 3307
4. Update `.env` file: `DB_PORT=3307`

## Testing Workflow Tips

### 1. Use Environment Variables

Always use `{{ _.base_url }}` and `{{ _.token }}` instead of hardcoding values.

### 2. Organize Requests in Folders

Create folders in Insomnia:
- 📁 Authentication
  - Register
  - Login
  - Get Me
  - Logout
- 📁 Products
  - Create Product
  - Get Products
  - Get Product by ID
  - Update Product
  - Delete Product
- 📁 Invoices
- 📁 Customers
- 📁 Reports

### 3. Save Response Examples

After successful requests, save the response as an example for reference.

### 4. Use Query Parameters

For GET requests with filters:
```
{{ _.base_url }}/products?search=laptop&page=1&limit=10
```

### 5. Test Error Cases

Try invalid requests to test error handling:
- Invalid credentials
- Missing required fields
- Duplicate entries
- Unauthorized access

## Viewing Data in phpMyAdmin

1. Open: `http://localhost/phpmyadmin`
2. Click `inventory_management` database
3. Click on any table to view data
4. Use **Browse** to see records
5. Use **SQL** tab to run custom queries

### Example Queries

```sql
-- View all companies
SELECT * FROM companies;

-- View all users
SELECT id, name, email, role, company_id FROM users;

-- View all products with stock
SELECT name, barcode, currentStock, minStockLevel
FROM products
WHERE currentStock <= minStockLevel;

-- View invoices with customer names
SELECT i.invoiceNumber, c.name, i.totalAmount, i.paymentStatus
FROM invoices i
JOIN customers c ON i.customerId = c.id;
```

## Quick Reference: Common Endpoints

| Endpoint | Method | Auth Required | Description |
|----------|--------|---------------|-------------|
| `/health` | GET | No | API health check |
| `/api/v1/auth/register` | POST | No | Register company & admin |
| `/api/v1/auth/login` | POST | No | Login user |
| `/api/v1/auth/me` | GET | Yes | Get current user |
| `/api/v1/products` | GET | Yes | List products |
| `/api/v1/products` | POST | Yes | Create product |
| `/api/v1/products/:id` | GET | Yes | Get product |
| `/api/v1/products/:id` | PUT | Yes | Update product |
| `/api/v1/products/:id` | DELETE | Yes | Delete product |
| `/api/v1/invoices` | GET | Yes | List invoices |
| `/api/v1/invoices` | POST | Yes | Create invoice |
| `/api/v1/customers` | GET | Yes | List customers |
| `/api/v1/customers` | POST | Yes | Create customer |

## Next Steps

1. Test all CRUD operations for each resource
2. Test pagination and filtering
3. Test role-based access (create users with different roles)
4. Test error cases and validation
5. Monitor logs in terminal for debugging
6. Check MySQL data after each operation in phpMyAdmin

## Need Help?

- Check server logs in terminal
- Review `logs/combined.log` and `logs/error.log`
- Check MySQL error logs in XAMPP
- Verify token is correctly set in Insomnia environment
- Ensure all required fields are provided in request body
