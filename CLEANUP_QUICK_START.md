# Invoice Cleanup - Quick Start Guide

**Get started with automated invoice cleanup in 2 minutes**

---

## ⚡ Quick Setup

### 1. Enable Cleanup (10 seconds)

Add to your `.env` file:
```bash
INVOICE_CLEANUP_ENABLED=true
INVOICE_CLEANUP_DAYS=32
INVOICE_CLEANUP_INTERVAL_HOURS=24
```

### 2. Restart Server (5 seconds)

```bash
npm restart
```

Done! Cleanup is now running automatically.

---

## ✅ Verify It's Working

### Check Server Logs
```bash
tail -f logs/combined.log | grep cleanup
```

You should see:
```
[INFO] Invoice cleanup enabled: deleting invoices older than 32 days
[INFO] Scheduler service initialized
```

### Check via API
```bash
GET http://localhost:5000/api/v1/cleanup/stats
Authorization: Bearer YOUR_ADMIN_TOKEN
```

Response should show:
```json
{
  "configuration": {
    "enabled": true,
    "days": 32,
    "interval_hours": 24
  }
}
```

---

## 🧪 Test It (Dry Run)

Before actual deletion, test what would be deleted:

```bash
POST http://localhost:5000/api/v1/cleanup/invoices
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "days_old": 32,
  "dry_run": true
}
```

This shows what would be deleted **without actually deleting anything**.

---

## 🔥 Manual Cleanup

Trigger cleanup manually anytime:

```bash
POST http://localhost:5000/api/v1/cleanup/invoices
Authorization: Bearer YOUR_ADMIN_TOKEN
Content-Type: application/json

{
  "days_old": 32,
  "dry_run": false
}
```

---

## 📊 View Statistics

```bash
GET http://localhost:5000/api/v1/cleanup/stats
Authorization: Bearer YOUR_ADMIN_TOKEN
```

See:
- Total invoices deleted
- Last cleanup date
- Last cleanup count
- Configuration settings

---

## ⚙️ Configuration Options

| Setting | Default | Description |
|---------|---------|-------------|
| `INVOICE_CLEANUP_ENABLED` | `false` | Turn on/off |
| `INVOICE_CLEANUP_DAYS` | `32` | Keep invoices for X days |
| `INVOICE_CLEANUP_INTERVAL_HOURS` | `24` | Run every X hours |

### Examples

**Weekly cleanup, 90-day retention:**
```bash
INVOICE_CLEANUP_ENABLED=true
INVOICE_CLEANUP_DAYS=90
INVOICE_CLEANUP_INTERVAL_HOURS=168
```

**Aggressive cleanup, 7-day retention:**
```bash
INVOICE_CLEANUP_ENABLED=true
INVOICE_CLEANUP_DAYS=7
INVOICE_CLEANUP_INTERVAL_HOURS=12
```

**Disable automatic cleanup:**
```bash
INVOICE_CLEANUP_ENABLED=false
```

---

## 🛡️ Safety Features

✅ **Only deletes:**
- Paid invoices
- Cancelled invoices
- Refunded invoices

❌ **Never deletes:**
- Pending invoices (might be processed)

✅ **Transaction safety:**
- All deletions in database transaction
- Rollback on any error
- No partial deletions

✅ **Audit trail:**
- All deletions logged
- Invoice numbers recorded
- Statistics tracked

---

## 🚨 Troubleshooting

### Cleanup Not Running?

**1. Check if enabled:**
```bash
grep INVOICE_CLEANUP_ENABLED .env
```

**2. Restart server:**
```bash
npm restart
```

**3. Check logs:**
```bash
grep "cleanup" logs/combined.log
```

### No Invoices Deleted?

**Reason:** No invoices old enough yet!

**Check with dry run:**
```bash
POST /api/v1/cleanup/invoices
{ "days_old": 32, "dry_run": true }
```

If `wouldDeleteCount: 0`, there are no old invoices.

---

## 📚 Full Documentation

For complete details, see:
- **INVOICE_CLEANUP_SYSTEM.md** - Full documentation
- **API Endpoints** - http://localhost:5000/api/v1/cleanup
- **Server Logs** - logs/combined.log

---

## 💡 Common Use Cases

### Case 1: Standard Business
Keep 1 month of invoices:
```bash
INVOICE_CLEANUP_DAYS=30
INVOICE_CLEANUP_INTERVAL_HOURS=24
```

### Case 2: High Volume
Keep 1 week, clean twice daily:
```bash
INVOICE_CLEANUP_DAYS=7
INVOICE_CLEANUP_INTERVAL_HOURS=12
```

### Case 3: Compliance
Keep 1 year, clean weekly:
```bash
INVOICE_CLEANUP_DAYS=365
INVOICE_CLEANUP_INTERVAL_HOURS=168
```

### Case 4: Testing
Manual control only:
```bash
INVOICE_CLEANUP_ENABLED=false
```
Use API for manual cleanup when needed.

---

## ✅ Checklist

- [ ] Added environment variables to `.env`
- [ ] Restarted server
- [ ] Checked logs for initialization
- [ ] Tested with dry run
- [ ] Verified statistics API
- [ ] Configured retention period for your needs
- [ ] Set cleanup frequency appropriately
- [ ] Documented your configuration

---

**That's it! Your invoice cleanup system is now active and will automatically maintain your database size.**

🎉 **Enjoy automatic storage management!**

---

**Quick Links:**
- Full Documentation: `INVOICE_CLEANUP_SYSTEM.md`
- API Base: `http://localhost:5000/api/v1/cleanup`
- Stats Endpoint: `GET /api/v1/cleanup/stats`
- Manual Trigger: `POST /api/v1/cleanup/invoices`
