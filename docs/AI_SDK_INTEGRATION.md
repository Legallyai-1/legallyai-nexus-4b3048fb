# Vercel AI SDK Integration with Anthropic Claude

This document explains the integration of Vercel AI SDK with Anthropic's Claude Sonnet 4.5 model via Vercel AI Gateway.

## Overview

The LegallyAI chat feature now uses:
- **Vercel AI SDK** (`ai` package) - For streamlined AI interactions
- **Anthropic Claude Sonnet 4.5** - Advanced language model via `@ai-sdk/anthropic`
- **Vercel AI Gateway** - For secure API key management and routing

## Configuration

### Environment Variables

Add to your `.env` file:

```env
VERCEL_AI_GATEWAY_KEY=vck_YOUR_ACTUAL_KEY_HERE
```

This key is automatically used in Supabase Edge Functions.

### Model Configuration

The integration uses:
- **Model**: `anthropic/claude-sonnet-4.5` (via Vercel AI Gateway)
- **Provider**: Anthropic via AI SDK
- **Gateway**: Vercel AI Gateway
- **Streaming**: Enabled by default

## Implementation

### Edge Function (Supabase)

Located at: `supabase/functions/legal-chat/index.ts`

```typescript
import { streamText } from "npm:ai@3.4.33";
import { createAnthropic } from "npm:@ai-sdk/anthropic@1.0.2";

// Initialize Anthropic provider
const anthropic = createAnthropic({
  apiKey: Deno.env.get("VERCEL_AI_GATEWAY_KEY"),
  baseURL: 'https://gateway.ai.cloudflare.com/v1/vercel',
});

// Stream text with Claude
const result = await streamText({
  model: anthropic('claude-sonnet-4.5'),
  system: systemPrompt,
  messages: formattedMessages,
});
```

### Frontend (React)

The `ChatPage` component handles streaming responses:

```typescript
const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/legal-chat`;

// Send message with streaming enabled
const response = await fetch(CHAT_URL, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${session?.access_token}`,
  },
  body: JSON.stringify({
    messages: conversationMessages,
    stream: true, // Enable streaming
  }),
});
```

## Features

### 1. Streaming Responses

Real-time token-by-token streaming for better UX:
- Immediate feedback to users
- Progressive content display
- Lower perceived latency

### 2. Security

- Prompt injection protection
- Message validation
- Content length limits
- Rate limiting ready

### 3. Error Handling

Graceful fallbacks when AI service unavailable:
- Informative error messages
- Guidance to alternative features
- No service disruption

## Usage Example

```typescript
import { streamText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';

const anthropic = createAnthropic({
  apiKey: process.env.VERCEL_AI_GATEWAY_KEY!,
});

const result = await streamText({
  model: anthropic('claude-sonnet-4-20250514'),
  prompt: 'Why is the sky blue?'
});

// Stream the response
for await (const chunk of result.textStream) {
  process.stdout.write(chunk);
}
```

## Dependencies

Added to `package.json`:

```json
{
  "dependencies": {
    "ai": "^3.4.33",
    "@ai-sdk/anthropic": "^1.0.2"
  }
}
```

## Deployment

### Supabase Edge Functions

Set the environment variable in Supabase:

```bash
# Via Supabase CLI
supabase secrets set VERCEL_AI_GATEWAY_KEY=vck_...

# Or via Supabase Dashboard
# Settings → Edge Functions → Environment Variables
```

### Vercel (Frontend)

The frontend doesn't need the API key - it's only used server-side in edge functions.

## Benefits

1. **Better Performance**: Claude Sonnet 4.5 offers superior reasoning
2. **Cost Efficiency**: Vercel AI Gateway optimizes API calls
3. **Streaming**: Real-time responses improve UX
4. **Type Safety**: AI SDK provides full TypeScript support
5. **Unified Interface**: Consistent API across different AI providers

## Migration Notes

### From Previous Implementation

**Before:**
- Direct API calls to OpenAI/Lovable
- Manual streaming implementation
- Complex error handling

**After:**
- Vercel AI SDK abstraction
- Built-in streaming support
- Standardized error handling

### Breaking Changes

None - the API interface remains the same for frontend clients.

## Monitoring

Monitor usage in:
- Vercel AI Gateway Dashboard
- Supabase Edge Function Logs
- Application metrics

## Troubleshooting

### API Key Not Working

1. Verify key in `.env` and Supabase secrets
2. Check Vercel AI Gateway dashboard
3. Ensure edge function has access to environment variable

### Streaming Not Working

1. Verify `stream: true` in request body
2. Check CORS headers
3. Monitor edge function logs

### Model Not Found

Ensure using correct model identifier:
- `claude-sonnet-4.5` (Vercel AI Gateway format)
- Not `claude-sonnet-4-20250514` (direct Anthropic API format)

## Resources

- [Vercel AI SDK Docs](https://sdk.vercel.ai/docs)
- [Anthropic Claude Docs](https://docs.anthropic.com/)
- [Vercel AI Gateway](https://vercel.com/docs/ai-gateway)
- [Supabase Edge Functions](https://supabase.com/docs/guides/functions)

---

**Last Updated:** 2026-02-09  
**Model:** Claude Sonnet 4.5 (`anthropic/claude-sonnet-4.5`)  
**Gateway:** Vercel AI Gateway
