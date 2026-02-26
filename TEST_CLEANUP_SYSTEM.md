# Invoice Cleanup System - Test Plan

**Quick tests to verify the cleanup system is working correctly**

---

## Pre-Test Setup

### 1. Enable Cleanup in .env
```bash
INVOICE_CLEANUP_ENABLED=true
INVOICE_CLEANUP_DAYS=32
INVOICE_CLEANUP_INTERVAL_HOURS=24
```

### 2. Restart Server
```bash
npm restart
```

### 3. Get Admin Token
Login as admin and save the JWT token:
```bash
POST http://localhost:5000/api/v1/auth/login
Content-Type: application/json

{
  "email": "admin@companya.com",
  "password": "SecurePass123!"
}
```

Save the token from response for all tests below.

---

## Test 1: Check Scheduler Initialization (30 seconds)

### Check Server Logs
```bash
tail -50 logs/combined.log | grep -i scheduler
```

**Expected Output:**
```
[INFO] Initializing scheduler service...
[INFO] Invoice cleanup enabled: deleting invoices older than 32 days, running every 24 hours
[INFO] Invoice cleanup scheduled: running every 24 hours
[INFO] Scheduler service initialized
```

**✅ PASS:** If you see these messages
**❌ FAIL:** If no scheduler messages appear

---

## Test 2: Check Scheduler Status via API (1 minute)

### Request
```bash
GET http://localhost:5000/api/v1/cleanup/scheduler
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "data": {
    "initialized": true,
    "activeTasks": ["invoiceCleanup"],
    "cleanupStats": {
      "totalInvoicesDeleted": 0,
      "lastCleanupCount": 0,
      "lastCleanupDate": null,
      "errors": 0
    }
  }
}
```

**✅ PASS:** If `initialized: true` and `activeTasks` includes `"invoiceCleanup"`
**❌ FAIL:** If `initialized: false` or no active tasks

---

## Test 3: Check Configuration (1 minute)

### Request
```bash
GET http://localhost:5000/api/v1/cleanup/stats
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "data": {
    "cleanup": {
      "totalInvoicesDeleted": 0,
      "lastCleanupCount": 0,
      "lastCleanupDate": null,
      "errors": 0,
      "isRunning": false,
      "lastRunTime": null
    },
    "scheduler": {
      "initialized": true,
      "activeTasks": ["invoiceCleanup"]
    },
    "configuration": {
      "enabled": true,
      "days": 32,
      "interval_hours": 24
    }
  }
}
```

**✅ PASS:** If configuration shows correct values
**❌ FAIL:** If `enabled: false` or wrong values

---

## Test 4: Dry Run - See What Would Be Deleted (2 minutes)

### Request
```bash
POST http://localhost:5000/api/v1/cleanup/invoices
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "days_old": 32,
  "dry_run": true
}
```

### Expected Response - No Old Invoices (200 OK)
```json
{
  "success": true,
  "data": {
    "success": true,
    "deletedCount": 0,
    "message": "No old invoices to delete",
    "cutoffDate": "2026-01-15T10:30:00.000Z"
  }
}
```

### Expected Response - Has Old Invoices (200 OK)
```json
{
  "success": true,
  "data": {
    "success": true,
    "dryRun": true,
    "wouldDeleteCount": 5,
    "invoices": [
      {
        "id": "uuid-here",
        "invoice_number": "INV-2025-001",
        "created_at": "2025-01-10T10:00:00.000Z",
        "total": "150.00"
      }
    ],
    "cutoffDate": "2026-01-15T10:30:00.000Z"
  }
}
```

**✅ PASS:** If API returns successfully (even with 0 count)
**❌ FAIL:** If error or unauthorized

---

## Test 5: Create Test Invoice for Deletion (3 minutes)

### Step 1: Create Old Invoice
Create an invoice, then manually change its date in database:

```sql
-- Create invoice normally via API first, then:
UPDATE invoices
SET created_at = DATE_SUB(NOW(), INTERVAL 35 DAY),
    payment_status = 'paid'
WHERE invoice_number = 'INV-TEST-OLD';
```

### Step 2: Verify Invoice Exists
```bash
GET http://localhost:5000/api/v1/invoices
Authorization: Bearer YOUR_ADMIN_TOKEN
```

Look for invoice older than 32 days with `paid` status.

**✅ PASS:** If old invoice exists
**❌ FAIL:** If no old invoice found

---

## Test 6: Dry Run with Test Invoice (2 minutes)

### Request
```bash
POST http://localhost:5000/api/v1/cleanup/invoices
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "days_old": 32,
  "dry_run": true
}
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "data": {
    "success": true,
    "dryRun": true,
    "wouldDeleteCount": 1,
    "invoices": [
      {
        "id": "uuid-here",
        "invoice_number": "INV-TEST-OLD",
        "created_at": "2025-01-10T...",
        "total": "..."
      }
    ]
  }
}
```

**✅ PASS:** If test invoice appears in list
**❌ FAIL:** If test invoice not found

---

## Test 7: Actual Deletion (3 minutes)

### Request
```bash
POST http://localhost:5000/api/v1/cleanup/invoices
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "days_old": 32,
  "dry_run": false
}
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "data": {
    "success": true,
    "deletedCount": 1,
    "duration": 234,
    "cutoffDate": "2026-01-15T...",
    "deletedInvoiceIds": ["uuid-here"],
    "message": "Successfully deleted 1 invoices older than 32 days"
  }
}
```

### Verify Deletion
```bash
GET http://localhost:5000/api/v1/invoices
Authorization: Bearer YOUR_ADMIN_TOKEN
```

**✅ PASS:** If old invoice is gone and response shows `deletedCount: 1`
**❌ FAIL:** If old invoice still exists

---

## Test 8: Check Updated Statistics (1 minute)

### Request
```bash
GET http://localhost:5000/api/v1/cleanup/stats
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "data": {
    "cleanup": {
      "totalInvoicesDeleted": 1,
      "lastCleanupCount": 1,
      "lastCleanupDate": "2026-02-16T...",
      "errors": 0,
      "isRunning": false,
      "lastRunTime": "2026-02-16T..."
    }
  }
}
```

**✅ PASS:** If statistics updated correctly
**❌ FAIL:** If stats still show 0

---

## Test 9: Check Logs for Deletion (1 minute)

### Check Logs
```bash
grep -i "cleanup" logs/combined.log | tail -20
```

### Expected Log Entries
```
[INFO] Manual invoice cleanup triggered by user {uuid}: 32 days, dry_run: false
[INFO] Starting invoice cleanup: deleting invoices older than 32 days
[INFO] Found 1 invoices to delete
[INFO] Successfully deleted 1 old invoices in 234ms
[INFO] Deleted invoice numbers: INV-TEST-OLD
```

**✅ PASS:** If logs show deletion details
**❌ FAIL:** If no cleanup logs

---

## Test 10: Reset Statistics (1 minute)

### Request
```bash
POST http://localhost:5000/api/v1/cleanup/reset-stats
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Expected Response (200 OK)
```json
{
  "success": true,
  "message": "Statistics reset successfully"
}
```

### Verify Reset
```bash
GET http://localhost:5000/api/v1/cleanup/stats
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Expected Response
```json
{
  "cleanup": {
    "totalInvoicesDeleted": 0,
    "lastCleanupCount": 0,
    "lastCleanupDate": null,
    "errors": 0
  }
}
```

**✅ PASS:** If statistics are reset to 0
**❌ FAIL:** If stats unchanged

---

## Test 11: Permission Check (1 minute)

### Test with Non-Admin User

Get a non-admin token (cashier or operator), then:

```bash
GET http://localhost:5000/api/v1/cleanup/stats
Authorization: Bearer NON_ADMIN_TOKEN
```

### Expected Response (403 Forbidden)
```json
{
  "success": false,
  "message": "Access denied. Required role: admin"
}
```

**✅ PASS:** If access denied for non-admin
**❌ FAIL:** If non-admin can access

---

## Test 12: Disable Cleanup (2 minutes)

### Step 1: Update .env
```bash
INVOICE_CLEANUP_ENABLED=false
```

### Step 2: Restart Server
```bash
npm restart
```

### Step 3: Check Logs
```bash
tail -50 logs/combined.log | grep -i cleanup
```

### Expected Output
```
[INFO] Invoice cleanup disabled (set INVOICE_CLEANUP_ENABLED=true to enable)
```

### Step 4: Check via API
```bash
GET http://localhost:5000/api/v1/cleanup/stats
Authorization: Bearer YOUR_ADMIN_TOKEN
```

### Expected Response
```json
{
  "configuration": {
    "enabled": false,
    "days": 32,
    "interval_hours": 24
  }
}
```

**✅ PASS:** If cleanup is disabled
**❌ FAIL:** If still shows enabled

---

## Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| 1. Scheduler Initialization | ⬜ | Check logs |
| 2. Scheduler Status API | ⬜ | API check |
| 3. Configuration Check | ⬜ | Verify settings |
| 4. Dry Run (No Data) | ⬜ | Safe test |
| 5. Create Test Invoice | ⬜ | Setup |
| 6. Dry Run (With Data) | ⬜ | Preview deletion |
| 7. Actual Deletion | ⬜ | Real cleanup |
| 8. Check Statistics | ⬜ | Verify tracking |
| 9. Check Logs | ⬜ | Audit trail |
| 10. Reset Statistics | ⬜ | Reset function |
| 11. Permission Check | ⬜ | Security |
| 12. Disable Cleanup | ⬜ | Toggle feature |

**Mark:** ✅ Pass | ❌ Fail

---

## Troubleshooting

### All Tests Fail - Server Not Starting

**Check:**
1. Environment variables syntax
2. Server logs: `tail -f logs/error.log`
3. Database connection

### Tests 1-3 Fail - Scheduler Not Running

**Fix:**
1. Set `INVOICE_CLEANUP_ENABLED=true`
2. Restart server
3. Check logs

### Test 7 Fails - No Deletion

**Reasons:**
1. No invoices old enough
2. Invoices not in `paid/cancelled/refunded` status
3. Database permissions

**Fix:**
Check invoice status and age in database.

### Test 11 Fails - Non-Admin Can Access

**Fix:**
Check role middleware in cleanup routes.

---

## Quick Test (30 seconds)

Just want to verify it's working? Run these:

```bash
# 1. Check if enabled
curl http://localhost:5000/api/v1/cleanup/stats \
  -H "Authorization: Bearer YOUR_TOKEN" | jq '.data.configuration.enabled'

# Expected: true

# 2. Dry run
curl -X POST http://localhost:5000/api/v1/cleanup/invoices \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"dry_run":true}' | jq '.success'

# Expected: true
```

---

## Success Criteria

✅ All tests pass
✅ Scheduler initializes on startup
✅ API endpoints work correctly
✅ Deletions work and are logged
✅ Statistics track correctly
✅ Only admins can access
✅ Can enable/disable via config

---

**Total Test Time:** ~20 minutes
**Critical Tests:** 1, 2, 3, 4, 7, 11
**Optional Tests:** 5, 6, 8, 9, 10, 12

**After Testing:** Re-enable cleanup if needed:
```bash
INVOICE_CLEANUP_ENABLED=true
```
Then restart server.
