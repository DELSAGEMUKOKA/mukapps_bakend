# MaxiCash Subscription Payment Integration Guide

This guide explains how to use the MaxiCash payment integration for recurring subscription payments in your inventory management system.

## Table of Contents

1. [Overview](#overview)
2. [Configuration](#configuration)
3. [Available Plans](#available-plans)
4. [API Endpoints](#api-endpoints)
5. [Workflow](#workflow)
6. [Middleware Usage](#middleware-usage)
7. [Testing](#testing)
8. [Troubleshooting](#troubleshooting)

## Overview

The MaxiCash subscription system allows companies to subscribe to different plans (Basic, Pro, Enterprise) using MaxiCash's **PayNowSynch** payment method. The integration is fully automated and secure.

### Key Features

- ✅ Multiple subscription plans (Free, Basic, Pro, Enterprise)
- ✅ Secure payment processing via MaxiCash PayNowSynch
- ✅ Automatic subscription activation on successful payment
- ✅ Payment verification and validation
- ✅ Auto-renewal capability
- ✅ Subscription status tracking
- ✅ Route protection based on subscription plan
- ✅ Usage limit enforcement
- ✅ Payment history tracking

## Configuration

### 1. MaxiCash Credentials

Sign up for a MaxiCash merchant account at [https://developer.maxicashapp.com/](https://developer.maxicashapp.com/)

### 2. Environment Variables

Add the following to your `.env` file:

```env
# MaxiCash Configuration
MAXICASH_MERCHANT_ID=your_merchant_id
MAXICASH_MERCHANT_PASSWORD=your_merchant_password
MAXICASH_ENVIRONMENT=sandbox  # or 'live' for production
```

### 3. Database Setup

The subscription tables are automatically created with the migration. Run the application and the tables will be set up with:

- MaxiCash transaction tracking fields
- Payment status fields
- Auto-renewal configuration
- Row Level Security (RLS) policies

## Available Plans

### Free Plan
- **Price**: $0/month
- **Features**: Basic features, limited usage
- **Limits**: 50 products, 20 invoices/month, 1 user

### Basic Plan
- **Price**: $29.99/month
- **Features**: Standard business features
- **Limits**: 500 products, 200 invoices/month, 3 users

### Pro Plan
- **Price**: $59.99/month
- **Features**: Advanced features with API access
- **Limits**: Unlimited products & invoices, 10 users

### Enterprise Plan
- **Price**: $149.99/month
- **Features**: Full features with dedicated support
- **Limits**: Unlimited everything

## API Endpoints

### Base URL
```
/api/v1/maxicash-subscriptions
```

### 1. Get Available Plans

**GET** `/plans`

Returns all available subscription plans with features and pricing.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "basic",
      "name": "Basic Plan",
      "price": 29.99,
      "currency": "USD",
      "duration": 30,
      "features": [...],
      "limits": {...}
    }
  ]
}
```

### 2. Initiate Subscription Payment

**POST** `/initiate`

Initiates a new subscription with MaxiCash payment.

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Request Body:**
```json
{
  "planId": "basic",
  "customerPhone": "+1234567890",
  "autoRenew": false
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Subscription activated successfully",
  "data": {
    "subscriptionId": "uuid",
    "plan": "Basic Plan",
    "amount": 29.99,
    "currency": "USD",
    "status": "active",
    "transactionId": "MC-xxx-xxx",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-02-01T00:00:00Z",
    "autoRenew": false
  }
}
```

**Response (Failure):**
```json
{
  "success": false,
  "message": "Payment failed",
  "error": "Insufficient funds",
  "data": {
    "subscriptionId": "uuid",
    "reference": "SUB-xxx-xxx"
  }
}
```

### 3. Get Active Subscription

**GET** `/active`

Returns the current active subscription for the company.

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "uuid",
    "company_id": "uuid",
    "plan_type": "basic",
    "status": "active",
    "amount": 29.99,
    "start_date": "2024-01-01T00:00:00Z",
    "end_date": "2024-02-01T00:00:00Z",
    "plan": "Basic Plan",
    "features": [...],
    "daysRemaining": 30,
    "isExpired": false,
    "isActive": true
  }
}
```

### 4. Verify Payment

**GET** `/verify/:transactionId`

Verifies a MaxiCash payment transaction.

**Response:**
```json
{
  "success": true,
  "message": "Payment verified and subscription activated",
  "data": {
    "subscriptionId": "uuid",
    "status": "active",
    "transactionId": "MC-xxx-xxx",
    "amount": 29.99
  }
}
```

### 5. Cancel Subscription

**POST** `/:subscriptionId/cancel`

Cancels an active subscription (Admin only).

**Response:**
```json
{
  "success": true,
  "message": "Subscription cancelled successfully",
  "data": {
    "subscriptionId": "uuid",
    "status": "cancelled"
  }
}
```

### 6. Update Auto-Renewal

**PUT** `/:subscriptionId/auto-renew`

Enables or disables auto-renewal (Admin only).

**Request Body:**
```json
{
  "autoRenew": true
}
```

**Response:**
```json
{
  "success": true,
  "message": "Auto-renew enabled successfully",
  "data": {
    "subscriptionId": "uuid",
    "autoRenew": true,
    "nextBillingDate": "2024-02-01T00:00:00Z"
  }
}
```

### 7. Get Subscription History

**GET** `/history`

Returns all past and present subscriptions for the company.

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "plan_type": "basic",
      "planName": "Basic Plan",
      "status": "active",
      "amount": 29.99,
      "start_date": "2024-01-01T00:00:00Z",
      "end_date": "2024-02-01T00:00:00Z"
    }
  ]
}
```

## Workflow

### Subscription Payment Flow

1. **User selects a plan** from available plans
2. **Admin initiates payment** via POST `/initiate` with:
   - Plan ID
   - Customer phone number (for MaxiCash)
   - Auto-renewal preference
3. **Backend creates subscription record** with status "pending"
4. **MaxiCash PayNowSynch is called**:
   - User receives notification on their phone
   - User has 60 seconds to approve payment
5. **Payment result is processed**:
   - **Success**: Subscription activated immediately
   - **Failure**: Subscription marked as expired
6. **Subscription is active** and company can use the system

### Payment Verification Flow

If there's any doubt about payment status:

1. Call GET `/verify/:transactionId`
2. System queries MaxiCash to verify transaction
3. Subscription status is updated accordingly

## Middleware Usage

### 1. Require Active Subscription

Protects routes that require any active subscription:

```javascript
import { requireActiveSubscription } from '../middleware/subscriptionCheck.js';

router.get('/premium-feature',
  authenticate,
  requireActiveSubscription(),
  controller.premiumFeature
);
```

### 2. Require Specific Plan

Protects routes that require specific plan levels:

```javascript
router.get('/advanced-reports',
  authenticate,
  requireActiveSubscription(['pro', 'enterprise']),
  controller.advancedReports
);
```

### 3. Check Feature Access

Validates access to features based on plan hierarchy:

```javascript
import { checkFeatureAccess } from '../middleware/subscriptionCheck.js';

router.post('/api-access',
  authenticate,
  checkFeatureAccess('API Access', { minPlan: 'pro' }),
  controller.apiAccess
);
```

### 4. Check Usage Limits

Enforces resource limits based on subscription plan:

```javascript
import { checkUsageLimit } from '../middleware/subscriptionCheck.js';

router.post('/products',
  authenticate,
  checkUsageLimit('products', 'products'),
  controller.createProduct
);
```

### 5. Warn on Approaching Limits

Adds headers to response when usage is approaching limits:

```javascript
import { warnOnLimitApproaching } from '../middleware/subscriptionCheck.js';

router.get('/products',
  authenticate,
  warnOnLimitApproaching('products', 'products', 0.8),
  controller.listProducts
);
```

Response headers when approaching limit:
```
X-Usage-Warning: approaching-limit
X-Usage-Count: 450
X-Usage-Limit: 500
X-Usage-Percentage: 90
```

## Testing

### 1. Sandbox Environment

The integration uses MaxiCash sandbox by default. Set `MAXICASH_ENVIRONMENT=sandbox` in `.env`.

### 2. Test Phone Numbers

Use your actual phone number in sandbox mode. You'll receive real notifications to approve test payments.

### 3. Test Plans

All plans can be tested in sandbox mode with the same pricing structure.

### 4. Example Test Flow

```bash
# 1. Get available plans
curl -X GET http://localhost:5000/api/v1/maxicash-subscriptions/plans

# 2. Initiate payment (requires authentication)
curl -X POST http://localhost:5000/api/v1/maxicash-subscriptions/initiate \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "planId": "basic",
    "customerPhone": "+1234567890",
    "autoRenew": false
  }'

# 3. Check active subscription
curl -X GET http://localhost:5000/api/v1/maxicash-subscriptions/active \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

## Troubleshooting

### Common Issues

#### 1. "MaxiCash credentials not configured"

**Solution**: Ensure `MAXICASH_MERCHANT_ID` and `MAXICASH_MERCHANT_PASSWORD` are set in `.env`

#### 2. "Payment failed" - User timeout

**Issue**: User didn't approve payment within 60 seconds

**Solution**: Initiate a new payment. The old subscription record will remain as expired.

#### 3. "Customer phone number is required"

**Issue**: Phone number not provided or invalid format

**Solution**: Provide phone number in international format: `+1234567890`

#### 4. "Only admins can initiate subscription payments"

**Issue**: Non-admin user trying to create subscription

**Solution**: Only users with 'admin' role can manage subscriptions

#### 5. "Active subscription required"

**Issue**: Route is protected by subscription middleware

**Solution**: Subscribe to a paid plan to access the feature

### Logs

Check application logs for detailed information:

```bash
tail -f logs/combined.log | grep MaxiCash
```

### Support

For MaxiCash API issues:
- Email: info@maxicashapp.com
- Documentation: https://developer.maxicashapp.com/

## Security Notes

1. **Never expose credentials**: MaxiCash credentials are stored server-side only
2. **RLS enabled**: Subscription data is protected by Row Level Security
3. **Admin-only actions**: Payment initiation requires admin role
4. **HTTPS required**: Use HTTPS in production for secure communication
5. **Phone validation**: Phone numbers are validated before payment initiation

## Future Extensions

The system is designed to support:

- Automatic renewal processing (cron job needed)
- Prorated upgrades/downgrades
- Multiple payment methods
- Subscription discounts and coupons
- Trial periods
- Payment retry logic
- Webhook notifications from MaxiCash

## License

This integration is part of the Inventory Management System and follows the same license.
