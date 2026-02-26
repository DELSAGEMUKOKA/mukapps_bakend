{
  "info": {
    "name": "Inventory Management API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  pour jjhdh
  "item": [
    {
      "name": "🔐 AUTH",
      "item": [
        {
          "name": "Register - Créer compte",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"John Doe\",\n  \"email\": \"john@example.com\",\n  \"password\": \"Password123!\",\n  \"companyName\": \"Ma Société\"\n}"
            },
            "url": "http://localhost:5000/api/v1/auth/register"
          }
        },
        {
          "name": "Login - Connexion",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"email\": \"john@example.com\",\n  \"password\": \"Password123!\"\n}"
            },
            "url": "http://localhost:5000/api/v1/auth/login"
          }
        },
        {
          "name": "Logout - Déconnexion",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/auth/logout"
          }
        },
        {
          "name": "Refresh Token",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/auth/refresh-token"
          }
        },
        {
          "name": "Me - Profil actuel",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/auth/me"
          }
        }
      ]
    },
    {
      "name": "👥 USERS",
      "item": [
        {
          "name": "Get All Users",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/users"
          }
        },
        {
          "name": "Get User by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/users/{{userId}}"
          }
        },
        {
          "name": "Create User",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Jane Doe\",\n  \"email\": \"jane@example.com\",\n  \"password\": \"Password123!\",\n  \"role\": \"cashier\",\n  \"phone\": \"+243123456789\"\n}"
            },
            "url": "http://localhost:5000/api/v1/users"
          }
        },
        {
          "name": "Update User",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Jane Updated\",\n  \"phone\": \"+243987654321\",\n  \"role\": \"supervisor\"\n}"
            },
            "url": "http://localhost:5000/api/v1/users/{{userId}}"
          }
        },
        {
          "name": "Delete User",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/users/{{userId}}"
          }
        }
      ]
    },
    {
      "name": "🏢 COMPANIES",
      "item": [
        {
          "name": "Get All Companies",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/companies"
          }
        },
        {
          "name": "Get Company by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/companies/{{companyId}}"
          }
        },
        {
          "name": "Update Company",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Nouveau Nom Société\",\n  \"email\": \"contact@societe.com\",\n  \"phone\": \"+243123456789\",\n  \"address\": \"123 Avenue, Ville\"\n}"
            },
            "url": "http://localhost:5000/api/v1/companies/{{companyId}}"
          }
        },
        {
          "name": "Delete Company",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/companies/{{companyId}}"
          }
        }
      ]
    },
    {
      "name": "📦 PRODUCTS",
      "item": [
        {
          "name": "Get All Products",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/products"
          }
        },
        {
          "name": "Get Product by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/products/{{productId}}"
          }
        },
        {
          "name": "Create Product",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Produit Test\",\n  \"price\": 2500,\n  \"costPrice\": 1500,\n  \"description\": \"Description du produit\",\n  \"categoryId\": \"{{categoryId}}\",\n  \"barcode\": \"123456789\",\n  \"minStockLevel\": 5,\n  \"unit\": \"pièce\",\n  \"currentStock\": 10\n}"
            },
            "url": "http://localhost:5000/api/v1/products"
          }
        },
        {
          "name": "Update Product",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Produit Modifié\",\n  \"price\": 3000,\n  \"currentStock\": 15\n}"
            },
            "url": "http://localhost:5000/api/v1/products/{{productId}}"
          }
        },
        {
          "name": "Delete Product",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/products/{{productId}}"
          }
        }
      ]
    },
    {
      "name": "🏷️ CATEGORIES",
      "item": [
        {
          "name": "Get All Categories",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/categories"
          }
        },
        {
          "name": "Create Category",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Nouvelle Catégorie\",\n  \"description\": \"Description de la catégorie\",\n  \"color\": \"#3B82F6\"\n}"
            },
            "url": "http://localhost:5000/api/v1/categories"
          }
        },
        {
          "name": "Update Category",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Catégorie Modifiée\",\n  \"color\": \"#EF4444\"\n}"
            },
            "url": "http://localhost:5000/api/v1/categories/{{categoryId}}"
          }
        },
        {
          "name": "Delete Category",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/categories/{{categoryId}}"
          }
        }
      ]
    },
    {
      "name": "👤 CUSTOMERS",
      "item": [
        {
          "name": "Get All Customers",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/customers"
          }
        },
        {
          "name": "Create Customer",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Client Test\",\n  \"email\": \"client@example.com\",\n  \"phone\": \"+243123456789\",\n  \"address\": \"123 Rue, Ville\",\n  \"type\": \"individual\",\n  \"isVip\": false\n}"
            },
            "url": "http://localhost:5000/api/v1/customers"
          }
        },
        {
          "name": "Update Customer",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"name\": \"Client Modifié\",\n  \"phone\": \"+243987654321\",\n  \"isVip\": true\n}"
            },
            "url": "http://localhost:5000/api/v1/customers/{{customerId}}"
          }
        },
        {
          "name": "Delete Customer",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/customers/{{customerId}}"
          }
        }
      ]
    },
    {
      "name": "🧾 INVOICES",
      "item": [
        {
          "name": "Get All Invoices",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/invoices"
          }
        },
        {
          "name": "Create Invoice",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"customerId\": \"{{customerId}}\",\n  \"items\": [\n    {\n      \"productId\": \"{{productId}}\",\n      \"quantity\": 2,\n      \"unitPrice\": 2500,\n      \"total\": 5000\n    }\n  ],\n  \"subtotal\": 5000,\n  \"tax\": 0,\n  \"discount\": 0,\n  \"total\": 5000,\n  \"paymentMethod\": \"cash\",\n  \"status\": \"paid\"\n}"
            },
            "url": "http://localhost:5000/api/v1/invoices"
          }
        },
        {
          "name": "Get Invoice by ID",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/invoices/{{invoiceId}}"
          }
        },
        {
          "name": "Update Invoice",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"status\": \"cancelled\",\n  \"notes\": \"Facture annulée\"\n}"
            },
            "url": "http://localhost:5000/api/v1/invoices/{{invoiceId}}"
          }
        },
        {
          "name": "Delete Invoice",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/invoices/{{invoiceId}}"
          }
        }
      ]
    },
    {
      "name": "💰 EXPENSES",
      "item": [
        {
          "name": "Get All Expenses",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/expenses"
          }
        },
        {
          "name": "Create Expense",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"title\": \"Achat fournitures\",\n  \"amount\": \"50000\",\n  \"category\": \"purchase\",\n  \"description\": \"Achat de papier et stylos\",\n  \"date\": \"2026-02-19\",\n  \"paymentMethod\": \"cash\",\n  \"status\": \"pending\"\n}"
            },
            "url": "http://localhost:5000/api/v1/expenses"
          }
        },
        {
          "name": "Update Expense",
          "request": {
            "method": "PUT",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"status\": \"approved\"\n}"
            },
            "url": "http://localhost:5000/api/v1/expenses/{{expenseId}}"
          }
        },
        {
          "name": "Delete Expense",
          "request": {
            "method": "DELETE",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/expenses/{{expenseId}}"
          }
        }
      ]
    },
    {
      "name": "📈 STOCK",
      "item": [
        {
          "name": "Get Stock Movements",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/stock"
          }
        },
        {
          "name": "Add Stock",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"productId\": \"{{productId}}\",\n  \"type\": \"in\",\n  \"quantity\": 10,\n  \"reason\": \"purchase\",\n  \"reference\": \"PO-2026-001\",\n  \"notes\": \"Achat nouvelle commande\"\n}"
            },
            "url": "http://localhost:5000/api/v1/stock/movements"
          }
        },
        {
          "name": "Remove Stock",
          "request": {
            "method": "POST",
            "header": [
              {
                "key": "Content-Type",
                "value": "application/json"
              },
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "body": {
              "mode": "raw",
              "raw": "{\n  \"productId\": \"{{productId}}\",\n  \"type\": \"out\",\n  \"quantity\": 2,\n  \"reason\": \"damage\",\n  \"notes\": \"Produit endommagé\"\n}"
            },
            "url": "http://localhost:5000/api/v1/stock/movements"
          }
        }
      ]
    },
    {
      "name": "📊 REPORTS",
      "item": [
        {
          "name": "Dashboard Stats",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/reports/dashboard"
          }
        },
        {
          "name": "Sales Report",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/reports/sales?startDate=2026-01-01&endDate=2026-12-31"
          }
        },
        {
          "name": "Stock Report",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/reports/stock"
          }
        },
        {
          "name": "Profit & Loss",
          "request": {
            "method": "GET",
            "header": [
              {
                "key": "Authorization",
                "value": "Bearer {{token}}"
              }
            ],
            "url": "http://localhost:5000/api/v1/reports/profit-loss?month=2&year=2026"
          }
        }
      ]
    }
  ],
  "variable": [
    {
      "key": "token",
      "value": "your_jwt_token_here"
    },
    {
      "key": "userId",
      "value": "user_id_here"
    },
    {
      "key": "companyId",
      "value": "company_id_here"
    },
    {
      "key": "productId",
      "value": "product_id_here"
    },
    {
      "key": "categoryId",
      "value": "category_id_here"
    },
    {
      "key": "customerId",
      "value": "customer_id_here"
    },
    {
      "key": "invoiceId",
      "value": "invoice_id_here"
    },
    {
      "key": "expenseId",
      "value": "expense_id_here"
    }
  ]
}