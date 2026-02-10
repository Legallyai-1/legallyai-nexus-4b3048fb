# Bank Integration Guide

This guide covers setting up bank payouts for user earnings.

## Overview

LegallyAI supports bank payouts for:
- Ad revenue earnings
- Referral commissions
- Affiliate payments
- Creator rewards

---

## Database Schema

Payouts are stored in the `payout_requests` table:

```sql
CREATE TABLE payout_requests (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id uuid REFERENCES auth.users(id),
  amount numeric NOT NULL,
  status text DEFAULT 'pending',
  bank_account_info jsonb,
  created_at timestamp DEFAULT now(),
  processed_at timestamp,
  transaction_id text
);
```

---

## Integration Options

### Option 1: Manual Processing (Default)

1. User requests payout
2. Admin receives notification
3. Admin processes via bank transfer
4. Admin marks as complete

**Pros:** Simple, no integration needed  
**Cons:** Manual work, slower processing

### Option 2: Stripe Connect

```typescript
// Install Stripe
npm install stripe

// Initialize in edge function
import Stripe from 'stripe';
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// Create payout
const payout = await stripe.transfers.create({
  amount: 10000, // $100.00
  currency: 'usd',
  destination: userStripeAccountId,
});
```

### Option 3: PayPal Payouts API

```typescript
// Install PayPal SDK
npm install @paypal/payouts-sdk

// Create payout
const payout = await paypal.payouts.create({
  sender_batch_header: {
    email_subject: 'You have a payout!',
  },
  items: [{
    recipient_type: 'EMAIL',
    amount: { value: '100.00', currency: 'USD' },
    receiver: userEmail,
  }],
});
```

### Option 4: Plaid + Dwolla

For ACH transfers:

1. Use Plaid for bank verification
2. Use Dwolla for ACH transfers
3. Fully automated payouts

---

## User Flow

### 1. Check Balance

```typescript
const { data: credits } = await supabase
  .from('user_credits')
  .select('balance')
  .eq('user_id', userId)
  .single();

const balance = credits.balance / 100; // Convert cents to dollars
```

### 2. Request Payout

```typescript
const { data, error } = await supabase.functions.invoke('request-payout', {
  body: {
    amount: balance,
    bank_account: {
      account_number: '****1234',
      routing_number: '110000000',
      account_holder: 'John Doe',
    },
  },
});
```

### 3. Process Payout

Admin dashboard or automated:

```typescript
const { data, error } = await supabase.functions.invoke('process-payout', {
  body: {
    payout_id: payoutId,
    transaction_id: 'bank_txn_123',
  },
});
```

---

## Security

### Bank Account Encryption

```typescript
import { createCipheriv, createDecipheriv } from 'crypto';

function encryptBankInfo(info: BankAccount) {
  const cipher = createCipheriv('aes-256-gcm', key, iv);
  return cipher.update(JSON.stringify(info), 'utf8', 'hex');
}
```

### Verification

- Micro-deposit verification
- Plaid instant verification
- Manual verification by admin

---

## Compliance

### Requirements

- [ ] KYC (Know Your Customer) verification
- [ ] Tax information (W-9 for US)
- [ ] Anti-money laundering checks
- [ ] Transaction limits

### Tax Reporting

For US users earning > $600/year:
- Issue 1099 forms
- Report to IRS
- Collect W-9 information

---

## Minimum Thresholds

```typescript
const PAYOUT_MINIMUMS = {
  USD: 100, // $100
  EUR: 100, // €100
  GBP: 75,  // £75
};
```

---

## Testing

### Test Payouts

Use test bank accounts:
```
Account: 000123456789
Routing: 110000000
```

### Verify Flow

1. Create test user
2. Add test earnings
3. Request payout
4. Verify database updates
5. Check admin notifications

---

## Monitoring

Track:
- Pending payouts
- Failed transactions
- Average processing time
- Fraud attempts

---

**Related:** [Monetization Guide](./MONETIZATION.md)
