# API Documentation & Testing Tools

This folder contains all the testing tools and API specifications for the Inventory Management System.

---

## 📁 Files in This Folder

### 1. Postman Collection (v2.1)
**File:** `postman_collection_v2.json`

Complete Postman collection with:
- ✅ All API endpoints
- ✅ Authentication flows
- ✅ CRUD operations
- ✅ Multi-tenant isolation tests
- ✅ Security validation tests
- ✅ Automatic token management
- ✅ Test assertions

**How to Import:**
1. Open Postman
2. Click "Import" button
3. Select `postman_collection_v2.json`
4. Collection will appear in left sidebar

### 2. Postman Environment
**File:** `postman_environment.json`

Environment variables for testing:
- `base_url` - API base URL
- `access_token_a` - Company A access token (auto-saved)
- `refresh_token_a` - Company A refresh token (auto-saved)
- `company_id_a` - Company A ID (auto-saved)
- `product_id` - Sample product ID (auto-saved)
- `customer_id` - Sample customer ID (auto-saved)
- `invoice_id` - Sample invoice ID (auto-saved)

**How to Import:**
1. Click gear icon (⚙️) in Postman
2. Select "Import"
3. Choose `postman_environment.json`
4. Select the environment from dropdown

**Environment Variables:**
```json
{
  "base_url": "http://localhost:5000/api/v1",
  "access_token_a": "",
  "refresh_token_a": "",
  "company_id_a": "",
  "user_id_a": "",
  "access_token_b": "",
  "company_id_b": "",
  "category_id": "",
  "product_id": "",
  "customer_id": "",
  "invoice_id": "",
  "expense_id": ""
}
```

### 3. OpenAPI/Swagger Specification
**File:** `swagger.yaml`

OpenAPI 3.0 specification for:
- API documentation
- Code generation
- API testing tools
- Integration with Swagger UI

**How to Use:**
1. **Swagger Editor:** Upload to https://editor.swagger.io
2. **Swagger UI:** Serve with Swagger UI
3. **Code Generation:** Use with OpenAPI generators
4. **Documentation:** Import into API documentation tools

---

## 🚀 Quick Start with Postman

### Step 1: Import Collection & Environment
1. Import `postman_collection_v2.json`
2. Import `postman_environment.json`
3. Select "Inventory API - Testing" environment

### Step 2: Run Collection in Order
The collection is organized sequentially:

**1. Authentication**
- 1.1 Register Company A → Creates company & admin user
- 1.2 Login Company A → Gets fresh token
- 1.3 Get Current User → Verifies authentication
- 1.4 Refresh Token → Tests token refresh

**2. User Management**
- 2.1 Create Supervisor → Creates supervisor role user
- 2.2 Create Operator → Creates operator role user
- 2.3 Create Cashier → Creates cashier role user
- 2.4 List Users → Views all company users

**3. Categories**
- 3.1 Create Category → Creates product category
- 3.2 List Categories → Views all categories

**4. Products**
- 4.1 Create Product → Creates product
- 4.2 List Products → Views all products
- 4.3 Get Product by ID → Retrieves single product

**5. Customers**
- 5.1 Create Customer → Creates customer
- 5.2 List Customers → Views all customers

**6. Invoices**
- 6.1 Create Invoice → Creates invoice & deducts stock
- 6.2 List Invoices → Views all invoices
- 6.3 Verify Stock Deduction → Confirms stock was deducted

**7. Multi-Tenant Isolation**
- 7.1 Register Company B → Creates second company
- 7.2 Create Product (Same Barcode) → Tests isolation
- 7.3 Test Cross-Company Access → Verifies data isolation

**8. Security Tests**
- 8.1 Test No Token → Expects 401
- 8.2 Test Invalid Token → Expects 401

### Step 3: Check Results
- All requests should return 200/201 status
- Tokens are saved automatically to environment
- IDs are saved for subsequent requests
- Test assertions validate responses

---

## 📊 Postman Collection Features

### Automatic Token Management
Tokens are automatically saved after registration/login:

```javascript
// In Test Scripts
const res = pm.response.json();
if (res.success) {
    pm.environment.set("access_token_a", res.data.token);
    pm.environment.set("refresh_token_a", res.data.refreshToken);
    pm.environment.set("company_id_a", res.data.company.id);
}
```

### Automatic ID Saving
Resource IDs are saved for later requests:

```javascript
// After creating product
pm.environment.set("product_id", res.data.id);

// Use in later request
GET /products/{{product_id}}
```

### Test Assertions
Every request includes test assertions:

```javascript
pm.test("Status is 200", () => pm.response.to.have.status(200));
pm.test("Has data property", () => pm.expect(pm.response.json().data).to.exist);
pm.test("Company ID matches", () => {
    const product = pm.response.json().data;
    const companyId = pm.environment.get("company_id_a");
    pm.expect(product.company_id).to.eql(companyId);
});
```

### Multi-Tenant Testing
Tests data isolation between companies:

1. Create Company A → Save token A
2. Create Product in Company A
3. Create Company B → Save token B
4. Try to access Company A's product with token B
5. Should return 404 (not found)

---

## 🔧 Swagger/OpenAPI Usage

### View in Swagger Editor
1. Go to https://editor.swagger.io
2. File → Import File
3. Select `swagger.yaml`
4. View interactive documentation

### Generate API Client
```bash
# Install OpenAPI Generator
npm install @openapitools/openapi-generator-cli -g

# Generate TypeScript client
openapi-generator-cli generate \
  -i swagger.yaml \
  -g typescript-axios \
  -o ./generated-client

# Generate Python client
openapi-generator-cli generate \
  -i swagger.yaml \
  -g python \
  -o ./python-client
```

### Serve with Swagger UI
```bash
# Using Docker
docker run -p 8080:8080 \
  -e SWAGGER_JSON=/swagger.yaml \
  -v $(pwd):/swagger.yaml \
  swaggerapi/swagger-ui

# Access at http://localhost:8080
```

---

## 📝 Testing Workflow

### Workflow 1: Basic Testing
```
1. Register Company → Get token
2. Create Category → Get category_id
3. Create Product → Get product_id
4. Create Customer → Get customer_id
5. Create Invoice → Stock deducted
6. View Reports → See sales data
```

### Workflow 2: Multi-Tenant Testing
```
1. Register Company A → Token A
2. Create Product A
3. Register Company B → Token B
4. Create Product B (same barcode) → Should succeed
5. Try to access Product A with Token B → Should fail (404)
6. Try to access Product B with Token A → Should fail (404)
```

### Workflow 3: Role-Based Access Testing
```
1. Login as Admin → Create users
2. Login as Supervisor → Can approve expenses
3. Login as Operator → Can create invoices
4. Login as Cashier → Limited to invoice creation
5. Test unauthorized actions → Should fail (403)
```

### Workflow 4: Stock Management Testing
```
1. Create Product (stock: 100)
2. Create Invoice (quantity: 10) → Stock: 90
3. Check stock movement history
4. Cancel Invoice → Stock: 100 (restored)
5. Manual stock adjustment
6. Check low stock alerts
```

---

## 🎯 Environment Configuration

### Development
```json
{
  "base_url": "http://localhost:5000/api/v1"
}
```

### Staging
```json
{
  "base_url": "https://staging-api.yourdomain.com/api/v1"
}
```

### Production
```json
{
  "base_url": "https://api.yourdomain.com/api/v1"
}
```

**How to Switch:**
1. Duplicate environment
2. Update `base_url`
3. Select environment from dropdown

---

## 🔍 Debugging Tips

### View Request/Response
1. Click on request in Postman
2. Check "Body" tab for request data
3. Check "Response" section for API response
4. Use "Console" (bottom) for detailed logs

### Check Environment Variables
1. Click eye icon (👁️) next to environment selector
2. View all saved variables
3. Verify tokens and IDs are saved

### Test Script Console
1. Add `console.log()` in Test Scripts
2. Open Postman Console (View → Show Postman Console)
3. See detailed execution logs

### Common Issues

**Issue: 401 Unauthorized**
- Solution: Token expired, run "1.2 Login" again

**Issue: 404 Not Found**
- Solution: Resource ID not found, check environment variables

**Issue: 400 Validation Error**
- Solution: Check request body format, use snake_case

**Issue: Variables not saved**
- Solution: Check Test Scripts, verify environment is selected

---

## 📚 Additional Documentation

**In project root:**
- `FRONTEND_INTEGRATION_GUIDE.md` - Complete API documentation
- `API_QUICK_REFERENCE.md` - Quick endpoint reference
- `API_FIELD_NAMING_GUIDE.md` - Field naming conventions
- `POSTMAN_TESTING_GUIDE.md` - Detailed Postman guide

**In docs folder:**
- `docs/FRONTEND_QUICK_START.md` - Quick start guide

---

## ✅ Testing Checklist

### Basic Functionality
- [ ] Health check works
- [ ] Registration works
- [ ] Login works
- [ ] Token refresh works
- [ ] CRUD operations work for all resources
- [ ] Pagination works
- [ ] Search works
- [ ] Filtering works

### Multi-Tenancy
- [ ] Data isolated per company
- [ ] Cross-company access blocked
- [ ] Same barcode allowed in different companies
- [ ] Same email allowed in different companies

### Stock Management
- [ ] Invoice creation deducts stock
- [ ] Invoice cancellation restores stock
- [ ] Stock movements recorded
- [ ] Low stock alerts work

### Security
- [ ] Unauthenticated requests blocked
- [ ] Invalid tokens rejected
- [ ] Role-based access enforced
- [ ] Rate limiting works

### Error Handling
- [ ] Validation errors detailed
- [ ] Not found returns 404
- [ ] Duplicates return 409
- [ ] Server errors return 500

---

## 🚀 Collection Runner

**Run entire collection automatically:**

1. Click "Collections" in sidebar
2. Find "Inventory Management API"
3. Click "..." → "Run collection"
4. Select requests to run
5. Click "Run Inventory Management API"
6. View results summary

**Benefits:**
- Tests all endpoints in sequence
- Verifies entire API workflow
- Detects breaking changes
- Useful for regression testing

---

## 📞 Support

**Questions?**
1. Check `FRONTEND_INTEGRATION_GUIDE.md` first
2. Review request examples in Postman
3. Verify environment variables are set
4. Check console for detailed errors

**Common Resources:**
- API Documentation: `FRONTEND_INTEGRATION_GUIDE.md`
- Quick Reference: `API_QUICK_REFERENCE.md`
- Field Names: `API_FIELD_NAMING_GUIDE.md`
- Postman Guide: `POSTMAN_TESTING_GUIDE.md`

---

## 🎉 Summary

This folder provides:
✅ Complete Postman collection with 50+ requests
✅ Environment configuration
✅ OpenAPI/Swagger specification
✅ Automatic token management
✅ Test assertions
✅ Multi-tenant testing
✅ Security testing

**Next Steps:**
1. Import Postman collection
2. Import environment
3. Run "1.1 Register Company A"
4. Continue with subsequent requests
5. View test results

**Happy Testing! 🧪**
