# SUPABASE CLI COMMANDS - COPY & PASTE

## STEP 1: Setup (Do once)

```bash
supabase link --project-ref wejiqqtwnhevcjdllodr
```

## STEP 2: Deploy AI Function

```bash
supabase functions deploy legal-chat
```

## STEP 3: Set API Key

```bash
supabase secrets set ANTHROPIC_API_KEY=sk_ant_YOUR_KEY_HERE
```

Replace `sk_ant_YOUR_KEY_HERE` with your actual Anthropic API key.

## STEP 4: View Logs

```bash
supabase functions logs legal-chat
```

## STEP 5: Deploy Everything

```bash
supabase deploy
```

## RESULT
✅ AI chat working
✅ Functions deployed
✅ Ready for production
