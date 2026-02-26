# MaxiCash Subscription System - Quick Start Guide

This guide will help you get the MaxiCash subscription payment system up and running in minutes.

## Prerequisites

1. Active Supabase account with database configured
2. MaxiCash merchant account (sandbox or live)
3. Node.js 18+ installed
4. Application environment configured

## Step 1: Configure MaxiCash Credentials

1. Visit [MaxiCash Developer Portal](https://developer.maxicashapp.com/)
2. Sign up or log in to get your credentials
3. Add credentials to your `.env` file:

```env
MAXICASH_MERCHANT_ID=your_merchant_id
MAXICASH_MERCHANT_PASSWORD=your_merchant_password
MAXICASH_ENVIRONMENT=sandbox
```

## Step 2: Verify Database Migration

The subscription tables are automatically created. Verify they exist:

- `subscriptions` table with MaxiCash fields
- Proper indexes on transaction fields
- RLS policies enabled

The migration includes:
- ✅ `maxicash_transaction_id`
- ✅ `maxicash_reference`
- ✅ `maxicash_payment_status`
- ✅ `maxicash_payment_date`
- ✅ `customer_phone`
- ✅ `auto_renew`
- ✅ `next_billing_date`

## Step 3: Start Your Server

```bash
npm start
```

## Step 4: Test the Integration

### A. Get Available Plans

```bash
curl http://localhost:5000/api/v1/maxicash-subscriptions/plans
```

**Expected Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "free",
      "name": "Free Plan",
      "price": 0,
      ...
    },
    {
      "id": "basic",
      "name": "Basic Plan",
      "price": 29.99,
      ...
    }
  ]
}
```

### B. Initiate a Subscription Payment

First, get an admin JWT token by logging in, then:

```bash
curl -X POST http://localhost:5000/api/v1/maxicash-subscriptions/initiate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "basic",
    "customerPhone": "+1234567890",
    "autoRenew": false
  }'
```

**What happens:**
1. Subscription record created with status "pending"
2. MaxiCash sends notification to customer phone
3. Customer approves payment on their phone (60 second window)
4. Payment result returned immediately
5. If successful, subscription status changes to "active"

**Expected Success Response:**
```json
{
  "success": true,
  "message": "Subscription activated successfully",
  "data": {
    "subscriptionId": "uuid-here",
    "plan": "Basic Plan",
    "amount": 29.99,
    "currency": "USD",
    "status": "active",
    "transactionId": "MC-xxx-xxx",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-02-01T00:00:00Z"
  }
}
```

### C. Check Active Subscription

```bash
curl http://localhost:5000/api/v1/maxicash-subscriptions/active \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

**Expected Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "plan_type": "basic",
    "status": "active",
    "amount": 29.99,
    "plan": "Basic Plan",
    "daysRemaining": 30,
    "isExpired": false,
    "isActive": true
  }
}
```

## Step 5: Protect Routes with Subscription Middleware

### Example 1: Require Any Active Subscription

```javascript
import { requireActiveSubscription } from './middleware/subscriptionCheck.js';

router.get('/premium-feature',
  authenticate,
  requireActiveSubscription(),
  controller.premiumFeature
);
```

### Example 2: Require Specific Plans

```javascript
router.get('/pro-feature',
  authenticate,
  requireActiveSubscription(['pro', 'enterprise']),
  controller.proFeature
);
```

### Example 3: Check Usage Limits

```javascript
import { checkUsageLimit } from './middleware/subscriptionCheck.js';

router.post('/products',
  authenticate,
  checkUsageLimit('products', 'products'),
  controller.createProduct
);
```

## Common Scenarios

### Scenario 1: New Company Signs Up

1. Company registers and creates account
2. Company gets free trial or free plan automatically
3. Admin decides to upgrade
4. Admin calls `/initiate` with desired plan and phone number
5. Payment processed via MaxiCash
6. Subscription activated immediately on success

### Scenario 2: Expired Subscription

1. Subscription end date passes
2. System automatically marks subscription as "expired"
3. Protected routes return 403 error
4. User must renew subscription to continue

### Scenario 3: Cancel Subscription

1. Admin calls `/cancel` endpoint
2. Subscription marked as "cancelled"
3. Auto-renewal disabled
4. Service continues until end date, then expires

### Scenario 4: Enable Auto-Renewal

1. Admin calls `/auto-renew` endpoint
2. System stores `next_billing_date`
3. (Future) Cron job processes renewals automatically

## Testing in Sandbox

### Test Data

- **Environment**: Set to "sandbox" in `.env`
- **Phone Number**: Use your real phone for testing
- **Payment**: You'll receive real MaxiCash notifications
- **Approval**: Approve the test payment on your phone

### Test Plans

All plans are available in sandbox:
- Free: $0
- Basic: $29.99
- Pro: $59.99
- Enterprise: $149.99

### Sample Test Flow

```bash
# 1. Login as admin
TOKEN=$(curl -X POST http://localhost:5000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@company.com",
    "password": "password"
  }' | jq -r '.data.token')

# 2. Get available plans
curl http://localhost:5000/api/v1/maxicash-subscriptions/plans

# 3. Subscribe to Basic plan
curl -X POST http://localhost:5000/api/v1/maxicash-subscriptions/initiate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "basic",
    "customerPhone": "+1234567890",
    "autoRenew": false
  }'

# 4. Check active subscription
curl http://localhost:5000/api/v1/maxicash-subscriptions/active \
  -H "Authorization: Bearer $TOKEN"

# 5. View history
curl http://localhost:5000/api/v1/maxicash-subscriptions/history \
  -H "Authorization: Bearer $TOKEN"
```

## Troubleshooting

### Issue: "MaxiCash credentials not configured"

**Fix**: Check your `.env` file has:
```env
MAXICASH_MERCHANT_ID=xxx
MAXICASH_MERCHANT_PASSWORD=xxx
```

### Issue: "Customer phone number is required"

**Fix**: Provide phone in international format:
```json
{
  "customerPhone": "+1234567890"
}
```

### Issue: Payment timeout

**Problem**: User didn't approve within 60 seconds

**Fix**: Simply initiate a new payment. The old subscription remains as expired.

### Issue: "Only admins can initiate subscription payments"

**Fix**: Ensure the user has role='admin' in the database

### Issue: "Active subscription required"

**Problem**: Route protected by subscription middleware

**Fix**: Subscribe to a paid plan

## API Endpoints Summary

| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/plans` | ✅ | Any | List all plans |
| POST | `/initiate` | ✅ | Admin | Start payment |
| GET | `/active` | ✅ | Any | Get active subscription |
| GET | `/verify/:id` | ✅ | Any | Verify payment |
| POST | `/:id/cancel` | ✅ | Admin | Cancel subscription |
| PUT | `/:id/auto-renew` | ✅ | Admin | Toggle auto-renew |
| GET | `/history` | ✅ | Any | View all subscriptions |

## Next Steps

1. ✅ Test in sandbox environment
2. ✅ Verify payment flow works
3. ✅ Implement route protection in your features
4. ✅ Test usage limits
5. ⏭️ Set up auto-renewal cron job (future)
6. ⏭️ Switch to live environment for production

## Production Checklist

- [ ] Change `MAXICASH_ENVIRONMENT` to `live`
- [ ] Use production MaxiCash credentials
- [ ] Test payment flow with real transactions
- [ ] Enable HTTPS
- [ ] Set up monitoring for failed payments
- [ ] Configure auto-renewal processing
- [ ] Set up webhook notifications (if needed)

## Support

- **Documentation**: See `MAXICASH_SUBSCRIPTION_GUIDE.md`
- **MaxiCash API**: https://developer.maxicashapp.com/
- **MaxiCash Support**: info@maxicashapp.com

## Key Files

- `src/services/maxicashService.js` - MaxiCash API integration
- `src/controllers/maxicashSubscriptionController.js` - Subscription logic
- `src/routes/maxicashSubscriptions.js` - API routes
- `src/middleware/subscriptionCheck.js` - Route protection
- `src/config/subscriptionPlans.js` - Plan definitions

---

**You're all set!** 🎉

The MaxiCash subscription system is now fully integrated and ready to use. Start by testing in sandbox mode, then switch to live when ready for production.
