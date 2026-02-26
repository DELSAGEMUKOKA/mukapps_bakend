# Database Migration Plan
## Adapting Backend to Match MukApps Database Structure

**Date:** February 17, 2026
**Source:** `database_for_mukapps.json`

---

## Overview

This document outlines the migration plan to adapt the current backend to match the structure found in the MukApps database export.

---

## Current vs. Required Structure

### New Collections to Add

1. **adminActions** - Track administrative actions
2. **loginAttempts** - Track login attempts for security
3. **roles** - Granular permission system
4. **userPins** - User PIN codes for quick access
5. **settings** - Company-specific settings (extended)

### Collections to Update

1. **categories** - Add `color` field
2. **customers** - Add multiple new fields
3. **products** - Rename/add fields
4. **invoices** - Update structure
5. **companies** - Simplify structure
6. **subscriptions** - Update plan structure
7. **stockMovements** - Update field names
8. **expenses** - Keep existing structure (matches)

---

## Detailed Schema Changes

### 1. Categories

**Current:**
```javascript
{
  id: UUID,
  name: STRING,
  description: STRING,
  company_id: UUID,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

**Required (add):**
```javascript
{
  color: STRING  // Hex color code (e.g., "#3B82F6")
}
```

### 2. Products

**Current:**
```javascript
{
  id, name, barcode, description, category_id,
  purchase_price, selling_price, current_stock,
  min_stock_level, unit, image_url, sku, location,
  company_id, created_at, updated_at
}
```

**Required Changes:**
- Rename `purchase_price` → `cost_price` (or keep both)
- Rename `selling_price` → `price`
- Remove `image_url` (not in source DB)
- Add `category` (denormalized category name)

**New Structure:**
```javascript
{
  id: STRING,
  name: STRING,
  barcode: STRING,
  description: STRING,
  category_id: STRING,
  category: STRING,        // Denormalized
  price: DECIMAL,          // Selling price
  cost_price: DECIMAL,     // Purchase price
  current_stock: INTEGER,
  min_stock_level: INTEGER,
  unit: STRING,
  sku: STRING,
  location: STRING,
  company_id: STRING,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### 3. Customers

**Current:**
```javascript
{
  id, name, email, phone, address, city, state,
  country, postal_code, tax_id, total_purchases,
  is_vip, company_id, created_at, updated_at
}
```

**Required (add):**
```javascript
{
  type: STRING,              // 'individual' or 'business'
  credit_limit: DECIMAL,     // Customer credit limit
  notes: TEXT,               // Additional notes
  discount_percentage: DECIMAL, // Default discount
  total_spent: DECIMAL,      // Total amount spent
  loyalty_points: INTEGER    // Loyalty program points
}
```

### 4. Invoices

**Current:**
```javascript
{
  id, invoice_number, customer_id, user_id, company_id,
  date, subtotal, tax, discount, total,
  payment_method, payment_status, notes,
  created_at, updated_at
}
```

**Required Changes:**
- Rename `payment_status` → `status`
- Add `customer_name` (denormalized)
- Add `discount_percentage`
- Add `delivery_address`
- Add `payment_date`
- Add `company_info` (embedded object)

**Invoice Items:**
```javascript
// Current
{
  id, invoice_id, product_id, quantity,
  unit_price, tax_rate, discount, total
}

// Required
{
  id, product_id, product_name,  // Add product_name
  quantity, unit_price, total
  // Remove: tax_rate, discount
}
```

### 5. Companies

**Current:**
```javascript
{
  id, name, email, phone, address, city, state,
  country, postal_code, tax_id, logo_url, website,
  currency, timezone, is_active,
  created_at, updated_at
}
```

**Required (simplified):**
```javascript
{
  id: STRING,
  name: STRING,
  owner_id: STRING,  // User ID of owner
  created_at: TIMESTAMP
}
```

### 6. Settings (NEW)

**Structure:**
```javascript
{
  id: STRING,              // Same as company_id
  company_id: STRING,
  company_name: STRING,

  // Contact info
  email: STRING,
  phone: STRING,
  address: STRING,
  city: STRING,
  country: STRING,
  postal_code: STRING,
  website: STRING,

  // Legal info
  rccm: STRING,           // Commercial register
  id_nat: STRING,         // National ID
  impot_number: STRING,   // Tax number

  // Display settings
  currency: STRING,       // e.g., 'FC', 'USD'
  date_format: STRING,    // e.g., 'dd/MM/yyyy'
  slogan: STRING,

  // Invoice settings
  invoice_prefix: STRING, // e.g., 'FAC', 'INV'
  invoice_footer: TEXT,

  updated_at: TIMESTAMP
}
```

### 7. Roles (NEW)

**Structure:**
```javascript
{
  id: STRING,
  name: STRING,           // 'Admin', 'Manager', 'Cashier'
  description: TEXT,
  permissions: JSON,      // Array of permission objects
  is_default: BOOLEAN,
  company_id: STRING,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

**Permission Object:**
```javascript
{
  id: STRING,             // e.g., 'products_create'
  name: STRING,           // Display name
  description: STRING,
  module: STRING,         // 'products', 'sales', 'customers', etc.
  action: STRING          // 'create', 'read', 'update', 'delete', 'manage'
}
```

### 8. AdminActions (NEW)

**Structure:**
```javascript
{
  id: STRING,
  admin_id: STRING,
  admin_email: STRING,
  action: STRING,         // 'password_reset_sent', 'user_created', etc.
  target_user_id: STRING,
  target_user_email: STRING,
  timestamp: TIMESTAMP,
  success: BOOLEAN,
  company_id: STRING
}
```

### 9. LoginAttempts (NEW)

**Structure:**
```javascript
{
  id: STRING,
  user_id: STRING,
  email: STRING,
  ip_address: STRING,
  user_agent: STRING,
  success: BOOLEAN,
  captcha_verified: BOOLEAN,
  timestamp: TIMESTAMP,
  company_id: STRING
}
```

### 10. UserPins (NEW)

**Structure:**
```javascript
{
  id: STRING,             // Same as user_id
  user_id: STRING,
  pin_code: STRING,       // 4-6 digit PIN (hashed)
  company_id: STRING,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### 11. Subscriptions

**Current:**
```javascript
{
  id, company_id, plan_type, status,
  start_date, end_date, trial_ends_at,
  payment_method, amount, max_users, max_products,
  features, created_at, updated_at
}
```

**Required Changes:**
- Rename `plan_type` → `plan`
- Add `user_id` (owner)
- Add `is_subscribed`
- Add `current_period_start`
- Add `current_period_end`
- Add `payment_history` (JSON array)

### 12. StockMovements

**Current:**
```javascript
{
  id, product_id, type, quantity,
  previous_stock, new_stock, reason,
  reference, notes, company_id, user_id,
  created_at
}
```

**Required Changes:**
- Rename `new_stock` → `current_stock`
- Add `date` field (explicit date)

---

## Migration Strategy

### Phase 1: Add New Tables ✅
1. Create `settings` table
2. Create `roles` table
3. Create `admin_actions` table
4. Create `login_attempts` table
5. Create `user_pins` table

### Phase 2: Update Existing Tables ✅
1. Add `color` to `categories`
2. Update `products` fields (add `cost_price`, keep `purchase_price` for compatibility)
3. Add new fields to `customers`
4. Update `invoices` structure
5. Simplify `companies` (keep existing fields, add `owner_id`)
6. Update `subscriptions` fields
7. Update `stock_movements` fields

### Phase 3: Update Models ✅
1. Create Sequelize models for new tables
2. Update existing Sequelize models
3. Add model associations

### Phase 4: Update Controllers ✅
1. Settings controller (new)
2. Roles controller (new)
3. Admin actions logger (utility)
4. Login attempts tracker (middleware)
5. User pins controller (new)
6. Update existing controllers for new fields

### Phase 5: Update Validation ✅
1. Update Joi schemas for all endpoints
2. Add validation for new fields
3. Update field naming (keep snake_case)

### Phase 6: Update Documentation ✅
1. Update API documentation
2. Update Postman collection
3. Update field naming guide

---

## Compatibility Considerations

### Backward Compatibility

**Keep both old and new field names where possible:**

**Products:**
- Keep `purchase_price` (existing)
- Add `cost_price` (new) - alias for purchase_price
- Keep `selling_price` (existing)
- Add `price` (new) - alias for selling_price

**This allows:**
1. Frontend can use new field names
2. Existing integrations continue working
3. Gradual migration path

### Field Mappings

```javascript
// Virtual getters/setters
Product.prototype.cost_price → purchase_price
Product.prototype.price → selling_price
Invoice.prototype.status → payment_status (keep both)
```

---

## Implementation Priority

### High Priority (Core Functionality)
1. ✅ Update Products model (add cost_price/price aliases)
2. ✅ Update Categories model (add color)
3. ✅ Create Settings table and controller
4. ✅ Update Customers model (add new fields)
5. ✅ Update Invoices structure

### Medium Priority (Enhanced Features)
1. ✅ Create Roles system with permissions
2. ✅ Create AdminActions logging
3. ✅ Create LoginAttempts tracking
4. ✅ Update Subscriptions structure

### Low Priority (Nice to Have)
1. ✅ UserPins system
2. ✅ Enhanced reporting with new fields

---

## Database Migration Scripts

### Migration File Naming Convention
```
YYYYMMDDHHMMSS_descriptive_name.sql
```

### Required Migrations

1. `20260217_add_category_color.sql`
2. `20260217_update_products_pricing.sql`
3. `20260217_extend_customers.sql`
4. `20260217_create_settings.sql`
5. `20260217_create_roles.sql`
6. `20260217_create_admin_actions.sql`
7. `20260217_create_login_attempts.sql`
8. `20260217_create_user_pins.sql`
9. `20260217_update_invoices.sql`
10. `20260217_update_subscriptions.sql`
11. `20260217_update_companies.sql`

---

## Testing Checklist

### Unit Tests
- [ ] New model validations
- [ ] Field aliases work correctly
- [ ] Virtual getters/setters

### Integration Tests
- [ ] Settings CRUD operations
- [ ] Roles & permissions
- [ ] Admin actions logging
- [ ] Login attempts tracking
- [ ] User pins authentication

### API Tests
- [ ] All existing endpoints still work
- [ ] New endpoints functional
- [ ] Field names (snake_case) correct
- [ ] Postman collection updated

---

## Rollback Plan

### If Issues Arise

1. **Database Level:**
   - Keep migration scripts reversible
   - Backup before migration
   - Test rollback scripts

2. **Application Level:**
   - Use feature flags for new features
   - Keep old field names functional
   - Gradual rollout

---

## Timeline Estimate

- **Phase 1 (Add New Tables):** 2-3 hours
- **Phase 2 (Update Existing):** 2-3 hours
- **Phase 3 (Update Models):** 2-3 hours
- **Phase 4 (Update Controllers):** 3-4 hours
- **Phase 5 (Update Validation):** 1-2 hours
- **Phase 6 (Documentation):** 1-2 hours

**Total: 11-17 hours** of development work

---

## Notes

1. **Denormalization:** The source DB uses denormalized fields (e.g., `category` in products, `productName` in invoice items). We'll add these for performance but maintain normalized structure.

2. **Field Naming:** Continue using `snake_case` for all database fields to maintain consistency.

3. **Timestamp Format:** Source DB uses Firebase timestamps. Convert to standard PostgreSQL timestamps.

4. **JSON Fields:** Use PostgreSQL JSON/JSONB for complex fields like permissions, payment_history.

5. **Security:** UserPins and LoginAttempts enhance security. Implement rate limiting and lockout mechanisms.

---

**Status:** Ready for Implementation
**Approved By:** _________________
**Date:** _________________
