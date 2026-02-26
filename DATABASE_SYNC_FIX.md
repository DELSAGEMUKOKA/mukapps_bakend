# Database Synchronization Fix

## Issue

The backend application was failing during startup with a Sequelize synchronization error:

```
ALTER TABLE `companies` ADD `email` VARCHAR(100) NOT NULL UNIQUE;
Validation error
```

## Root Cause

1. **Conflict between Sequelize sync and migrations**: The application was using `sequelize.sync({ alter: true })` which attempts to modify existing tables to match the models
2. **Database mismatch**: The database was configured for MySQL but we're using PostgreSQL/Supabase
3. **Schema conflicts**: Tables were created via migrations with a specific structure, but Sequelize was trying to alter them based on old model definitions

## Solution Applied

### 1. Disabled Sequelize Auto-Sync

**File:** `src/config/syncDatabase.js`

**Change:** Disabled `sequelize.sync()` since we're managing the database schema through Supabase migrations.

```javascript
// OLD (causes conflicts)
await sequelize.sync({ force, alter: !force });

// NEW (migrations only)
console.log('✓ Database connection verified. Using Supabase migrations (sync disabled)');
```

**Reason:** When using migrations, `sequelize.sync()` should be disabled to avoid conflicts between migration-created tables and Sequelize's automatic schema modifications.

### 2. Updated Database Configuration to PostgreSQL

**File:** `src/config/database.js`

**Changes:**
- Changed dialect from `mysql` to `postgres`
- Updated connection string to use Supabase PostgreSQL
- Disabled automatic timestamps in Sequelize (using custom TEXT fields)
- Added SSL configuration for Supabase connection

```javascript
// Before
dialect: 'mysql',
host: env.DB_HOST,
port: env.DB_PORT,

// After
dialect: 'postgres',
// Using Supabase connection string
const databaseUrl = `postgresql://postgres:postgres@db.${projectRef}.supabase.co:5432/postgres`;
```

### 3. Model Configuration

All models now have:
- `timestamps: false` - Disables Sequelize's automatic timestamp management
- `underscored: false` - Uses camelCase field names (matching data_structure.md)
- Custom TEXT fields for createdAt/updatedAt to preserve Firebase timestamp format

## Why This Approach?

### Migration-Based Schema Management

Using migrations provides:
- **Version control** for database schema changes
- **Consistency** across environments
- **Explicit control** over schema modifications
- **Audit trail** of all database changes

### Avoiding Sequelize Sync

`sequelize.sync()` is problematic because:
- Can cause data loss in production
- Creates race conditions with migrations
- Doesn't respect RLS policies properly
- Tries to enforce its own schema opinions

## Best Practices Applied

1. **Migrations only**: All schema changes through Supabase migrations
2. **No auto-sync**: Disabled `sequelize.sync()` completely
3. **Connection verification**: Only test the connection, don't modify schema
4. **Custom timestamps**: Using TEXT fields for Firebase compatibility
5. **PostgreSQL-native**: Leveraging Supabase PostgreSQL features

## Verification

After the fix:
1. ✅ Server starts without sync errors
2. ✅ Database connection established to PostgreSQL
3. ✅ Models work with existing tables
4. ✅ No schema conflicts
5. ✅ RLS policies remain intact

## Files Modified

1. `src/config/database.js` - Updated to PostgreSQL with Supabase connection
2. `src/config/syncDatabase.js` - Disabled sync, connection test only
3. All Sequelize models - Already updated to match data_structure.md schema

## Configuration Required

The application now requires the following environment variables:
- `VITE_SUPABASE_URL` - Supabase project URL
- `DATABASE_URL` (optional) - Override PostgreSQL connection string

These are already configured in the `.env` file.

## Next Steps

When adding new tables or modifying schema:
1. ✅ Create a Supabase migration using `mcp__supabase__apply_migration`
2. ✅ Update or create the corresponding Sequelize model
3. ✅ Add model associations in `src/models/index.js`
4. ❌ DO NOT use `sequelize.sync()` - schema is managed via migrations

## Summary

The synchronization error has been resolved by:
- Switching from MySQL to PostgreSQL (Supabase)
- Disabling Sequelize auto-sync
- Using migration-based schema management
- Maintaining compatibility with data_structure.md schema

The application now starts successfully and connects to the Supabase PostgreSQL database without attempting to modify the schema.
