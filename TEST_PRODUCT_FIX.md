# Test Plan: Product Creation/Update Fix Verification

**Date:** 2026-02-14
**Status:** Ready for Testing

---

## Quick Test (5 minutes)

### 1. Start Server
```bash
npm start
```

### 2. Login and Get Token
```bash
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@companya.com",
  "password": "SecurePass123!"
}
```

**Save the token from response.**

---

### 3. Test Product Creation (ALL FIELDS)

```bash
POST http://localhost:5000/api/v1/products
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Dell XPS 15 Laptop",
  "barcode": "LAPTOP-XPS-001",
  "description": "High-performance laptop with Intel i7",
  "category_id": null,
  "purchase_price": 1000.00,
  "selling_price": 1500.00,
  "current_stock": 10,
  "min_stock_level": 5,
  "unit": "piece",
  "sku": "DELL-XPS-15-001",
  "location": "Warehouse A - Shelf 3"
}
```

**Expected Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Dell XPS 15 Laptop",
    "barcode": "LAPTOP-XPS-001",
    "purchase_price": "1000.00",      ✅ Should be 1000, not 0
    "selling_price": "1500.00",       ✅ Should be 1500, not 0
    "current_stock": 10,               ✅ Should be 10, not 0
    "min_stock_level": 5,              ✅ Should be 5, not 0
    "unit": "piece",                   ✅ Should be "piece"
    "sku": "DELL-XPS-15-001",         ✅ Should be present
    "location": "Warehouse A - Shelf 3", ✅ Should be present
    "company_id": "uuid-here",
    "created_at": "2026-02-14T..."
  }
}
```

**✅ PASS if all fields have correct values**
**❌ FAIL if any numeric field is 0 or null**

---

### 4. Test Product Update (NUMERIC FIELDS)

Use the product ID from step 3:

```bash
PUT http://localhost:5000/api/v1/products/{product-id}
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "selling_price": 1600.00,
  "purchase_price": 1100.00,
  "min_stock_level": 8,
  "description": "Updated: Now with 32GB RAM"
}
```

**Expected Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "uuid-here",
    "name": "Dell XPS 15 Laptop",
    "purchase_price": "1100.00",   ✅ Updated from 1000 to 1100
    "selling_price": "1600.00",    ✅ Updated from 1500 to 1600
    "min_stock_level": 8,           ✅ Updated from 5 to 8
    "description": "Updated: Now with 32GB RAM", ✅ Updated
    "current_stock": 10,            ✅ Unchanged (correct)
    "updated_at": "2026-02-14T..."
  }
}
```

**✅ PASS if all updated fields have new values**
**❌ FAIL if prices/min_stock_level didn't change**

---

### 5. Verify Data in Database

```bash
GET http://localhost:5000/api/v1/products/{product-id}
Authorization: Bearer YOUR_TOKEN
```

**Confirm:**
- ✅ `selling_price` = 1600.00
- ✅ `purchase_price` = 1100.00
- ✅ `min_stock_level` = 8
- ✅ `current_stock` = 10
- ✅ `sku` and `location` are present

---

## What Was Fixed

### Before Fix ❌
```json
// User sends:
{
  "selling_price": 1500,
  "purchase_price": 1000,
  "min_stock_level": 5
}

// Database saves:
{
  "selling_price": 0,      ❌ Lost!
  "purchase_price": 0,     ❌ Lost!
  "min_stock_level": 0     ❌ Lost!
}
```

### After Fix ✅
```json
// User sends:
{
  "selling_price": 1500,
  "purchase_price": 1000,
  "min_stock_level": 5
}

// Database saves:
{
  "selling_price": 1500,   ✅ Correct!
  "purchase_price": 1000,  ✅ Correct!
  "min_stock_level": 5     ✅ Correct!
}
```

---

## Root Cause

The validation schema used **camelCase** (`sellingPrice`, `purchasePrice`) but the API and database use **snake_case** (`selling_price`, `purchase_price`).

The middleware had `stripUnknown: true`, so fields not in the schema were silently removed.

---

## Files Changed

1. **src/utils/validators.js** - Fixed all schemas to use snake_case
2. **src/controllers/productController.js** - Fixed updatePrice and updateStock methods
3. **src/models/Product.js** - Added `sku` and `location` fields
4. **Database Migration** - Added sku and location columns

---

## Additional Tests

### Test Invoice Creation (Verify Integration)
```bash
POST http://localhost:5000/api/v1/invoices
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "customer_id": null,
  "items": [
    {
      "product_id": "{product-id-from-step-3}",
      "quantity": 2,
      "unit_price": 1600.00,
      "discount": 0,
      "tax": 0
    }
  ],
  "payment_method": "cash",
  "payment_status": "paid"
}
```

**Expected:**
- ✅ Invoice created successfully
- ✅ Product stock decreased from 10 to 8
- ✅ Invoice total = 3200.00 (2 × 1600)

### Test Customer Creation (Verify Schema Fix)
```bash
POST http://localhost:5000/api/v1/customers
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json

{
  "name": "Test Customer Inc",
  "email": "customer@test.com",
  "phone": "+1234567890",
  "address": "123 Test Street",
  "city": "New York",
  "state": "NY",
  "country": "USA",
  "zip_code": "10001",
  "tax_id": "12-3456789"
}
```

**Expected:**
- ✅ All fields saved correctly (including state, country, zip_code)

---

## Validation Schema Changes

### Product Schema
- ✅ `categoryId` → `category_id`
- ✅ `purchasePrice` → `purchase_price`
- ✅ `sellingPrice` → `selling_price`
- ✅ `currentStock` → `current_stock`
- ✅ `minStockLevel` → `min_stock_level`
- ✅ `imageUrl` → `image_url`
- ✅ Added: `sku`, `location`

### Invoice Schema
- ✅ `customerId` → `customer_id`
- ✅ `productId` → `product_id`
- ✅ `unitPrice` → `unit_price`
- ✅ `taxRate` → `tax` (simplified)
- ✅ `paymentMethod` → `payment_method`
- ✅ `paymentStatus` → `payment_status`

### Customer Schema
- ✅ `taxId` → `tax_id`
- ✅ Added: `state`, `country`, `zip_code`

### Expense Schema
- ✅ `paymentMethod` → `payment_method`
- ✅ `receiptUrl` → `reference`
- ✅ Added: `notes`, `status`

### Stock Schema
- ✅ `productId` → `product_id`
- ✅ `newStock` → `new_stock`
- ✅ `fromLocation` → `from_location`
- ✅ `toLocation` → `to_location`

---

## Success Criteria

✅ All tests pass
✅ Product creation saves all fields correctly
✅ Product update changes all fields correctly
✅ Invoice creation works with updated products
✅ No console errors
✅ Database values match sent values

---

## If Tests Fail

1. Check server logs: `logs/error.log`
2. Verify token is valid and not expired
3. Confirm database migration ran successfully
4. Check request body uses snake_case field names
5. Verify Content-Type header is `application/json`

---

**Testing Status:** ⏳ Awaiting Manual Testing
**Expected Result:** ✅ All Tests Pass
**Critical Priority:** YES - Affects core functionality
