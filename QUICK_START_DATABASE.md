# Quick Start: Database Configuration

## 🚀 Get Started in 3 Steps

### Step 1: Get Your Supabase Password

Visit: https://supabase.com/dashboard/project/jvwkjrhvsavptkkyyaso/settings/database

Copy your database password.

### Step 2: Configure DATABASE_URL

Add to your `.env` file:

```bash
DATABASE_URL=postgresql://postgres:YOUR_PASSWORD_HERE@db.jvwkjrhvsavptkkyyaso.supabase.co:5432/postgres
```

Replace `YOUR_PASSWORD_HERE` with your actual password.

### Step 3: Start the Server

```bash
npm start
```

You should see:
```
✓ PostgreSQL database connection established successfully
```

---

## ✅ What's Already Done

- ✅ All 13 tables created in Supabase
- ✅ Database schema matches data_structure.md exactly
- ✅ Row Level Security (RLS) configured
- ✅ Sequelize models updated to camelCase fields
- ✅ Migration system configured

## ⚠️ What You Need to Do

- ⚠️ Add DATABASE_URL to .env with your Supabase password

---

## 📋 Key Information

**Database Type**: PostgreSQL (Supabase)
**Field Naming**: camelCase (companyId, not company_id)
**Data Types**: TEXT for most fields (loose typing)
**Tables**: 13 tables from data_structure.md

---

## 🔧 Field Name Examples

| Old (snake_case) | New (camelCase) |
|------------------|-----------------|
| company_id       | companyId       |
| category_id      | categoryId      |
| created_at       | createdAt       |
| current_stock    | currentStock    |

---

## 📚 Full Documentation

- `DATABASE_SETUP_GUIDE.md` - Complete setup instructions
- `DATA_STRUCTURE_ADAPTATION_COMPLETE.md` - Migration details
- `DATABASE_SYNC_FIX.md` - Sync error resolution

---

## ❓ Still Having Issues?

Check:
1. Is DATABASE_URL in your .env file?
2. Did you use your actual Supabase password?
3. Is your Supabase project active?

Run the server and check the error message for specific issues.
