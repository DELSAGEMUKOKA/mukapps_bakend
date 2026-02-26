# Quick Start Checklist

Use this checklist to quickly get your API up and running with XAMPP and Insomnia.

## ✅ Pre-Setup Checklist

- [ ] XAMPP installed
- [ ] Node.js 18+ installed
- [ ] Insomnia installed
- [ ] Project downloaded/cloned
- [ ] Terminal/Command Prompt ready

## ✅ XAMPP Setup (5 minutes)

- [ ] Open XAMPP Control Panel
- [ ] Click **Start** for MySQL (wait for green indicator)
- [ ] Click **Start** for Apache (optional, for phpMyAdmin)
- [ ] Open browser and verify phpMyAdmin works: `http://localhost/phpmyadmin`
- [ ] Create database:
  - [ ] Click **New** in phpMyAdmin
  - [ ] Database name: `inventory_management`
  - [ ] Collation: `utf8mb4_unicode_ci`
  - [ ] Click **Create**
- [ ] Database created successfully ✓

## ✅ Project Setup (3 minutes)

- [ ] Open terminal in project directory
- [ ] Run: `npm install` (wait for completion)
- [ ] Copy environment file: `cp .env.example .env` (or manually copy)
- [ ] Open `.env` file in editor
- [ ] Verify/Update database settings:
  ```env
  DB_HOST=localhost
  DB_PORT=3306
  DB_NAME=inventory_management
  DB_USER=root
  DB_PASSWORD=
  ```
- [ ] Save `.env` file
- [ ] Configuration complete ✓

## ✅ Start Server (1 minute)

- [ ] In terminal, run: `npm run dev`
- [ ] Wait for success messages:
  - [ ] "Server is running on http://localhost:5000"
  - [ ] "Database connected successfully"
- [ ] Server running ✓
- [ ] Go to phpMyAdmin and verify 11 tables were created in `inventory_management`

## ✅ Insomnia Setup (5 minutes)

- [ ] Open Insomnia
- [ ] Create new Request Collection: "Inventory API"
- [ ] Set up environment:
  - [ ] Click **No Environment** dropdown
  - [ ] Click **Manage Environments**
  - [ ] Click **+** to add new
  - [ ] Name: `Development`
  - [ ] JSON:
    ```json
    {
      "base_url": "http://localhost:5000/api/v1",
      "token": ""
    }
    ```
  - [ ] Click **Done**
  - [ ] Select **Development** environment
- [ ] Environment configured ✓

## ✅ First API Test (2 minutes)

### Test 1: Health Check
- [ ] Create new GET request
- [ ] URL: `http://localhost:5000/health`
- [ ] Click **Send**
- [ ] Verify response shows "success": true
- [ ] Health check passed ✓

### Test 2: Register Company
- [ ] Create new POST request
- [ ] URL: `{{ _.base_url }}/auth/register`
- [ ] Select **Body** → **JSON**
- [ ] Paste:
  ```json
  {
    "name": "Test Admin",
    "email": "admin@test.com",
    "password": "Test123456",
    "companyName": "My Test Company",
    "phone": "+1234567890"
  }
  ```
- [ ] Add Header: `Content-Type: application/json`
- [ ] Click **Send**
- [ ] Response shows success: true
- [ ] Copy the `token` from response
- [ ] Registration successful ✓

### Test 3: Update Token
- [ ] Go back to **Manage Environments**
- [ ] Paste token in "token" field:
  ```json
  {
    "base_url": "http://localhost:5000/api/v1",
    "token": "paste-your-token-here"
  }
  ```
- [ ] Click **Done**
- [ ] Token saved ✓

### Test 4: Get Current User (Protected Route)
- [ ] Create new GET request
- [ ] URL: `{{ _.base_url }}/auth/me`
- [ ] Add Header: `Authorization: Bearer {{ _.token }}`
- [ ] Click **Send**
- [ ] Verify you see your user data
- [ ] Authentication working ✓

### Test 5: Create Product
- [ ] Create new POST request
- [ ] URL: `{{ _.base_url }}/products`
- [ ] Headers:
  - [ ] `Content-Type: application/json`
  - [ ] `Authorization: Bearer {{ _.token }}`
- [ ] Body:
  ```json
  {
    "name": "Test Laptop",
    "barcode": "TEST-001",
    "description": "Test product",
    "purchasePrice": 500,
    "sellingPrice": 800,
    "currentStock": 50,
    "minStockLevel": 10,
    "unit": "piece"
  }
  ```
- [ ] Click **Send**
- [ ] Product created successfully ✓

### Test 6: Get Products
- [ ] Create new GET request
- [ ] URL: `{{ _.base_url }}/products`
- [ ] Add Header: `Authorization: Bearer {{ _.token }}`
- [ ] Click **Send**
- [ ] See your created product in the list ✓

## ✅ Verify in Database

- [ ] Open phpMyAdmin: `http://localhost/phpmyadmin`
- [ ] Click `inventory_management` database
- [ ] Click `companies` table → Browse → See your company
- [ ] Click `users` table → Browse → See your admin user
- [ ] Click `products` table → Browse → See your test product
- [ ] All data visible in database ✓

## 🎉 Setup Complete!

You're all set! Your API is working with:
- ✅ XAMPP MySQL database
- ✅ Backend server running
- ✅ Insomnia configured
- ✅ Authentication working
- ✅ Products CRUD tested
- ✅ Data persisting in database

## 🚀 What's Next?

Now you can:
1. Test other endpoints (customers, invoices, categories, expenses)
2. Create different user roles (supervisor, operator, cashier)
3. Test invoice creation with automatic stock deduction
4. Try pagination and filtering
5. Test reporting endpoints
6. Review full API documentation in `TESTING_GUIDE.md`

## 📚 References

- **Full Testing Guide**: `TESTING_GUIDE.md`
- **API Documentation**: `README.md` (API Endpoints section)
- **Backend Specs**: `BACKEND_SPECIFICATION.md`
- **Database Schema**: `DATABASE_AND_MODELS_SUMMARY.md`

## ⚠️ Common Issues

### MySQL Won't Start in XAMPP
- Close Skype (uses port 3306)
- Check if another MySQL service is running
- Change MySQL port in XAMPP config

### Server Won't Start
- Check if port 5000 is already in use
- Verify `.env` database credentials
- Run `npm install` again

### Token Not Working
- Verify token is correctly copied
- Check there are no extra spaces
- Token expires after 7 days - login again

### Tables Not Created
- Restart the server
- Check server logs for errors
- Verify database name in `.env` matches phpMyAdmin

## 🆘 Need Help?

1. Check terminal logs for errors
2. Check `logs/error.log` file
3. Review `TESTING_GUIDE.md` for detailed troubleshooting
4. Verify XAMPP MySQL is running (green indicator)
5. Test database connection in phpMyAdmin

---

**Time to complete**: ~15 minutes

**Difficulty**: Beginner-friendly

**Support**: Check documentation or server logs for any issues
