/*
  # Create Users Table

  1. Overview
     This migration creates the users table to match the schema defined in data_structure.md.

  2. Table: users
     Multi-tenant user authentication and management

  3. Security:
     - Enable RLS
     - Users can view/update their own record
     - Company owners can manage users in their company

  4. Indexes:
     - email, company_id, role
     - Unique constraint on (email, company_id)
*/

-- Drop table if exists
DROP TABLE IF EXISTS "users" CASCADE;

-- Create users table
CREATE TABLE "users" (
  "id" varchar(255) PRIMARY KEY,
  "name" varchar(100) NOT NULL,
  "email" varchar(100) NOT NULL,
  "password" varchar(255) NOT NULL,
  "role" varchar(20) NOT NULL DEFAULT 'cashier',
  "company_id" varchar(255) NOT NULL,
  "phone" varchar(20) DEFAULT NULL,
  "is_active" boolean DEFAULT true,
  "failed_login_attempts" integer DEFAULT 0,
  "locked_until" timestamptz DEFAULT NULL,
  "last_login" timestamptz DEFAULT NULL,
  "email_verified" boolean DEFAULT false,
  "email_verification_token" varchar(255) DEFAULT NULL,
  "password_reset_token" varchar(255) DEFAULT NULL,
  "password_reset_expires" timestamptz DEFAULT NULL,
  "createdAt" text DEFAULT NULL,
  "updatedAt" text DEFAULT NULL,
  "_export_date" timestamptz DEFAULT current_timestamp,
  CONSTRAINT check_role CHECK ("role" IN ('admin', 'supervisor', 'operator', 'cashier'))
);

-- Create indexes
CREATE INDEX idx_users_email ON "users"("email");
CREATE INDEX idx_users_company_id ON "users"("company_id");
CREATE INDEX idx_users_role ON "users"("role");
CREATE UNIQUE INDEX unique_email_per_company ON "users"("email", "company_id");

-- Enable RLS
ALTER TABLE "users" ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own record
CREATE POLICY "Users can view own record"
  ON "users" FOR SELECT
  TO authenticated
  USING ("id" = auth.uid()::text);

-- Policy: Company owners can view all users in their company
CREATE POLICY "Company owners can view company users"
  ON "users" FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "users"."company_id"
      AND "companies"."ownerId" = auth.uid()::text
    )
  );

-- Policy: Company owners can create users in their company
CREATE POLICY "Company owners can create company users"
  ON "users" FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "users"."company_id"
      AND "companies"."ownerId" = auth.uid()::text
    )
  );

-- Policy: Users can update their own record
CREATE POLICY "Users can update own record"
  ON "users" FOR UPDATE
  TO authenticated
  USING ("id" = auth.uid()::text)
  WITH CHECK ("id" = auth.uid()::text);

-- Policy: Company owners can update users in their company
CREATE POLICY "Company owners can update company users"
  ON "users" FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "users"."company_id"
      AND "companies"."ownerId" = auth.uid()::text
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "users"."company_id"
      AND "companies"."ownerId" = auth.uid()::text
    )
  );

-- Policy: Company owners can delete users in their company
CREATE POLICY "Company owners can delete company users"
  ON "users" FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM "companies"
      WHERE "companies"."id" = "users"."company_id"
      AND "companies"."ownerId" = auth.uid()::text
    )
  );