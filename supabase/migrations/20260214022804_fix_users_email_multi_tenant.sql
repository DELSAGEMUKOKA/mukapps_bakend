/*
  # Fix Users Email Constraint for Multi-Tenant Isolation

  ## Overview
  This migration fixes a critical multi-tenant issue where user emails were globally 
  unique across all companies. In a multi-tenant SaaS system, the same email address
  should be allowed to exist in different companies (e.g., john@example.com can be 
  an admin in Company A and also work as a user in Company B).

  ## Changes Made

  ### 1. Users Table - Email Uniqueness
  - **Remove**: Global unique constraint on `email` column
  - **Add**: Composite unique constraint on `(email, company_id)`
  - **Impact**: Same email can exist in different companies
  - **Security**: Prevents duplicate emails within the same company

  ## Business Logic
  
  **Before (WRONG):**
  - john@example.com registers for Company A ✅
  - john@example.com tries to register for Company B ❌ (rejected - email exists)
  
  **After (CORRECT):**
  - john@example.com registers for Company A ✅
  - john@example.com registers for Company B ✅ (different company)
  - john@example.com tries to register again for Company A ❌ (rejected - email exists in that company)

  ## Data Safety
  - Uses `IF EXISTS` to safely drop constraints
  - Uses `IF NOT EXISTS` to safely create constraints
  - No data loss - only constraint modifications
  - Backwards compatible with existing data

  ## Important Notes
  1. This is critical for proper multi-tenant isolation
  2. Authentication logic already filters by email during login
  3. After login, company_id is retrieved from the user record
  4. All queries automatically filter by company_id via middleware
*/

-- Drop global unique constraint on users.email (if exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_email_key' 
    AND conrelid = 'users'::regclass
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_email_key;
  END IF;
END $$;

-- Drop any existing index on users.email (if exists)
DROP INDEX IF EXISTS users_email_key;

-- Create composite unique constraint for email per company
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_email_per_company'
    AND conrelid = 'users'::regclass
  ) THEN
    ALTER TABLE users 
    ADD CONSTRAINT unique_email_per_company 
    UNIQUE (email, company_id);
  END IF;
END $$;

-- Create index for better query performance (email lookups are common)
CREATE INDEX IF NOT EXISTS idx_users_email_company 
  ON users(email, company_id);

-- Create additional index for login queries (email lookup first, then company check)
CREATE INDEX IF NOT EXISTS idx_users_email 
  ON users(email);

-- Verify the changes
DO $$
BEGIN
  -- Check users constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_email_per_company'
  ) THEN
    RAISE EXCEPTION 'Failed to create unique_email_per_company constraint';
  END IF;

  RAISE NOTICE 'Users email multi-tenant constraint migration completed successfully';
END $$;