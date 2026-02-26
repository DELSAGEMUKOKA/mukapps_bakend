# Invoice Cleanup System - Verification Guide

**Quick guide to verify the 140-day automated cleanup is working**

---

## Step 1: Check Configuration

```bash
# View current configuration
cat .env | grep INVOICE_CLEANUP
```

**Expected Output:**
```
INVOICE_CLEANUP_ENABLED=true
INVOICE_CLEANUP_DAYS=140
INVOICE_CLEANUP_INTERVAL_HOURS=24
```

✅ If you see these values, configuration is correct.

---

## Step 2: Start the Server

```bash
npm start
```

**Look for these startup messages:**
```
[INFO] Initializing scheduler service...
[INFO] Invoice cleanup enabled: deleting invoices older than 140 days, running every 24 hours
[INFO] Invoice cleanup scheduled: running every 24 hours
[INFO] Scheduler service initialized
```

✅ If you see these messages, the scheduler is active.

---

## Step 3: Verify via API

### Get Cleanup Status

```bash
curl -X GET http://localhost:5000/api/v1/cleanup/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json"
```

**Expected Response:**
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
      "days": 140,
      "interval_hours": 24
    }
  }
}
```

✅ Check that:
- `"initialized": true`
- `"enabled": true`
- `"days": 140`
- `"activeTasks": ["invoiceCleanup"]`

---

## Step 4: Test with Dry Run

### Safe Preview (Nothing Gets Deleted)

```bash
curl -X POST http://localhost:5000/api/v1/cleanup/invoices \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "days_old": 140,
    "dry_run": true
  }'
```

**Expected Response (if no old invoices exist):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "deletedCount": 0,
    "message": "No old invoices to delete",
    "cutoffDate": "2025-09-30T12:00:00.000Z"
  },
  "message": "Cleanup completed"
}
```

**Response (if old invoices exist):**
```json
{
  "success": true,
  "data": {
    "success": true,
    "dryRun": true,
    "wouldDeleteCount": 5,
    "invoices": [
      {
        "id": "...",
        "invoice_number": "INV-2025-001",
        "created_at": "2025-08-15T10:00:00.000Z",
        "total": "150.00"
      }
    ],
    "cutoffDate": "2025-09-30T12:00:00.000Z"
  }
}
```

✅ Dry run shows what would be deleted without actually deleting.

---

## Step 5: Check Server Logs

```bash
# View cleanup-related logs
grep -i "cleanup" logs/combined.log

# View recent logs
tail -f logs/combined.log | grep -i cleanup
```

**Expected Log Output:**
```
[INFO] Initializing scheduler service...
[INFO] Invoice cleanup enabled: deleting invoices older than 140 days, running every 24 hours
[INFO] Invoice cleanup scheduled: running every 24 hours
[INFO] Scheduler service initialized
```

---

## Testing Scenarios

### Scenario 1: No Old Invoices (Expected)

If your system is new or has no invoices older than 140 days:

```bash
# Check status
curl -X GET http://localhost:5000/api/v1/cleanup/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

Expected: `"lastCleanupCount": 0` (nothing to delete)

---

### Scenario 2: Test with Shorter Retention (Testing Only)

To test the cleanup works, temporarily use a shorter retention:

```bash
# Dry run with 1 day (shows all invoices older than 1 day)
curl -X POST http://localhost:5000/api/v1/cleanup/invoices \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "days_old": 1,
    "dry_run": true
  }'
```

This will show you what invoices exist and would be deleted.

**Warning:** Don't actually delete with short retention in production!

---

### Scenario 3: Manual Cleanup (Real Deletion)

If you want to trigger immediate cleanup:

```bash
curl -X POST http://localhost:5000/api/v1/cleanup/invoices \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "days_old": 140,
    "dry_run": false
  }'
```

**Response:**
```json
{
  "success": true,
  "data": {
    "success": true,
    "deletedCount": 15,
    "duration": 234,
    "cutoffDate": "2025-09-30T12:00:00.000Z",
    "deletedInvoiceIds": ["uuid1", "uuid2", "..."],
    "message": "Successfully deleted 15 invoices older than 140 days"
  },
  "message": "Cleanup completed"
}
```

---

## Monitoring Over Time

### Daily Check

```bash
# Quick status check
curl -X GET http://localhost:5000/api/v1/cleanup/stats \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" | jq '.data.cleanup'
```

**What to Monitor:**
- `totalInvoicesDeleted` - Total deleted since server started
- `lastCleanupCount` - How many deleted in last run
- `lastCleanupDate` - When last cleanup ran
- `errors` - Should be 0

---

### Weekly Review

```bash
# Check logs for past week
grep "cleanup" logs/combined.log | tail -50
```

Look for:
- Regular cleanup execution messages
- Number of invoices deleted
- Any error messages

---

## Troubleshooting

### ❌ Scheduler Not Initialized

**Symptom:** No cleanup messages in startup logs

**Check:**
```bash
grep "scheduler" logs/combined.log
```

**Solution:**
1. Verify `.env` has `INVOICE_CLEANUP_ENABLED=true`
2. Restart server: `npm restart`
3. Check logs again

---

### ❌ Configuration Shows Wrong Days

**Symptom:** API shows different days than expected

**Check:**
```bash
grep INVOICE_CLEANUP_DAYS .env
```

**Solution:**
1. Update `.env` file
2. Restart server
3. Verify with API: `GET /api/v1/cleanup/stats`

---

### ❌ Cleanup Never Runs

**Symptom:** No cleanup logs after 24 hours

**Check:**
```bash
# Check if server has been running for 24+ hours
uptime

# Check scheduler status
curl -X GET http://localhost:5000/api/v1/cleanup/scheduler \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Solution:**
1. Check `"initialized": true` in response
2. Manually trigger cleanup to test:
   ```bash
   POST /api/v1/cleanup/invoices
   { "days_old": 140, "dry_run": false }
   ```

---

### ❌ No Invoices Being Deleted

**Symptom:** Cleanup runs but deletes 0 invoices

**Possible Reasons:**
1. No invoices older than 140 days exist (normal for new systems)
2. All old invoices already deleted
3. Old invoices have `pending` status (not deleted by design)

**Check Invoice Ages:**
```sql
SELECT
  DATEDIFF(NOW(), created_at) as days_old,
  payment_status,
  COUNT(*) as count
FROM invoices
GROUP BY FLOOR(DATEDIFF(NOW(), created_at) / 10), payment_status
ORDER BY days_old DESC;
```

---

## Success Indicators

### ✅ System is Working If:

1. **Startup logs show:**
   - "Invoice cleanup enabled: deleting invoices older than 140 days"
   - "Scheduler service initialized"

2. **API stats show:**
   - `"enabled": true`
   - `"days": 140`
   - `"initialized": true`
   - `"activeTasks": ["invoiceCleanup"]`

3. **Cleanup runs every 24 hours:**
   - Check logs daily
   - See cleanup execution messages
   - Deletion counts recorded

4. **No errors:**
   - `"errors": 0` in stats
   - No error messages in logs

---

## Quick Verification Checklist

- [ ] `.env` has `INVOICE_CLEANUP_ENABLED=true`
- [ ] `.env` has `INVOICE_CLEANUP_DAYS=140`
- [ ] Server starts without errors
- [ ] Startup logs show "Invoice cleanup enabled"
- [ ] API `/cleanup/stats` shows correct configuration
- [ ] Scheduler status shows `"initialized": true`
- [ ] Dry run test works (returns expected response)
- [ ] No errors in logs

---

## Next Steps After Verification

Once verified, the system will:

1. ✅ Run automatically every 24 hours
2. ✅ Delete invoices older than 140 days
3. ✅ Only delete safe invoices (paid/cancelled/refunded)
4. ✅ Log all operations
5. ✅ Keep storage size stable

**No manual intervention required!**

---

## Support

If issues persist:

1. Check full logs: `cat logs/combined.log | grep -i cleanup`
2. Check error logs: `cat logs/error.log`
3. Verify database connection
4. Check admin user permissions
5. Review `INVOICE_CLEANUP_SYSTEM.md` for detailed documentation

---

**Status:** Ready for Testing
**Next Action:** Start server and verify with steps above
**Documentation:** See `AUTOMATED_CLEANUP_140_DAYS.md` for full details
