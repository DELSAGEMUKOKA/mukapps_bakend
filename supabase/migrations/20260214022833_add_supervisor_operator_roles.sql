/*
  # Add Supervisor and Operator Roles to Users

  ## Overview
  This migration adds two new roles to the users table to support the full
  role hierarchy required for the multi-tenant inventory management system.

  ## Role Hierarchy
  1. **ADMIN** - Full access to all company data and settings
  2. **SUPERVISOR** - Product management + invoices + viewing capabilities
  3. **OPERATOR** - Invoice creation only
  4. **CASHIER** - Limited cash receipts/invoice creation, can add customers but not delete

  ## Changes Made
  - Add 'supervisor' to role enum
  - Add 'operator' to role enum
  - Maintain existing 'admin' and 'cashier' roles

  ## Data Safety
  - Existing user roles remain unchanged
  - New roles available for future user assignments
  - No data loss
*/

-- Check if role constraint exists and update it
DO $$
BEGIN
  -- Drop existing check constraint if it exists
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'users_role_check'
    AND conrelid = 'users'::regclass
  ) THEN
    ALTER TABLE users DROP CONSTRAINT users_role_check;
  END IF;

  -- Add new check constraint with all four roles
  ALTER TABLE users 
  ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'supervisor', 'operator', 'cashier'));

  RAISE NOTICE 'Supervisor and Operator roles added successfully';
END $$;