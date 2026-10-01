import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';
import { validateStripeWebhookEnv } from '../../.env.validation.ts';

const SUPPORTED_EVENTS = new Set([
  'checkout.session.completed',
  'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed',
  'invoice.paid',
  'customer.subscription.created',
  'customer.subscription.updated',
  'customer.subscription.deleted',
]);

const MAX_RETRIES = 3;
const PRICE_TIERS: Record<string, 'premium' | 'pro' | 'document'> = {
  price_1Sdfqp0QhWGUtGKvcQuWONuB: 'premium',
  price_1SckV70QhWGUtGKvvg1tH7lu: 'pro',
  price_1SckVt0QhWGUtGKvl9YdmQqk: 'document',
};
const VALID_TIERS = new Set(['premium', 'pro', 'document']);

function getWebhookClients() {
  const env = validateStripeWebhookEnv(process.env);

  return {
    env,
    stripe: new Stripe(env.STRIPE_SECRET_KEY, { apiVersion: '2025-08-27.basil' }),
    supabase: createClient(env.SUPABASE_URL, env.SUPABASE_SERVER_KEY),
  };
}

function normalizeStatus(status: Stripe.Subscription.Status): 'inactive' | 'trialing' | 'active' | 'past_due' | 'canceled' | 'unpaid' {
  if (status === 'trialing' || status === 'active' || status === 'past_due' || status === 'canceled' || status === 'unpaid') {
    return status;
  }

  return 'inactive';
}

function getTier(subscription: Stripe.Subscription): 'free' | 'premium' | 'pro' | 'document' {
  const price = subscription.items.data[0]?.price;
  const metadataTier = price?.metadata?.tier || subscription.metadata?.tier;
  if (metadataTier && VALID_TIERS.has(metadataTier)) {
    return metadataTier as 'premium' | 'pro' | 'document';
  }

  return PRICE_TIERS[price?.id || ''] || 'premium';
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function formatError(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  return 'Unknown error';
}

async function withRetry<T>(label: string, operation: () => Promise<T>) {
  let lastError: unknown;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt += 1) {
    try {
      return await operation();
    } catch (error) {
      lastError = error;
      if (attempt === MAX_RETRIES) {
        break;
      }

      console.warn(`[stripe-webhook] retrying ${label} after attempt ${attempt}`, formatError(error));
      await sleep(200 * attempt);
    }
  }

  throw lastError;
}

async function getRawBody(req: VercelRequest) {
  const chunks: Buffer[] = [];

  for await (const chunk of req) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
  }

  if (chunks.length > 0) {
    return Buffer.concat(chunks);
  }

  const rawBody = (req as VercelRequest & { rawBody?: Buffer | string }).rawBody;
  if (Buffer.isBuffer(rawBody)) {
    return rawBody;
  }

  if (typeof rawBody === 'string') {
    return Buffer.from(rawBody, 'utf8');
  }

  if (Buffer.isBuffer(req.body)) {
    return req.body;
  }

  if (typeof req.body === 'string') {
    return Buffer.from(req.body, 'utf8');
  }

  return Buffer.from(JSON.stringify(req.body ?? {}), 'utf8');
}

async function resolveUserId(
  stripe: Stripe,
  supabase: ReturnType<typeof createClient>,
  customerId: string,
  metadata: Stripe.Metadata,
) {
  if (metadata.user_id) return metadata.user_id;

  const customer = await withRetry(`customer lookup ${customerId}`, () => stripe.customers.retrieve(customerId));
  if (('deleted' in customer && customer.deleted) || !('email' in customer) || !customer.email) {
    throw new Error(`Unable to resolve Stripe customer ${customerId}`);
  }

  const { data: profile } = await withRetry(`profile lookup ${customerId}`, () =>
    supabase
      .from('profiles')
      .select('id')
      .eq('email', customer.email)
      .maybeSingle()
      .throwOnError(),
  );

  if (!profile) {
    throw new Error(`Unable to resolve Supabase profile for Stripe customer ${customerId}`);
  }

  return profile.id;
}

async function persistSubscription(
  stripe: Stripe,
  supabase: ReturnType<typeof createClient>,
  subscription: Stripe.Subscription,
  userId?: string,
) {
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
  const resolvedUserId = userId || await resolveUserId(stripe, supabase, customerId, subscription.metadata);
  const status = normalizeStatus(subscription.status);
  const tier = status === 'canceled' || status === 'unpaid' ? 'free' : getTier(subscription);
  const period = subscription.items.data[0];
  if (!period) throw new Error(`Stripe subscription ${subscription.id} has no items`);
  const periodStart = new Date(period.current_period_start * 1000).toISOString();
  const periodEnd = new Date(period.current_period_end * 1000).toISOString();

  await withRetry(`subscription upsert ${subscription.id}`, () =>
    supabase.from('subscriptions').upsert({
      user_id: resolvedUserId,
      stripe_customer_id: customerId,
      stripe_subscription_id: subscription.id,
      status,
      tier,
      current_period_start: periodStart,
      current_period_end: periodEnd,
      cancel_at_period_end: subscription.cancel_at_period_end,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' }).throwOnError(),
  );

  await withRetry(`profile update ${resolvedUserId}`, () =>
    supabase
      .from('profiles')
      .update({ subscription_tier: tier, updated_at: new Date().toISOString() })
      .eq('id', resolvedUserId)
      .throwOnError(),
  );
}

export async function checkStripeHealth() {
  try {
    const { stripe } = getWebhookClients();
    const account = await stripe.accounts.retrieve();

    return {
      ok: true,
      accountId: account.id,
      supportedEvents: [...SUPPORTED_EVENTS],
    };
  } catch (error) {
    return {
      ok: false,
      error: formatError(error),
    };
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  let clients: ReturnType<typeof getWebhookClients>;

  try {
    clients = getWebhookClients();
  } catch (error) {
    const details = error instanceof Error ? error.message : 'Invalid webhook configuration';
    return res.status(503).json({ error: details });
  }

  const { stripe, supabase, env } = clients;
  const signature = req.headers['stripe-signature'];

  if (!signature) {
    return res.status(401).json({ error: 'Missing stripe signature header' });
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(await getRawBody(req), signature as string, env.STRIPE_WEBHOOK_SECRET);
  } catch (error) {
    console.error('Stripe webhook verification failed', error);
    return res.status(400).json({ error: 'Webhook verification failed' });
  }

  if (!SUPPORTED_EVENTS.has(event.type)) {
    console.info(`[stripe-webhook] ignored unsupported event ${event.type}`);
    return res.status(202).json({ received: true, ignored: true });
  }

  console.info(`[stripe-webhook] processing ${event.type}`, { id: event.id });

  try {
    switch (event.type) {
      case 'checkout.session.completed':
      case 'checkout.session.async_payment_succeeded': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.payment_status === 'unpaid') {
          break;
        }

        if (session.mode === 'subscription' && session.subscription) {
          const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
          const subscription = await withRetry(`subscription retrieve ${subscriptionId}`, () => stripe.subscriptions.retrieve(subscriptionId));
          await persistSubscription(stripe, supabase, subscription, session.client_reference_id || session.metadata?.user_id);
        }
        break;
      }
      case 'checkout.session.async_payment_failed': {
        console.warn('[stripe-webhook] async payment failed', { id: event.id });
        break;
      }
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const parentSubscription = invoice.parent?.type === 'subscription_details'
          ? invoice.parent.subscription_details?.subscription
          : null;
        const subscriptionId = typeof parentSubscription === 'string'
          ? parentSubscription
          : parentSubscription?.id;
        if (subscriptionId) {
          const subscription = await withRetry(`subscription retrieve ${subscriptionId}`, () => stripe.subscriptions.retrieve(subscriptionId));
          await persistSubscription(stripe, supabase, subscription);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await persistSubscription(stripe, supabase, subscription);
        break;
      }
      default:
        break;
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('[stripe-webhook] event processing error', {
      id: event.id,
      type: event.type,
      error: formatError(error),
    });
    return res.status(500).json({ error: 'Event processing failed' });
  }
}
