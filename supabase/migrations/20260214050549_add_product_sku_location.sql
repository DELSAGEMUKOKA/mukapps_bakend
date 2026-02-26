/*
  # Add SKU and Location fields to Products

  1. Changes
    - Add `sku` column to products table (optional, unique per company)
    - Add `location` column to products table (optional, for warehouse location)
    - Add unique index for SKU per company

  2. Purpose
    - SKU: Stock Keeping Unit for internal product identification
    - Location: Physical location in warehouse/store

  3. Notes
    - Both fields are optional (NULL allowed)
    - SKU must be unique within a company (not globally)
    - Existing products will have NULL values (acceptable)
*/

-- Add SKU column
ALTER TABLE products
ADD COLUMN IF NOT EXISTS sku VARCHAR(50) NULL;

-- Add Location column
ALTER TABLE products
ADD COLUMN IF NOT EXISTS location VARCHAR(200) NULL;

-- Add unique index for SKU per company
-- This ensures SKU is unique within each company but can be reused across companies
CREATE UNIQUE INDEX IF NOT EXISTS unique_sku_per_company
ON products(sku, company_id)
WHERE sku IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN products.sku IS 'Stock Keeping Unit - internal product code, unique per company';
COMMENT ON COLUMN products.location IS 'Physical storage location (e.g., Warehouse A - Shelf 3)';
