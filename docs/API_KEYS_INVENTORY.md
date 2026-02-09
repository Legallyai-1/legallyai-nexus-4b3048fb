# API Keys Inventory

This document provides a comprehensive inventory of all API keys and environment variables used in the LegallyAI application.

## 📋 Current Active API Keys

### ✅ **Required - Currently Configured**

#### 1. Supabase (Backend & Database)
**Status:** ✅ ACTIVE - Keys present in `.env`

- **VITE_SUPABASE_URL**
  - Value: `https://wejiqqtwnhevcjdllodr.supabase.co`
  - Purpose: Supabase project URL for frontend
  - Location: `.env`, `.env.example`
  - Used in: Frontend components, edge function calls

- **VITE_SUPABASE_PUBLISHABLE_KEY** (Anon Key)
  - Value: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (full key in `.env`)
  - Purpose: Public/anonymous access key for Supabase client
  - Location: `.env`
  - Used in: `src/integrations/supabase/client.ts`

- **VITE_SUPABASE_PROJECT_ID**
  - Value: `wejiqqtwnhevcjdllodr`
  - Purpose: Supabase project reference ID
  - Location: `.env`, `.env.example`, `supabase/config.toml`
  - Used in: CI/CD, deployment configs

#### 2. Vercel AI Gateway (AI Features)
**Status:** ✅ ACTIVE - Key configured

- **VERCEL_AI_GATEWAY_KEY**
  - Value: `vck_YOUR_KEY_HERE` (stored securely in `.env`)
  - Purpose: Access to Anthropic Claude via Vercel AI Gateway
  - Location: `.env`, `.env.example`
  - Used in: `supabase/functions/legal-chat/index.ts`
  - Model: `anthropic/claude-sonnet-4.5`
  - Documentation: `docs/AI_SDK_INTEGRATION.md`

#### 3. Paypost/Global Payments (Payment Processing)
**Status:** 🔧 TO BE CONFIGURED - Ready for setup

- **PAYPOST_MERCHANT_ID**
  - Purpose: Merchant identification for Paypost account
  - Location: Supabase secrets (edge functions only)
  - Used in: `supabase/functions/paypost-checkout/index.ts`
  - Documentation: `docs/PAYPOST_INTEGRATION.md`

- **PAYPOST_API_KEY**
  - Purpose: API authentication key
  - Location: Supabase secrets (edge functions only)
  - Used in: `supabase/functions/paypost-checkout/index.ts`
  - Security: Never expose in frontend

- **PAYPOST_API_SECRET**
  - Purpose: API secret for authentication
  - Location: Supabase secrets (edge functions only)
  - Used in: `supabase/functions/paypost-checkout/index.ts`
  - Security: Never expose in frontend

- **PAYPOST_WEBHOOK_SECRET**
  - Purpose: Verify webhook signatures from Paypost
  - Location: Supabase secrets (edge functions only)
  - Used in: `supabase/functions/paypost-webhook/index.ts`
  - Security: Critical for webhook security

- **PAYPOST_ENVIRONMENT**
  - Value: `sandbox` or `production`
  - Purpose: Switch between test and live environments
  - Location: Supabase secrets (edge functions only)
  - Default: `sandbox`

**Benefits:**
- Real payment processing (vs demo mode)
- PCI-compliant hosted payment pages
- Automated subscription management
- Transaction fees: 2.9% + $0.30

---

### 🔒 **Auto-Injected by Supabase** (Edge Functions Only)

These are automatically provided by Supabase runtime to edge functions:

- **SUPABASE_URL** - Auto-injected in edge functions
- **SUPABASE_SERVICE_ROLE_KEY** - Auto-injected (admin privileges)
- **SUPABASE_ANON_KEY** - Auto-injected (public access)

**Used in:**
- `supabase/functions/predictive-ai/index.ts`
- `supabase/functions/plaid-integration/index.ts`
- `supabase/functions/legal-chat/index.ts`
- `supabase/functions/send-notification/index.ts`
- And other edge functions

---

## 🔴 **Optional/External Service API Keys**

### Referenced but NOT Required (Per `.env.example`)

These keys are referenced in code but marked as removed/optional:

#### 1. OpenAI API
- **OPENAI_API_KEY**
  - Status: ⚠️ OPTIONAL (for embeddings generation)
  - Used in:
    - `.github/workflows/generate-embeddings.yml`
    - `supabase/functions/search-docs/index.ts` (if implemented)
  - Purpose: Generate documentation embeddings for vector search
  - Documentation: `docs/VECTOR_SEARCH_EMBEDDINGS.md`
  - Note: Chat features use Vercel AI Gateway instead

#### 2. Stripe Payment Processing
- **STRIPE_SECRET_KEY**
  - Status: ❌ REMOVED (marked as "Using database")
  - Referenced in:
    - `supabase/functions/api-proxy/index.ts`
    - `supabase/functions/create-checkout/index.ts`
  - Purpose: Payment processing (migrated to database-only)

#### 3. Lovable (Development Platform)
- **LOVABLE_API_KEY**
  - Status: ❌ REMOVED (Lovable removed)
  - Referenced in:
    - `supabase/functions/legal-chat/index.ts`
  - Purpose: Previous development platform integration

#### 4. Court Records Integration
- **COURTLISTENER_TOKEN**
  - Status: ⚠️ OPTIONAL
  - Referenced in:
    - `supabase/functions/api-proxy/index.ts`
  - Purpose: CourtListener API for court records

#### 5. Plaid Banking Integration
- **PLAID_CLIENT_ID**
- **PLAID_SECRET**
  - Status: ⚠️ OPTIONAL
  - Referenced in:
    - `supabase/functions/plaid-integration/index.ts`
  - Purpose: Bank account verification and ACH transfers

#### 6. Job Search APIs
- **RAPIDAPI_KEY** - RapidAPI platform access
- **ADZUNA_APP_ID** - Adzuna job search
- **ADZUNA_API_KEY** - Adzuna authentication
- **CAREERJET_AFFILIATE_ID** - CareerJet affiliate ID
- **USAJOBS_API_KEY** - USAJobs.gov API
- **USAJOBS_EMAIL** - USAJobs contact email
  - Status: ⚠️ OPTIONAL
  - Referenced in:
    - `supabase/functions/job-search/index.ts`
  - Purpose: Job board integrations for legal jobs feature

#### 7. Email Service
- **RESEND_API_KEY**
  - Status: ⚠️ OPTIONAL
  - Referenced in:
    - `supabase/functions/send-notification/index.ts`
  - Purpose: Transactional email notifications

#### 8. Court Records Access
- **PACER_TOKEN**
  - Status: ⚠️ OPTIONAL
  - Referenced in:
    - Various court record functions
  - Purpose: PACER court records system access

---

## 🏗️ **CI/CD & Deployment Keys**

### GitHub Actions Secrets

#### Required for Deployment:
- **SUPABASE_ACCESS_TOKEN**
  - Purpose: Deploy edge functions and migrations
  - Used in: `.github/workflows/supabase-deploy.yml`

#### Required for Frontend Build:
- **VITE_SUPABASE_PROJECT_ID**
- **VITE_SUPABASE_PUBLISHABLE_KEY**
- **VITE_SUPABASE_URL**
  - Purpose: Build frontend with Supabase connection
  - Used in: `.github/workflows/android-build.yml`

#### Optional for Android Signing:
- **ANDROID_KEYSTORE_BASE64** - Keystore file (base64 encoded)
- **ANDROID_KEYSTORE_PASSWORD** - Keystore password
- **ANDROID_KEY_ALIAS** - Key alias name
- **ANDROID_KEY_ALIAS_PASSWORD** - Key password
  - Purpose: Sign release APK
  - Used in: `.github/workflows/android-build.yml`

---

## 📱 **Monetization API Keys** (To Be Configured)

### Google AdSense (Web Ads)
**Status:** 🔧 NOT YET CONFIGURED

Per `docs/MONETIZATION.md`, these need to be set up:
- Publisher ID: Format `pub-XXXXXXXXXXXXXXXX`
- Ad unit slot IDs
- Location: Should be added to ad components

### Google AdMob (Mobile Ads)
**Status:** 🔧 NOT YET CONFIGURED

Per `android/app/src/main/AndroidManifest.xml`:
- App ID: Currently placeholder `ca-app-pub-4991947741196600~XXXXXXXXXX`
- Ad unit IDs: Need to be configured in components

---

## 📊 **Summary by Category**

### ✅ Currently Active (4)
1. VITE_SUPABASE_URL ✓
2. VITE_SUPABASE_PUBLISHABLE_KEY ✓
3. VITE_SUPABASE_PROJECT_ID ✓
4. VERCEL_AI_GATEWAY_KEY ✓ **NEW**

### 🔒 Auto-Provided (3)
1. SUPABASE_URL (edge functions)
2. SUPABASE_SERVICE_ROLE_KEY (edge functions)
3. SUPABASE_ANON_KEY (edge functions)

### ❌ Removed/Deprecated (3)
1. LOVABLE_API_KEY
2. OPENAI_API_KEY (replaced by Vercel AI Gateway)
3. STRIPE_SECRET_KEY

### ⚠️ Optional/External (11)
1. COURTLISTENER_TOKEN
2. PLAID_CLIENT_ID
3. PLAID_SECRET
4. RAPIDAPI_KEY
5. ADZUNA_APP_ID
6. ADZUNA_API_KEY
7. CAREERJET_AFFILIATE_ID
8. USAJOBS_API_KEY
9. USAJOBS_EMAIL
10. RESEND_API_KEY
11. PACER_TOKEN

### 🔧 To Be Configured (2)
1. Google AdSense credentials
2. Google AdMob credentials

---

## 🔐 **Security Notes**

1. **Public Keys:** Only `VITE_SUPABASE_PUBLISHABLE_KEY` is safe to expose publicly (it's an anonymous/public key)

2. **Never Commit:**
   - Service role keys
   - Secret keys for external APIs
   - Production credentials

3. **Environment Files:**
   - `.env` is in `.gitignore` (contains real keys)
   - `.env.example` is committed (contains placeholders)

4. **Edge Functions:**
   - Secret keys should only be used in Supabase edge functions (server-side)
   - Never import secret keys into frontend code

---

## 📝 **Where Keys Are Used**

### Frontend (Public Keys Only)
```
src/integrations/supabase/client.ts
├── VITE_SUPABASE_URL
└── VITE_SUPABASE_PUBLISHABLE_KEY

src/pages/ChatPage.tsx
└── VITE_SUPABASE_URL (for edge function calls)

src/components/business/*.tsx
└── VITE_SUPABASE_URL (for edge function calls)
```

### Backend (Edge Functions - Secret Keys)
```
supabase/functions/
├── legal-chat/ → OPENAI_API_KEY, LOVABLE_API_KEY
├── api-proxy/ → OPENAI_API_KEY, STRIPE_SECRET_KEY, COURTLISTENER_TOKEN
├── plaid-integration/ → PLAID_CLIENT_ID, PLAID_SECRET
├── job-search/ → RAPIDAPI_KEY, ADZUNA_*, CAREERJET_*, USAJOBS_*
├── send-notification/ → RESEND_API_KEY
└── All functions → SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY (auto-injected)
```

### CI/CD
```
.github/workflows/
├── android-build.yml → VITE_SUPABASE_*, ANDROID_KEYSTORE_*
└── supabase-deploy.yml → SUPABASE_ACCESS_TOKEN, VITE_SUPABASE_PROJECT_ID
```

---

## 🚀 **Quick Reference: What You Have**

Based on the actual `.env` file in the repository:

```env
# ✅ CONFIGURED AND ACTIVE
VITE_SUPABASE_PROJECT_ID="wejiqqtwnhevcjdllodr"
VITE_SUPABASE_PUBLISHABLE_KEY="eyJhbGc..." (full key present)
VITE_SUPABASE_URL="https://wejiqqtwnhevcjdllodr.supabase.co"

# ❌ NOT CONFIGURED (Optional)
# All other keys listed above are either:
# - Auto-injected by Supabase (edge functions)
# - Optional for extended features
# - Marked as removed in .env.example
```

---

## 📖 **Related Documentation**

- Setup guide: `docs/SUPABASE_SETUP.md`
- Monetization: `docs/MONETIZATION.md`
- API reference: `docs/API.md`
- Main README: `README.md`

---

**Last Updated:** 2026-02-09  
**Repository:** Legallyai-1/legallyai-nexus-4b3048fb
