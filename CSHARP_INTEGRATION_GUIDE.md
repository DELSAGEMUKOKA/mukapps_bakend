# C# Windows Forms Integration Guide

Complete guide for consuming the Inventory Management System API in a C# Windows Forms application.

## Table of Contents
1. [Prerequisites](#prerequisites)
2. [API Overview](#api-overview)
3. [Setting Up Your C# Project](#setting-up-your-c-project)
4. [Creating the API Client](#creating-the-api-client)
5. [Authentication](#authentication)
6. [CRUD Operations](#crud-operations)
7. [Error Handling](#error-handling)
8. [Complete Examples](#complete-examples)

---

## Prerequisites

### Backend Requirements
- Node.js backend running (default: `http://localhost:5000`)
- MySQL database configured in XAMPP
- Backend started with `npm run dev`

### C# Requirements
- Visual Studio 2019 or later
- .NET Framework 4.7.2 or .NET 6/7/8
- NuGet packages:
  - `Newtonsoft.Json` (for JSON serialization)
  - `System.Net.Http` (usually included)

---

## API Overview

### Base URL
```
http://localhost:5000/api/v1
```

### Main Endpoints
- **Auth**: `/auth/register`, `/auth/login`, `/auth/logout`
- **Companies**: `/companies`
- **Products**: `/products`
- **Customers**: `/customers`
- **Invoices**: `/invoices`
- **Expenses**: `/expenses`
- **Categories**: `/categories`
- **Stock**: `/stock/movements`
- **Reports**: `/reports/sales`, `/reports/inventory`, `/reports/expenses`

### Authentication
All requests (except `/auth/register` and `/auth/login`) require a JWT token in the `Authorization` header:
```
Authorization: Bearer YOUR_JWT_TOKEN
```

---

## Setting Up Your C# Project

### Step 1: Create Windows Forms Project

1. Open Visual Studio
2. Create new project → **Windows Forms App (.NET Framework)** or **Windows Forms App (.NET 6/7/8)**
3. Name it: `InventoryManagementClient`

### Step 2: Install Required NuGet Packages

Right-click project → Manage NuGet Packages → Install:
- `Newtonsoft.Json` (version 13.0.3 or later)

### Step 3: Project Structure

Create the following folders in your project:
```
InventoryManagementClient/
├── Models/              (Data models)
├── Services/            (API client services)
├── Forms/               (Your forms)
└── Utils/               (Helper classes)
```

---

## Creating the API Client

### Step 1: Create Models (Models/ApiModels.cs)

```csharp
using System;
using System.Collections.Generic;
using Newtonsoft.Json;

namespace InventoryManagementClient.Models
{
    // Base Response Models
    public class ApiResponse<T>
    {
        [JsonProperty("success")]
        public bool Success { get; set; }

        [JsonProperty("data")]
        public T Data { get; set; }

        [JsonProperty("message")]
        public string Message { get; set; }

        [JsonProperty("error")]
        public string Error { get; set; }
    }

    public class PaginatedResponse<T>
    {
        [JsonProperty("success")]
        public bool Success { get; set; }

        [JsonProperty("data")]
        public List<T> Data { get; set; }

        [JsonProperty("pagination")]
        public PaginationInfo Pagination { get; set; }
    }

    public class PaginationInfo
    {
        [JsonProperty("page")]
        public int Page { get; set; }

        [JsonProperty("limit")]
        public int Limit { get; set; }

        [JsonProperty("total")]
        public int Total { get; set; }

        [JsonProperty("totalPages")]
        public int TotalPages { get; set; }
    }

    // Auth Models
    public class LoginRequest
    {
        [JsonProperty("email")]
        public string Email { get; set; }

        [JsonProperty("password")]
        public string Password { get; set; }
    }

    public class RegisterRequest
    {
        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("email")]
        public string Email { get; set; }

        [JsonProperty("password")]
        public string Password { get; set; }

        [JsonProperty("companyName")]
        public string CompanyName { get; set; }

        [JsonProperty("companyTaxId")]
        public string CompanyTaxId { get; set; }
    }

    public class AuthResponse
    {
        [JsonProperty("user")]
        public User User { get; set; }

        [JsonProperty("company")]
        public Company Company { get; set; }

        [JsonProperty("token")]
        public string Token { get; set; }

        [JsonProperty("refreshToken")]
        public string RefreshToken { get; set; }
    }

    // User Model
    public class User
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("email")]
        public string Email { get; set; }

        [JsonProperty("role")]
        public string Role { get; set; }

        [JsonProperty("company_id")]
        public int CompanyId { get; set; }

        [JsonProperty("is_active")]
        public bool IsActive { get; set; }

        [JsonProperty("created_at")]
        public DateTime CreatedAt { get; set; }
    }

    // Company Model
    public class Company
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("tax_id")]
        public string TaxId { get; set; }

        [JsonProperty("email")]
        public string Email { get; set; }

        [JsonProperty("phone")]
        public string Phone { get; set; }

        [JsonProperty("address")]
        public string Address { get; set; }

        [JsonProperty("is_active")]
        public bool IsActive { get; set; }
    }

    // Product Model
    public class Product
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("sku")]
        public string Sku { get; set; }

        [JsonProperty("barcode")]
        public string Barcode { get; set; }

        [JsonProperty("category_id")]
        public int? CategoryId { get; set; }

        [JsonProperty("unit_price")]
        public decimal UnitPrice { get; set; }

        [JsonProperty("cost_price")]
        public decimal CostPrice { get; set; }

        [JsonProperty("current_stock")]
        public int CurrentStock { get; set; }

        [JsonProperty("min_stock")]
        public int MinStock { get; set; }

        [JsonProperty("max_stock")]
        public int? MaxStock { get; set; }

        [JsonProperty("unit_of_measure")]
        public string UnitOfMeasure { get; set; }

        [JsonProperty("is_active")]
        public bool IsActive { get; set; }

        [JsonProperty("company_id")]
        public int CompanyId { get; set; }

        [JsonProperty("created_at")]
        public DateTime CreatedAt { get; set; }

        [JsonProperty("updated_at")]
        public DateTime UpdatedAt { get; set; }
    }

    // Customer Model
    public class Customer
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("email")]
        public string Email { get; set; }

        [JsonProperty("phone")]
        public string Phone { get; set; }

        [JsonProperty("tax_id")]
        public string TaxId { get; set; }

        [JsonProperty("address")]
        public string Address { get; set; }

        [JsonProperty("city")]
        public string City { get; set; }

        [JsonProperty("state")]
        public string State { get; set; }

        [JsonProperty("postal_code")]
        public string PostalCode { get; set; }

        [JsonProperty("country")]
        public string Country { get; set; }

        [JsonProperty("is_active")]
        public bool IsActive { get; set; }

        [JsonProperty("company_id")]
        public int CompanyId { get; set; }

        [JsonProperty("created_at")]
        public DateTime CreatedAt { get; set; }
    }

    // Invoice Model
    public class Invoice
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("invoice_number")]
        public string InvoiceNumber { get; set; }

        [JsonProperty("customer_id")]
        public int CustomerId { get; set; }

        [JsonProperty("issue_date")]
        public DateTime IssueDate { get; set; }

        [JsonProperty("due_date")]
        public DateTime? DueDate { get; set; }

        [JsonProperty("subtotal")]
        public decimal Subtotal { get; set; }

        [JsonProperty("tax_amount")]
        public decimal TaxAmount { get; set; }

        [JsonProperty("discount_amount")]
        public decimal DiscountAmount { get; set; }

        [JsonProperty("total_amount")]
        public decimal TotalAmount { get; set; }

        [JsonProperty("status")]
        public string Status { get; set; }

        [JsonProperty("payment_method")]
        public string PaymentMethod { get; set; }

        [JsonProperty("notes")]
        public string Notes { get; set; }

        [JsonProperty("company_id")]
        public int CompanyId { get; set; }

        [JsonProperty("items")]
        public List<InvoiceItem> Items { get; set; }

        [JsonProperty("created_at")]
        public DateTime CreatedAt { get; set; }
    }

    public class InvoiceItem
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("product_id")]
        public int ProductId { get; set; }

        [JsonProperty("product_name")]
        public string ProductName { get; set; }

        [JsonProperty("quantity")]
        public int Quantity { get; set; }

        [JsonProperty("unit_price")]
        public decimal UnitPrice { get; set; }

        [JsonProperty("tax_rate")]
        public decimal TaxRate { get; set; }

        [JsonProperty("discount_amount")]
        public decimal DiscountAmount { get; set; }

        [JsonProperty("subtotal")]
        public decimal Subtotal { get; set; }
    }

    // Category Model
    public class Category
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("name")]
        public string Name { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("is_active")]
        public bool IsActive { get; set; }

        [JsonProperty("company_id")]
        public int CompanyId { get; set; }
    }

    // Expense Model
    public class Expense
    {
        [JsonProperty("id")]
        public int Id { get; set; }

        [JsonProperty("description")]
        public string Description { get; set; }

        [JsonProperty("amount")]
        public decimal Amount { get; set; }

        [JsonProperty("category")]
        public string Category { get; set; }

        [JsonProperty("expense_date")]
        public DateTime ExpenseDate { get; set; }

        [JsonProperty("payment_method")]
        public string PaymentMethod { get; set; }

        [JsonProperty("notes")]
        public string Notes { get; set; }

        [JsonProperty("company_id")]
        public int CompanyId { get; set; }

        [JsonProperty("created_at")]
        public DateTime CreatedAt { get; set; }
    }
}
```

### Step 2: Create API Client Base (Services/ApiClient.cs)

```csharp
using System;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;
using Newtonsoft.Json;

namespace InventoryManagementClient.Services
{
    public class ApiClient
    {
        private static readonly HttpClient client = new HttpClient();
        private const string BASE_URL = "http://localhost:5000/api/v1";
        private static string _authToken;

        static ApiClient()
        {
            client.BaseAddress = new Uri(BASE_URL);
            client.DefaultRequestHeaders.Accept.Clear();
            client.DefaultRequestHeaders.Accept.Add(
                new MediaTypeWithQualityHeaderValue("application/json"));
        }

        public static void SetAuthToken(string token)
        {
            _authToken = token;
            if (!string.IsNullOrEmpty(token))
            {
                client.DefaultRequestHeaders.Authorization =
                    new AuthenticationHeaderValue("Bearer", token);
            }
            else
            {
                client.DefaultRequestHeaders.Authorization = null;
            }
        }

        public static string GetAuthToken()
        {
            return _authToken;
        }

        public static async Task<T> GetAsync<T>(string endpoint)
        {
            try
            {
                HttpResponseMessage response = await client.GetAsync(endpoint);
                string content = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    throw new HttpRequestException($"Request failed: {response.StatusCode} - {content}");
                }

                return JsonConvert.DeserializeObject<T>(content);
            }
            catch (Exception ex)
            {
                throw new Exception($"API GET request failed: {ex.Message}", ex);
            }
        }

        public static async Task<T> PostAsync<T>(string endpoint, object data)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(data);
                StringContent content = new StringContent(jsonData, Encoding.UTF8, "application/json");

                HttpResponseMessage response = await client.PostAsync(endpoint, content);
                string responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    throw new HttpRequestException($"Request failed: {response.StatusCode} - {responseContent}");
                }

                return JsonConvert.DeserializeObject<T>(responseContent);
            }
            catch (Exception ex)
            {
                throw new Exception($"API POST request failed: {ex.Message}", ex);
            }
        }

        public static async Task<T> PutAsync<T>(string endpoint, object data)
        {
            try
            {
                string jsonData = JsonConvert.SerializeObject(data);
                StringContent content = new StringContent(jsonData, Encoding.UTF8, "application/json");

                HttpResponseMessage response = await client.PutAsync(endpoint, content);
                string responseContent = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    throw new HttpRequestException($"Request failed: {response.StatusCode} - {responseContent}");
                }

                return JsonConvert.DeserializeObject<T>(responseContent);
            }
            catch (Exception ex)
            {
                throw new Exception($"API PUT request failed: {ex.Message}", ex);
            }
        }

        public static async Task<T> DeleteAsync<T>(string endpoint)
        {
            try
            {
                HttpResponseMessage response = await client.DeleteAsync(endpoint);
                string content = await response.Content.ReadAsStringAsync();

                if (!response.IsSuccessStatusCode)
                {
                    throw new HttpRequestException($"Request failed: {response.StatusCode} - {content}");
                }

                return JsonConvert.DeserializeObject<T>(content);
            }
            catch (Exception ex)
            {
                throw new Exception($"API DELETE request failed: {ex.Message}", ex);
            }
        }
    }
}
```

### Step 3: Create Authentication Service (Services/AuthService.cs)

```csharp
using System.Threading.Tasks;
using InventoryManagementClient.Models;

namespace InventoryManagementClient.Services
{
    public class AuthService
    {
        public static async Task<ApiResponse<AuthResponse>> LoginAsync(string email, string password)
        {
            var loginRequest = new LoginRequest
            {
                Email = email,
                Password = password
            };

            var response = await ApiClient.PostAsync<ApiResponse<AuthResponse>>(
                "/auth/login",
                loginRequest
            );

            if (response.Success && response.Data != null)
            {
                // Save the token for future requests
                ApiClient.SetAuthToken(response.Data.Token);
            }

            return response;
        }

        public static async Task<ApiResponse<AuthResponse>> RegisterAsync(
            string name,
            string email,
            string password,
            string companyName,
            string companyTaxId)
        {
            var registerRequest = new RegisterRequest
            {
                Name = name,
                Email = email,
                Password = password,
                CompanyName = companyName,
                CompanyTaxId = companyTaxId
            };

            var response = await ApiClient.PostAsync<ApiResponse<AuthResponse>>(
                "/auth/register",
                registerRequest
            );

            if (response.Success && response.Data != null)
            {
                ApiClient.SetAuthToken(response.Data.Token);
            }

            return response;
        }

        public static async Task<ApiResponse<object>> LogoutAsync()
        {
            try
            {
                var response = await ApiClient.PostAsync<ApiResponse<object>>(
                    "/auth/logout",
                    new { }
                );

                // Clear the token
                ApiClient.SetAuthToken(null);

                return response;
            }
            catch
            {
                // Even if the request fails, clear the local token
                ApiClient.SetAuthToken(null);
                throw;
            }
        }
    }
}
```

### Step 4: Create Product Service (Services/ProductService.cs)

```csharp
using System.Collections.Generic;
using System.Threading.Tasks;
using InventoryManagementClient.Models;

namespace InventoryManagementClient.Services
{
    public class ProductService
    {
        public static async Task<PaginatedResponse<Product>> GetAllProductsAsync(
            int page = 1,
            int limit = 50,
            string search = null,
            bool? isActive = null)
        {
            string endpoint = $"/products?page={page}&limit={limit}";

            if (!string.IsNullOrEmpty(search))
                endpoint += $"&search={search}";

            if (isActive.HasValue)
                endpoint += $"&isActive={isActive.Value}";

            return await ApiClient.GetAsync<PaginatedResponse<Product>>(endpoint);
        }

        public static async Task<ApiResponse<Product>> GetProductByIdAsync(int id)
        {
            return await ApiClient.GetAsync<ApiResponse<Product>>($"/products/{id}");
        }

        public static async Task<ApiResponse<Product>> CreateProductAsync(Product product)
        {
            return await ApiClient.PostAsync<ApiResponse<Product>>("/products", product);
        }

        public static async Task<ApiResponse<Product>> UpdateProductAsync(int id, Product product)
        {
            return await ApiClient.PutAsync<ApiResponse<Product>>($"/products/{id}", product);
        }

        public static async Task<ApiResponse<object>> DeleteProductAsync(int id)
        {
            return await ApiClient.DeleteAsync<ApiResponse<object>>($"/products/{id}");
        }

        public static async Task<PaginatedResponse<Product>> GetLowStockProductsAsync()
        {
            return await ApiClient.GetAsync<PaginatedResponse<Product>>("/products/low-stock");
        }
    }
}
```

### Step 5: Create Customer Service (Services/CustomerService.cs)

```csharp
using System.Collections.Generic;
using System.Threading.Tasks;
using InventoryManagementClient.Models;

namespace InventoryManagementClient.Services
{
    public class CustomerService
    {
        public static async Task<PaginatedResponse<Customer>> GetAllCustomersAsync(
            int page = 1,
            int limit = 50,
            string search = null)
        {
            string endpoint = $"/customers?page={page}&limit={limit}";

            if (!string.IsNullOrEmpty(search))
                endpoint += $"&search={search}";

            return await ApiClient.GetAsync<PaginatedResponse<Customer>>(endpoint);
        }

        public static async Task<ApiResponse<Customer>> GetCustomerByIdAsync(int id)
        {
            return await ApiClient.GetAsync<ApiResponse<Customer>>($"/customers/{id}");
        }

        public static async Task<ApiResponse<Customer>> CreateCustomerAsync(Customer customer)
        {
            return await ApiClient.PostAsync<ApiResponse<Customer>>("/customers", customer);
        }

        public static async Task<ApiResponse<Customer>> UpdateCustomerAsync(int id, Customer customer)
        {
            return await ApiClient.PutAsync<ApiResponse<Customer>>($"/customers/{id}", customer);
        }

        public static async Task<ApiResponse<object>> DeleteCustomerAsync(int id)
        {
            return await ApiClient.DeleteAsync<ApiResponse<object>>($"/customers/{id}");
        }
    }
}
```

### Step 6: Create Invoice Service (Services/InvoiceService.cs)

```csharp
using System.Collections.Generic;
using System.Threading.Tasks;
using InventoryManagementClient.Models;

namespace InventoryManagementClient.Services
{
    public class InvoiceService
    {
        public static async Task<PaginatedResponse<Invoice>> GetAllInvoicesAsync(
            int page = 1,
            int limit = 50,
            string status = null,
            int? customerId = null)
        {
            string endpoint = $"/invoices?page={page}&limit={limit}";

            if (!string.IsNullOrEmpty(status))
                endpoint += $"&status={status}";

            if (customerId.HasValue)
                endpoint += $"&customerId={customerId.Value}";

            return await ApiClient.GetAsync<PaginatedResponse<Invoice>>(endpoint);
        }

        public static async Task<ApiResponse<Invoice>> GetInvoiceByIdAsync(int id)
        {
            return await ApiClient.GetAsync<ApiResponse<Invoice>>($"/invoices/{id}");
        }

        public static async Task<ApiResponse<Invoice>> CreateInvoiceAsync(Invoice invoice)
        {
            return await ApiClient.PostAsync<ApiResponse<Invoice>>("/invoices", invoice);
        }

        public static async Task<ApiResponse<Invoice>> UpdateInvoiceAsync(int id, Invoice invoice)
        {
            return await ApiClient.PutAsync<ApiResponse<Invoice>>($"/invoices/{id}", invoice);
        }

        public static async Task<ApiResponse<object>> DeleteInvoiceAsync(int id)
        {
            return await ApiClient.DeleteAsync<ApiResponse<object>>($"/invoices/{id}");
        }
    }
}
```

---

## Complete Examples

### Example 1: Login Form (Forms/LoginForm.cs)

```csharp
using System;
using System.Windows.Forms;
using InventoryManagementClient.Services;

namespace InventoryManagementClient.Forms
{
    public partial class LoginForm : Form
    {
        public LoginForm()
        {
            InitializeComponent();
        }

        private async void btnLogin_Click(object sender, EventArgs e)
        {
            try
            {
                // Disable button to prevent multiple clicks
                btnLogin.Enabled = false;
                lblStatus.Text = "Logging in...";

                string email = txtEmail.Text.Trim();
                string password = txtPassword.Text;

                // Validate input
                if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
                {
                    MessageBox.Show("Please enter email and password", "Validation Error",
                        MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    return;
                }

                // Call the API
                var response = await AuthService.LoginAsync(email, password);

                if (response.Success)
                {
                    MessageBox.Show($"Welcome, {response.Data.User.Name}!", "Login Successful",
                        MessageBoxButtons.OK, MessageBoxIcon.Information);

                    // Open the main form
                    MainForm mainForm = new MainForm(response.Data);
                    mainForm.Show();
                    this.Hide();
                }
                else
                {
                    MessageBox.Show(response.Error ?? "Login failed", "Login Error",
                        MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error: {ex.Message}", "Login Error",
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                btnLogin.Enabled = true;
                lblStatus.Text = "";
            }
        }
    }
}
```

### Example 2: Product List Form (Forms/ProductListForm.cs)

```csharp
using System;
using System.Windows.Forms;
using InventoryManagementClient.Services;
using InventoryManagementClient.Models;

namespace InventoryManagementClient.Forms
{
    public partial class ProductListForm : Form
    {
        private int currentPage = 1;
        private int pageSize = 50;

        public ProductListForm()
        {
            InitializeComponent();
        }

        private async void ProductListForm_Load(object sender, EventArgs e)
        {
            await LoadProducts();
        }

        private async System.Threading.Tasks.Task LoadProducts()
        {
            try
            {
                lblStatus.Text = "Loading products...";
                dataGridView1.Enabled = false;

                string searchTerm = txtSearch.Text.Trim();

                var response = await ProductService.GetAllProductsAsync(
                    page: currentPage,
                    limit: pageSize,
                    search: string.IsNullOrEmpty(searchTerm) ? null : searchTerm
                );

                if (response.Success)
                {
                    // Clear existing rows
                    dataGridView1.Rows.Clear();

                    // Add products to grid
                    foreach (var product in response.Data)
                    {
                        dataGridView1.Rows.Add(
                            product.Id,
                            product.Name,
                            product.Sku,
                            product.UnitPrice.ToString("C"),
                            product.CurrentStock,
                            product.MinStock,
                            product.IsActive ? "Yes" : "No"
                        );
                    }

                    // Update pagination info
                    lblPagination.Text = $"Page {response.Pagination.Page} of {response.Pagination.TotalPages} " +
                                        $"(Total: {response.Pagination.Total} products)";

                    btnPrevious.Enabled = currentPage > 1;
                    btnNext.Enabled = currentPage < response.Pagination.TotalPages;

                    lblStatus.Text = $"Loaded {response.Data.Count} products";
                }
                else
                {
                    MessageBox.Show("Failed to load products", "Error",
                        MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error loading products: {ex.Message}", "Error",
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                dataGridView1.Enabled = true;
            }
        }

        private async void btnSearch_Click(object sender, EventArgs e)
        {
            currentPage = 1;
            await LoadProducts();
        }

        private async void btnNext_Click(object sender, EventArgs e)
        {
            currentPage++;
            await LoadProducts();
        }

        private async void btnPrevious_Click(object sender, EventArgs e)
        {
            if (currentPage > 1)
            {
                currentPage--;
                await LoadProducts();
            }
        }

        private void btnAddProduct_Click(object sender, EventArgs e)
        {
            ProductEditForm editForm = new ProductEditForm();
            if (editForm.ShowDialog() == DialogResult.OK)
            {
                // Reload products after adding
                LoadProducts();
            }
        }

        private async void btnDeleteProduct_Click(object sender, EventArgs e)
        {
            if (dataGridView1.SelectedRows.Count == 0)
            {
                MessageBox.Show("Please select a product to delete", "No Selection",
                    MessageBoxButtons.OK, MessageBoxIcon.Warning);
                return;
            }

            int productId = Convert.ToInt32(dataGridView1.SelectedRows[0].Cells["Id"].Value);
            string productName = dataGridView1.SelectedRows[0].Cells["Name"].Value.ToString();

            var result = MessageBox.Show(
                $"Are you sure you want to delete product '{productName}'?",
                "Confirm Delete",
                MessageBoxButtons.YesNo,
                MessageBoxIcon.Question
            );

            if (result == DialogResult.Yes)
            {
                try
                {
                    var response = await ProductService.DeleteProductAsync(productId);

                    if (response.Success)
                    {
                        MessageBox.Show("Product deleted successfully", "Success",
                            MessageBoxButtons.OK, MessageBoxIcon.Information);
                        await LoadProducts();
                    }
                    else
                    {
                        MessageBox.Show(response.Error ?? "Failed to delete product", "Error",
                            MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Error deleting product: {ex.Message}", "Error",
                        MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
        }
    }
}
```

### Example 3: Create Product Form (Forms/ProductEditForm.cs)

```csharp
using System;
using System.Windows.Forms;
using InventoryManagementClient.Services;
using InventoryManagementClient.Models;

namespace InventoryManagementClient.Forms
{
    public partial class ProductEditForm : Form
    {
        private Product _product;
        private bool _isEditMode;

        public ProductEditForm(Product product = null)
        {
            InitializeComponent();
            _product = product;
            _isEditMode = product != null;
        }

        private void ProductEditForm_Load(object sender, EventArgs e)
        {
            if (_isEditMode && _product != null)
            {
                // Fill form with existing product data
                txtName.Text = _product.Name;
                txtDescription.Text = _product.Description;
                txtSku.Text = _product.Sku;
                txtBarcode.Text = _product.Barcode;
                numUnitPrice.Value = _product.UnitPrice;
                numCostPrice.Value = _product.CostPrice;
                numCurrentStock.Value = _product.CurrentStock;
                numMinStock.Value = _product.MinStock;
                numMaxStock.Value = _product.MaxStock ?? 0;
                txtUnitOfMeasure.Text = _product.UnitOfMeasure;
                chkIsActive.Checked = _product.IsActive;

                this.Text = "Edit Product";
                btnSave.Text = "Update";
            }
            else
            {
                this.Text = "Add New Product";
                btnSave.Text = "Create";
            }
        }

        private async void btnSave_Click(object sender, EventArgs e)
        {
            try
            {
                // Validate input
                if (string.IsNullOrWhiteSpace(txtName.Text))
                {
                    MessageBox.Show("Product name is required", "Validation Error",
                        MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    return;
                }

                btnSave.Enabled = false;

                // Create product object
                var product = new Product
                {
                    Name = txtName.Text.Trim(),
                    Description = txtDescription.Text.Trim(),
                    Sku = txtSku.Text.Trim(),
                    Barcode = txtBarcode.Text.Trim(),
                    UnitPrice = numUnitPrice.Value,
                    CostPrice = numCostPrice.Value,
                    CurrentStock = (int)numCurrentStock.Value,
                    MinStock = (int)numMinStock.Value,
                    MaxStock = numMaxStock.Value > 0 ? (int?)numMaxStock.Value : null,
                    UnitOfMeasure = txtUnitOfMeasure.Text.Trim(),
                    IsActive = chkIsActive.Checked
                };

                if (_isEditMode)
                {
                    // Update existing product
                    var response = await ProductService.UpdateProductAsync(_product.Id, product);

                    if (response.Success)
                    {
                        MessageBox.Show("Product updated successfully!", "Success",
                            MessageBoxButtons.OK, MessageBoxIcon.Information);
                        this.DialogResult = DialogResult.OK;
                        this.Close();
                    }
                    else
                    {
                        MessageBox.Show(response.Error ?? "Failed to update product", "Error",
                            MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }
                }
                else
                {
                    // Create new product
                    var response = await ProductService.CreateProductAsync(product);

                    if (response.Success)
                    {
                        MessageBox.Show("Product created successfully!", "Success",
                            MessageBoxButtons.OK, MessageBoxIcon.Information);
                        this.DialogResult = DialogResult.OK;
                        this.Close();
                    }
                    else
                    {
                        MessageBox.Show(response.Error ?? "Failed to create product", "Error",
                            MessageBoxButtons.OK, MessageBoxIcon.Error);
                    }
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Error saving product: {ex.Message}", "Error",
                    MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
            finally
            {
                btnSave.Enabled = true;
            }
        }

        private void btnCancel_Click(object sender, EventArgs e)
        {
            this.DialogResult = DialogResult.Cancel;
            this.Close();
        }
    }
}
```

---

## Error Handling Best Practices

### Create a Helper Class (Utils/ErrorHandler.cs)

```csharp
using System;
using System.Net.Http;
using System.Windows.Forms;
using Newtonsoft.Json;

namespace InventoryManagementClient.Utils
{
    public static class ErrorHandler
    {
        public static void HandleException(Exception ex, string context = "")
        {
            string message = "An error occurred";

            if (!string.IsNullOrEmpty(context))
            {
                message = $"Error in {context}";
            }

            if (ex is HttpRequestException)
            {
                message += "\n\nUnable to connect to the server. Please ensure:";
                message += "\n- The backend server is running";
                message += "\n- The server URL is correct";
                message += "\n- Your network connection is active";
            }
            else if (ex.Message.Contains("401"))
            {
                message += "\n\nYour session has expired. Please login again.";
                // Optionally redirect to login
            }
            else if (ex.Message.Contains("403"))
            {
                message += "\n\nYou don't have permission to perform this action.";
            }
            else if (ex.Message.Contains("404"))
            {
                message += "\n\nThe requested resource was not found.";
            }
            else
            {
                message += $"\n\n{ex.Message}";
            }

            MessageBox.Show(message, "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
        }
    }
}
```

---

## Testing Your Integration

### 1. Test Backend Connection

Create a simple test form:

```csharp
private async void btnTestConnection_Click(object sender, EventArgs e)
{
    try
    {
        lblStatus.Text = "Testing connection...";

        // Try to hit a public endpoint or login
        var response = await AuthService.LoginAsync("test@example.com", "password");

        lblStatus.Text = "Connection successful!";
        MessageBox.Show("Backend connection is working!", "Success",
            MessageBoxButtons.OK, MessageBoxIcon.Information);
    }
    catch (Exception ex)
    {
        lblStatus.Text = "Connection failed!";
        MessageBox.Show($"Failed to connect to backend:\n{ex.Message}", "Error",
            MessageBoxButtons.OK, MessageBoxIcon.Error);
    }
}
```

### 2. Test Authentication Flow

1. Start your backend: `npm run dev`
2. Run your C# application
3. Try to register a new user
4. Login with the registered user
5. Verify token is set and stored

### 3. Test CRUD Operations

Test each operation:
- **Create**: Add a new product
- **Read**: Load product list
- **Update**: Edit a product
- **Delete**: Remove a product

---

## Tips and Best Practices

### 1. Store Authentication Token

Create a session manager:

```csharp
public static class SessionManager
{
    public static User CurrentUser { get; set; }
    public static Company CurrentCompany { get; set; }
    public static string AuthToken { get; set; }

    public static bool IsAuthenticated()
    {
        return !string.IsNullOrEmpty(AuthToken) && CurrentUser != null;
    }

    public static void ClearSession()
    {
        CurrentUser = null;
        CurrentCompany = null;
        AuthToken = null;
        ApiClient.SetAuthToken(null);
    }
}
```

### 2. Handle Async Operations Properly

Always use `async/await` pattern:

```csharp
private async void btnLoad_Click(object sender, EventArgs e)
{
    try
    {
        btnLoad.Enabled = false;
        await LoadDataAsync();
    }
    catch (Exception ex)
    {
        ErrorHandler.HandleException(ex, "loading data");
    }
    finally
    {
        btnLoad.Enabled = true;
    }
}
```

### 3. Show Loading Indicators

```csharp
private async Task LoadWithProgress(Func<Task> action, string message)
{
    using (var loadingForm = new LoadingForm(message))
    {
        loadingForm.Show();
        await action();
        loadingForm.Close();
    }
}
```

### 4. Validate Data Before Sending

```csharp
private bool ValidateProduct(Product product)
{
    if (string.IsNullOrWhiteSpace(product.Name))
    {
        MessageBox.Show("Name is required");
        return false;
    }

    if (product.UnitPrice <= 0)
    {
        MessageBox.Show("Price must be greater than 0");
        return false;
    }

    return true;
}
```

### 5. Handle Network Timeouts

Configure timeout in ApiClient:

```csharp
static ApiClient()
{
    client.BaseAddress = new Uri(BASE_URL);
    client.Timeout = TimeSpan.FromSeconds(30);
    // ... rest of configuration
}
```

---

## Troubleshooting

### Backend Not Running
**Error**: "Unable to connect to the server"
**Solution**: Make sure backend is running with `npm run dev`

### CORS Issues
**Error**: "CORS policy blocked"
**Solution**: Backend already has CORS enabled for all origins

### Authentication Errors
**Error**: "401 Unauthorized"
**Solution**: Ensure token is being sent with requests. Check if login was successful.

### Data Not Loading
**Error**: Empty responses or null data
**Solution**:
- Check if you're logged in
- Verify company has data
- Check pagination parameters

---

## Next Steps

1. Implement remaining services (Categories, Expenses, Reports)
2. Add data caching to reduce API calls
3. Implement offline mode with local database
4. Add proper logging and error tracking
5. Create user preferences and settings
6. Add report generation and export features

---

## Additional Resources

- Backend API Documentation: See `API_QUICK_REFERENCE.md`
- Newtonsoft.Json Documentation: https://www.newtonsoft.com/json/help/html/Introduction.htm
- HttpClient Best Practices: https://learn.microsoft.com/en-us/dotnet/api/system.net.http.httpclient

---

**Note**: This guide assumes the backend is running on `localhost:5000`. If your backend runs on a different port or host, update the `BASE_URL` constant in `ApiClient.cs`.
