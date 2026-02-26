# Postman Quick Start Guide

**Ready in 5 Minutes** ⚡

---

## Step 1: Import Collection & Environment

### Import Collection
1. Open Postman
2. Click **Import** (top left)
3. Drag & drop: `docs/api/postman_collection_v2.json`
4. Done ✅

### Import Environment
1. Click ⚙️ (top right)
2. Click **Import**
3. Drag & drop: `docs/api/postman_environment.json`
4. Close settings
5. Select **"Inventory API - Testing"** from dropdown (top right)
6. Done ✅

---

## Step 2: Start Server

```bash
cd /path/to/project
npm start
```

Server runs on: `http://localhost:5000`

---

## Step 3: Run Quick Test

### Option A: Manual (Recommended for First Time)

**Run these 6 requests in order:**

1. **1. Authentication** → **1.1 Register Company A**
   - Click **Send**
   - ✅ Token automatically saved

2. **3. Categories** → **3.1 Create Category**
   - Click **Send**
   - ✅ Category ID saved

3. **4. Products** → **4.1 Create Product**
   - Click **Send**
   - ✅ Product ID saved

4. **5. Customers** → **5.1 Create Customer**
   - Click **Send**
   - ✅ Customer ID saved

5. **6. Invoices** → **6.1 Create Invoice**
   - Click **Send**
   - ✅ Invoice created, stock deducted

6. **6. Invoices** → **6.3 Verify Stock Deduction**
   - Click **Send**
   - ✅ Check: `current_stock` should be 8 (was 10)

**Result:** System works! 🎉

---

### Option B: Collection Runner (Automated)

1. Click **Runner** button
2. Select **"Inventory Management API"**
3. Select **"Inventory API - Testing"** environment
4. Click **Run**
5. Watch tests pass ✅

---

## Step 4: Test Multi-Tenant Isolation

**Run these 3 requests:**

1. **7. Multi-Tenant Isolation** → **7.1 Register Company B**
   - Creates second company
   - ✅ Different token saved

2. **7. Multi-Tenant Isolation** → **7.2 Create Product (Same Barcode)**
   - Same barcode as Company A
   - ✅ Should succeed (different companies)

3. **7. Multi-Tenant Isolation** → **7.3 Test Cross-Company Access**
   - Company B tries to access Company A's product
   - ✅ Should return 404 (data isolated)

**Result:** Companies are isolated! 🔒

---

## Step 5: Test Security

**Run these 2 requests:**

1. **8. Security Tests** → **8.1 Test No Token**
   - ✅ Should return 401

2. **8. Security Tests** → **8.2 Test Invalid Token**
   - ✅ Should return 401

**Result:** Security works! 🛡️

---

## Complete Test Order

For comprehensive testing, run in this sequence:

```
Phase 1: Company A Setup
├─ 1.1 Register Company A
├─ 1.2 Login Company A
├─ 1.3 Get Current User
├─ 2.1 Create Supervisor
├─ 2.2 Create Operator
├─ 2.3 Create Cashier
└─ 2.4 List Users

Phase 2: Business Data
├─ 3.1 Create Category
├─ 4.1 Create Product
├─ 5.1 Create Customer
├─ 6.1 Create Invoice
└─ 6.3 Verify Stock Deduction

Phase 3: Isolation Test
├─ 7.1 Register Company B
├─ 7.2 Create Product (Same Barcode)
└─ 7.3 Test Cross-Company Access

Phase 4: Security Test
├─ 8.1 Test No Token
└─ 8.2 Test Invalid Token
```

**Total Time:** 10-15 minutes

---

## Common Issues

### Issue: "Authentication required"
**Fix:** Re-run **1.1 Register** or **1.2 Login**
- Token auto-saves to environment

### Issue: "Product not found" (404)
**Check:** Are you using Company B's token to access Company A's product?
- This is expected behavior (data isolation)

### Issue: Server connection refused
**Fix:** Make sure server is running
```bash
npm start
```

---

## Environment Variables Explained

| Variable | Purpose | Auto-Saved |
|----------|---------|------------|
| `base_url` | API base URL | No (manual) |
| `access_token_a` | Company A auth token | Yes (login) |
| `company_id_a` | Company A UUID | Yes (register) |
| `product_id` | Created product UUID | Yes (create) |
| `customer_id` | Created customer UUID | Yes (create) |
| `invoice_id` | Created invoice UUID | Yes (create) |

**No need to manually set variables** - they're saved automatically! ✨

---

## Viewing Saved Variables

1. Click 👁️ (eye icon, top right)
2. See all current values
3. Expand to copy UUIDs if needed

---

## Advanced: Newman CLI

**Run from command line:**

```bash
# Install Newman
npm install -g newman

# Run collection
newman run docs/api/postman_collection_v2.json \
  -e docs/api/postman_environment.json

# With HTML report
npm install -g newman-reporter-htmlextra
newman run docs/api/postman_collection_v2.json \
  -e docs/api/postman_environment.json \
  -r htmlextra \
  --reporter-htmlextra-export report.html
```

---

## What's Tested?

✅ **Authentication** - Register, login, tokens
✅ **User Management** - Create users with roles
✅ **Categories** - CRUD operations
✅ **Products** - Create, list, retrieve
✅ **Customers** - Customer management
✅ **Invoices** - Create with automatic stock deduction
✅ **Multi-Tenant Isolation** - Companies cannot access each other's data
✅ **Security** - No token = 401, Invalid token = 401

---

## Full Documentation

For complete endpoint details, see:
- **`POSTMAN_COMPLETE_TESTING_GUIDE.md`** - Comprehensive guide (200+ pages)
- **`SYSTEM_FOUNDATION_VALIDATION.md`** - System validation report
- **`MULTI_TENANT_VALIDATION_TESTS.md`** - Manual test scenarios

---

**Quick Start Complete!** 🚀

You can now test the entire system systematically.

For questions, refer to the complete guide or check the API documentation.
