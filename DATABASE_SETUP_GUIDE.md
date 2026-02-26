# Database Setup Guide

## Overview

This application has been adapted to use the exact database structure from `data_structure.md` with PostgreSQL/Supabase as the database backend.

## Database Configuration Required

### Step 1: Get Your Supabase Database Password

1. Go to your Supabase project dashboard: https://supabase.com/dashboard
2. Select your project: `jvwkjrhvsavptkkyyaso`
3. Navigate to: **Project Settings** > **Database**
4. Find the **Connection string** section
5. Copy the **Connection string** (choose either Direct connection or Connection pooler)

The connection string will look like:
```
postgresql://postgres:[YOUR-PASSWORD]@db.jvwkjrhvsavptkkyyaso.supabase.co:5432/postgres
```

### Step 2: Update Environment Variable

Add the `DATABASE_URL` to your `.env` file:

```bash
# In .env file
DATABASE_URL=postgresql://postgres:[YOUR-PASSWORD]@db.jvwkjrhvsavptkkyyaso.supabase.co:5432/postgres
```

**Replace `[YOUR-PASSWORD]` with your actual Supabase database password.**

### Alternative: Use .env.local (Recommended)

For better security, create a `.env.local` file (which is gitignored) with your sensitive credentials:

```bash
# .env.local
DATABASE_URL=postgresql://postgres:your-actual-password@db.jvwkjrhvsavptkkyyaso.supabase.co:5432/postgres
```

## Database Schema

The database uses the exact schema from `data_structure.md`:

### Tables Created (13 tables)
1. **companies** - Multi-tenant company records
2. **categories** - Product categories
3. **products** - Product catalog with inventory
4. **customers** - Customer management
5. **invoices** - Sales invoices (items stored as JSON)
6. **expenses** - Business expense tracking
7. **stockMovements** - Inventory audit trail
8. **settings** - Company configuration
9. **roles** - Role-based access control
10. **subscriptions** - SaaS subscription management
11. **adminActions** - Admin audit log
12. **loginAttempts** - Security audit log
13. **userPins** - POS authentication codes

### Field Naming Convention

All fields use **camelCase** naming (matching data_structure.md):
- `companyId` (not `company_id`)
- `categoryId` (not `category_id`)
- `createdAt` (not `created_at`)
- etc.

### Data Types

Most fields use **TEXT** type to match the Firebase export format:
- Numeric values stored as TEXT strings (e.g., `price`, `quantity`)
- Boolean values stored as TEXT strings (e.g., `"true"`, `"false"`)
- Timestamps stored as TEXT with Firebase format: `{"_seconds": 1234567890, "_nanoseconds": 123456789}`

## Migration Applied

The migration `adapt_to_data_structure_md_schema.sql` has been applied to Supabase, which:
- Creates all 13 tables with exact schema from data_structure.md
- Sets up Row Level Security (RLS) on all tables
- Creates indexes on foreign key columns
- Implements company-level data isolation

## Sequelize Configuration

### Important Notes

1. **Sync is Disabled**: Sequelize's automatic sync is disabled. Schema is managed through Supabase migrations only.
2. **No Automatic Timestamps**: Sequelize timestamps are disabled; using custom TEXT fields instead.
3. **PostgreSQL Dialect**: Using `postgres` dialect with SSL enabled for Supabase.

### Connection Configuration

File: `src/config/database.js`

The configuration:
- Requires `DATABASE_URL` environment variable
- Uses PostgreSQL dialect
- Enables SSL for Supabase connection
- Disables Sequelize's automatic schema sync
- Uses custom timestamps (camelCase TEXT fields)

## Starting the Server

### Prerequisites

1. ✅ Supabase migrations applied (already done)
2. ⚠️ DATABASE_URL configured in .env file (you need to add your password)

### Start Command

```bash
npm start
# or
npm run dev
```

### Expected Output

When configured correctly, you should see:
```
✓ PostgreSQL database connection established successfully
✓ Database connection verified. Using Supabase migrations (sync disabled)
Server is running on port 5000
```

### If Connection Fails

Check the following:
1. Is `DATABASE_URL` set in your .env file?
2. Did you replace `[YOUR-PASSWORD]` with your actual password?
3. Is your Supabase project active?
4. Are you connected to the internet?

## Working with the Database

### Creating Records

When creating records, remember:
- IDs should be VARCHAR(255) strings (e.g., UUID or Firebase ID format)
- Numeric values should be strings: `"99.99"` not `99.99`
- Booleans should be strings: `"true"` not `true`
- Timestamps should use Firebase format or TEXT representation

Example:
```javascript
await Product.create({
  id: 'prod_123abc',
  name: 'Test Product',
  price: '99.99',  // TEXT string
  currentStock: '10',  // TEXT string
  trackStock: 'true',  // TEXT boolean
  companyId: 'comp_456def',
  createdAt: '{"_seconds": 1234567890, "_nanoseconds": 0}'
});
```

### Querying Records

Use camelCase field names:
```javascript
// Correct
const products = await Product.findAll({
  where: { companyId: 'comp_123' }
});

// Incorrect (old snake_case)
// where: { company_id: 'comp_123' }
```

### Type Conversions

Create utility functions to handle type conversions:
```javascript
// Parse TEXT to number
const price = parseFloat(product.price);

// Parse TEXT to boolean
const isActive = product.trackStock === 'true';

// Parse Firebase timestamp
const createdDate = new Date(
  JSON.parse(product.createdAt)._seconds * 1000
);
```

## Security (RLS)

All tables have Row Level Security enabled with company-level isolation:
- Users can only access data from their own company
- Enforced at the database level
- Policies check `auth.uid()` and company ownership

## Next Steps

1. **Configure DATABASE_URL** - Add your Supabase password to .env
2. **Test Connection** - Run `npm start` to verify database connection
3. **Update Controllers** - Controllers may need updates to work with camelCase fields
4. **Add Type Conversions** - Create utility functions for TEXT to number/boolean conversions
5. **Update Validation** - Update Joi schemas to match new field names

## Troubleshooting

### Error: "DATABASE_URL environment variable is not set"

**Solution**: Add DATABASE_URL to your .env file with your Supabase connection string.

### Error: "password authentication failed"

**Solution**: Check that you've replaced `[YOUR-PASSWORD]` with your actual Supabase database password.

### Error: "relation does not exist"

**Solution**: The migrations may not be applied. Check Supabase dashboard to verify tables exist.

### Error: "column does not exist"

**Solution**: You may be using old snake_case field names. Update to camelCase (e.g., `companyId` not `company_id`).

## Documentation References

- `data_structure.md` - Original database schema specification
- `DATA_STRUCTURE_ADAPTATION_COMPLETE.md` - Complete adaptation summary
- `DATABASE_SYNC_FIX.md` - Synchronization error fix details
- `SETUP.md` - General application setup guide

## Support

If you encounter issues:
1. Check the Supabase dashboard for database status
2. Verify your DATABASE_URL is correct
3. Check the server logs for specific error messages
4. Ensure all migrations have been applied
