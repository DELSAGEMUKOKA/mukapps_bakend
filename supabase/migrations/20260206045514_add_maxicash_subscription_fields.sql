/*
  # Add MaxiCash Payment Fields to Subscriptions

  ## Changes Made
  
  1. New Columns
    - `maxicash_transaction_id` (text) - Stores the MaxiCash transaction ID
    - `maxicash_reference` (text) - Unique reference for MaxiCash payment
    - `maxicash_payment_status` (varchar) - Payment status from MaxiCash
    - `maxicash_payment_date` (timestamptz) - Date when payment was completed
    - `customer_phone` (varchar) - Phone number for MaxiCash payment
    - `auto_renew` (boolean) - Flag for automatic renewal
    - `next_billing_date` (timestamptz) - Next billing date for renewals
    
  2. Updated Constraints
    - Modified plan_type to include new plans: 'free', 'basic', 'pro', 'enterprise'
    - Modified status to include 'pending' status
    
  3. Indexes
    - Added index on maxicash_transaction_id for quick lookups
    - Added index on maxicash_reference for payment tracking
    - Added index on next_billing_date for renewal processing
    
  4. Security
    - RLS will be enabled on subscriptions table
    - Only authenticated users can access their company's subscriptions
*/

-- Add new columns for MaxiCash integration
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'maxicash_transaction_id'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN maxicash_transaction_id text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'maxicash_reference'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN maxicash_reference text UNIQUE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'maxicash_payment_status'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN maxicash_payment_status varchar(50);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'maxicash_payment_date'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN maxicash_payment_date timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'customer_phone'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN customer_phone varchar(20);
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'auto_renew'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN auto_renew boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'subscriptions' AND column_name = 'next_billing_date'
  ) THEN
    ALTER TABLE subscriptions ADD COLUMN next_billing_date timestamptz;
  END IF;
END $$;

-- Drop and recreate plan_type constraint with new plans
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_type_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_type_check
  CHECK (plan_type IN ('free', 'basic', 'pro', 'enterprise', 'trial', 'monthly', 'yearly'));

-- Drop and recreate status constraint with pending status
ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_status_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_status_check
  CHECK (status IN ('active', 'pending', 'cancelled', 'expired', 'trial'));

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_maxicash_transaction_id
  ON subscriptions(maxicash_transaction_id);

CREATE INDEX IF NOT EXISTS idx_subscriptions_maxicash_reference
  ON subscriptions(maxicash_reference);

CREATE INDEX IF NOT EXISTS idx_subscriptions_next_billing_date
  ON subscriptions(next_billing_date) WHERE next_billing_date IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_subscriptions_auto_renew
  ON subscriptions(auto_renew, next_billing_date) WHERE auto_renew = true;

-- Enable Row Level Security
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their company subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admins can create company subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admins can update their company subscriptions" ON subscriptions;
DROP POLICY IF EXISTS "Admins can delete their company subscriptions" ON subscriptions;

-- Create RLS policies for subscriptions
CREATE POLICY "Users can view their company subscriptions"
  ON subscriptions FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Admins can create company subscriptions"
  ON subscriptions FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update their company subscriptions"
  ON subscriptions FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  )
  WITH CHECK (
    company_id IN (
      SELECT company_id FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can delete their company subscriptions"
  ON subscriptions FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id FROM users 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
