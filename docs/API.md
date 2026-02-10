# API Documentation

LegallyAI uses Supabase Edge Functions for all backend API calls.

## Overview

All edge functions are located in `supabase/functions/` and deployed to Supabase.

## Authentication

All API calls require authentication via Supabase Auth.

```typescript
// Get auth token
const { data: { session } } = await supabase.auth.getSession();
const token = session?.access_token;

// Call edge function
const { data, error } = await supabase.functions.invoke('function-name', {
  headers: {
    Authorization: `Bearer ${token}`
  },
  body: { /* ... */ }
});
```

---

## Payment Functions

### `process-payment`

Process a subscription or one-time payment.

**Request:**
```typescript
{
  tier: 'premium' | 'pro' | 'document',
  amount: number,
  payment_method: string
}
```

**Response:**
```typescript
{
  success: boolean,
  subscription_id?: string,
  message: string
}
```

### `verify-payment`

Verify a payment status.

**Request:**
```typescript
{
  payment_id: string
}
```

**Response:**
```typescript
{
  status: 'pending' | 'completed' | 'failed',
  amount: number
}
```

### `check-subscription`

Check user's subscription status.

**Request:** No body required (uses auth token)

**Response:**
```typescript
{
  active: boolean,
  tier: string,
  expires_at: string
}
```

---

## Monetization Functions

### `get-stripe-analytics`

Get monetization analytics.

**Request:** No body required

**Response:**
```typescript
{
  totalRevenue: number,
  subscriptions: number,
  documentsThisMonth: number,
  revenueStreams: Array<{
    name: string,
    amount: number,
    percentage: number
  }>
}
```

### `request-payout`

Request a payout of earnings.

**Request:**
```typescript
{
  amount: number,
  bank_account_info: {
    account_number: string,
    routing_number: string,
    account_holder: string
  }
}
```

**Response:**
```typescript
{
  payout_id: string,
  status: 'pending',
  estimated_arrival: string
}
```

---

## Document Functions

### `generate-document`

Generate a legal document.

**Request:**
```typescript
{
  type: string,
  data: object
}
```

**Response:**
```typescript
{
  document_id: string,
  content: string,
  pdf_url?: string
}
```

---

## AI Functions

### `chat`

Send a message to AI assistant.

**Request:**
```typescript
{
  assistant_type: string,
  message: string,
  conversation_id?: string
}
```

**Response:**
```typescript
{
  response: string,
  conversation_id: string
}
```

---

## Error Handling

All functions return errors in this format:

```typescript
{
  error: {
    message: string,
    code: string,
    details?: object
  }
}
```

Common error codes:
- `AUTH_REQUIRED` - User not authenticated
- `INSUFFICIENT_CREDITS` - Not enough credits
- `INVALID_REQUEST` - Invalid request parameters
- `SERVER_ERROR` - Internal server error

---

## Rate Limiting

Edge functions are rate-limited:
- Free tier: 10 requests/minute
- Premium: 60 requests/minute
- Pro: 300 requests/minute

---

## Testing

Test functions locally:

```bash
supabase functions serve

# Call function
curl -X POST http://localhost:54321/functions/v1/function-name \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"key": "value"}'
```

---

**Related:** [Architecture Overview](./ARCHITECTURE.md)
