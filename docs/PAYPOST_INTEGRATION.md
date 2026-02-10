# Paypost Payment Gateway Integration

This guide explains how to integrate Paypost (Global Payments) as a payment gateway for the LegallyAI platform.

## Overview

Paypost is a payment method within the Global Payments ecosystem that provides secure, PCI-compliant payment processing. This integration supports:

- ✅ One-time payments (per-document purchases)
- ✅ Recurring subscriptions (Premium/Pro plans)
- ✅ Secure payment processing
- ✅ Webhook notifications
- ✅ Transaction history

## Prerequisites

1. **Paypost/Global Payments Account**
   - Sign up at [Global Payments](https://developer.globalpayments.com/)
   - Complete merchant verification
   - Obtain API credentials

2. **Required Credentials**
   - Merchant ID
   - API Key
   - API Secret
   - Webhook Secret (for payment notifications)

## Integration Methods

### Method 1: Hosted Payment Page (HPP) - Recommended

**Pros:**
- PCI compliance handled by Paypost
- Quick integration
- Lower security burden
- Mobile-responsive

**Cons:**
- Less customization
- Redirects user away from site

**Implementation:**
See `supabase/functions/paypost-checkout/index.ts`

### Method 2: Direct API Integration

**Pros:**
- Full control over UX
- No redirects
- Custom branding

**Cons:**
- PCI compliance requirements
- More complex implementation
- Higher security responsibility

## Setup Instructions

### 1. Configure Environment Variables

Add to your Supabase edge function secrets:

```bash
# Paypost/Global Payments Credentials
supabase secrets set PAYPOST_MERCHANT_ID=your_merchant_id
supabase secrets set PAYPOST_API_KEY=your_api_key
supabase secrets set PAYPOST_API_SECRET=your_api_secret
supabase secrets set PAYPOST_WEBHOOK_SECRET=your_webhook_secret

# Environment (sandbox or production)
supabase secrets set PAYPOST_ENVIRONMENT=sandbox
```

Add to `.env.example` for frontend:

```env
# Paypost Configuration (Optional - only if using client-side integration)
VITE_PAYPOST_MERCHANT_ID=your_merchant_id_here
VITE_PAYPOST_ENVIRONMENT=sandbox
```

### 2. Deploy Edge Functions

```bash
# Deploy Paypost checkout function
supabase functions deploy paypost-checkout

# Deploy webhook handler
supabase functions deploy paypost-webhook
```

### 3. Configure Webhooks

1. Log in to Global Payments Dashboard
2. Navigate to Webhooks/Notifications
3. Add webhook URL:
   ```
   https://your-project.supabase.co/functions/v1/paypost-webhook
   ```
4. Select events:
   - payment.succeeded
   - payment.failed
   - subscription.created
   - subscription.canceled
5. Copy webhook secret to Supabase secrets

### 4. Update Frontend Code

The `PricingPage.tsx` has been updated to support Paypost. To enable:

1. Set `PAYMENT_PROVIDER` in frontend config:
   ```typescript
   // src/config/payments.ts
   export const PAYMENT_PROVIDER = 'paypost'; // or 'stripe' or 'database'
   ```

2. Payment flow automatically uses Paypost when configured

## Payment Flow

### One-Time Payments (Per-Document)

1. User clicks "Buy Document" on pricing page
2. Frontend calls `paypost-checkout` edge function
3. Edge function creates payment session with Paypost
4. User redirected to Paypost HPP
5. User completes payment
6. Paypost sends webhook to `paypost-webhook`
7. Webhook updates database (payment_transactions table)
8. User redirected back to success page

### Subscription Payments

1. User clicks "Subscribe" on pricing page
2. Frontend calls `paypost-checkout` edge function with `mode: 'subscription'`
3. Edge function creates subscription with Paypost
4. User redirected to Paypost HPP
5. User completes payment setup
6. Paypost sends webhook for `subscription.created`
7. Webhook updates database (user_subscriptions table)
8. User redirected back to dashboard

## Database Schema

### payment_transactions

```sql
CREATE TABLE payment_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  provider TEXT NOT NULL, -- 'paypost', 'stripe', etc.
  provider_transaction_id TEXT UNIQUE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  currency TEXT DEFAULT 'USD',
  status TEXT NOT NULL, -- 'pending', 'completed', 'failed', 'refunded'
  payment_type TEXT NOT NULL, -- 'one_time', 'subscription'
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### user_subscriptions

```sql
CREATE TABLE user_subscriptions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  provider TEXT NOT NULL, -- 'paypost', 'stripe', etc.
  provider_subscription_id TEXT UNIQUE NOT NULL,
  tier TEXT NOT NULL, -- 'premium', 'pro'
  status TEXT NOT NULL, -- 'active', 'canceled', 'past_due'
  current_period_start TIMESTAMPTZ,
  current_period_end TIMESTAMPTZ,
  cancel_at_period_end BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## API Reference

### POST /functions/v1/paypost-checkout

Create a payment session.

**Request:**
```json
{
  "amount": 9.99,
  "currency": "USD",
  "mode": "payment", // or "subscription"
  "tier": "premium", // for subscriptions
  "success_url": "https://yourapp.com/success",
  "cancel_url": "https://yourapp.com/cancel"
}
```

**Response:**
```json
{
  "session_id": "sess_xxxxx",
  "checkout_url": "https://hpp.globalpayments.com/pay/xxxxx",
  "status": "created"
}
```

### POST /functions/v1/paypost-webhook

Webhook endpoint for payment notifications.

**Headers:**
```
X-Paypost-Signature: sha256=xxxxx
```

**Body:** (varies by event type)

## Testing

### Test Cards (Sandbox)

```
Success: 4111111111111111
Decline: 4000000000000002
Insufficient Funds: 4000000000009995
CVV: Any 3 digits
Expiry: Any future date
```

### Test Workflow

1. Switch to sandbox environment:
   ```bash
   supabase secrets set PAYPOST_ENVIRONMENT=sandbox
   ```

2. Use test merchant credentials

3. Test payment flow with test cards

4. Verify:
   - Payment recorded in database
   - Webhook received and processed
   - User granted access

5. Check logs:
   ```bash
   supabase functions logs paypost-checkout
   supabase functions logs paypost-webhook
   ```

## Security Best Practices

1. **Never expose API secrets in frontend code**
   - Always use edge functions for sensitive operations
   - Only public merchant ID can be in frontend

2. **Verify webhook signatures**
   - Always validate `X-Paypost-Signature` header
   - Prevent replay attacks

3. **Use HTTPS everywhere**
   - Required for PCI compliance
   - Enforced by Supabase by default

4. **Sanitize user input**
   - Validate amounts
   - Check for injection attacks
   - Use parameterized queries

5. **Store minimal payment data**
   - Never store full card numbers
   - Only store transaction IDs
   - Use tokens for recurring payments

## Troubleshooting

### Payment fails immediately

**Cause:** Invalid API credentials
**Solution:** Verify credentials in Supabase secrets

### Webhook not received

**Cause:** Incorrect webhook URL or signature verification failed
**Solution:** 
- Check webhook URL in Global Payments dashboard
- Verify webhook secret matches
- Check function logs for errors

### User not granted access after payment

**Cause:** Webhook processing failed
**Solution:**
- Check `paypost-webhook` function logs
- Verify database permissions
- Manually update user subscription if needed

### Test payments work but production fails

**Cause:** Using sandbox credentials in production
**Solution:**
- Switch to production credentials
- Set `PAYPOST_ENVIRONMENT=production`

## Migration from Stripe

If you're currently using Stripe and want to migrate:

1. **Phase 1: Parallel Running**
   - Keep Stripe active
   - Add Paypost support
   - Let users choose payment method

2. **Phase 2: Data Migration**
   - Export Stripe customer data
   - Import into Paypost (if needed)
   - Map subscription IDs

3. **Phase 3: Switchover**
   - Set Paypost as default
   - Handle existing Stripe subscriptions
   - Update documentation

## Cost Comparison

| Provider | Transaction Fee | Monthly Fee | Setup Fee |
|----------|----------------|-------------|-----------|
| Paypost  | 2.9% + $0.30   | $0          | $0        |
| Stripe   | 2.9% + $0.30   | $0          | $0        |

**Note:** Actual rates may vary based on your merchant agreement.

## Support

- **Paypost Support:** [Global Payments Support](https://developer.globalpayments.com/support)
- **Integration Help:** Create issue in repository
- **Emergency:** Contact Global Payments 24/7 support

## References

- [Global Payments Developer Docs](https://developer.globalpayments.com/)
- [Paypost Payment Method Guide](https://developer.globalpayments.com/docs/payments/payment-methods/supported-payment-methods/paypost)
- [HPP Integration Guide](https://developer.globalpayments.com/docs/hpp)
- [Webhook Documentation](https://developer.globalpayments.com/docs/webhooks)

---

**Last Updated:** February 2026
**Integration Status:** Ready for Production
**Tested Environments:** Sandbox ✅ | Production ✅
