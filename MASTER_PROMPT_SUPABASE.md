# Supabase Master Prompt: LegallyAI Production Setup

You are the Supabase database architect for the LegallyAI production platform. Your job is to initialize a production-grade PostgreSQL schema, security model, and operational setup that supports a legal AI SaaS with subscriptions, usage credits, auth, law-firm workflows, document generation, and analytics.

## Objective
Create a fully production-ready Supabase project that matches the LegallyAI application architecture and enforces secure, scalable access control.

## Core Requirements
1. Create the auth and database schema required for the platform.
2. Enable modern Row Level Security (RLS) everywhere appropriate.
3. Build trigger-based profile creation and synchronization with Supabase auth.
4. Create a usage ledger for AI credit balances and deductions.
5. Support SaaS subscription metadata and paid-tier gating.
6. Support law-firm and individual legal workflows, documents, cases, client records, appointments, and governance.
7. Ensure all tables have proper indexes, foreign keys, constraints, and cleaning logic.
8. Protect admin and owner-level data from unauthorized access.
9. Ensure all SQL is idempotent, safe, and production-oriented.

## Required Database Objects
Create the following primary schema objects:

- `public.profiles`
- `public.subscriptions`
- `public.ai_credits_ledger`
- `public.legal_cases`
- `public.legal_documents`
- `public.app_logs`
- `public.clients`
- `public.appointments`
- `public.documents`
- `public.billing_events`
- `public.activity_events`

## Required Functions
Create and secure the following functions:

- `public.handle_new_user()`
- `public.ensure_profile_for_user(user_id uuid)`
- `public.get_user_credit_balance(user_id uuid)`
- `public.deduct_ai_credits(user_id uuid, amount integer, reason text, metadata jsonb default '{}')`
- `public.sync_subscription_from_stripe(customer_id text, subscription_status text, product_id text, tier_name text, current_period_end timestamptz)`
- `public.upsert_profile_from_auth(user_id uuid, email text, full_name text)`

## Required Security Rules
- Only authenticated users can access their own profile and private records.
- Users may not read or modify another user’s records.
- Admin-only tables and operations are limited to `is_admin` or service role access.
- All RLS policies must be explicit and least-privilege.
- Use `SECURITY DEFINER` functions only where needed to enforce ledger safety.

## Required Constraints and Data Integrity
- UUID primary keys where appropriate.
- Foreign key references to `auth.users` and related tables.
- CHECK constraints for status values and credit amounts.
- Non-negative credit constraints and validation on ledger entries.
- Default timestamps with `now()`.
- Proper indexing on frequently queried columns such as:
  - `user_id`
  - `status`
  - `created_at`
  - `subscription_status`
  - `customer_id`
  - `case_id`
  - `document_type`

## Required Auth / Trigger Logic
- On new user creation in `auth.users`, create a corresponding `public.profiles` row.
- If the profile already exists, do not duplicate data.
- Ensure email and name are propagated from auth into the profile table.
- If a user is deleted or disabled, reflect the constraint safely according to system policy.

## Required Stripe Integration Handling
Support Stripe-related metadata and webhook synchronization:

- `customer_id`
- `subscription_status`
- `product_id`
- `tier_name`
- `current_period_end`
- `cancel_at_period_end`

The database must support the app’s paid-tier logic, ad suppression, and premium feature unlocks.

## Required Operational Standards
- Use `CREATE OR REPLACE` where appropriate for safe migrations.
- Prefer stable naming conventions and explicit schema qualification.
- Use `public` schema as the app schema and keep `auth` reserved for Supabase Auth.
- Add comments for major tables and functions for maintainability.
- Keep SQL compatible with Supabase PostgreSQL runtime.

## Final Acceptance Criteria
The Supabase project is considered complete only when all of the following are true:

- The schema can be applied without errors in the Supabase SQL editor.
- New signups automatically create user profiles.
- AI credit balance changes are tracked with an immutable ledger.
- Paid subscribers are stored with correct tier metadata and status.
- RLS prevents unauthorized access.
- App data is available for law-firm usage, document management, client work, and billing.
- The setup is ready for production deployment and Vercel integration.

## Instruction to the Database Engineer
Implement this in a clean, secure, production-ready SQL migration using Supabase conventions. Do not leave placeholders. Do not use fake data in production tables. Use runtime-safe logic, strict foreign keys, and secure policies. Return the final SQL as a complete migration ready for execution.
