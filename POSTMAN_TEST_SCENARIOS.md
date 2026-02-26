# Postman Test Scenarios

Step-by-step testing scenarios for real-world use cases.

---

## 📋 Scenario 1: Complete Sales Flow

### Goal
Complete a sale from customer creation to invoice generation and payment.

### Steps

**1. Login**
```
POST /api/v1/auth/login
{
  "email": "admin@example.com",
  "password": "your_password"
}
```
✅ Save the `token` to use in all subsequent requests

---

**2. Create Customer**
```
POST /api/v1/customers
Authorization: Bearer YOUR_TOKEN
{
  "name": "Sarah Johnson",
  "email": "sarah@example.com",
  "phone": "+1234567890",
  "address": "123 Main St",
  "city": "New York"
}
```
✅ Save the `customer_id` from response

---

**3. Create Products** (if not existing)
```
POST /api/v1/products
Authorization: Bearer YOUR_TOKEN
{
  "name": "Laptop Computer",
  "barcode": "LAPTOP001",
  "sellingPrice": 999.99,
  "purchasePrice": 600.00,
  "currentStock": 50,
  "minStockLevel": 5
}
```
✅ Save the `product_id` from response

**Create another product:**
```
{
  "name": "Wireless Mouse",
  "barcode": "MOUSE001",
  "sellingPrice": 29.99,
  "purchasePrice": 15.00,
  "currentStock": 100,
  "minStockLevel": 20
}
```
✅ Save this `product_id` as well

---

**4. Check Stock Before Sale**
```
GET /api/v1/stock/valuation
Authorization: Bearer YOUR_TOKEN
```
✅ Verify you have enough stock

---

**5. Create Invoice**
```
POST /api/v1/invoices
Authorization: Bearer YOUR_TOKEN
{
  "customerId": "CUSTOMER_ID_FROM_STEP_2",
  "items": [
    {
      "productId": "LAPTOP_PRODUCT_ID",
      "quantity": 1,
      "unitPrice": 999.99,
      "taxRate": 15,
      "discount": 0
    },
    {
      "productId": "MOUSE_PRODUCT_ID",
      "quantity": 2,
      "unitPrice": 29.99,
      "taxRate": 15,
      "discount": 5.00
    }
  ],
  "paymentMethod": "card",
  "paymentStatus": "paid",
  "discount": 50.00,
  "notes": "VIP customer - special discount applied"
}
```
✅ Save the `invoice_id` from response
✅ Note the total amount

---

**6. Verify Invoice Created**
```
GET /api/v1/invoices/INVOICE_ID
Authorization: Bearer YOUR_TOKEN
```
✅ Check all details are correct
✅ Verify stock was deducted

---

**7. Generate Invoice PDF**
```
GET /api/v1/invoices/INVOICE_ID/pdf
Authorization: Bearer YOUR_TOKEN
```
✅ PDF file should download

---

**8. Check Stock After Sale**
```
GET /api/v1/stock/history/LAPTOP_PRODUCT_ID
Authorization: Bearer YOUR_TOKEN
```
✅ Verify stock movement was recorded
✅ Check current stock level decreased

---

**9. View Customer Stats**
```
GET /api/v1/customers/CUSTOMER_ID/stats
Authorization: Bearer YOUR_TOKEN
```
✅ Verify purchase total is updated
✅ Check if customer became VIP

---

**10. Check Dashboard**
```
GET /api/v1/reports/dashboard
Authorization: Bearer YOUR_TOKEN
```
✅ Verify today's sales includes this transaction

---

## 📦 Scenario 2: Inventory Management

### Goal
Receive new stock, transfer between locations, and handle low stock alerts.

### Steps

**1. Check Current Inventory**
```
GET /api/v1/reports/inventory
Authorization: Bearer YOUR_TOKEN
```
✅ Review current stock levels

---

**2. Check Low Stock Products**
```
GET /api/v1/stock/low-stock
Authorization: Bearer YOUR_TOKEN
```
✅ Identify products needing reorder

---

**3. Receive New Stock**
```
POST /api/v1/stock/movements
Authorization: Bearer YOUR_TOKEN
{
  "productId": "PRODUCT_ID",
  "type": "in",
  "quantity": 200,
  "reason": "New shipment from Supplier A",
  "reference": "PO-2024-12345"
}
```
✅ Verify stock increased

---

**4. View Stock Movements**
```
GET /api/v1/stock/movements?page=1&limit=20
Authorization: Bearer YOUR_TOKEN
```
✅ Confirm movement was recorded

---

**5. Check Updated Stock Valuation**
```
GET /api/v1/stock/valuation
Authorization: Bearer YOUR_TOKEN
```
✅ Verify total inventory value increased

---

**6. Transfer Stock to Another Location**
```
POST /api/v1/stock/transfer
Authorization: Bearer YOUR_TOKEN
{
  "productId": "PRODUCT_ID",
  "quantity": 50,
  "fromLocation": "Main Warehouse",
  "toLocation": "Downtown Store",
  "notes": "Restocking downtown location for weekend rush"
}
```
✅ Transfer recorded

---

**7. Physical Inventory Count Adjustment** (Admin/Manager)
```
POST /api/v1/stock/adjust
Authorization: Bearer YOUR_TOKEN
{
  "productId": "PRODUCT_ID",
  "newStock": 175,
  "reason": "Physical count revealed discrepancy - updated to actual count"
}
```
✅ Stock corrected to actual count

---

**8. View Product History**
```
GET /api/v1/stock/history/PRODUCT_ID
Authorization: Bearer YOUR_TOKEN
```
✅ See all movements: in, transfer, adjustment

---

**9. Check Out of Stock Products**
```
GET /api/v1/stock/out-of-stock
Authorization: Bearer YOUR_TOKEN
```
✅ Identify products that need immediate reorder

---

## 📊 Scenario 3: Business Reports & Analytics

### Goal
Generate comprehensive business reports for decision making.

### Steps

**1. Dashboard Overview**
```
GET /api/v1/reports/dashboard
Authorization: Bearer YOUR_TOKEN
```
✅ Get overall business metrics
- Total sales today
- Revenue this month
- Current profit margin
- Pending invoices
- Low stock alerts

---

**2. Monthly Sales Report**
```
GET /api/v1/reports/sales?period=month
Authorization: Bearer YOUR_TOKEN
```
✅ Analyze sales performance

**With Custom Date Range:**
```
GET /api/v1/reports/sales?startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer YOUR_TOKEN
```

---

**3. Profit Analysis**
```
GET /api/v1/reports/profit?period=month
Authorization: Bearer YOUR_TOKEN
```
✅ Review profit margins
✅ Compare purchase vs selling prices

---

**4. Top Performing Products**
```
GET /api/v1/reports/top-products?period=month&limit=10
Authorization: Bearer YOUR_TOKEN
```
✅ Identify best sellers
✅ Plan inventory accordingly

---

**5. Low Performing Products**
```
GET /api/v1/reports/low-performing?period=month&limit=10
Authorization: Bearer YOUR_TOKEN
```
✅ Identify slow movers
✅ Consider promotions or discontinuation

---

**6. Customer Analysis**
```
GET /api/v1/reports/customers?period=month
Authorization: Bearer YOUR_TOKEN
```
✅ View customer purchase patterns
✅ Identify VIP customers

---

**7. Expense Report**
```
GET /api/v1/reports/expenses?period=month
Authorization: Bearer YOUR_TOKEN
```
✅ Track business expenses
✅ Compare against revenue

---

**8. Revenue Trend**
```
GET /api/v1/reports/revenue-trend?period=week
Authorization: Bearer YOUR_TOKEN
```
✅ See daily/weekly revenue patterns
✅ Identify peak sales periods

---

**9. Export Report to PDF**
```
GET /api/v1/reports/export?type=sales&format=pdf&period=month
Authorization: Bearer YOUR_TOKEN
```
✅ Download PDF for presentation

**Export to Excel:**
```
GET /api/v1/reports/export?type=profit&format=excel&startDate=2024-01-01&endDate=2024-12-31
Authorization: Bearer YOUR_TOKEN
```

---

## 👥 Scenario 4: User & Team Management

### Goal
Manage team members and their access (Admin only).

### Steps

**1. View Current Team**
```
GET /api/v1/users?page=1&limit=20
Authorization: Bearer YOUR_TOKEN
```
✅ See all team members
✅ Check roles and status

---

**2. Create New Cashier**
```
POST /api/v1/users
Authorization: Bearer YOUR_TOKEN
{
  "name": "Mike Chen",
  "email": "mike.chen@example.com",
  "password": "SecurePass123!",
  "role": "cashier",
  "phone": "+1234567890"
}
```
✅ Save the new `user_id`

---

**3. View New User Profile**
```
GET /api/v1/users/USER_ID
Authorization: Bearer YOUR_TOKEN
```
✅ Verify user was created correctly

---

**4. Update User Information**
```
PUT /api/v1/users/USER_ID
Authorization: Bearer YOUR_TOKEN
{
  "name": "Michael Chen",
  "phone": "+0987654321"
}
```
✅ Information updated

---

**5. Promote User to Manager**
```
PUT /api/v1/users/USER_ID/role
Authorization: Bearer YOUR_TOKEN
{
  "role": "manager"
}
```
✅ Role updated
✅ User now has manager permissions

---

**6. Test New Manager Permissions**
Login as the manager and try:
```
POST /api/v1/stock/adjust
Authorization: Bearer MANAGER_TOKEN
{
  "productId": "PRODUCT_ID",
  "newStock": 100,
  "reason": "Testing manager permissions"
}
```
✅ Should succeed (managers can adjust stock)

---

**7. Test Restricted Permissions**
Try to create a user as manager:
```
POST /api/v1/users
Authorization: Bearer MANAGER_TOKEN
{...}
```
❌ Should fail with 403 Forbidden (only admins can create users)

---

**8. Reset User Password**
```
PUT /api/v1/users/USER_ID/password
Authorization: Bearer YOUR_TOKEN
{
  "password": "NewSecurePass456!"
}
```
✅ Password changed

---

**9. Deactivate User**
```
POST /api/v1/users/USER_ID/deactivate
Authorization: Bearer YOUR_TOKEN
```
✅ User account deactivated
✅ User cannot login

---

**10. Reactivate User**
```
POST /api/v1/users/USER_ID/activate
Authorization: Bearer YOUR_TOKEN
```
✅ User can login again

---

**11. Search Users**
```
GET /api/v1/users?search=mike&role=manager&status=active
Authorization: Bearer YOUR_TOKEN
```
✅ Filter by multiple criteria

---

## 🔄 Scenario 5: Return & Refund Process

### Goal
Process a customer return and issue refund.

### Steps

**1. Find Original Invoice**
```
GET /api/v1/invoices/search?q=INV-2024
Authorization: Bearer YOUR_TOKEN
```
✅ Locate the invoice to refund

---

**2. View Invoice Details**
```
GET /api/v1/invoices/INVOICE_ID
Authorization: Bearer YOUR_TOKEN
```
✅ Review items purchased
✅ Note quantities and amounts

---

**3. Record Stock Return**
```
POST /api/v1/stock/movements
Authorization: Bearer YOUR_TOKEN
{
  "productId": "PRODUCT_ID",
  "type": "return",
  "quantity": 1,
  "reason": "Customer return - product defect",
  "reference": "INVOICE_NUMBER"
}
```
✅ Stock quantity increased

---

**4. Update Invoice Payment Status**
```
PUT /api/v1/invoices/INVOICE_ID
Authorization: Bearer YOUR_TOKEN
{
  "paymentStatus": "refunded",
  "notes": "Full refund issued - product defect"
}
```
✅ Invoice marked as refunded

---

**5. Adjust Customer Purchase Total**
```
GET /api/v1/customers/CUSTOMER_ID/stats
Authorization: Bearer YOUR_TOKEN
```
✅ Verify total purchases updated

---

**6. Check Dashboard After Refund**
```
GET /api/v1/reports/dashboard
Authorization: Bearer YOUR_TOKEN
```
✅ Metrics reflect the refund

---

## 🎯 Scenario 6: End of Day Reconciliation

### Goal
Review and reconcile all transactions for the day.

### Steps

**1. Today's Sales Overview**
```
GET /api/v1/reports/dashboard
Authorization: Bearer YOUR_TOKEN
```
✅ Total sales for today
✅ Number of transactions

---

**2. Today's Invoices**
```
GET /api/v1/invoices?dateFrom=2024-12-09&dateTo=2024-12-09
Authorization: Bearer YOUR_TOKEN
```
✅ Review all invoices created today

---

**3. Payment Method Breakdown**
```
GET /api/v1/invoices?paymentMethod=cash
Authorization: Bearer YOUR_TOKEN
```
Repeat for: `card`, `mobile`, `bank_transfer`
✅ Calculate totals per payment method

---

**4. Check Pending Payments**
```
GET /api/v1/invoices/pending
Authorization: Bearer YOUR_TOKEN
```
✅ Follow up on unpaid invoices

---

**5. Today's Stock Movements**
```
GET /api/v1/stock/movements?dateFrom=2024-12-09&dateTo=2024-12-09
Authorization: Bearer YOUR_TOKEN
```
✅ Review all stock in/out today

---

**6. Low Stock Alerts**
```
GET /api/v1/stock/low-stock
Authorization: Bearer YOUR_TOKEN
```
✅ Create purchase orders for tomorrow

---

**7. Daily Sales Report**
```
GET /api/v1/reports/sales?period=today
Authorization: Bearer YOUR_TOKEN
```
✅ Detailed sales breakdown

---

**8. Export Daily Report**
```
GET /api/v1/reports/export?type=sales&format=pdf&period=today
Authorization: Bearer YOUR_TOKEN
```
✅ Save for records

---

## 💡 Testing Tips

### 1. Use Test Scripts in Postman
Add to request "Tests" tab:
```javascript
// Auto-save response IDs
if (pm.response.code === 201 || pm.response.code === 200) {
    var jsonData = pm.response.json();
    if (jsonData.data && jsonData.data.id) {
        pm.collectionVariables.set('last_created_id', jsonData.data.id);
    }
}

// Verify response structure
pm.test("Response has success flag", function () {
    var jsonData = pm.response.json();
    pm.expect(jsonData).to.have.property('success');
});

// Check status code
pm.test("Status code is 200 or 201", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 201]);
});
```

### 2. Use Pre-request Scripts
Add to request "Pre-request Script" tab:
```javascript
// Set dynamic dates
pm.collectionVariables.set('today', new Date().toISOString().split('T')[0]);
pm.collectionVariables.set('startOfMonth', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]);
```

### 3. Environment Variables
Create these variables:
- `base_url`: http://localhost:5000/api/v1
- `token`: Your auth token
- `admin_email`: admin@example.com
- `admin_password`: your_password

### 4. Collection Runner
Use Postman's Collection Runner to:
- Run entire test suite
- Test multiple scenarios
- Generate reports

### 5. Monitor Mode
Set up monitors to:
- Test API health
- Verify endpoints work
- Get alerts on failures

---

## 🚨 Common Issues & Solutions

### Issue: 401 Unauthorized
**Solution:** Refresh your token by logging in again

### Issue: 403 Forbidden
**Solution:** Check user role - you may need admin/manager access

### Issue: 404 Not Found
**Solution:** Verify the resource ID exists in your database

### Issue: 400 Bad Request
**Solution:** Check request body matches schema in `validators.js`

### Issue: 500 Server Error
**Solution:** Check server logs in `logs/error.log`

---

## 📚 Related Documentation

- Full API Guide: `POSTMAN_API_TESTING_GUIDE.md`
- Quick Reference: `API_TESTING_QUICK_REFERENCE.md`
- API Documentation: `API_QUICK_REFERENCE.md`
- Database Models: `DATABASE_AND_MODELS_SUMMARY.md`
