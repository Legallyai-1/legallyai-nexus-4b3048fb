# Vercel AI Gateway Setup

## Environment Configuration

The application uses Vercel AI Gateway to access Anthropic's Claude Sonnet 4.5 model.

### Local Development

1. Copy the environment template:
```bash
cp .env.example .env
```

2. Add your Vercel AI Gateway API key to `.env`:
```env
VERCEL_AI_GATEWAY_KEY=your_key_here
```

**Note:** The `.env` file is gitignored and will never be committed.

### Production Deployment (Supabase)

Configure the API key as a secret in Supabase:

**Via Supabase CLI:**
```bash
supabase secrets set VERCEL_AI_GATEWAY_KEY=your_key_here
```

**Via Supabase Dashboard:**
1. Go to your project dashboard
2. Navigate to: Settings → Edge Functions → Environment Variables
3. Click "Add new secret"
4. Name: `VERCEL_AI_GATEWAY_KEY`
5. Value: Your Vercel AI Gateway API key
6. Save

### Deploy Edge Function

```bash
supabase functions deploy legal-chat
```

## Model Configuration

The integration uses:
- **Model:** `anthropic/claude-sonnet-4.5`
- **Provider:** Anthropic via Vercel AI SDK
- **Streaming:** Enabled by default

## Verification

Test the integration:

```bash
# Test locally
npm run dev

# Or test the deployed function
curl -X POST \
  "${SUPABASE_URL}/functions/v1/legal-chat" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${SUPABASE_ANON_KEY}" \
  -d '{
    "messages": [{"role": "user", "content": "What is contract law?"}],
    "stream": false
  }'
```

## Security

- API key is ONLY used server-side in Supabase Edge Functions
- Frontend never has access to this key
- Key stored as environment variable, never in code
- `.env` file is gitignored

## Documentation

- Full integration guide: `docs/AI_SDK_INTEGRATION.md`
- API keys inventory: `docs/API_KEYS_INVENTORY.md`

## Troubleshooting

**Function errors:**
1. Check edge function logs in Supabase dashboard
2. Verify API key is set correctly
3. Ensure model identifier is: `claude-sonnet-4.5`

**Build errors:**
1. Verify packages are installed: `npm install`
2. Check `ai` and `@ai-sdk/anthropic` are in package.json
