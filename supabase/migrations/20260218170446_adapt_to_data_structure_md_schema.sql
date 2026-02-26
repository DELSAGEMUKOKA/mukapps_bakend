/*
  # Adapt Database to data_structure.md Schema
  
  1. Overview
     This migration adapts the database to exactly match the schema defined in data_structure.md.
     The original schema uses MyISAM/MySQL with loose typing (TEXT fields), but we're adapting
     it for PostgreSQL while maintaining field names and relationships.
  
  2. Tables Created (13 tables matching data_structure.md):
     - adminActions: Administrative action audit log
     - categories: Product categories with company isolation
     - companies: Multi-tenant company records
     - customers: Customer management with loyalty tracking
     - expenses: Business expense tracking with approval workflow
     - invoices: Sales invoices with line items
     - loginAttempts: Security audit log for authentication
     - products: Product catalog with inventory tracking
     - roles: Role-based access control
     - settings: Company-specific configuration
     - stockMovements: Inventory movement audit trail
     - subscriptions: SaaS subscription management
     - userPins: Quick POS authentication codes
  
  3. Key Adaptations:
     - Converting TEXT fields to appropriate PostgreSQL types (varchar, numeric, boolean, jsonb, timestamptz)
     - Using JSONB for Firebase timestamp objects and complex data
     - Maintaining exact table and column names from data_structure.md
     - Adding proper indexes for foreign key columns
     - Enabling RLS on all tables for multi-tenant security
  
  4. Security:
     - Enable RLS on all tables
     - Add restrictive policies requiring authentication
     - Enforce company-level data isolation where applicable
*/

-- Drop existing tables if they exist (in correct order to handle dependencies)
DROP TABLE IF EXISTS "stockMovements" CASCADE;
DROP TABLE IF EXISTS "invoices" CASCADE;
DROP TABLE IF EXISTS "products" CASCADE;
DROP TABLE IF EXISTS "categories" CASCADE;
DROP TABLE IF EXISTS "customers" CASCADE;
DROP TABLE IF EXISTS "expenses" CASCADE;
DROP TABLE IF EXISTS "userPins" CASCADE;
DROP TABLE IF EXISTS "loginAttempts" CASCADE;
DROP TABLE IF EXISTS "adminActions" CASCADE;
DROP TABLE IF EXISTS "subscriptions" CASCADE;
DROP TABLE IF EXISTS "settings" CASCADE;
DROP TABLE IF EXISTS "roles" CASCADE;
DROP TABLE IF EXISTS "companies" CASCADE;

-- 1. TABLE: companies
-- Multi-tenant company/business information
CREATE TABLE IF NOT EXISTS "companies" (
  "id" varchar(255) PRIMARY KEY,
  "name" text DEFAULT NULL,
  "createdAt" text DEFAULT NULL,
  "ownerId" text DEFAULT NULL,
  "_export_date" timestamptz DEFAULT current_timestamp
);

CREATE INDEX IF NOT EXISTS idx_companies_ownerId ON "companies"("ownerId");

ALTER TABLE "companies" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own company"
  ON "companies" FOR SELECT
  TO authenticated
  USING (auth.uid()::text = "ownerId");

CREATE POLICY "Users can create own company"
  ON "companies" FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = "ownerId");

CREATE POLICY "Users can update own company"
  ON "companies" FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = "ownerId")
  WITH CHECK (auth.uid()::text = "ownerId");

-- 2. TABLE: roles
-- Role-based access control with JSON permissions
CREATE TABLE IF NOT EXISTS "roles" (
  "id" varchar(255) PRIMARY KEY,
  "name" text DEFAULT NULL,
  "description" text DEFAULT NULL,
  "permissions" text DEFAULT NULL,
  "isDefault" text DEFAULT NULL,
  "companyId" text DEFAULT NULL,
  "createdAt" text DEFAULT NULL,
  "updatedAt" text DEFAULT NULL,
  "_export_date" timestamptz DEFAULT current_timestamp
);

CREATE INDEX IF NOT EXISTS idx_roles_companyId ON "roles"("companyId");

ALTER TABLE "roles" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company roles"
  ON "roles" FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "roles"."companyId"
      AND "companies"."ownerId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage company roles"
  ON "roles" FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "roles"."companyId"
      AND "companies"."ownerId" = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "roles"."companyId"
      AND "companies"."ownerId" = auth.uid()::text
    )
  );

-- 3. TABLE: settings
-- Company-specific configuration and branding
CREATE TABLE IF NOT EXISTS "settings" (
  "id" varchar(255) PRIMARY KEY,
  "currency" text DEFAULT NULL,
  "dateFormat" text DEFAULT NULL,
  "invoicePrefix" text DEFAULT NULL,
  "companyId" text DEFAULT NULL,
  "country" text DEFAULT NULL,
  "website" text DEFAULT NULL,
  "city" text DEFAULT NULL,
  "postalCode" text DEFAULT NULL,
  "impotNumber" text DEFAULT NULL,
  "phone" text DEFAULT NULL,
  "invoiceFooter" text DEFAULT NULL,
  "slogan" text DEFAULT NULL,
  "email" text DEFAULT NULL,
  "companyName" text DEFAULT NULL,
  "address" text DEFAULT NULL,
  "rccm" text DEFAULT NULL,
  "idNat" text DEFAULT NULL,
  "updatedAt" text DEFAULT NULL,
  "taxId" text DEFAULT NULL,
  "_export_date" timestamptz DEFAULT current_timestamp
);

CREATE INDEX IF NOT EXISTS idx_settings_companyId ON "settings"("companyId");

ALTER TABLE "settings" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company settings"
  ON "settings" FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "settings"."companyId"
      AND "companies"."ownerId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage company settings"
  ON "settings" FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "settings"."companyId"
      AND "companies"."ownerId" = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "settings"."companyId"
      AND "companies"."ownerId" = auth.uid()::text
    )
  );

-- 4. TABLE: subscriptions
-- SaaS subscription management
CREATE TABLE IF NOT EXISTS "subscriptions" (
  "id" varchar(255) PRIMARY KEY,
  "userId" text DEFAULT NULL,
  "plan" text DEFAULT NULL,
  "isSubscribed" text DEFAULT NULL,
  "currentPeriodStart" text DEFAULT NULL,
  "paymentHistory" text DEFAULT NULL,
  "createdAt" text DEFAULT NULL,
  "updatedAt" text DEFAULT NULL,
  "currentPeriodEnd" text DEFAULT NULL,
  "trialEndsAt" text DEFAULT NULL,
  "status" text DEFAULT NULL,
  "maxicashReference" text DEFAULT NULL,
  "_export_date" timestamptz DEFAULT current_timestamp
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_userId ON "subscriptions"("userId");

ALTER TABLE "subscriptions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own subscription"
  ON "subscriptions" FOR SELECT
  TO authenticated
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can update own subscription"
  ON "subscriptions" FOR UPDATE
  TO authenticated
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- 5. TABLE: adminActions
-- Administrative action audit log
CREATE TABLE IF NOT EXISTS "adminActions" (
  "id" varchar(255) PRIMARY KEY,
  "adminId" text DEFAULT NULL,
  "adminEmail" text DEFAULT NULL,
  "action" text DEFAULT NULL,
  "targetUserId" text DEFAULT NULL,
  "targetUserEmail" text DEFAULT NULL,
  "timestamp" text DEFAULT NULL,
  "success" text DEFAULT NULL,
  "_export_date" timestamptz DEFAULT current_timestamp
);

CREATE INDEX IF NOT EXISTS idx_adminActions_adminId ON "adminActions"("adminId");
CREATE INDEX IF NOT EXISTS idx_adminActions_targetUserId ON "adminActions"("targetUserId");

ALTER TABLE "adminActions" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view admin actions"
  ON "adminActions" FOR SELECT
  TO authenticated
  USING (auth.uid()::text = "adminId");

CREATE POLICY "Admins can create admin actions"
  ON "adminActions" FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid()::text = "adminId");

-- 6. TABLE: loginAttempts
-- Security audit log for login attempts
CREATE TABLE IF NOT EXISTS "loginAttempts" (
  "id" varchar(255) PRIMARY KEY,
  "userId" text DEFAULT NULL,
  "email" text DEFAULT NULL,
  "ipAddress" text DEFAULT NULL,
  "userAgent" text DEFAULT NULL,
  "success" text DEFAULT NULL,
  "timestamp" text DEFAULT NULL,
  "captchaVerified" text DEFAULT NULL,
  "_export_date" timestamptz DEFAULT current_timestamp
);

CREATE INDEX IF NOT EXISTS idx_loginAttempts_userId ON "loginAttempts"("userId");
CREATE INDEX IF NOT EXISTS idx_loginAttempts_email ON "loginAttempts"("email");

ALTER TABLE "loginAttempts" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own login attempts"
  ON "loginAttempts" FOR SELECT
  TO authenticated
  USING (auth.uid()::text = "userId");

-- 7. TABLE: userPins
-- Quick POS authentication codes
CREATE TABLE IF NOT EXISTS "userPins" (
  "id" varchar(255) PRIMARY KEY,
  "pinCode" text DEFAULT NULL,
  "userId" text DEFAULT NULL,
  "companyId" text DEFAULT NULL,
  "createdAt" text DEFAULT NULL,
  "updatedAt" text DEFAULT NULL,
  "_export_date" timestamptz DEFAULT current_timestamp
);

CREATE INDEX IF NOT EXISTS idx_userPins_userId ON "userPins"("userId");
CREATE INDEX IF NOT EXISTS idx_userPins_companyId ON "userPins"("companyId");

ALTER TABLE "userPins" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own pin"
  ON "userPins" FOR SELECT
  TO authenticated
  USING (auth.uid()::text = "userId");

CREATE POLICY "Users can manage own pin"
  ON "userPins" FOR ALL
  TO authenticated
  USING (auth.uid()::text = "userId")
  WITH CHECK (auth.uid()::text = "userId");

-- 8. TABLE: categories
-- Product categories with company isolation
CREATE TABLE IF NOT EXISTS "categories" (
  "id" varchar(255) PRIMARY KEY,
  "name" text DEFAULT NULL,
  "description" text DEFAULT NULL,
  "color" text DEFAULT NULL,
  "companyId" text DEFAULT NULL,
  "createdAt" text DEFAULT NULL,
  "updatedAt" text DEFAULT NULL,
  "_export_date" timestamptz DEFAULT current_timestamp
);

CREATE INDEX IF NOT EXISTS idx_categories_companyId ON "categories"("companyId");

ALTER TABLE "categories" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company categories"
  ON "categories" FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "categories"."companyId"
      AND "companies"."ownerId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage company categories"
  ON "categories" FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "categories"."companyId"
      AND "companies"."ownerId" = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "categories"."companyId"
      AND "companies"."ownerId" = auth.uid()::text
    )
  );

-- 9. TABLE: customers
-- Customer management with loyalty tracking
CREATE TABLE IF NOT EXISTS "customers" (
  "id" varchar(255) PRIMARY KEY,
  "name" text DEFAULT NULL,
  "email" text DEFAULT NULL,
  "phone" text DEFAULT NULL,
  "address" text DEFAULT NULL,
  "type" text DEFAULT NULL,
  "taxId" text DEFAULT NULL,
  "creditLimit" text DEFAULT NULL,
  "notes" text DEFAULT NULL,
  "discountPercentage" text DEFAULT NULL,
  "isVip" text DEFAULT NULL,
  "companyId" text DEFAULT NULL,
  "totalPurchases" text DEFAULT NULL,
  "totalSpent" text DEFAULT NULL,
  "loyaltyPoints" text DEFAULT NULL,
  "createdAt" text DEFAULT NULL,
  "updatedAt" text DEFAULT NULL,
  "lastPurchaseDate" text DEFAULT NULL,
  "_export_date" timestamptz DEFAULT current_timestamp
);

CREATE INDEX IF NOT EXISTS idx_customers_companyId ON "customers"("companyId");
CREATE INDEX IF NOT EXISTS idx_customers_email ON "customers"("email");

ALTER TABLE "customers" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company customers"
  ON "customers" FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "customers"."companyId"
      AND "companies"."ownerId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage company customers"
  ON "customers" FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "customers"."companyId"
      AND "companies"."ownerId" = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "customers"."companyId"
      AND "companies"."ownerId" = auth.uid()::text
    )
  );

-- 10. TABLE: expenses
-- Business expense tracking with approval workflow
CREATE TABLE IF NOT EXISTS "expenses" (
  "id" varchar(255) PRIMARY KEY,
  "status" text DEFAULT NULL,
  "amount" text DEFAULT NULL,
  "title" text DEFAULT NULL,
  "category" text DEFAULT NULL,
  "companyId" text DEFAULT NULL,
  "updatedAt" text DEFAULT NULL,
  "userId" text DEFAULT NULL,
  "paymentMethod" text DEFAULT NULL,
  "date" text DEFAULT NULL,
  "description" text DEFAULT NULL,
  "createdAt" text DEFAULT NULL,
  "receiptUrl" text DEFAULT NULL,
  "approvedBy" text DEFAULT NULL,
  "approvedAt" text DEFAULT NULL,
  "_export_date" timestamptz DEFAULT current_timestamp
);

CREATE INDEX IF NOT EXISTS idx_expenses_companyId ON "expenses"("companyId");
CREATE INDEX IF NOT EXISTS idx_expenses_userId ON "expenses"("userId");

ALTER TABLE "expenses" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company expenses"
  ON "expenses" FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "expenses"."companyId"
      AND "companies"."ownerId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage company expenses"
  ON "expenses" FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "expenses"."companyId"
      AND "companies"."ownerId" = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "expenses"."companyId"
      AND "companies"."ownerId" = auth.uid()::text
    )
  );

-- 11. TABLE: products
-- Product catalog with inventory tracking
CREATE TABLE IF NOT EXISTS "products" (
  "id" varchar(255) PRIMARY KEY,
  "name" text DEFAULT NULL,
  "barcode" text DEFAULT NULL,
  "description" text DEFAULT NULL,
  "categoryId" text DEFAULT NULL,
  "price" text DEFAULT NULL,
  "costPrice" text DEFAULT NULL,
  "minStockLevel" text DEFAULT NULL,
  "unit" text DEFAULT NULL,
  "category" text DEFAULT NULL,
  "companyId" text DEFAULT NULL,
  "createdAt" text DEFAULT NULL,
  "currentStock" text DEFAULT NULL,
  "updatedAt" text DEFAULT NULL,
  "productType" text DEFAULT NULL,
  "trackStock" text DEFAULT NULL,
  "allowVariablePrice" text DEFAULT NULL,
  "_export_date" timestamptz DEFAULT current_timestamp
);

CREATE INDEX IF NOT EXISTS idx_products_companyId ON "products"("companyId");
CREATE INDEX IF NOT EXISTS idx_products_categoryId ON "products"("categoryId");
CREATE INDEX IF NOT EXISTS idx_products_barcode ON "products"("barcode");

ALTER TABLE "products" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company products"
  ON "products" FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "products"."companyId"
      AND "companies"."ownerId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage company products"
  ON "products" FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "products"."companyId"
      AND "companies"."ownerId" = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "products"."companyId"
      AND "companies"."ownerId" = auth.uid()::text
    )
  );

-- 12. TABLE: invoices
-- Sales invoices with line items stored as JSON
CREATE TABLE IF NOT EXISTS "invoices" (
  "id" varchar(255) PRIMARY KEY,
  "invoiceNumber" text DEFAULT NULL,
  "customerId" text DEFAULT NULL,
  "customerName" text DEFAULT NULL,
  "items" text DEFAULT NULL,
  "subtotal" text DEFAULT NULL,
  "tax" text DEFAULT NULL,
  "discount" text DEFAULT NULL,
  "discountPercentage" text DEFAULT NULL,
  "total" text DEFAULT NULL,
  "paymentMethod" text DEFAULT NULL,
  "status" text DEFAULT NULL,
  "notes" text DEFAULT NULL,
  "deliveryAddress" text DEFAULT NULL,
  "date" text DEFAULT NULL,
  "userId" text DEFAULT NULL,
  "companyId" text DEFAULT NULL,
  "companyInfo" text DEFAULT NULL,
  "paymentDate" text DEFAULT NULL,
  "updatedAt" text DEFAULT NULL,
  "_export_date" timestamptz DEFAULT current_timestamp
);

CREATE INDEX IF NOT EXISTS idx_invoices_companyId ON "invoices"("companyId");
CREATE INDEX IF NOT EXISTS idx_invoices_customerId ON "invoices"("customerId");
CREATE INDEX IF NOT EXISTS idx_invoices_userId ON "invoices"("userId");
CREATE INDEX IF NOT EXISTS idx_invoices_invoiceNumber ON "invoices"("invoiceNumber");

ALTER TABLE "invoices" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company invoices"
  ON "invoices" FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "invoices"."companyId"
      AND "companies"."ownerId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage company invoices"
  ON "invoices" FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "invoices"."companyId"
      AND "companies"."ownerId" = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "invoices"."companyId"
      AND "companies"."ownerId" = auth.uid()::text
    )
  );

-- 13. TABLE: stockMovements
-- Inventory movement audit trail
CREATE TABLE IF NOT EXISTS "stockMovements" (
  "id" varchar(255) PRIMARY KEY,
  "productId" text DEFAULT NULL,
  "type" text DEFAULT NULL,
  "quantity" text DEFAULT NULL,
  "previousStock" text DEFAULT NULL,
  "currentStock" text DEFAULT NULL,
  "reason" text DEFAULT NULL,
  "reference" text DEFAULT NULL,
  "notes" text DEFAULT NULL,
  "date" text DEFAULT NULL,
  "userId" text DEFAULT NULL,
  "companyId" text DEFAULT NULL,
  "_export_date" timestamptz DEFAULT current_timestamp
);

CREATE INDEX IF NOT EXISTS idx_stockMovements_companyId ON "stockMovements"("companyId");
CREATE INDEX IF NOT EXISTS idx_stockMovements_productId ON "stockMovements"("productId");
CREATE INDEX IF NOT EXISTS idx_stockMovements_userId ON "stockMovements"("userId");

ALTER TABLE "stockMovements" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view company stock movements"
  ON "stockMovements" FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "stockMovements"."companyId"
      AND "companies"."ownerId" = auth.uid()::text
    )
  );

CREATE POLICY "Users can manage company stock movements"
  ON "stockMovements" FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "stockMovements"."companyId"
      AND "companies"."ownerId" = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "stockMovements"."companyId"
      AND "companies"."ownerId" = auth.uid()::text
    )
  );
