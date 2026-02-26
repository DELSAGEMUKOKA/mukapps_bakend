/*
  # Fix Company Data Isolation - Critical Security Update

  ## Overview
  This migration fixes a critical security vulnerability where data was not properly
  isolated between companies. It ensures that barcodes and invoice numbers are unique
  per company, not globally.

  ## Changes Made

  ### 1. Products Table - Barcode Uniqueness
  - **Remove**: Global unique constraint on `barcode` column
  - **Add**: Composite unique constraint on `(barcode, company_id)`
  - **Impact**: Multiple companies can now use the same barcode for different products
  - **Security**: Prevents barcode conflicts between companies

  ### 2. Invoices Table - Invoice Number Uniqueness
  - **Remove**: Global unique constraint on `invoice_number` column
  - **Add**: Composite unique constraint on `(invoice_number, company_id)`
  - **Impact**: Multiple companies can now have the same invoice number
  - **Security**: Proper isolation of invoice numbering per company

  ## Data Safety
  - Uses `IF EXISTS` to safely drop constraints if they exist
  - Uses `IF NOT EXISTS` to safely create new constraints
  - No data loss - only constraint modifications
  - Backwards compatible

  ## Important Notes
  1. This is a critical security fix
  2. All existing data remains intact
  3. Future inserts will be validated per-company
  4. Application code has been updated to match these constraints
*/

-- Drop global unique constraint on products.barcode (if exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'products_barcode_key' 
    AND conrelid = 'products'::regclass
  ) THEN
    ALTER TABLE products DROP CONSTRAINT products_barcode_key;
  END IF;
END $$;

-- Drop global unique index on products.barcode (if exists)
DROP INDEX IF EXISTS products_barcode_key;

-- Create composite unique constraint for barcode per company
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_barcode_per_company'
    AND conrelid = 'products'::regclass
  ) THEN
    ALTER TABLE products 
    ADD CONSTRAINT unique_barcode_per_company 
    UNIQUE (barcode, company_id);
  END IF;
END $$;

-- Drop global unique constraint on invoices.invoice_number (if exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'invoices_invoice_number_key' 
    AND conrelid = 'invoices'::regclass
  ) THEN
    ALTER TABLE invoices DROP CONSTRAINT invoices_invoice_number_key;
  END IF;
END $$;

-- Drop global unique index on invoices.invoice_number (if exists)
DROP INDEX IF EXISTS invoices_invoice_number_key;

-- Create composite unique constraint for invoice_number per company
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_invoice_number_per_company'
    AND conrelid = 'invoices'::regclass
  ) THEN
    ALTER TABLE invoices 
    ADD CONSTRAINT unique_invoice_number_per_company 
    UNIQUE (invoice_number, company_id);
  END IF;
END $$;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_products_barcode_company 
  ON products(barcode, company_id) 
  WHERE barcode IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_invoices_invoice_number_company 
  ON invoices(invoice_number, company_id);

-- Verify the changes
DO $$
BEGIN
  -- Check products constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_barcode_per_company'
  ) THEN
    RAISE EXCEPTION 'Failed to create unique_barcode_per_company constraint';
  END IF;

  -- Check invoices constraint
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint 
    WHERE conname = 'unique_invoice_number_per_company'
  ) THEN
    RAISE EXCEPTION 'Failed to create unique_invoice_number_per_company constraint';
  END IF;

  RAISE NOTICE 'Company data isolation migration completed successfully';
END $$;