# Migration Guide: Supabase to MySQL + Sequelize

This guide documents the migration from Supabase (PostgreSQL) to MySQL with Sequelize ORM.

## Completed Work

### 1. Dependencies
- ✅ Installed `sequelize`, `mysql2`, and `sequelize-cli`
- ✅ Removed `@supabase/supabase-js` dependency

### 2. Configuration
- ✅ Updated `/src/config/database.js` to use Sequelize with MySQL
- ✅ Updated `/src/config/env.js` for MySQL environment variables
- ✅ Updated `.env` and `.env.example` files with MySQL credentials

### 3. Models
All models converted to Sequelize ORM:
- ✅ Company
- ✅ User
- ✅ Product
- ✅ Category
- ✅ Customer
- ✅ Invoice & InvoiceItem
- ✅ Expense
- ✅ StockMovement
- ✅ Team
- ✅ Subscription

### 4. Model Associations
✅ Created `/src/models/index.js` with all model relationships:
- Company has many Users, Products, Categories, Customers, Invoices, Expenses, Teams, Subscriptions
- Category has many Products
- User has many Invoices, Expenses, StockMovements
- Customer has many Invoices
- Invoice has many InvoiceItems
- Product has many InvoiceItems, StockMovements

### 5. Database Sync
✅ Created `/src/config/syncDatabase.js` for automatic database initialization

### 6. Server Initialization
✅ Updated `/src/server.js` to initialize database connection on startup

### 7. Services
✅ Updated `authService.js` to use Sequelize transactions and models

### 8. Controllers
✅ Updated `productController.js` with full Sequelize implementation

## Remaining Work

### Controllers to Update

The following controllers still use old Supabase methods and need conversion to Sequelize:

#### Priority 1 (Core functionality)
- ⏳ `categoryController.js` - Convert static methods to Sequelize queries
- ⏳ `customerController.js` - Remove supabase imports, use Sequelize
- ⏳ `invoiceController.js` - Update with transactions for invoice creation
- ⏳ `expenseController.js` - Convert to Sequelize queries
- ⏳ `stockController.js` - Update stock movement logic

#### Priority 2 (Additional features)
- ⏳ `userController.js` - Convert to Sequelize
- ⏳ `companyController.js` - Convert to Sequelize
- ⏳ `reportController.js` - Update aggregation queries for Sequelize
- ⏳ `teamController.js` - Convert to Sequelize
- ⏳ `subscriptionController.js` - Convert to Sequelize

## Conversion Pattern

### Old Pattern (Supabase)
```javascript
import { Product } from '../models/index.js';

const product = await Product.findById(id, companyId);
```

### New Pattern (Sequelize)
```javascript
import { Product, Category } from '../models/index.js';
import { Op } from 'sequelize';

const product = await Product.findOne({
  where: {
    id: req.params.id,
    company_id: req.user.companyId
  },
  include: [{ model: Category, as: 'category' }]
});
```

## Common Sequelize Operations

### Find One
```javascript
const record = await Model.findOne({
  where: { id, company_id }
});
```

### Find All with Filters
```javascript
const { rows, count } = await Model.findAndCountAll({
  where: {
    company_id,
    [Op.and]: [
      { name: { [Op.like]: `%${search}%` } }
    ]
  },
  include: [{ model: RelatedModel, as: 'alias' }],
  limit,
  offset,
  order: [['name', 'ASC']]
});
```

### Create
```javascript
const record = await Model.create({
  name: 'Test',
  company_id: companyId
});
```

### Update
```javascript
const record = await Model.findOne({ where: { id, company_id } });
await record.update({ name: 'New Name' });
```

### Delete
```javascript
const record = await Model.findOne({ where: { id, company_id } });
await record.destroy();
```

### Transactions
```javascript
const transaction = await sequelize.transaction();
try {
  await Model1.create({ data }, { transaction });
  await Model2.create({ data }, { transaction });
  await transaction.commit();
} catch (error) {
  await transaction.rollback();
  throw error;
}
```

### Aggregations
```javascript
const result = await Model.findAll({
  attributes: [
    'category',
    [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
    [sequelize.fn('COUNT', sequelize.col('id')), 'count']
  ],
  where: { company_id },
  group: ['category']
});
```

## Environment Variables

### Required MySQL Variables
```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=inventory_management
DB_USER=root
DB_PASSWORD=your_password
```

## Database Setup

1. Create MySQL database:
```sql
CREATE DATABASE inventory_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```

2. Start the server (tables will be created automatically):
```bash
npm start
```

3. For development with auto-reload:
```bash
npm run dev
```

## Testing

Before deploying, ensure:
1. All controllers are updated to use Sequelize
2. All services use Sequelize transactions where appropriate
3. All routes are tested for CRUD operations
4. Multi-tenancy (company_id filtering) works correctly
5. Authentication and JWT tokens work properly

## Architecture Principles

This project follows these principles:
- **Models**: Define schema and associations only (no business logic)
- **Services**: Contain business logic and complex operations
- **Controllers**: Handle HTTP requests/responses and call services
- **Multi-tenancy**: All queries filter by company_id for data isolation
- **Transactions**: Use for operations that modify multiple tables
- **JWT Authentication**: Secure all routes except auth endpoints

## Notes

- All models use UUID primary keys
- Timestamps (created_at, updated_at) are handled automatically by Sequelize
- Foreign keys are defined with proper references
- Indexes are created for frequently queried columns
- Multi-company data isolation is enforced at the query level
