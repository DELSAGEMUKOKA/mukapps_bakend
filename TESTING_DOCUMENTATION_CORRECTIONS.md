# Testing Documentation Corrections

This document summarizes the corrections made to align the testing documentation with the actual database models.

## Overview

The testing guides have been corrected to match the actual database schema which uses **snake_case** naming convention for all fields.

## Files Corrected

1. ✅ `POSTMAN_TESTING_GUIDE.md`
2. ✅ `QUICK_TEST_SCENARIOS.md`
3. ✅ `Inventory_API_Collection.postman_collection.json`
4. ✅ `API_FIELD_NAMING_GUIDE.md` (NEW - comprehensive reference)

## Key Corrections Made

### 1. Registration Fields

**Before (Incorrect):**
```json
{
  "companyName": "Test Company Inc",
  "companyEmail": "company@test.com",
  "adminName": "John Admin",
  "adminEmail": "admin@test.com",
  "password": "SecurePass123!",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York",
  "country": "USA"
}
```

**After (Correct):**
```json
{
  "name": "John Admin",
  "email": "admin@test.com",
  "password": "SecurePass123!",
  "companyName": "Test Company Inc",
  "phone": "+1234567890"
}
```

**Changes:**
- Simplified to required fields only
- Uses single email for both user and company
- Removed unused fields (address, city, country not required)

### 2. Product Fields

**Before (Incorrect):**
```json
{
  "name": "Product",
  "categoryId": "uuid",
  "purchasePrice": 100,
  "sellingPrice": 150,
  "currentStock": 50,
  "minStockLevel": 10
}
```

**After (Correct):**
```json
{
  "name": "Product",
  "category_id": "uuid",
  "purchase_price": 100,
  "selling_price": 150,
  "current_stock": 50,
  "min_stock_level": 10
}
```

**Changes:**
- `categoryId` → `category_id`
- `purchasePrice` → `purchase_price`
- `sellingPrice` → `selling_price`
- `currentStock` → `current_stock`
- `minStockLevel` → `min_stock_level`

### 3. Customer Fields

**Before (Incorrect):**
```json
{
  "name": "Customer",
  "taxId": "TAX123"
}
```

**After (Correct):**
```json
{
  "name": "Customer",
  "email": "customer@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York"
}
```

**Changes:**
- Removed `taxId` field (not in Customer model)
- Customer model doesn't have tax_id field

### 4. Invoice Fields

**Before (Incorrect):**
```json
{
  "customerId": "uuid",
  "items": [
    {
      "productId": "uuid",
      "quantity": 2,
      "unitPrice": 15.00,
      "discount": 0
    }
  ],
  "paymentMethod": "cash"
}
```

**After (Correct):**
```json
{
  "customer_id": "uuid",
  "items": [
    {
      "product_id": "uuid",
      "quantity": 2,
      "unit_price": 15.00,
      "tax_rate": 10,
      "discount": 0
    }
  ],
  "tax": 2.70,
  "discount": 0,
  "payment_method": "cash",
  "payment_status": "paid"
}
```

**Changes:**
- `customerId` → `customer_id`
- `productId` → `product_id`
- `unitPrice` → `unit_price`
- Added `tax_rate` field for invoice items
- `paymentMethod` → `payment_method`
- Added `payment_status` field

### 5. Expense Fields

**Before (Incorrect):**
```json
{
  "title": "Expense",
  "amount": 50.00,
  "paymentMethod": "card"
}
```

**After (Correct):**
```json
{
  "title": "Expense",
  "description": "Description",
  "amount": 50.00,
  "category": "supplies",
  "payment_method": "card",
  "date": "2024-01-15"
}
```

**Changes:**
- `paymentMethod` → `payment_method`
- Added `date` field
- Added `category` field

### 6. User Roles

**Before (Incorrect):**
```
Roles: admin, supervisor, operator, cashier
```

**After (Correct):**
```
Roles: admin, manager, cashier
```

**Changes:**
- Removed non-existent roles: `supervisor`, `operator`
- Corrected to actual roles from User model: `admin`, `manager`, `cashier`

### 7. Subscription Plan Types

**Before (Incorrect):**
```
Plans: free, basic, pro, enterprise
```

**After (Correct):**
```
Plans: free, basic, premium, enterprise
```

**Changes:**
- `pro` → `premium` (actual plan name in Subscription model)

## Database Model Reference

### Actual Field Names from Models

**User Model:**
- `company_id`
- `is_active`
- `failed_login_attempts`
- `locked_until`
- `last_login`
- `email_verified`
- `email_verification_token`
- `password_reset_token`
- `password_reset_expires`

**Product Model:**
- `category_id`
- `purchase_price`
- `selling_price`
- `current_stock`
- `min_stock_level`
- `image_url`
- `company_id`

**Customer Model:**
- `total_purchases`
- `is_vip`
- `company_id`

**Invoice Model:**
- `invoice_number`
- `customer_id`
- `user_id`
- `company_id`
- `payment_method`
- `payment_status`

**InvoiceItem Model:**
- `invoice_id`
- `product_id`
- `unit_price`
- `tax_rate`

**Expense Model:**
- `payment_method`
- `receipt_url`
- `user_id`
- `company_id`

**Subscription Model:**
- `company_id`
- `plan_type`
- `start_date`
- `end_date`
- `trial_ends_at`
- `payment_method`

## Enum Values Corrected

### User Roles
```javascript
ENUM('admin', 'manager', 'cashier')
```

### Payment Methods
```javascript
ENUM('cash', 'card', 'transfer', 'check')
```

### Payment Status
```javascript
ENUM('pending', 'paid', 'cancelled', 'refunded')
```

### Subscription Plan Types
```javascript
ENUM('free', 'basic', 'premium', 'enterprise')
```

### Subscription Status
```javascript
ENUM('active', 'cancelled', 'expired', 'trial')
```

## Testing Files Status

| File | Status | Description |
|------|--------|-------------|
| `POSTMAN_TESTING_GUIDE.md` | ✅ Corrected | All field names updated to snake_case |
| `QUICK_TEST_SCENARIOS.md` | ✅ Corrected | All curl commands updated |
| `Inventory_API_Collection.postman_collection.json` | ✅ Corrected | Collection JSON updated |
| `API_FIELD_NAMING_GUIDE.md` | ✅ Created | New comprehensive reference guide |
| `API_QUICK_REFERENCE.md` | ⚠️ Existing | Already correct (user-modified) |

## How to Use Corrected Documentation

1. **For Postman Users:**
   - Import `Inventory_API_Collection.postman_collection.json`
   - Collection now has correct field names

2. **For Insomnia Users:**
   - Follow `POSTMAN_TESTING_GUIDE.md`
   - All examples now use snake_case

3. **For cURL Users:**
   - Use `QUICK_TEST_SCENARIOS.md`
   - All commands corrected

4. **For Reference:**
   - Check `API_FIELD_NAMING_GUIDE.md`
   - Complete field name reference with examples

## Common Mistakes to Avoid

❌ **Don't use camelCase:**
- `productId`, `customerId`, `purchasePrice`, `sellingPrice`

✅ **Use snake_case:**
- `product_id`, `customer_id`, `purchase_price`, `selling_price`

❌ **Don't use wrong roles:**
- `supervisor`, `operator`

✅ **Use correct roles:**
- `admin`, `manager`, `cashier`

❌ **Don't use wrong plan:**
- `pro`

✅ **Use correct plan:**
- `premium`

## Validation

All corrections have been validated against:
1. ✅ Sequelize model definitions in `src/models/`
2. ✅ Database schema
3. ✅ Controller implementations
4. ✅ Service layer code

## Next Steps

1. Import the corrected Postman collection
2. Review the API Field Naming Guide
3. Start testing with correct field names
4. Refer to POSTMAN_TESTING_GUIDE.md for detailed examples

## Summary

All testing documentation now accurately reflects:
- ✅ Correct field naming (snake_case)
- ✅ Correct user roles
- ✅ Correct subscription plans
- ✅ Correct enum values
- ✅ Required vs optional fields
- ✅ Actual model structure

The documentation is now 100% aligned with the database models and will work correctly with the API.
