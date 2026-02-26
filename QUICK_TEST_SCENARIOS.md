# Quick Test Scenarios

Fast reference for common testing workflows with curl commands and expected results.

## Prerequisites

```bash
# Start the server
npm start

# Set base URL
export API="http://localhost:5000/api/v1"
```

## Scenario 1: New Company Setup & Basic Subscription

```bash
# Step 1: Register a new company
curl -X POST $API/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "companyName": "Test Company",
    "companyEmail": "company@test.com",
    "adminName": "Admin User",
    "adminEmail": "admin@test.com",
    "password": "SecurePass123!",
    "phone": "+1234567890"
  }'

# Copy the token from response
export TOKEN="paste_your_token_here"

# Step 2: Check available plans
curl $API/maxicash-subscriptions/plans \
  -H "Authorization: Bearer $TOKEN"

# Step 3: Subscribe to Basic plan
curl -X POST $API/maxicash-subscriptions/initiate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "basic",
    "customerPhone": "+1234567890",
    "autoRenew": false
  }'

# Step 4: Verify subscription is active
curl $API/maxicash-subscriptions/active \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result:**
- ✅ Company registered
- ✅ JWT token received
- ✅ 4 plans returned (Free, Basic, Pro, Enterprise)
- ✅ Subscription activated with status "active"
- ✅ Active subscription shows Basic plan

---

## Scenario 2: Login & Create Product

```bash
# Step 1: Login
TOKEN=$(curl -X POST $API/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@test.com",
    "password": "SecurePass123!"
  }' | jq -r '.data.token')

# Step 2: Create a category first
CATEGORY=$(curl -X POST $API/categories \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Electronics",
    "description": "Electronic items"
  }' | jq -r '.data.id')

# Step 3: Create a product
curl -X POST $API/products \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"name\": \"Laptop\",
    \"barcode\": \"LAP001\",
    \"category_id\": \"$CATEGORY\",
    \"purchase_price\": 800,
    \"selling_price\": 1200,
    \"current_stock\": 50,
    \"min_stock_level\": 5
  }"

# Step 4: List all products
curl $API/products \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result:**
- ✅ Login successful
- ✅ Category created
- ✅ Product created with all details
- ✅ Product appears in list

---

## Scenario 3: Complete Sales Flow

```bash
# Assuming you're logged in with TOKEN set

# Step 1: Create a customer
CUSTOMER=$(curl -X POST $API/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Customer",
    "email": "john@customer.com",
    "phone": "+1555123456",
    "address": "123 Main St"
  }' | jq -r '.data.id')

# Step 2: Get a product ID
PRODUCT=$(curl $API/products?limit=1 \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data[0].id')

# Step 3: Create an invoice
curl -X POST $API/invoices \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"customer_id\": \"$CUSTOMER\",
    \"items\": [
      {
        \"product_id\": \"$PRODUCT\",
        \"quantity\": 2,
        \"unit_price\": 1200,
        \"tax_rate\": 10,
        \"discount\": 0
      }
    ],
    \"tax\": 240,
    \"discount\": 0,
    \"payment_method\": \"cash\",
    \"payment_status\": \"paid\"
  }"

# Step 4: View dashboard
curl $API/reports/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result:**
- ✅ Customer created
- ✅ Invoice created with items
- ✅ Stock automatically reduced
- ✅ Dashboard shows updated sales

---

## Scenario 4: Subscription Management

```bash
# Assuming you're logged in with TOKEN set

# Step 1: Check current subscription
SUBSCRIPTION=$(curl $API/maxicash-subscriptions/active \
  -H "Authorization: Bearer $TOKEN" | jq -r '.data.id')

echo "Current Subscription ID: $SUBSCRIPTION"

# Step 2: Enable auto-renewal
curl -X PUT "$API/maxicash-subscriptions/$SUBSCRIPTION/auto-renew" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "autoRenew": true
  }'

# Step 3: View subscription history
curl $API/maxicash-subscriptions/history \
  -H "Authorization: Bearer $TOKEN"

# Step 4: Cancel subscription
curl -X POST "$API/maxicash-subscriptions/$SUBSCRIPTION/cancel" \
  -H "Authorization: Bearer $TOKEN"

# Step 5: Verify cancellation
curl $API/maxicash-subscriptions/active \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Result:**
- ✅ Active subscription retrieved
- ✅ Auto-renewal enabled
- ✅ History shows all subscriptions
- ✅ Subscription cancelled
- ✅ Status shows "cancelled"

---

## Scenario 5: User Management

```bash
# Assuming you're logged in as admin with TOKEN set

# Step 1: Create a new cashier
curl -X POST $API/users \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Cashier",
    "email": "jane@company.com",
    "password": "SecurePass123!",
    "role": "cashier",
    "phone": "+1555987654"
  }'

# Step 2: List all users
curl $API/users \
  -H "Authorization: Bearer $TOKEN"

# Step 3: Login as the new cashier
CASHIER_TOKEN=$(curl -X POST $API/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "jane@company.com",
    "password": "SecurePass123!"
  }' | jq -r '.data.token')

# Step 4: Try to create a user (should fail - cashiers can't)
curl -X POST $API/users \
  -H "Authorization: Bearer $CASHIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@company.com",
    "password": "Pass123!"
  }'
```

**Expected Result:**
- ✅ Cashier created by admin
- ✅ All users listed
- ✅ Cashier can login
- ❌ Cashier cannot create users (403 error)

---

## Scenario 6: Testing Subscription Limits

```bash
# Assuming Basic plan with limit of 500 products

# Step 1: Check your plan limits
curl $API/maxicash-subscriptions/active \
  -H "Authorization: Bearer $TOKEN" | jq '.data.plan'

# Step 2: Try to create a product (within limit)
for i in {1..10}; do
  curl -s -X POST $API/products \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"name\": \"Product $i\",
      \"selling_price\": 10,
      \"current_stock\": 100
    }" > /dev/null
  echo "Created product $i"
done

# Step 3: Check product count
curl $API/products \
  -H "Authorization: Bearer $TOKEN" | jq '.pagination.total'

# Step 4: Upgrade to Premium plan for unlimited products
curl -X POST $API/maxicash-subscriptions/initiate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "premium",
    "customerPhone": "+1234567890"
  }'
```

**Expected Result:**
- ✅ Basic plan shows 500 product limit
- ✅ 10 products created successfully
- ✅ Product count increases
- ✅ Can upgrade to Premium plan

---

## Scenario 7: Payment Verification Flow

```bash
# Step 1: Initiate payment
PAYMENT=$(curl -X POST $API/maxicash-subscriptions/initiate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "basic",
    "customerPhone": "+1234567890"
  }')

echo "$PAYMENT" | jq '.'

# Step 2: Extract transaction ID
TRANSACTION_ID=$(echo "$PAYMENT" | jq -r '.data.transactionId')

echo "Transaction ID: $TRANSACTION_ID"

# Step 3: Verify payment status
curl "$API/maxicash-subscriptions/verify/$TRANSACTION_ID" \
  -H "Authorization: Bearer $TOKEN"

# Step 4: Check if subscription activated
curl $API/maxicash-subscriptions/active \
  -H "Authorization: Bearer $TOKEN" | jq '.data.status'
```

**Expected Result:**
- ✅ Payment initiated
- ✅ Transaction ID received
- ✅ Payment verified
- ✅ Subscription status is "active"

---

## Scenario 8: Reports & Analytics

```bash
# Assuming you have some data

# Step 1: Dashboard overview
curl $API/reports/dashboard \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Step 2: Sales report for current month
START_DATE=$(date -u +"%Y-%m-01")
END_DATE=$(date -u +"%Y-%m-%d")

curl "$API/reports/sales?startDate=$START_DATE&endDate=$END_DATE" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Step 3: Profit analysis
curl "$API/reports/profit?startDate=$START_DATE&endDate=$END_DATE" \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Step 4: Inventory report
curl $API/reports/inventory \
  -H "Authorization: Bearer $TOKEN" | jq '.'

# Step 5: Low stock alerts
curl $API/reports/low-stock \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

**Expected Result:**
- ✅ Dashboard shows overview stats
- ✅ Sales report shows revenue data
- ✅ Profit report shows margin analysis
- ✅ Inventory report shows stock levels
- ✅ Low stock shows products below threshold

---

## Quick Error Testing

### Test 1: Invalid Credentials
```bash
curl -X POST $API/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "wrong@email.com",
    "password": "wrongpass"
  }'
# Expected: 401 "Invalid credentials"
```

### Test 2: Missing Token
```bash
curl $API/products
# Expected: 401 "Authentication required"
```

### Test 3: Invalid Plan
```bash
curl -X POST $API/maxicash-subscriptions/initiate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "invalid_plan",
    "customerPhone": "+1234567890"
  }'
# Expected: 400 "Invalid subscription plan"
```

### Test 4: Non-Admin Action
```bash
# Login as cashier and try to create subscription
curl -X POST $API/maxicash-subscriptions/initiate \
  -H "Authorization: Bearer $CASHIER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "basic",
    "customerPhone": "+1234567890"
  }'
# Expected: 403 "Only admins can initiate subscription payments"
```

---

## Postman/Insomnia Quick Import

### Postman
1. Open Postman
2. Click "Import"
3. Select `Inventory_API_Collection.postman_collection.json`
4. Collection ready with all requests!

### Insomnia
1. Open Insomnia
2. Click "Create" → "Import from File"
3. Select the JSON collection file
4. All requests imported!

---

## Tips

1. **Save tokens**: Export TOKEN variable after login
2. **Use jq**: Install jq for JSON parsing: `sudo apt install jq`
3. **Test sequentially**: Some scenarios depend on previous data
4. **Check logs**: `tail -f logs/combined.log` for debugging
5. **Reset data**: Truncate tables in Supabase if needed

---

## Common Status Codes

| Code | Meaning | Common Cause |
|------|---------|--------------|
| 200 | Success | Request completed |
| 201 | Created | Resource created |
| 400 | Bad Request | Invalid input data |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 500 | Server Error | Backend issue |

---

**Happy Testing!** 🚀

For detailed documentation, see:
- `POSTMAN_TESTING_GUIDE.md` - Full API testing guide
- `MAXICASH_SUBSCRIPTION_GUIDE.md` - Subscription system details
- `MAXICASH_QUICK_START.md` - Quick start guide
