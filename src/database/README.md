# Database Management

This directory contains database-related files for the Inventory Management System using Sequelize ORM with MySQL.

## Structure

```
database/
├── migrations/      # SQL reference files (tables created by Sequelize)
├── seeds/          # Seed data for development and testing
└── README.md       # This file
```

## Database Setup

### 1. Create MySQL Database

```sql
CREATE DATABASE inventory_management
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

### 2. Configure Environment

Update your `.env` file:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=inventory_management
DB_USER=root
DB_PASSWORD=your_password
```

### 3. Start Application

Tables are created automatically when you start the server:

```bash
npm start
```

Sequelize will sync all models and create tables with proper:
- Foreign key constraints
- Indexes
- UUID primary keys
- Timestamps (created_at, updated_at)

## Database Schema

### Tables

1. **companies** - Multi-tenant organizations
   - Primary key: id (UUID)
   - Unique: email, tax_id
   - Indexes: email, tax_id

2. **users** - System users with authentication
   - Primary key: id (UUID)
   - Foreign key: company_id → companies
   - Unique: email
   - Indexes: email, company_id, role
   - Roles: admin, manager, cashier

3. **categories** - Product categorization
   - Primary key: id (UUID)
   - Foreign key: company_id → companies
   - Unique: (name, company_id)
   - Indexes: company_id

4. **products** - Inventory items
   - Primary key: id (UUID)
   - Foreign keys: company_id → companies, category_id → categories
   - Unique: barcode
   - Indexes: company_id, category_id, barcode, name

5. **customers** - Customer records
   - Primary key: id (UUID)
   - Foreign key: company_id → companies
   - Indexes: company_id, email, phone
   - VIP status auto-upgraded at $1000+ purchases

6. **invoices** - Sales transactions
   - Primary key: id (UUID)
   - Foreign keys: company_id, user_id, customer_id
   - Unique: invoice_number
   - Indexes: company_id, customer_id, user_id, date, payment_status

7. **invoice_items** - Invoice line items
   - Primary key: id (UUID)
   - Foreign keys: invoice_id → invoices, product_id → products
   - Indexes: invoice_id, product_id

8. **expenses** - Business expenses
   - Primary key: id (UUID)
   - Foreign keys: company_id → companies, user_id → users
   - Indexes: company_id, user_id, category, date

9. **stock_movements** - Inventory movement history
   - Primary key: id (UUID)
   - Foreign keys: company_id, user_id, product_id
   - Indexes: company_id, product_id, user_id, type, created_at
   - Types: in, out, adjustment, sale, return

10. **teams** - Team organization
    - Primary key: id (UUID)
    - Foreign key: company_id → companies
    - Unique: (name, company_id)
    - Indexes: company_id

11. **subscriptions** - Billing and subscription management
    - Primary key: id (UUID)
    - Foreign key: company_id → companies
    - Indexes: company_id, status, plan_type
    - Plans: free, basic, premium, enterprise
    - Status: active, cancelled, expired, trial

## Seeding Data

### Run Demo Data Seeder

```bash
npm run seed
```

This will create:
- 1 demo company
- 3 users (admin, manager, cashier)
- 3 categories (Electronics, Clothing, Food & Beverages)
- 5 products with stock
- 3 customers (1 VIP)
- 1 premium subscription

### Demo Login Credentials

**Admin:**
- Email: admin@demo.com
- Password: Admin123!

**Manager:**
- Email: manager@demo.com
- Password: Manager123!

**Cashier:**
- Email: cashier@demo.com
- Password: Cashier123!

### Custom Seeders

Create new seed files in `seeds/` directory:

```javascript
import { Model } from '../../models/index.js';

export const seedMyData = async () => {
  await Model.create({ /* data */ });
};

export default seedMyData;
```

Add to `seeds/index.js`:

```javascript
import seedMyData from './02-my-data.js';

// In runSeeders function:
await seedMyData();
```

## Migrations

Since we use Sequelize's `sync()` method, migrations are handled automatically. The `migrations/` directory contains SQL reference files for documentation purposes only.

### Manual SQL Migration (if needed)

If you prefer manual SQL migrations instead of sync():

1. Disable auto-sync in `src/config/syncDatabase.js`
2. Create migration files in `migrations/`
3. Run manually with MySQL client

## Multi-Tenancy

All data is isolated by `company_id`:
- Every query must filter by company_id
- Controllers enforce company_id from JWT token
- Foreign keys ensure referential integrity
- No cross-company data access

## Backup and Restore

### Backup

```bash
mysqldump -u root -p inventory_management > backup.sql
```

### Restore

```bash
mysql -u root -p inventory_management < backup.sql
```

## Performance Optimization

- All foreign keys have indexes
- Frequently queried columns are indexed
- UUID v4 for globally unique IDs
- Connection pooling configured in database.js
- Use `findAndCountAll` with `limit/offset` for pagination

## Troubleshooting

### Connection Issues

Check your `.env` configuration and MySQL service:

```bash
mysql -u root -p
```

### Table Creation Errors

Drop and recreate database:

```sql
DROP DATABASE IF EXISTS inventory_management;
CREATE DATABASE inventory_management
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;
```

Then restart the server.

### Seed Errors

Clear existing data:

```sql
USE inventory_management;
SET FOREIGN_KEY_CHECKS = 0;
-- Drop tables in reverse order
DROP TABLE IF EXISTS stock_movements;
DROP TABLE IF EXISTS invoice_items;
DROP TABLE IF EXISTS invoices;
DROP TABLE IF EXISTS expenses;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS categories;
DROP TABLE IF EXISTS customers;
DROP TABLE IF EXISTS subscriptions;
DROP TABLE IF EXISTS teams;
DROP TABLE IF EXISTS users;
DROP TABLE IF EXISTS companies;
SET FOREIGN_KEY_CHECKS = 1;
```

Then restart the server and run seeds again.

## Development Notes

- Models are defined in `src/models/`
- Model associations in `src/models/index.js`
- Database config in `src/config/database.js`
- Auto-sync in `src/config/syncDatabase.js`
- Use transactions for operations affecting multiple tables
- Always include `company_id` in WHERE clauses
