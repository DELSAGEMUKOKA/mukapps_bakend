# Automated Invoice Cleanup System

**Feature:** Automatic deletion of old invoices to free up storage space
**Status:** ✅ ACTIVE
**Version:** 1.0.0
**Date:** 2026-02-16

---

## Overview

The Invoice Cleanup System automatically deletes invoices older than a specified number of days (default: 140 days) to free up storage space in the database. The system runs as a scheduled background task within the application.

---

## Key Features

✅ **Automatic Cleanup** - Runs on a configurable schedule (default: every 24 hours)
✅ **Configurable Retention** - Set how many days to keep invoices (default: 32 days)
✅ **Safe Deletion** - Only deletes paid, cancelled, or refunded invoices
✅ **Manual Control** - Admin API to trigger cleanup manually
✅ **Dry Run Mode** - Test what would be deleted without actually deleting
✅ **Detailed Logging** - Complete audit trail of all deletions
✅ **Statistics Tracking** - Monitor cleanup operations and deleted invoice counts
✅ **Transaction Safety** - All deletions happen in database transactions
✅ **Graceful Shutdown** - Scheduler stops cleanly when server shuts down

---

## Configuration

### Environment Variables

Add these to your `.env` file:

```bash
# Enable/disable automatic cleanup
INVOICE_CLEANUP_ENABLED=true

# Delete invoices older than this many days
INVOICE_CLEANUP_DAYS=32

# Run cleanup every X hours (24 = daily)
INVOICE_CLEANUP_INTERVAL_HOURS=24
```

### Default Values

| Setting | Default | Description |
|---------|---------|-------------|
| `INVOICE_CLEANUP_ENABLED` | `true` | Enabled by default for automatic storage management |
| `INVOICE_CLEANUP_DAYS` | `140` | Retention period in days (~4.5 months) |
| `INVOICE_CLEANUP_INTERVAL_HOURS` | `24` | How often to run (daily) |

---

## How It Works

### 1. Automatic Scheduling

When the server starts, if `INVOICE_CLEANUP_ENABLED=true`, the scheduler:
1. Initializes the cleanup service
2. Schedules periodic cleanup based on `INVOICE_CLEANUP_INTERVAL_HOURS`
3. Runs automatically at the specified interval

### 2. Cleanup Process

Each cleanup operation:

1. **Calculates cutoff date** - Current date minus `INVOICE_CLEANUP_DAYS`
2. **Finds old invoices** - Queries for invoices:
   - Created before the cutoff date
   - With status: `paid`, `cancelled`, or `refunded` (safe to delete)
3. **Logs invoice details** - Records invoice numbers and IDs before deletion
4. **Deletes in transaction** - Uses database transaction for safety
5. **Updates statistics** - Tracks deletion counts and timestamps
6. **Logs results** - Records success/failure in server logs

### 3. Safety Measures

**Only Safe Invoices Deleted:**
- ✅ `paid` - Payment completed, no longer needed
- ✅ `cancelled` - Invoice was cancelled
- ✅ `refunded` - Payment was refunded
- ❌ `pending` - NOT deleted (might still be processed)

**Transaction Safety:**
- All deletions happen in a database transaction
- If any error occurs, entire operation is rolled back
- No partial deletions possible

**Cascade Deletion:**
- Invoice items are automatically deleted with invoices
- Database foreign key constraints handle this

---

## API Endpoints

All endpoints require authentication and **Admin role**.

### 1. Manual Cleanup

Trigger cleanup manually (useful for testing or immediate cleanup):

```bash
POST /api/v1/cleanup/invoices
Authorization: Bearer {admin-token}
Content-Type: application/json

{
  "days_old": 32,
  "dry_run": false
}
```

**Parameters:**
- `days_old` (optional) - Number of days, default: 32, min: 1, max: 365
- `dry_run` (optional) - If `true`, shows what would be deleted without deleting

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "deletedCount": 15,
    "duration": 234,
    "cutoffDate": "2025-01-15T10:30:00.000Z",
    "deletedInvoiceIds": ["uuid1", "uuid2", "..."],
    "message": "Successfully deleted 15 invoices older than 32 days"
  },
  "message": "Cleanup completed"
}
```

**Dry Run Response (200):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "dryRun": true,
    "wouldDeleteCount": 15,
    "invoices": [
      {
        "id": "uuid1",
        "invoice_number": "INV-2025-001",
        "created_at": "2025-01-10T10:00:00.000Z",
        "total": "150.00"
      }
    ],
    "cutoffDate": "2025-01-15T10:30:00.000Z"
  }
}
```

### 2. Get Statistics

View cleanup statistics and configuration:

```bash
GET /api/v1/cleanup/stats
Authorization: Bearer {admin-token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "cleanup": {
      "totalInvoicesDeleted": 150,
      "lastCleanupCount": 15,
      "lastCleanupDate": "2026-02-16T08:00:00.000Z",
      "errors": 0,
      "isRunning": false,
      "lastRunTime": "2026-02-16T08:00:00.000Z"
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

### 3. Get Scheduler Status

Check if scheduler is running:

```bash
GET /api/v1/cleanup/scheduler
Authorization: Bearer {admin-token}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "initialized": true,
    "activeTasks": ["invoiceCleanup"],
    "cleanupStats": {
      "totalInvoicesDeleted": 150,
      "lastCleanupCount": 15,
      "lastCleanupDate": "2026-02-16T08:00:00.000Z",
      "errors": 0
    }
  }
}
```

### 4. Reset Statistics

Reset cleanup statistics (doesn't affect actual data):

```bash
POST /api/v1/cleanup/reset-stats
Authorization: Bearer {admin-token}
```

**Response (200):**
```json
{
  "success": true,
  "message": "Statistics reset successfully"
}
```

---

## Logging

All cleanup operations are logged:

### Startup Logs
```
[INFO] Initializing scheduler service...
[INFO] Invoice cleanup enabled: deleting invoices older than 140 days, running every 24 hours
[INFO] Invoice cleanup scheduled: running every 24 hours
[INFO] Scheduler service initialized
```

### Cleanup Execution Logs
```
[INFO] Starting invoice cleanup: deleting invoices older than 140 days (before 2025-09-29T10:30:00.000Z)
[INFO] Found 15 invoices to delete
[INFO] Successfully deleted 15 old invoices in 234ms
[INFO] Deleted invoice numbers: INV-2025-001, INV-2025-002, ...
```

### Error Logs
```
[ERROR] Error during invoice cleanup: {error details}
```

### Dry Run Logs
```
[INFO] DRY RUN - Would delete the following invoices:
[INFO]   - Invoice INV-2025-001 (uuid) from 2025-01-10T10:00:00.000Z
[INFO]   - Invoice INV-2025-002 (uuid) from 2025-01-11T10:00:00.000Z
```

---

## Testing

### 1. Test with Dry Run (Safe)

See what would be deleted without actually deleting:

```bash
POST /api/v1/cleanup/invoices
{
  "days_old": 32,
  "dry_run": true
}
```

Review the response to see which invoices would be deleted.

### 2. Test Manual Cleanup

Trigger a real cleanup with shorter retention:

```bash
POST /api/v1/cleanup/invoices
{
  "days_old": 60,
  "dry_run": false
}
```

### 3. Check Statistics

```bash
GET /api/v1/cleanup/stats
```

Verify the cleanup worked and check deletion counts.

### 4. Check Server Logs

```bash
tail -f logs/combined.log | grep -i cleanup
```

Monitor cleanup operations in real-time.

---

## Use Cases

### Scenario 1: Regular Storage Maintenance
**Configuration:**
```bash
INVOICE_CLEANUP_ENABLED=true
INVOICE_CLEANUP_DAYS=30
INVOICE_CLEANUP_INTERVAL_HOURS=24
```

**Result:** Every day, invoices older than 30 days are deleted automatically.

---

### Scenario 2: Aggressive Cleanup
**Configuration:**
```bash
INVOICE_CLEANUP_ENABLED=true
INVOICE_CLEANUP_DAYS=7
INVOICE_CLEANUP_INTERVAL_HOURS=12
```

**Result:** Every 12 hours, invoices older than 7 days are deleted.

---

### Scenario 3: Manual Control Only
**Configuration:**
```bash
INVOICE_CLEANUP_ENABLED=false
```

**Usage:** Admin triggers cleanup manually when needed via API.

---

### Scenario 4: Long-Term Archival
**Configuration:**
```bash
INVOICE_CLEANUP_ENABLED=true
INVOICE_CLEANUP_DAYS=365
INVOICE_CLEANUP_INTERVAL_HOURS=168
```

**Result:** Weekly cleanup of invoices older than 1 year.

---

## Storage Impact

### Example Database Sizes

Assuming average invoice size: ~5KB (invoice + items + metadata)

| Invoices/Day | 30 Days | 60 Days | 90 Days | 365 Days |
|--------------|---------|---------|---------|----------|
| 10 | 1.5 MB | 3 MB | 4.5 MB | 18 MB |
| 50 | 7.5 MB | 15 MB | 22.5 MB | 91 MB |
| 100 | 15 MB | 30 MB | 45 MB | 183 MB |
| 500 | 75 MB | 150 MB | 225 MB | 915 MB |
| 1000 | 150 MB | 300 MB | 450 MB | 1.8 GB |

**With 140-day cleanup:** Storage stabilizes at ~140 days (~4.5 months) worth of invoices.

### Example with 140-Day Retention

| Invoices/Day | Storage After Cleanup |
|--------------|----------------------|
| 10 | ~7 MB |
| 50 | ~35 MB |
| 100 | ~70 MB |
| 500 | ~350 MB |
| 1000 | ~700 MB |

---

## Best Practices

### 1. Enable Gradually
Start with longer retention (60+ days) and gradually reduce:
```bash
Week 1: INVOICE_CLEANUP_DAYS=90
Week 2: INVOICE_CLEANUP_DAYS=60
Week 3: INVOICE_CLEANUP_DAYS=45
Week 4: INVOICE_CLEANUP_DAYS=32
```

### 2. Monitor First
Run in dry run mode first:
```bash
POST /api/v1/cleanup/invoices
{ "dry_run": true }
```

### 3. Check Logs Regularly
```bash
grep -i "cleanup" logs/combined.log | tail -50
```

### 4. Track Statistics
Monitor deletion counts via API:
```bash
GET /api/v1/cleanup/stats
```

### 5. Consider Business Requirements
- **Accounting needs**: Keep invoices for tax year
- **Legal requirements**: Check local regulations
- **Customer service**: Keep recent invoices accessible
- **Analytics**: Balance storage vs. reporting needs

---

## Troubleshooting

### Cleanup Not Running

**Check 1: Is it enabled?**
```bash
grep INVOICE_CLEANUP_ENABLED .env
```
Should be `true`.

**Check 2: Check scheduler status**
```bash
GET /api/v1/cleanup/scheduler
```

**Check 3: Check logs**
```bash
grep "scheduler" logs/combined.log
```

### No Invoices Being Deleted

**Reason 1: No old invoices**
All invoices are newer than retention period.

**Reason 2: Wrong status**
Only `paid`, `cancelled`, `refunded` are deleted.

**Reason 3: Already cleaned**
Cleanup already ran and deleted them.

**Solution: Run dry run**
```bash
POST /api/v1/cleanup/invoices
{ "days_old": 32, "dry_run": true }
```

### Cleanup Errors

**Check logs:**
```bash
grep -i "error.*cleanup" logs/error.log
```

**Common issues:**
- Database connection lost
- Transaction timeout
- Permission issues

---

## Security Considerations

### Access Control
- ✅ All cleanup endpoints require authentication
- ✅ Only **Admin** role can access cleanup endpoints
- ✅ Cleanup operations are logged with user ID

### Data Safety
- ✅ Only safe invoice statuses are deleted
- ✅ All deletions use database transactions
- ✅ Dry run mode available for testing
- ✅ Deleted invoice IDs are logged

### Audit Trail
- ✅ All deletions logged with details
- ✅ Invoice numbers recorded before deletion
- ✅ Statistics tracked for monitoring
- ✅ Timestamps of all cleanup operations

---

## Technical Architecture

### Services

**CleanupService** (`src/services/cleanupService.js`)
- Handles invoice deletion logic
- Manages statistics
- Provides dry run capability

**SchedulerService** (`src/services/schedulerService.js`)
- Manages scheduled tasks
- Initializes on server startup
- Stops on graceful shutdown

### Controller

**CleanupController** (`src/controllers/cleanupController.js`)
- Handles API requests
- Validates admin access
- Returns formatted responses

### Routes

**Cleanup Routes** (`src/routes/cleanup.js`)
- Defines API endpoints
- Applies authentication
- Enforces admin role

---

## Maintenance

### Regular Checks

**Daily:**
- Monitor cleanup logs
- Check for errors

**Weekly:**
- Review statistics
- Verify storage trends

**Monthly:**
- Adjust retention if needed
- Review deletion patterns

### Monitoring Queries

**Check invoice age distribution:**
```sql
SELECT
  DATE(created_at) as date,
  COUNT(*) as count
FROM invoices
GROUP BY DATE(created_at)
ORDER BY date DESC
LIMIT 30;
```

**Check invoice status distribution:**
```sql
SELECT
  payment_status,
  COUNT(*) as count
FROM invoices
GROUP BY payment_status;
```

**Check oldest invoices:**
```sql
SELECT
  invoice_number,
  created_at,
  payment_status,
  DATEDIFF(NOW(), created_at) as days_old
FROM invoices
ORDER BY created_at ASC
LIMIT 10;
```

---

## Disabling Cleanup

To disable automatic cleanup:

1. **Update .env:**
```bash
INVOICE_CLEANUP_ENABLED=false
```

2. **Restart server:**
```bash
npm restart
```

3. **Verify:**
```bash
GET /api/v1/cleanup/stats
```

Should show `"enabled": false`.

---

## Files Modified

| File | Purpose |
|------|---------|
| `src/services/cleanupService.js` | Core cleanup logic |
| `src/services/schedulerService.js` | Task scheduling |
| `src/controllers/cleanupController.js` | API endpoints |
| `src/routes/cleanup.js` | Route definitions |
| `src/routes/index.js` | Route registration |
| `src/server.js` | Scheduler initialization |
| `.env` | Configuration |
| `.env.example` | Configuration template |

---

## Summary

✅ **Automated** - Runs on schedule without manual intervention
✅ **Safe** - Only deletes completed invoices with transaction safety
✅ **Configurable** - Adjust retention and frequency to your needs
✅ **Controllable** - Manual triggers and dry run mode available
✅ **Monitored** - Comprehensive logging and statistics
✅ **Secure** - Admin-only access with full audit trail

**Storage savings:** Keeps database size stable by removing old data
**Zero maintenance:** Set it and forget it
**Full control:** Manual override and configuration options

---

**Feature Status:** ✅ Ready for Production
**Testing Required:** Manual testing recommended
**Documentation:** Complete
**Support:** Check logs and statistics APIs
