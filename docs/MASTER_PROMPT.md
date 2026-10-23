# LegallyAI Master Prompt (for every agent working on this product)

You are finishing and optimizing LegallyAI (www.legallyai.ai): a legal-information web app and law-firm workspace
whose in-house AI is **Lee**. Every hub assistant (CustodiAI, MaryAI, DefendrAI, Freedom AI, WorkAI, ProBonoAI,
PraxisAI, ServeAI) is Lee with a different name and face. There are **live paying customers**. Work autonomously,
verify everything against production, and never leave the site broken.

## Non-negotiables
1. **Never break production.** Branch → tests → PR → merge → deploy → re-test live. If a live test fails, fix or roll
   back (`vercel rollback`) immediately.
2. **No API keys in chat or code.** Secrets live only in Supabase → Edge Functions → Secrets (names: `GEMINI_API_KEY`
   or "Gemini API Key", `ANTHROPIC_API_KEY`, optional `GROQ_API_KEY` / `OPENROUTER_API_KEY`). Never print values.
3. **Minimal spend.** Prefer code and fetch checks over browser sessions; one image generation per asset; no subagents.
4. **Ultramodern design** everywhere (dark navy, neon cyan, legal gold, glass cards). Mobile first: nothing may
   overflow the viewport at 360–412 px; test with the Pixel 7 profile before shipping.
5. **Lee must behave like a top AI assistant:** plain English, state-aware, official links in every answer, research
   links (Google / YouTube / court sites), honest about limits, never fabricates statutes. Legal information, not advice.

## Architecture (where things live)
- Frontend: Vite + React + Tailwind, `src/`. Routes in `src/components/AnimatedRoutes.tsx`. Chat hook `src/hooks/useAIChat.ts`.
- Backend: Supabase project `whdljtbtqisoszbrzdwq`. Edge function `supabase/functions/legal-chat` (+ `_shared/*`).
  Engines in order: paid (Anthropic, subscribers) → Gemini (`_shared/gemini.ts`, models `gemini-3.5-flash-lite`,
  `gemini-3.8-flash`) → optional free providers → built-in guide (`_shared/legal-knowledge.ts`, 21 topics,
  51-state court directory, embeddings in `_shared/legal-topic-embeddings.ts`).
- Gating: 5 free questions per user/IP (`_shared/free-question-gate.ts`, RPC `consume_free_question`, 402 →
  `FreeLimitDialog`). Developer API: `x-api-key` header, keys from `create_api_key` (requires subscription/trial).
- Data: `cases` (user_id, organization_id, next_deadline), `appointments`, `ai_chat_history` (one row per chat session,
  RLS: owner only), `api_keys`, `subscriptions` (tiers: free, premium, pro, enterprise, document).
- Deploy: Vercel project `legallyai-nexus-4b3048fb` (`vercel deploy --prod --yes --build-env VITE_ENABLE_PAYMENTS=true`).
  Edge function deploy: Supabase MCP `deploy_edge_function` with files `legal-chat/index.ts` + all `_shared/*`.
  GitHub Actions are locked (billing) → deploy manually after each merge.

## Definition of done (check every item live, signed out and signed in)
- [ ] Every route in `AnimatedRoutes.tsx` renders with 0 console errors and 0 failed Supabase requests.
- [x] Mobile: `document.documentElement.scrollWidth === innerWidth` on /, /chat, /pricing, /custody (verified Oct 22 2026).
- [x] Chat: answer streams, markdown renders, "Save to case file" works, History drawer lists and resumes sessions,
      6th free question shows the trial dialog, Gemini engine reported (`engine: gemini:gemini-3.5-flash-lite`). Verified live.
- [ ] Dashboard: Ask Lee panel hands off to /chat?q=, stats load, cases/appointments/invoices/messages CRUD works.
- [ ] Settings → Developer API: non-subscriber blocked, trial/subscriber can create, key works, revoked key → 401.
- [ ] Payments: Stripe checkout links resolve; pricing copy matches the 5-free → 7-day trial → monthly/annual model.
- [x] Ads: AdSense script loads once, publisher id present, `/ads.txt` 200, slot requests reach Google (verified Oct 22 2026).
      Google currently answers with an empty ad (unfilled) → approval/inventory is pending on Google's side; check AdSense → Sites.
- [ ] `node --test scripts/*.test.mjs`, `npx tsc -p tsconfig.app.json --noEmit`, `npx eslint .` (0 errors),
      `npm run build`, `deno check supabase/functions/legal-chat/index.ts` all pass.

## Working loop for each task
1. Read this file and `git log -20`. Pick the highest-value unchecked item above.
2. Make the smallest change that completes it. Add or update a test under `scripts/` when logic changes.
3. Run the five checks. Open a PR with a one-paragraph summary of user-visible effects. Merge, deploy, re-test live.
4. Clean up any test data you created (QA user id `a6d92b5c-63fa-4154-84bf-c9502b8cade4`).
5. Update the checklist above and `docs/README` notes. Do not stop while unchecked items remain.

## Backlog (in priority order)
1. ~~Hub pages show their persona name + Lee mascot~~ (done: `HubAssistant` uses `src/lib/leePersonas.ts`, mascot, Save to case file).
2. ~~Cases page: next-deadline + "Saved from Lee chat" badge~~ (done). Appointments: email/SMS deadline reminders still open.
3. Gemini Search grounding needs a billed Google AI project (free tier returns 429); until then Lee appends its own
   research links. When billing is enabled, grounding turns on automatically.
4. Ezoic / alternative ad network fallback if AdSense is not approved (payouts go to bank, not Stripe).
5. Marketing: lawyer landing page (/for-law-firms) with firm workflow proof, testimonials, demo CTA.
