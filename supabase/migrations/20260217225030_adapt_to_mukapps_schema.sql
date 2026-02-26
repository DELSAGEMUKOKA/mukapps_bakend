/*
  # Adapt Database to MukApps Schema

  ## Summary
  This migration adapts the database schema to match the MukApps database structure
  while maintaining backward compatibility with existing data.

  ## Changes

  ### 1. New Tables
  - **settings**: Company-specific configuration and information
  - **roles**: Granular permission system for users
  - **admin_actions**: Audit log for administrative actions
  - **login_attempts**: Security tracking for login attempts
  - **user_pins**: PIN codes for quick user authentication

  ### 2. Updated Tables
  - **categories**: Add `color` field
  - **products**: Add `cost_price`, `price` (aliases), category name
  - **customers**: Add customer type, credit_limit, loyalty_points, etc.
  - **invoices**: Add customer_name, discount_percentage, payment_date, company_info
  - **companies**: Add `owner_id` field
  - **subscriptions**: Add plan fields, payment_history
  - **stock_movements**: Add `date` field, rename fields

  ## Security
  - RLS enabled on all new tables
  - Policies ensure company data isolation
  - Audit logging for sensitive operations
*/

-- =============================================================================
-- 1. CREATE NEW TABLES
-- =============================================================================

-- Settings Table
CREATE TABLE IF NOT EXISTS settings (
  id uuid PRIMARY KEY REFERENCES companies(id) ON DELETE CASCADE,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  company_name text,

  -- Contact Information
  email text,
  phone text,
  address text,
  city text,
  country text,
  postal_code text,
  website text,

  -- Legal Information
  rccm text,
  id_nat text,
  impot_number text,

  -- Display Settings
  currency text DEFAULT 'USD',
  date_format text DEFAULT 'MM/dd/yyyy',
  slogan text,

  -- Invoice Settings
  invoice_prefix text DEFAULT 'INV',
  invoice_footer text,

  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(company_id)
);

-- Roles Table
CREATE TABLE IF NOT EXISTS roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  permissions jsonb DEFAULT '[]'::jsonb,
  is_default boolean DEFAULT false,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(name, company_id)
);

-- Admin Actions Table
CREATE TABLE IF NOT EXISTS admin_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  admin_email text NOT NULL,
  action text NOT NULL,
  target_user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  target_user_email text,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  success boolean DEFAULT true,
  metadata jsonb DEFAULT '{}'::jsonb,
  timestamp timestamptz DEFAULT now()
);

-- Login Attempts Table
CREATE TABLE IF NOT EXISTS login_attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE SET NULL,
  email text NOT NULL,
  ip_address text,
  user_agent text,
  success boolean DEFAULT false,
  captcha_verified boolean DEFAULT false,
  company_id uuid REFERENCES companies(id) ON DELETE SET NULL,
  timestamp timestamptz DEFAULT now()
);

-- User Pins Table
CREATE TABLE IF NOT EXISTS user_pins (
  id uuid PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  pin_code_hash text NOT NULL,
  company_id uuid NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(user_id, company_id)
);

-- =============================================================================
-- 2. UPDATE EXISTING TABLES
-- =============================================================================

-- Add color to categories
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'categories' AND column_name = 'color'
  ) THEN
    ALTER TABLE categories ADD COLUMN color text DEFAULT '#3B82F6';
  END IF;
END $$;

-- Update products table
DO $$
BEGIN
  -- Add cost_price (same as purchase_price)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'cost_price'
  ) THEN
    ALTER TABLE products ADD COLUMN cost_price decimal(10,2);
    -- Copy existing purchase_price to cost_price
    UPDATE products SET cost_price = purchase_price WHERE cost_price IS NULL;
  END IF;

  -- Add price (same as selling_price)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'price'
  ) THEN
    ALTER TABLE products ADD COLUMN price decimal(10,2);
    -- Copy existing selling_price to price
    UPDATE products SET price = selling_price WHERE price IS NULL;
  END IF;

  -- Add category name (denormalized)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'products' AND column_name = 'category'
  ) THEN
    ALTER TABLE products ADD COLUMN category text;
  END IF;
END $$;

-- Update customers table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'type'
  ) THEN
    ALTER TABLE customers ADD COLUMN type text DEFAULT 'individual';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'credit_limit'
  ) THEN
    ALTER TABLE customers ADD COLUMN credit_limit decimal(12,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'notes'
  ) THEN
    ALTER TABLE customers ADD COLUMN notes text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'discount_percentage'
  ) THEN
    ALTER TABLE customers ADD COLUMN discount_percentage decimal(5,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'total_spent'
  ) THEN
    ALTER TABLE customers ADD COLUMN total_spent decimal(12,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'loyalty_points'
  ) THEN
    ALTER TABLE customers ADD COLUMN loyalty_points integer DEFAULT 0;
  END IF;
END $$;

-- Update invoices table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'customer_name'
  ) THEN
    ALTER TABLE invoices ADD COLUMN customer_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'status'
  ) THEN
    ALTER TABLE invoices ADD COLUMN status text DEFAULT 'paid';
    -- Copy payment_status to status
    UPDATE invoices SET status = payment_status WHERE status IS NULL OR status = 'paid';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'discount_percentage'
  ) THEN
    ALTER TABLE invoices ADD COLUMN discount_percentage decimal(5,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'delivery_address'
  ) THEN
    ALTER TABLE invoices ADD COLUMN delivery_address text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'payment_date'
  ) THEN
    ALTER TABLE invoices ADD COLUMN payment_date timestamptz;
    -- Set payment_date to date for paid invoices
    UPDATE invoices SET payment_date = date WHERE payment_status = 'paid' AND payment_date IS NULL;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoices' AND column_name = 'company_info'
  ) THEN
    ALTER TABLE invoices ADD COLUMN company_info jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add product_name to invoice_items (denormalized)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'invoice_items' AND column_name = 'product_name'
  ) THEN
    ALTER TABLE invoice_items ADD COLUMN product_name text;
  END IF;
END $$;

-- Update companies table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'companies' AND column_name = 'owner_id'
  ) THEN
    ALTER TABLE companies ADD COLUMN owner_id uuid REFERENCES users(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Update subscriptions table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'plan'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN plan text DEFAULT 'free';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN user_id uuid REFERENCES users(id) ON DELETE CASCADE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'is_subscribed'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN is_subscribed boolean DEFAULT true;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'current_period_start'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN current_period_start timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'current_period_end'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN current_period_end timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'payment_history'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN payment_history jsonb DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- Update stock_movements table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stock_movements' AND column_name = 'date'
  ) THEN
    ALTER TABLE stock_movements ADD COLUMN date timestamptz DEFAULT now();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stock_movements' AND column_name = 'current_stock'
  ) THEN
    ALTER TABLE stock_movements ADD COLUMN current_stock integer;
  END IF;
END $$;

-- =============================================================================
-- 3. CREATE INDEXES
-- =============================================================================

-- Settings indexes
CREATE INDEX IF NOT EXISTS idx_settings_company_id ON settings(company_id);

-- Roles indexes
CREATE INDEX IF NOT EXISTS idx_roles_company_id ON roles(company_id);
CREATE INDEX IF NOT EXISTS idx_roles_name ON roles(name);

-- Admin actions indexes
CREATE INDEX IF NOT EXISTS idx_admin_actions_admin_id ON admin_actions(admin_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_company_id ON admin_actions(company_id);
CREATE INDEX IF NOT EXISTS idx_admin_actions_timestamp ON admin_actions(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_admin_actions_action ON admin_actions(action);

-- Login attempts indexes
CREATE INDEX IF NOT EXISTS idx_login_attempts_email ON login_attempts(email);
CREATE INDEX IF NOT EXISTS idx_login_attempts_user_id ON login_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_login_attempts_timestamp ON login_attempts(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_login_attempts_success ON login_attempts(success);

-- User pins indexes
CREATE INDEX IF NOT EXISTS idx_user_pins_user_id ON user_pins(user_id);
CREATE INDEX IF NOT EXISTS idx_user_pins_company_id ON user_pins(company_id);

-- Additional indexes on updated tables
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_customers_type ON customers(type);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_invoices_payment_date ON invoices(payment_date);

-- =============================================================================
-- 4. ENABLE ROW LEVEL SECURITY
-- =============================================================================

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE login_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_pins ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- 5. CREATE RLS POLICIES
-- =============================================================================

-- Settings Policies
CREATE POLICY "Users can view own company settings"
  ON settings FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can update company settings"
  ON settings FOR UPDATE
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users
    WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (company_id IN (
    SELECT company_id FROM users
    WHERE id = auth.uid() AND role = 'admin'
  ));

CREATE POLICY "System can insert settings"
  ON settings FOR INSERT
  TO authenticated
  WITH CHECK (company_id IN (
    SELECT company_id FROM users
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Roles Policies
CREATE POLICY "Users can view company roles"
  ON roles FOR SELECT
  TO authenticated
  USING (company_id IN (SELECT company_id FROM users WHERE id = auth.uid()));

CREATE POLICY "Admins can manage roles"
  ON roles FOR ALL
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users
    WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (company_id IN (
    SELECT company_id FROM users
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- Admin Actions Policies
CREATE POLICY "Admins can view admin actions"
  ON admin_actions FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users
    WHERE id = auth.uid() AND role IN ('admin', 'supervisor')
  ));

CREATE POLICY "System can log admin actions"
  ON admin_actions FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Login Attempts Policies
CREATE POLICY "Admins can view login attempts"
  ON login_attempts FOR SELECT
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users
    WHERE id = auth.uid() AND role = 'admin'
  ) OR user_id = auth.uid());

CREATE POLICY "System can log login attempts"
  ON login_attempts FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- User Pins Policies
CREATE POLICY "Users can view own pin"
  ON user_pins FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own pin"
  ON user_pins FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can create own pin"
  ON user_pins FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can manage user pins"
  ON user_pins FOR ALL
  TO authenticated
  USING (company_id IN (
    SELECT company_id FROM users
    WHERE id = auth.uid() AND role = 'admin'
  ))
  WITH CHECK (company_id IN (
    SELECT company_id FROM users
    WHERE id = auth.uid() AND role = 'admin'
  ));

-- =============================================================================
-- 6. CREATE TRIGGERS FOR UPDATED_AT
-- =============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Settings trigger
DROP TRIGGER IF EXISTS update_settings_updated_at ON settings;
CREATE TRIGGER update_settings_updated_at
  BEFORE UPDATE ON settings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Roles trigger
DROP TRIGGER IF EXISTS update_roles_updated_at ON roles;
CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- User pins trigger
DROP TRIGGER IF EXISTS update_user_pins_updated_at ON user_pins;
CREATE TRIGGER update_user_pins_updated_at
  BEFORE UPDATE ON user_pins
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();