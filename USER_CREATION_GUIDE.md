# User Creation Guide - How to Create Cashiers and Other Users

Complete guide for creating and managing users (cashiers, managers) in the Inventory Management System.

## Table of Contents

1. [Overview](#overview)
2. [User Roles](#user-roles)
3. [Prerequisites](#prerequisites)
4. [Creating a Cashier User](#creating-a-cashier-user)
5. [Creating a Manager User](#creating-a-manager-user)
6. [Managing Users](#managing-users)
7. [Common Scenarios](#common-scenarios)
8. [Troubleshooting](#troubleshooting)

---

## Overview

The system has a hierarchical user management structure:
- **Admin users** (company owners) can create and manage all other users
- Each user belongs to a company (multi-tenant isolation)
- Users inherit their company context from the admin who creates them

---

## User Roles

The system supports three roles with different permission levels:

| Role | Description | Permissions |
|------|-------------|-------------|
| **admin** | Company owner/administrator | Full access to everything including user management, subscription management, and settings |
| **manager** | Store manager/supervisor | Can manage inventory, view reports, approve expenses, adjust stock |
| **cashier** | Point-of-sale operator | Can create invoices, manage customers, view products, record sales |

**Default Role:** When creating a user without specifying a role, they will be assigned the `cashier` role by default.

---

## Prerequisites

Before creating users, ensure:

1. You have an **admin account** (created during company registration)
2. You are **logged in** and have a valid JWT token
3. Your **subscription plan** allows creating additional users (check plan limits)

---

## Creating a Cashier User

### Step 1: Admin Login

First, the admin must log in to get an authentication token:

**POST** `http://localhost:5000/api/v1/auth/login`

**Request Body:**
```json
{
  "email": "admin@company.com",
  "password": "AdminPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "admin-uuid",
      "name": "Admin Name",
      "email": "admin@company.com",
      "role": "admin"
    },
    "company": {
      "id": "company-uuid",
      "name": "Company Name"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Action:** Save the `token` for the next step.

---

### Step 2: Create Cashier User

**Endpoint:** `POST /api/v1/users`

**Required Role:** Admin only

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

**Request Body (Minimum):**
```json
{
  "name": "Jane Cashier",
  "email": "jane@company.com",
  "password": "SecurePass123!"
}
```

**Request Body (With Optional Fields):**
```json
{
  "name": "Jane Cashier",
  "email": "jane@company.com",
  "password": "SecurePass123!",
  "role": "cashier",
  "phone": "+1234567890"
}
```

**Field Requirements:**
- `name` - Required, 2-200 characters
- `email` - Required, must be valid email format, must be unique
- `password` - Required, minimum 8 characters
- `role` - Optional, valid values: `admin`, `manager`, `cashier` (defaults to `cashier`)
- `phone` - Optional, phone number

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid-here",
    "name": "Jane Cashier",
    "email": "jane@company.com",
    "role": "cashier",
    "phone": "+1234567890",
    "is_active": true,
    "company_id": "company-uuid",
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  "message": "User created successfully"
}
```

---

### Step 3: Cashier First Login

The newly created cashier can now log in with their credentials:

**POST** `http://localhost:5000/api/v1/auth/login`

**Request Body:**
```json
{
  "email": "jane@company.com",
  "password": "SecurePass123!"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "user-uuid",
      "name": "Jane Cashier",
      "email": "jane@company.com",
      "role": "cashier"
    },
    "company": {
      "id": "company-uuid",
      "name": "Company Name"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

The cashier now has their own token for accessing the system with cashier-level permissions.

---

## Creating a Manager User

The process is identical to creating a cashier, but specify `role: "manager"`:

**POST** `http://localhost:5000/api/v1/users`

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "John Manager",
  "email": "john.manager@company.com",
  "password": "SecurePass123!",
  "role": "manager",
  "phone": "+1234567890"
}
```

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "user-uuid-here",
    "name": "John Manager",
    "email": "john.manager@company.com",
    "role": "manager",
    "phone": "+1234567890",
    "is_active": true,
    "company_id": "company-uuid",
    "created_at": "2024-01-15T10:30:00.000Z"
  },
  "message": "User created successfully"
}
```

---

## Managing Users

### View All Users

**GET** `http://localhost:5000/api/v1/users`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Query Parameters (Optional):**
```
?page=1&limit=20&role=cashier&is_active=true&search=jane
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Jane Cashier",
      "email": "jane@company.com",
      "role": "cashier",
      "is_active": true,
      "last_login": "2024-01-15T10:30:00.000Z",
      "created_at": "2024-01-15T10:00:00.000Z"
    }
  ],
  "pagination": {
    "total": 5,
    "page": 1,
    "limit": 20
  }
}
```

---

### View Specific User

**GET** `http://localhost:5000/api/v1/users/:id`

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
```

**Example:** `http://localhost:5000/api/v1/users/550e8400-e29b-41d4-a716-446655440000`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Jane Cashier",
    "email": "jane@company.com",
    "role": "cashier",
    "phone": "+1234567890",
    "is_active": true,
    "email_verified": false,
    "created_at": "2024-01-15T10:00:00.000Z",
    "updated_at": "2024-01-15T10:00:00.000Z"
  }
}
```

---

### Update User Information

**PUT** `http://localhost:5000/api/v1/users/:id`

**Required Role:** Admin (or the user themselves for their own profile)

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Jane Updated Cashier",
  "email": "jane.updated@company.com",
  "phone": "+1234567891"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "name": "Jane Updated Cashier",
    "email": "jane.updated@company.com",
    "phone": "+1234567891",
    "updated_at": "2024-01-15T11:00:00.000Z"
  },
  "message": "User updated successfully"
}
```

---

### Change User Password

**PUT** `http://localhost:5000/api/v1/users/:id/password`

**Required Role:** Admin or the user themselves

**Headers:**
```
Authorization: Bearer YOUR_TOKEN
Content-Type: application/json
```

**Request Body (For Self):**
```json
{
  "currentPassword": "OldPassword123!",
  "newPassword": "NewPassword123!"
}
```

**Request Body (Admin Changing for Others):**
```json
{
  "newPassword": "NewPassword123!"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Password changed successfully"
}
```

---

### Change User Role

**PUT** `http://localhost:5000/api/v1/users/:id/role`

**Required Role:** Admin only

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json
```

**Request Body:**
```json
{
  "role": "manager"
}
```

**Valid Roles:** `admin`, `manager`, `cashier`

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "role": "manager",
    "updated_at": "2024-01-15T11:00:00.000Z"
  },
  "message": "User role updated successfully"
}
```

**Note:** Admin cannot change their own role.

---

### Deactivate User

**POST** `http://localhost:5000/api/v1/users/:id/deactivate`

**Required Role:** Admin only

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "is_active": false
  },
  "message": "User deactivated successfully"
}
```

**Effect:** User cannot log in but their data is preserved.

**Note:** Admin cannot deactivate their own account.

---

### Activate User

**POST** `http://localhost:5000/api/v1/users/:id/activate`

**Required Role:** Admin only

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "is_active": true
  },
  "message": "User activated successfully"
}
```

---

### Delete User

**DELETE** `http://localhost:5000/api/v1/users/:id`

**Required Role:** Admin only

**Headers:**
```
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

**Warning:** This permanently deletes the user. Consider using deactivate instead.

**Note:** Admin cannot delete their own account.

---

## Common Scenarios

### Scenario 1: Small Store with One Cashier

```bash
# Admin logs in
curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@store.com",
    "password": "AdminPass123!"
  }'

# Admin creates cashier
curl -X POST http://localhost:5000/api/v1/users \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Sarah Cashier",
    "email": "sarah@store.com",
    "password": "SarahPass123!",
    "phone": "+1234567890"
  }'

# Cashier can now log in and start creating invoices
```

---

### Scenario 2: Multi-Location Store with Managers

```bash
# Admin creates manager for Location A
curl -X POST http://localhost:5000/api/v1/users \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mike Manager - Location A",
    "email": "mike@store.com",
    "password": "MikePass123!",
    "role": "manager",
    "phone": "+1234567890"
  }'

# Admin creates cashiers for Location A
curl -X POST http://localhost:5000/api/v1/users \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Lucy Cashier - Location A",
    "email": "lucy@store.com",
    "password": "LucyPass123!",
    "phone": "+1234567891"
  }'

# Repeat for Location B...
```

---

### Scenario 3: Temporary Employee

```bash
# Admin creates temporary cashier
curl -X POST http://localhost:5000/api/v1/users \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Temp Cashier",
    "email": "temp@store.com",
    "password": "TempPass123!"
  }'

# When employment ends, deactivate instead of delete
curl -X POST http://localhost:5000/api/v1/users/USER_ID/deactivate \
  -H "Authorization: Bearer ADMIN_TOKEN"
```

---

### Scenario 4: Promote Cashier to Manager

```bash
# Admin changes role from cashier to manager
curl -X PUT http://localhost:5000/api/v1/users/USER_ID/role \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "role": "manager"
  }'
```

---

## Troubleshooting

### Error: "Only admins can create users"

**Cause:** Non-admin user trying to create users

**Solution:** Only users with admin role can create new users. Log in with admin credentials.

---

### Error: "Email already exists"

**Cause:** Attempting to create user with an email that's already in use

**Solution:** Use a different email address. Each user must have a unique email.

```json
{
  "success": false,
  "error": {
    "message": "Email already exists",
    "code": "VALIDATION_ERROR"
  }
}
```

---

### Error: "Insufficient permissions" (403)

**Cause:** Token belongs to non-admin user

**Solution:** Ensure you're using an admin token in the Authorization header.

---

### Error: "Password must be at least 8 characters"

**Cause:** Password too short

**Solution:** Provide a password with at least 8 characters.

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": {
      "password": "Password must be at least 8 characters"
    }
  }
}
```

---

### Error: "Invalid role value"

**Cause:** Using an invalid role like 'user' or 'employee'

**Solution:** Use only valid roles: `admin`, `manager`, or `cashier`

```json
{
  "success": false,
  "error": {
    "message": "Validation failed",
    "details": {
      "role": "role must be one of [admin, manager, cashier]"
    }
  }
}
```

---

### User Created but Can't Log In

**Possible Causes:**
1. User account is deactivated (`is_active: false`)
2. Wrong password
3. Wrong email

**Solution:**
1. Check user status with GET `/api/v1/users/:id`
2. If deactivated, activate with POST `/api/v1/users/:id/activate`
3. If password forgotten, admin can change it with PUT `/api/v1/users/:id/password`

---

### Subscription Limit Reached

**Error:**
```json
{
  "success": false,
  "error": {
    "message": "User limit reached for your subscription plan",
    "code": "SUBSCRIPTION_LIMIT"
  }
}
```

**Solution:** Upgrade your subscription plan to allow more users.

| Plan | Max Users |
|------|-----------|
| Free | 1 |
| Basic | 3 |
| Premium | 10 |
| Enterprise | Unlimited |

See [MAXICASH_SUBSCRIPTION_GUIDE.md](MAXICASH_SUBSCRIPTION_GUIDE.md) for upgrading.

---

## Permission Matrix

What each role can do regarding user management:

| Action | Admin | Manager | Cashier |
|--------|-------|---------|---------|
| Create users | ✅ | ❌ | ❌ |
| View all users | ✅ | ✅ | ✅ |
| View own profile | ✅ | ✅ | ✅ |
| Update own profile | ✅ | ✅ | ✅ |
| Update other users | ✅ | ❌ | ❌ |
| Change own password | ✅ | ✅ | ✅ |
| Change other's password | ✅ | ❌ | ❌ |
| Change roles | ✅ | ❌ | ❌ |
| Deactivate users | ✅ | ❌ | ❌ |
| Delete users | ✅ | ❌ | ❌ |

---

## Best Practices

1. **Use Strong Passwords:** Enforce minimum 8 characters, mix of letters, numbers, and symbols

2. **Unique Emails:** Each user must have their own email address

3. **Deactivate Instead of Delete:** When an employee leaves, deactivate their account rather than deleting it to preserve audit trails

4. **Limit Admin Accounts:** Only give admin role to company owners or top management

5. **Regular Reviews:** Periodically review active users and deactivate unused accounts

6. **Phone Numbers:** Add phone numbers for important communications and account recovery

7. **Role-Based Assignment:** Assign the minimum role needed for each user's responsibilities

8. **Document User Changes:** Keep records of when users are created, role changes, and deactivations

---

## Quick Reference

### Create Cashier (Minimal)
```bash
POST /api/v1/users
{
  "name": "Cashier Name",
  "email": "cashier@company.com",
  "password": "SecurePass123!"
}
```

### Create Manager
```bash
POST /api/v1/users
{
  "name": "Manager Name",
  "email": "manager@company.com",
  "password": "SecurePass123!",
  "role": "manager"
}
```

### List All Users
```bash
GET /api/v1/users
```

### Deactivate User
```bash
POST /api/v1/users/:id/deactivate
```

### Change Role
```bash
PUT /api/v1/users/:id/role
{
  "role": "manager"
}
```

---

## Related Documentation

- [Postman Complete Guide](POSTMAN_COMPLETE_GUIDE.md) - Full API testing guide
- [Quick Start Checklist](QUICK_START_CHECKLIST.md) - Initial setup
- [API Field Naming Guide](API_FIELD_NAMING_GUIDE.md) - Field conventions
- [MaxiCash Subscription Guide](MAXICASH_SUBSCRIPTION_GUIDE.md) - Subscription management

---

## Need Help?

If you encounter issues not covered here:
1. Check the [Troubleshooting](#troubleshooting) section
2. Review the [Postman Complete Guide](POSTMAN_COMPLETE_GUIDE.md) for detailed examples
3. Check server logs in `logs/error.log`
4. Verify your JWT token hasn't expired (tokens last 24 hours by default)

Happy user management! 🎯
