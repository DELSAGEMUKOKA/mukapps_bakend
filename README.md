# Inventory Management System - Backend API

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)
[![License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg)](CONTRIBUTING.md)

A comprehensive multi-tenant inventory management system backend built with Node.js, Express, MySQL, and Sequelize ORM. Designed for scalability, security, and ease of use.

> **Migration Status**: Successfully migrated from Supabase to MySQL + Sequelize. See `SEQUELIZE_MIGRATION_SUMMARY.md` for details.

## 🚀 Quick Start

**New to the project?** Follow these guides to get started quickly:

1. **[Quick Start Checklist](QUICK_START_CHECKLIST.md)** - 15-minute setup guide with checkboxes
2. **[Postman Complete Guide](POSTMAN_COMPLETE_GUIDE.md)** - Step-by-step testing with ALL HTTP methods (GET, POST, PUT, DELETE)
3. **[User Creation Guide](USER_CREATION_GUIDE.md)** - How to create cashiers, managers, and manage users
4. **[Testing Guide: Insomnia + XAMPP](TESTING_GUIDE.md)** - Complete API testing guide
5. **[Quick Test Scenarios](QUICK_TEST_SCENARIOS.md)** - Ready-to-use cURL commands
6. **[API Field Naming Guide](API_FIELD_NAMING_GUIDE.md)** - Field naming conventions (snake_case)

**MaxiCash Subscription System:**
- **[MaxiCash Quick Start](MAXICASH_QUICK_START.md)** - Get subscriptions running in minutes
- **[MaxiCash Subscription Guide](MAXICASH_SUBSCRIPTION_GUIDE.md)** - Complete technical documentation
- **[Implementation Summary](MAXICASH_IMPLEMENTATION_SUMMARY.md)** - What was built and how it works

**Want to test immediately?**
```bash
# 1. Install dependencies
npm install

# 2. Configure .env (copy from .env.example)
cp .env.example .env

# 3. Add your MaxiCash credentials to .env
# MAXICASH_MERCHANT_ID=your_id
# MAXICASH_MERCHANT_PASSWORD=your_password

# 4. Start server
npm start

# 5. Test the API
curl http://localhost:5000/api/v1/health

# 6. Import Postman collection for easy testing
# File: Inventory_API_Collection.postman_collection.json
```

## Table of Contents

- [Quick Start](#quick-start)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Configuration](#configuration)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Testing with Insomnia](#testing-with-insomnia)
- [API Documentation](#api-documentation)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Security](#security)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

### Core Features
- ✅ **Multi-tenant Architecture** - Complete data isolation per company with company_id filtering
- ✅ **JWT Authentication** - Secure token-based auth with role-based access control (Admin, Supervisor, Operator, Cashier)
- ✅ **Product Management** - Full CRUD operations with barcode support and category organization
- ✅ **Inventory Tracking** - Real-time stock management with automatic updates and movement history
- ✅ **Invoice System** - Complete sales tracking with automatic stock deduction and tax calculation
- ✅ **Customer Management** - VIP status auto-upgrade, purchase tracking, and customer analytics
- ✅ **Expense Tracking** - Business expense management with categorization
- ✅ **Reporting** - Comprehensive sales, expenses, inventory, and profit/loss reports

### Technical Features
- ✅ **Security** - Rate limiting, input validation, CORS protection, Helmet.js, bcrypt password hashing
- ✅ **Database** - MySQL 8.0+ with Sequelize ORM for robust data management
- ✅ **Logging** - Winston logger with multiple transports (console, file)
- ✅ **Error Handling** - Centralized error handling with detailed logging
- ✅ **Request Tracking** - Unique request IDs for debugging and monitoring
- ✅ **Performance Monitoring** - Request timing, slow query detection
- ✅ **Graceful Shutdown** - Proper cleanup of connections and resources
- ✅ **Environment Management** - Separate configs for dev, test, and production
- ✅ **Hot Reload** - Development mode with Nodemon auto-restart

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js 4.18+
- **Database**: MySQL 8.0+
- **ORM**: Sequelize 6.x
- **Authentication**: JWT (jsonwebtoken)
- **Validation**: Joi
- **Security**: Helmet, bcryptjs, CORS
- **Logging**: Winston
- **Rate Limiting**: express-rate-limit

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - [Download](https://dev.mysql.com/downloads/mysql/)
- **npm** or **yarn** - Comes with Node.js
- **Git** - [Download](https://git-scm.com/)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/inventory-backend.git
cd inventory-backend
```

### 2. Install Dependencies

```bash
npm install
```

This will install all required packages including:
- Express.js for web framework
- Sequelize for ORM
- MySQL2 for database driver
- JWT for authentication
- Winston for logging
- And many more...

## Configuration

### 1. Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

### 2. Configure Database

Edit `.env` and update the database credentials:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=inventory_management
DB_USER=root
DB_PASSWORD=your_mysql_password
```

### 3. Configure JWT Secrets

Generate strong secrets for JWT tokens:

```bash
# Generate JWT secret
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Update `.env` with the generated secrets:

```env
JWT_SECRET=your-generated-secret-here
JWT_REFRESH_SECRET=your-generated-refresh-secret-here
```

### 4. Configure Other Settings

Review and update other settings in `.env` as needed:

```env
# Application
NODE_ENV=development
PORT=5000

# CORS
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173

# Security
BCRYPT_SALT_ROUNDS=10
MAX_LOGIN_ATTEMPTS=5
```

See `.env.example` for all available configuration options.

## Database Setup

### 1. Create Database

Connect to MySQL and create the database:

```sql
CREATE DATABASE inventory_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;
```

### 2. Grant Permissions (Optional)

If using a non-root user:

```sql
CREATE USER 'inventory_user'@'localhost' IDENTIFIED BY 'secure_password';
GRANT ALL PRIVILEGES ON inventory_management.* TO 'inventory_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Auto-Migration

The application will automatically create all required tables on first startup. No manual migration needed!

## Running the Application

### Development Mode

Start the server with auto-reload (recommended for development):

```bash
npm run dev
```

This will:
- Watch for file changes and auto-restart
- Use development environment settings
- Enable detailed logging
- Connect to database
- Create tables if they don't exist
- Start server on port 5000

### Production Mode

Start the server in production mode:

```bash
npm start
```

### Seeding Demo Data (Optional)

Load demo data for testing:

```bash
npm run seed
```

This creates:
- Demo company
- Admin user
- Sample products
- Sample customers
- Sample invoices

## Quick Start

After installation and configuration:

```bash
# 1. Install dependencies
npm install

# 2. Configure .env file
cp .env.example .env
# Edit .env with your settings

# 3. Create MySQL database
mysql -u root -p -e "CREATE DATABASE inventory_management;"

# 4. Start the server
npm run dev
```

The API will be available at: **http://localhost:5000**

## Testing with Insomnia

### Using XAMPP + Insomnia

For a complete guide on testing the API with Insomnia and XAMPP, see:

**📖 [Complete Testing Guide](TESTING_GUIDE.md)**

This guide includes:
- XAMPP MySQL setup instructions
- Insomnia configuration
- Step-by-step API testing workflow
- All request examples with expected responses
- Troubleshooting common issues
- Database verification steps

### Quick Test Steps

1. **Start XAMPP MySQL** and create `inventory_management` database
2. **Configure .env** with XAMPP settings (default user: `root`, password: empty)
3. **Start server**: `npm run dev`
4. **Test health endpoint**: `GET http://localhost:5000/health`
5. **Register company**: `POST http://localhost:5000/api/v1/auth/register`
6. **Copy token** from response
7. **Test protected routes** with `Authorization: Bearer {token}` header

See **[Quick Start Checklist](QUICK_START_CHECKLIST.md)** for a checklist-based approach.

## API Endpoints

### Authentication (`/api/v1/auth`)

```bash
# Register new company and admin user
POST /api/v1/auth/register
{
  "name": "John Doe",
  "email": "admin@company.com",
  "password": "SecurePass123",
  "companyName": "Acme Corp",
  "phone": "+1234567890"
}

# Login
POST /api/v1/auth/login
{
  "email": "admin@company.com",
  "password": "SecurePass123"
}

# Get current user
GET /api/v1/auth/me
Authorization: Bearer {token}

# Logout
POST /api/v1/auth/logout
Authorization: Bearer {token}
```

### Products (`/api/v1/products`)

```bash
# List all products (paginated)
GET /api/v1/products?page=1&limit=20&search=laptop
Authorization: Bearer {token}

# Get product by ID
GET /api/v1/products/{id}
Authorization: Bearer {token}

# Get product by barcode
GET /api/v1/products/barcode/{barcode}
Authorization: Bearer {token}

# Create product
POST /api/v1/products
Authorization: Bearer {token}
{
  "name": "Laptop Dell XPS 15",
  "barcode": "123456789",
  "description": "15-inch laptop",
  "purchasePrice": 800,
  "sellingPrice": 1200,
  "currentStock": 10,
  "minStockLevel": 5,
  "unit": "piece"
}

# Update product
PUT /api/v1/products/{id}
Authorization: Bearer {token}
{
  "sellingPrice": 1250
}

# Delete product
DELETE /api/v1/products/{id}
Authorization: Bearer {token}
```

### Invoices (`/api/v1/invoices`)

```bash
# List all invoices
GET /api/v1/invoices?page=1&limit=20&paymentStatus=paid
Authorization: Bearer {token}

# Get invoice by ID
GET /api/v1/invoices/{id}
Authorization: Bearer {token}

# Create invoice
POST /api/v1/invoices
Authorization: Bearer {token}
{
  "items": [
    {
      "productId": "uuid-here",
      "quantity": 2,
      "unitPrice": 1200,
      "taxRate": 10,
      "discount": 0
    }
  ],
  "customerId": "uuid-here",
  "paymentMethod": "cash",
  "paymentStatus": "paid",
  "discount": 0,
  "notes": "Thank you for your business"
}

# Cancel invoice
POST /api/v1/invoices/{id}/cancel
Authorization: Bearer {token}
```

### Categories (`/api/v1/categories`)

```bash
# List categories
GET /api/v1/categories
Authorization: Bearer {token}

# Create category
POST /api/v1/categories
Authorization: Bearer {token}
{
  "name": "Electronics",
  "description": "Electronic devices and accessories"
}

# Update category
PUT /api/v1/categories/{id}
Authorization: Bearer {token}
{
  "name": "Updated Electronics"
}

# Delete category
DELETE /api/v1/categories/{id}
Authorization: Bearer {token}
```

### Expenses (`/api/v1/expenses`)

```bash
# List expenses
GET /api/v1/expenses?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}

# Create expense
POST /api/v1/expenses
Authorization: Bearer {token}
{
  "category": "Rent",
  "amount": 1500,
  "description": "Office rent for January",
  "expenseDate": "2024-01-01"
}

# Update expense
PUT /api/v1/expenses/{id}
Authorization: Bearer {token}

# Delete expense
DELETE /api/v1/expenses/{id}
Authorization: Bearer {token}
```

### Reports (`/api/v1/reports`)

```bash
# Sales report
GET /api/v1/reports/sales?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}

# Inventory report
GET /api/v1/reports/inventory
Authorization: Bearer {token}

# Profit/Loss report
GET /api/v1/reports/profit?period=monthly&year=2024
Authorization: Bearer {token}

# Expense report
GET /api/v1/reports/expenses?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer {token}

# Dashboard summary
GET /api/v1/reports/dashboard
Authorization: Bearer {token}
```

### Stock Management (`/api/v1/stock`)

```bash
# Get stock movements
GET /api/v1/stock/movements?productId={id}&limit=50
Authorization: Bearer {token}

# Add stock
POST /api/v1/stock/in
Authorization: Bearer {token}
{
  "productId": "uuid-here",
  "quantity": 50,
  "reason": "Purchase order #123",
  "notes": "Received from supplier"
}

# Remove stock
POST /api/v1/stock/out
Authorization: Bearer {token}
{
  "productId": "uuid-here",
  "quantity": 10,
  "reason": "Damaged goods"
}

# Adjust stock
POST /api/v1/stock/adjust
Authorization: Bearer {token}
{
  "productId": "uuid-here",
  "newQuantity": 100,
  "reason": "Physical inventory count"
}

# Low stock alerts
GET /api/v1/stock/low-stock
Authorization: Bearer {token}
```

### Health Check

```bash
# Health check endpoint
GET /health

# Response
{
  "success": true,
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 3600,
  "uptimeHuman": "1h 0m 0s",
  "environment": "production",
  "database": {
    "status": "connected",
    "responseTime": "15ms"
  },
  "memory": {
    "heapUsed": 50,
    "heapTotal": 100,
    "unit": "MB"
  }
}
```

### API Documentation Endpoint

```bash
# Get API documentation
GET /api/v1

# Response: Complete list of all available endpoints
```

## Testing the API

### 1. Register a Company

```bash
curl -X POST http://localhost:5000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@example.com",
    "password": "TestPass123",
    "companyName": "Test Company"
  }'
```

### 2. Login

```bash
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "TestPass123"
  }'
```

Save the `token` from the response.

### 3. Create a Product

```bash
curl -X POST http://localhost:5000/api/v1/products \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "name": "Test Product",
    "barcode": "12345",
    "purchasePrice": 100,
    "sellingPrice": 150,
    "currentStock": 50
  }'
```

## Database Schema

The database includes 11 core tables with Sequelize ORM:

1. **companies** - Tenant organizations
2. **users** - System users (admin, manager, cashier)
3. **products** - Inventory items with barcode support
4. **categories** - Product categorization
5. **customers** - Customer records with VIP tracking
6. **invoices** - Sales transactions
7. **invoice_items** - Invoice line items
8. **expenses** - Business expense tracking
9. **stock_movements** - Inventory movement history
10. **teams** - Team organization
11. **subscriptions** - Billing and subscription management

All tables use UUID primary keys and include automatic timestamps (created_at, updated_at).

## Role-Based Access Control

| Role | Permissions |
|------|------------|
| **Admin** | Full access to all resources |
| **Supervisor** | Manage products, invoices, expenses, view reports |
| **Operator** | Create/edit products, customers, invoices |
| **Cashier** | Create invoices, view products |

## Security Features

- ✅ JWT authentication with 7-day token expiration
- ✅ Password hashing with bcrypt (10 rounds)
- ✅ Rate limiting (100 requests/15min, 5 auth attempts/15min)
- ✅ Account lockout after 5 failed login attempts
- ✅ Multi-tenant data isolation (company_id filtering)
- ✅ Input validation with Joi
- ✅ CORS protection
- ✅ Helmet security headers
- ✅ SQL injection prevention via Sequelize parameterized queries
- ✅ Transaction support for data consistency

## Business Logic

### Invoice Creation
1. Validates stock availability
2. Calculates totals (subtotal, tax, discount)
3. Creates invoice record
4. Creates invoice items
5. Auto-deducts stock
6. Updates customer purchase total
7. Auto-upgrades to VIP at $1000+

### Stock Management
- Automatic stock updates on sales
- Low stock alerts when current_stock ≤ min_stock_level
- Stock movement tracking (in/out/adjustment)
- Prevents negative stock levels

### User Registration
1. Validates email uniqueness
2. Creates new company (with transaction)
3. Creates admin user with hashed password
4. Creates 14-day trial subscription
5. Commits transaction or rolls back on error
6. Generates JWT token
7. Returns user, company, and token

## Project Structure

```
project/
├── src/
│   ├── config/          # Configuration (database, env, constants)
│   ├── models/          # Data access layer (11 models)
│   ├── controllers/     # Request handlers (3 controllers)
│   ├── routes/          # API routes
│   ├── services/        # Business logic (auth, stock, reports)
│   ├── middleware/      # Auth, validation, error handling
│   ├── utils/           # Helpers, validators, encryption
│   ├── app.js           # Express app setup
│   └── server.js        # Server entry point
├── .env                 # Environment variables
├── package.json         # Dependencies
└── README.md            # This file
```

## Error Handling

All errors return consistent JSON responses:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable message",
    "details": { }
  }
}
```

Common status codes:
- `200` - Success
- `201` - Created
- `400` - Bad Request (validation error)
- `401` - Unauthorized (not authenticated)
- `403` - Forbidden (insufficient permissions)
- `404` - Not Found
- `409` - Conflict (duplicate resource)
- `500` - Internal Server Error

## Logging

The application uses Winston for structured logging:

- **Console logs**: Colored, formatted output in development
- **Log levels**: error, warn, info, http, debug
- All HTTP requests are logged
- Authentication attempts are tracked
- Stock level warnings are logged

## Testing

### Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm test -- --coverage

# Run tests in watch mode
npm run test:watch

# Run specific test file
npm test -- src/tests/unit/models/User.test.js
```

### Test Structure

```
src/tests/
├── unit/              # Unit tests
│   ├── models/        # Model tests
│   ├── services/      # Service tests
│   └── utils/         # Utility tests
├── integration/       # Integration tests
│   ├── auth.test.js
│   ├── products.test.js
│   └── invoices.test.js
└── helpers/           # Test helpers
    ├── setup.js       # Test setup
    └── fixtures.js    # Test data
```

### Test Database

Tests use a separate database configured in `.env.test`:

```env
DB_NAME=inventory_management_test
```

### Coverage Reports

After running tests with coverage, view the report:

```bash
open coverage/index.html
```

## Deployment

### Prerequisites

- Linux server (Ubuntu 20.04+ recommended)
- Node.js 18+ installed
- MySQL 8.0+ installed
- PM2 for process management
- Nginx for reverse proxy (optional)

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js 18
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# Install MySQL
sudo apt install -y mysql-server
sudo mysql_secure_installation

# Install PM2 globally
sudo npm install -g pm2
```

### 2. Deploy Application

```bash
# Clone repository
git clone https://github.com/yourusername/inventory-backend.git
cd inventory-backend

# Install dependencies
npm ci --production

# Configure environment
cp .env.example .env
nano .env  # Update with production settings
```

### 3. Create Production Database

```bash
mysql -u root -p
```

```sql
CREATE DATABASE inventory_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

CREATE USER 'inventory_user'@'localhost' IDENTIFIED BY 'strong_password';
GRANT ALL PRIVILEGES ON inventory_management.* TO 'inventory_user'@'localhost';
FLUSH PRIVILEGES;
EXIT;
```

### 4. Start with PM2

```bash
# Start application
pm2 start src/server.js --name inventory-api

# Save PM2 configuration
pm2 save

# Setup PM2 to start on boot
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u $USER --hp $HOME

# Monitor application
pm2 monit

# View logs
pm2 logs inventory-api
```

### 5. Nginx Reverse Proxy (Optional)

```bash
sudo apt install -y nginx
sudo nano /etc/nginx/sites-available/inventory-api
```

Add configuration:

```nginx
server {
    listen 80;
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable site:

```bash
sudo ln -s /etc/nginx/sites-available/inventory-api /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 6. SSL Certificate (Let's Encrypt)

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d api.yourdomain.com
```

### 7. Firewall Configuration

```bash
sudo ufw allow 22/tcp
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw enable
```

### Docker Deployment

#### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --production

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
```

#### docker-compose.yml

```yaml
version: '3.8'

services:
  api:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    depends_on:
      - mysql
    restart: unless-stopped

  mysql:
    image: mysql:8.0
    environment:
      MYSQL_ROOT_PASSWORD: ${DB_PASSWORD}
      MYSQL_DATABASE: ${DB_NAME}
    volumes:
      - mysql-data:/var/lib/mysql
    restart: unless-stopped

volumes:
  mysql-data:
```

#### Deploy with Docker

```bash
docker-compose up -d
docker-compose logs -f api
```

## Monitoring and Maintenance

### Health Checks

Monitor application health:

```bash
curl http://localhost:5000/health
```

### Logs

View application logs:

```bash
# PM2 logs
pm2 logs inventory-api

# File logs
tail -f logs/combined.log
tail -f logs/error.log
```

### Database Backups

Create automatic backup script:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
mysqldump -u inventory_user -p inventory_management > backup_$DATE.sql
```

### Updates

```bash
# Pull latest changes
git pull origin main

# Install dependencies
npm ci --production

# Restart application
pm2 restart inventory-api

# Check status
pm2 status
```

## Performance Optimization

### Database Optimization

1. **Indexes**: Ensure proper indexes on frequently queried columns
2. **Connection Pooling**: Configured in `src/config/database.js`
3. **Query Optimization**: Use Sequelize query optimization
4. **Pagination**: All list endpoints support pagination

### Application Optimization

1. **Caching**: Implement Redis for session and data caching
2. **Compression**: Enable gzip compression
3. **Load Balancing**: Use PM2 cluster mode
4. **CDN**: Serve static assets via CDN

### Monitoring

1. **APM**: Consider using New Relic or Datadog
2. **Error Tracking**: Implement Sentry for error monitoring
3. **Logs**: Use centralized logging (ELK stack)
4. **Metrics**: Track key performance indicators

## Troubleshooting

### Common Issues

#### Port Already in Use

```bash
# Find process using port 5000
lsof -ti:5000

# Kill the process
kill -9 $(lsof -ti:5000)

# Or change port in .env
PORT=5001
```

#### Database Connection Failed

```bash
# Check MySQL is running
sudo systemctl status mysql

# Test connection
mysql -u root -p

# Check credentials in .env
# Ensure database exists
# Check firewall rules
```

#### Module Not Found

```bash
# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

#### Permission Errors

```bash
# Fix file permissions
chmod -R 755 src/
chmod -R 777 logs/
chmod -R 777 uploads/
```

### Debug Mode

Enable debug logging:

```env
LOG_LEVEL=debug
DEBUG=true
LOG_SQL_QUERIES=true
```

### Getting Help

1. Check [documentation](./docs)
2. Review [API documentation](./docs/api)
3. Check [issues](https://github.com/yourusername/inventory-backend/issues)
4. Contact support team

## API Rate Limits

| Endpoint Type | Rate Limit |
|--------------|------------|
| General API | 100 requests / 15 minutes |
| Authentication | 5 requests / 15 minutes |
| File Upload | 10 requests / hour |

## Contributing

We welcome contributions! Please follow these guidelines:

### Development Workflow

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Run tests (`npm test`)
5. Commit your changes (`git commit -m 'Add amazing feature'`)
6. Push to branch (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Code Style

- Follow existing code style
- Use ES6+ features
- Add JSDoc comments for functions
- Keep functions small and focused
- Write meaningful commit messages

### Testing

- Write tests for new features
- Maintain test coverage above 50%
- Run `npm test` before committing

### Pull Request Guidelines

- Update README if needed
- Add tests for new features
- Ensure all tests pass
- Update documentation
- Link related issues

## Documentation

### Getting Started Guides
- **[Quick Start Checklist](./QUICK_START_CHECKLIST.md)** - 15-minute setup with XAMPP + Insomnia
- **[Testing Guide](./TESTING_GUIDE.md)** - Complete API testing guide with Insomnia
- [`SETUP.md`](./SETUP.md) - Detailed setup instructions

### Technical Documentation
- [`SERVER_DOCUMENTATION.md`](./SERVER_DOCUMENTATION.md) - Server architecture and configuration
- [`BACKEND_SPECIFICATION.md`](./BACKEND_SPECIFICATION.md) - Technical specifications
- [`DATABASE_AND_MODELS_SUMMARY.md`](./DATABASE_AND_MODELS_SUMMARY.md) - Database schema details

### Migration Documentation
- [`SEQUELIZE_MIGRATION_SUMMARY.md`](./SEQUELIZE_MIGRATION_SUMMARY.md) - Database migration overview
- [`MIGRATION_GUIDE.md`](./MIGRATION_GUIDE.md) - Guide for updating controllers
- [`IMPLEMENTATION_SUMMARY.md`](./IMPLEMENTATION_SUMMARY.md) - Implementation details

## Changelog

### Version 1.0.0 (Current)

- Initial release
- Multi-tenant architecture
- JWT authentication
- Product management
- Invoice system
- Customer management
- Expense tracking
- Reporting features
- Comprehensive security features

## Roadmap

### Upcoming Features

- [ ] PDF invoice generation
- [ ] Email notifications
- [ ] SMS notifications
- [ ] Advanced analytics dashboard
- [ ] Product image uploads
- [ ] Barcode scanning integration
- [ ] Multi-currency support
- [ ] Warehouse management
- [ ] Purchase order system
- [ ] Supplier management
- [ ] API webhooks
- [ ] GraphQL API
- [ ] Mobile app API support

### Future Enhancements

- [ ] AI-powered demand forecasting
- [ ] Automated reordering
- [ ] Integration with accounting software
- [ ] E-commerce platform integration
- [ ] Multi-language support
- [ ] Advanced role permissions
- [ ] Audit trail
- [ ] Data export/import
- [ ] Batch operations
- [ ] Offline mode support

## FAQ

### Q: How do I reset the database?

```bash
# Drop and recreate database
mysql -u root -p -e "DROP DATABASE inventory_management;"
mysql -u root -p -e "CREATE DATABASE inventory_management;"

# Restart server (tables will be auto-created)
npm run dev
```

### Q: How do I change the admin password?

```bash
# Use bcrypt to hash new password
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('newpassword', 10));"

# Update in database
mysql -u root -p inventory_management
UPDATE users SET password = 'hashed_password' WHERE role = 'admin';
```

### Q: Can I use PostgreSQL instead of MySQL?

Yes! Update the Sequelize configuration in `src/config/database.js`:

```javascript
dialect: 'postgres',
// Update connection details
```

### Q: How do I enable HTTPS in development?

Use a reverse proxy like ngrok or create self-signed certificates:

```bash
openssl req -nodes -new -x509 -keyout server.key -out server.cert
```

### Q: How do I backup the database automatically?

Create a cron job:

```bash
crontab -e

# Add daily backup at 2 AM
0 2 * * * /path/to/backup-script.sh
```

## Support

For support and questions:

- Email: support@inventory.com
- Documentation: https://docs.inventory.com
- GitHub Issues: https://github.com/yourusername/inventory-backend/issues
- Discord: https://discord.gg/inventory

## Acknowledgments

- Express.js team
- Sequelize team
- All contributors
- Open source community

## Important Notes

This project has been migrated from Supabase to MySQL + Sequelize. The core infrastructure is complete:
- ✅ All models converted to Sequelize
- ✅ Database configuration and sync
- ✅ Authentication service updated
- ✅ Sample controller (productController) fully implemented
- ⏳ Remaining controllers need conversion (see MIGRATION_GUIDE.md)

## Support

For detailed technical specifications, see `BACKEND_SPECIFICATION.md`

## License

MIT License
