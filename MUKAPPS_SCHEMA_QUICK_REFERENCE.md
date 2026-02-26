# MukApps Schema Quick Reference
## Updated Database Structure

**Last Updated:** February 17, 2026

---

## New Tables

### 1. Settings (Company Configuration)

```javascript
{
  id: UUID,                  // Same as company_id
  company_id: UUID,
  company_name: STRING,

  // Contact
  email: STRING,
  phone: STRING,
  address: STRING,
  city: STRING,
  country: STRING,
  postal_code: STRING,
  website: STRING,

  // Legal
  rccm: STRING,             // Commercial Register
  id_nat: STRING,           // National ID
  impot_number: STRING,     // Tax Number

  // Display
  currency: STRING,          // Default: 'USD'
  date_format: STRING,       // Default: 'MM/dd/yyyy'
  slogan: STRING,

  // Invoice
  invoice_prefix: STRING,    // Default: 'INV'
  invoice_footer: TEXT,

  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### 2. Roles (Permission System)

```javascript
{
  id: UUID,
  name: STRING,              // 'Admin', 'Manager', 'Cashier'
  description: TEXT,
  permissions: JSONB,        // Array of permission objects
  is_default: BOOLEAN,
  company_id: UUID,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}

// Permission Object
{
  id: STRING,               // 'products_create'
  name: STRING,             // 'Create Products'
  description: STRING,      // 'Add new products'
  module: STRING,           // 'products', 'sales', 'customers'
  action: STRING            // 'create', 'read', 'update', 'delete'
}
```

### 3. Admin Actions (Audit Log)

```javascript
{
  id: UUID,
  admin_id: UUID,            // User who performed action
  admin_email: STRING,
  action: STRING,            // 'password_reset_sent', 'user_created'
  target_user_id: UUID,      // User affected by action
  target_user_email: STRING,
  company_id: UUID,
  success: BOOLEAN,
  metadata: JSONB,           // Additional data
  timestamp: TIMESTAMP
}
```

### 4. Login Attempts (Security)

```javascript
{
  id: UUID,
  user_id: UUID,
  email: STRING,
  ip_address: STRING,
  user_agent: STRING,
  success: BOOLEAN,
  captcha_verified: BOOLEAN,
  company_id: UUID,
  timestamp: TIMESTAMP
}
```

### 5. User Pins (Quick Auth)

```javascript
{
  id: UUID,                  // Same as user_id
  user_id: UUID,
  pin_code_hash: STRING,     // Bcrypt hashed
  company_id: UUID,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

---

## Updated Tables

### Categories (+ color)

```javascript
{
  id: UUID,
  name: STRING,
  description: TEXT,
  color: STRING,             // ✅ NEW: Hex color (#3B82F6)
  company_id: UUID,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### Products (+ cost_price, price, category)

```javascript
{
  id: UUID,
  name: STRING,
  barcode: STRING,
  description: TEXT,
  category_id: UUID,
  category: STRING,          // ✅ NEW: Denormalized category name

  // Pricing (backward compatible)
  purchase_price: DECIMAL,   // Original field
  cost_price: DECIMAL,       // ✅ NEW: Alias for purchase_price
  selling_price: DECIMAL,    // Original field
  price: DECIMAL,            // ✅ NEW: Alias for selling_price

  current_stock: INTEGER,
  min_stock_level: INTEGER,
  unit: STRING,
  sku: STRING,
  location: STRING,
  company_id: UUID,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### Customers (+ 6 new fields)

```javascript
{
  id: UUID,
  name: STRING,
  email: STRING,
  phone: STRING,
  address: TEXT,
  city: STRING,
  state: STRING,             // ✅ NEW
  country: STRING,           // ✅ NEW
  postal_code: STRING,       // ✅ NEW
  tax_id: STRING,            // ✅ NEW

  type: STRING,              // ✅ NEW: 'individual' or 'business'
  credit_limit: DECIMAL,     // ✅ NEW: Maximum credit
  notes: TEXT,               // ✅ NEW: Additional notes
  discount_percentage: DECIMAL, // ✅ NEW: Default discount

  total_purchases: DECIMAL,  // Original
  total_spent: DECIMAL,      // ✅ NEW: Total amount spent
  loyalty_points: INTEGER,   // ✅ NEW: Rewards points
  is_vip: BOOLEAN,

  company_id: UUID,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### Invoices (+ 6 new fields)

```javascript
{
  id: UUID,
  invoice_number: STRING,
  customer_id: UUID,
  customer_name: STRING,     // ✅ NEW: Denormalized
  user_id: UUID,
  company_id: UUID,
  date: TIMESTAMP,

  subtotal: DECIMAL,
  tax: DECIMAL,
  discount: DECIMAL,
  discount_percentage: DECIMAL, // ✅ NEW
  total: DECIMAL,

  payment_method: ENUM,
  payment_status: ENUM,      // Original
  status: STRING,            // ✅ NEW: Alias for payment_status
  payment_date: TIMESTAMP,   // ✅ NEW: When paid

  delivery_address: TEXT,    // ✅ NEW: Shipping address
  company_info: JSONB,       // ✅ NEW: Company snapshot
  notes: TEXT,

  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### Invoice Items (+ product_name)

```javascript
{
  id: UUID,
  invoice_id: UUID,
  product_id: UUID,
  product_name: STRING,      // ✅ NEW: Denormalized
  quantity: INTEGER,
  unit_price: DECIMAL,
  tax_rate: DECIMAL,
  discount: DECIMAL,
  total: DECIMAL,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### Companies (+ owner_id)

```javascript
{
  id: UUID,
  name: STRING,
  owner_id: UUID,            // ✅ NEW: References users
  email: STRING,
  phone: STRING,
  address: STRING,
  city: STRING,
  state: STRING,
  country: STRING,
  postal_code: STRING,
  tax_id: STRING,
  logo_url: STRING,
  website: STRING,
  currency: STRING,
  timezone: STRING,
  is_active: BOOLEAN,
  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### Subscriptions (+ 5 new fields)

```javascript
{
  id: UUID,
  company_id: UUID,
  user_id: UUID,             // ✅ NEW: Owner user

  plan_type: STRING,         // Original
  plan: STRING,              // ✅ NEW: Alias for plan_type

  status: ENUM,
  is_subscribed: BOOLEAN,    // ✅ NEW

  start_date: DATE,
  end_date: DATE,
  trial_ends_at: DATE,
  current_period_start: TIMESTAMP, // ✅ NEW
  current_period_end: TIMESTAMP,   // ✅ NEW

  payment_method: STRING,
  amount: DECIMAL,
  payment_history: JSONB,    // ✅ NEW: Array of payments

  max_users: INTEGER,
  max_products: INTEGER,
  features: JSONB,

  created_at: TIMESTAMP,
  updated_at: TIMESTAMP
}
```

### Stock Movements (+ date, current_stock)

```javascript
{
  id: UUID,
  product_id: UUID,
  type: ENUM,
  quantity: INTEGER,
  previous_stock: INTEGER,
  current_stock: INTEGER,    // ✅ NEW
  reason: STRING,
  reference: STRING,
  notes: TEXT,
  date: TIMESTAMP,           // ✅ NEW: Explicit date
  company_id: UUID,
  user_id: UUID,
  created_at: TIMESTAMP
}
```

---

## Field Naming Conventions

**CRITICAL: All fields use `snake_case`**

### Common Field Names

| Concept | Field Name | Type |
|---------|-----------|------|
| Product ID | `product_id` | UUID |
| Customer ID | `customer_id` | UUID |
| Category ID | `category_id` | UUID |
| Company ID | `company_id` | UUID |
| User ID | `user_id` | UUID |
| Purchase Price | `purchase_price` | DECIMAL |
| Cost Price | `cost_price` | DECIMAL |
| Selling Price | `selling_price` | DECIMAL |
| Price | `price` | DECIMAL |
| Current Stock | `current_stock` | INTEGER |
| Min Stock Level | `min_stock_level` | INTEGER |
| Unit Price | `unit_price` | DECIMAL |
| Tax Rate | `tax_rate` | DECIMAL |
| Payment Method | `payment_method` | STRING |
| Payment Status | `payment_status` | STRING |
| Payment Date | `payment_date` | TIMESTAMP |
| Discount Percentage | `discount_percentage` | DECIMAL |
| Credit Limit | `credit_limit` | DECIMAL |
| Total Purchases | `total_purchases` | DECIMAL |
| Total Spent | `total_spent` | DECIMAL |
| Loyalty Points | `loyalty_points` | INTEGER |
| Is VIP | `is_vip` | BOOLEAN |
| Is Active | `is_active` | BOOLEAN |
| Is Default | `is_default` | BOOLEAN |
| Is Subscribed | `is_subscribed` | BOOLEAN |
| Created At | `created_at` | TIMESTAMP |
| Updated At | `updated_at` | TIMESTAMP |

---

## Enum Values

### Customer Type
- `individual`
- `business`

### Payment Method
- `cash`
- `card`
- `transfer`
- `check`

### Payment Status / Invoice Status
- `pending`
- `paid`
- `cancelled`
- `refunded`

### Stock Movement Type
- `in`
- `out`
- `adjustment`
- `sale`

### Subscription Status
- `active`
- `cancelled`
- `expired`
- `trial`

### Plan Type / Plan
- `free`
- `basic`
- `premium`
- `enterprise`
- `monthly`

---

## Permission Modules

- `products` - Product management
- `sales` - Invoice/sales management
- `customers` - Customer management
- `reports` - Reporting & analytics
- `teams` - Team management
- `settings` - System settings
- `expenses` - Expense management
- `inventory` - Stock management

## Permission Actions

- `create` - Create new records
- `read` - View records
- `update` - Modify records
- `delete` - Remove records
- `manage` - Full control (create, read, update, delete)

---

## JSON Field Structures

### Permissions (in Roles)

```json
[
  {
    "id": "products_create",
    "name": "Create Products",
    "description": "Add new products to inventory",
    "module": "products",
    "action": "create"
  },
  {
    "id": "sales_read",
    "name": "View Sales",
    "description": "View sales history",
    "module": "sales",
    "action": "read"
  }
]
```

### Company Info (in Invoices)

```json
{
  "company_name": "My Company Inc",
  "address": "123 Business St",
  "city": "New York",
  "country": "USA",
  "postal_code": "10001",
  "phone": "+1234567890",
  "email": "contact@company.com",
  "rccm": "CD/LSH/RCCM/25-B-01138",
  "tax_id": "TAX-123"
}
```

### Payment History (in Subscriptions)

```json
[
  {
    "date": "2026-01-01T00:00:00Z",
    "amount": 29.99,
    "method": "card",
    "status": "success",
    "reference": "pay_123abc"
  },
  {
    "date": "2026-02-01T00:00:00Z",
    "amount": 29.99,
    "method": "card",
    "status": "success",
    "reference": "pay_456def"
  }
]
```

### Metadata (in Admin Actions)

```json
{
  "ip_address": "192.168.1.1",
  "reason": "Account locked after 5 failed attempts",
  "previous_value": "active",
  "new_value": "locked"
}
```

---

## Default Values

| Field | Default Value |
|-------|--------------|
| `color` | `#3B82F6` (blue) |
| `currency` | `USD` |
| `date_format` | `MM/dd/yyyy` |
| `invoice_prefix` | `INV` |
| `customer.type` | `individual` |
| `credit_limit` | `0` |
| `discount_percentage` | `0` |
| `total_spent` | `0` |
| `loyalty_points` | `0` |
| `payment_method` | `cash` |
| `payment_status` | `paid` |
| `is_vip` | `false` |
| `is_active` | `true` |
| `is_default` | `false` |
| `is_subscribed` | `true` |

---

## Indexes for Performance

### Settings
- `company_id` (unique)

### Roles
- `company_id`
- `name`
- `(name, company_id)` unique

### Admin Actions
- `admin_id`
- `company_id`
- `timestamp` (DESC)
- `action`
- `target_user_id`

### Login Attempts
- `email`
- `user_id`
- `timestamp` (DESC)
- `success`
- `ip_address`

### User Pins
- `user_id` (unique)
- `company_id`
- `(user_id, company_id)` unique

### Updated Indexes
- `products.category`
- `customers.type`
- `invoices.status`
- `invoices.payment_date`

---

## Relationships

### Settings
- `belongs_to` Company

### Roles
- `belongs_to` Company

### Admin Actions
- `belongs_to` Company
- `belongs_to` User (admin)
- `belongs_to` User (target_user)

### Login Attempts
- `belongs_to` Company
- `belongs_to` User

### User Pins
- `belongs_to` User
- `belongs_to` Company

---

## Migration Status

✅ **Database Schema** - All tables created/updated
✅ **Sequelize Models** - All models configured
✅ **Associations** - All relationships set up
✅ **RLS Policies** - Security enabled
✅ **Indexes** - Performance optimized
⏳ **Controllers** - To be created
⏳ **Routes** - To be created
⏳ **Validation** - To be updated

---

## Quick Code Examples

### Create Settings

```javascript
const settings = await Settings.create({
  company_id: companyId,
  company_name: 'My Company',
  currency: 'USD',
  invoice_prefix: 'INV',
  email: 'contact@company.com'
});
```

### Create Role with Permissions

```javascript
const role = await Role.create({
  name: 'Manager',
  description: 'Store manager role',
  company_id: companyId,
  permissions: [
    {
      id: 'products_create',
      name: 'Create Products',
      module: 'products',
      action: 'create'
    },
    {
      id: 'sales_read',
      name: 'View Sales',
      module: 'sales',
      action: 'read'
    }
  ]
});
```

### Log Admin Action

```javascript
await AdminAction.create({
  admin_id: adminUser.id,
  admin_email: adminUser.email,
  action: 'password_reset_sent',
  target_user_id: targetUser.id,
  target_user_email: targetUser.email,
  company_id: companyId,
  success: true,
  metadata: {
    ip_address: req.ip,
    reason: 'User requested password reset'
  }
});
```

### Track Login Attempt

```javascript
await LoginAttempt.create({
  user_id: user?.id,
  email: email,
  ip_address: req.ip,
  user_agent: req.headers['user-agent'],
  success: loginSuccess,
  captcha_verified: true,
  company_id: user?.company_id
});
```

### Create/Update User PIN

```javascript
const hashedPin = await bcrypt.hash(pinCode, 10);

await UserPin.upsert({
  id: userId,
  user_id: userId,
  pin_code_hash: hashedPin,
  company_id: companyId
});
```

---

## References

- **Migration Plan:** `DATABASE_MIGRATION_PLAN.md`
- **Migration Summary:** `MUKAPPS_MIGRATION_SUMMARY.md`
- **Source Database:** `database_for_mukapps.json`
- **Field Naming Guide:** `API_FIELD_NAMING_GUIDE.md`

---

**Version:** 1.0.0
**Last Updated:** February 17, 2026
