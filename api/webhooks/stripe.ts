import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';

type Db = SupabaseClient<any>;
export const SUPPORTED_EVENTS = new Set([
  'checkout.session.completed', 'checkout.session.async_payment_succeeded',
  'checkout.session.async_payment_failed', 'invoice.paid', 'invoice.payment_failed',
  'invoice.marked_uncollectible', 'customer.subscription.created',
  'customer.subscription.updated', 'customer.subscription.deleted',
  'customer.subscription.paused', 'customer.subscription.resumed',
]);
const PRICES: Record<string, { tier: 'premium' | 'pro'; amount: number }> = {
  price_1Sdfqp0QhWGUtGKvcQuWONuB: { tier: 'premium', amount: 999 },
  price_1SckV70QhWGUtGKvvg1tH7lu: { tier: 'pro', amount: 9900 },
};
const DOCUMENT_PRICE = 'price_1SckVt0QhWGUtGKvl9YdmQqk';
const idOf = (value: unknown): string | null => typeof value === 'string' ? value
  : value && typeof value === 'object' && 'id' in value && typeof value.id === 'string' ? value.id : null;

export function getSubscriptionTier(subscription: Stripe.Subscription): 'free' | 'premium' | 'pro' {
  if (subscription.items.data.length !== 1) return 'free';
  const price = subscription.items.data[0].price;
  const expected = Object.prototype.hasOwnProperty.call(PRICES, price.id) ? PRICES[price.id] : undefined;
  return expected && price.currency === 'usd' && price.unit_amount === expected.amount &&
    price.recurring?.interval === 'month' && price.recurring.interval_count === 1 ? expected.tier : 'free';
}

function getClients() {
  const key = process.env.STRIPE_SECRET_KEY;
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  const url = process.env.SUPABASE_URL;
  const serverKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key || !secret || !url || !serverKey) throw new Error('Webhook configuration missing');
  if (new URL(url).hostname !== 'whdljtbtqisoszbrzdwq.supabase.co') throw new Error('Unexpected billing backend');
  return { secret, stripe: new Stripe(key, { apiVersion: '2025-08-27.basil' }),
    db: createClient<any>(url, serverKey, { auth: { persistSession: false, autoRefreshToken: false } }) };
}

async function resolveOwner(stripe: Stripe, db: Db, customerId: string, candidates: (string | null | undefined)[]) {
  const { data: mapping } = await db.from('subscriptions').select('user_id')
    .eq('stripe_customer_id', customerId).maybeSingle().throwOnError();
  const customer = await stripe.customers.retrieve(customerId);
  if (!('metadata' in customer)) throw new Error('Deleted billing customer');
  const owners = new Set([...candidates, mapping?.user_id, customer.metadata?.user_id].filter(Boolean));
  if (owners.size !== 1) throw new Error('Missing or conflicting billing ownership');
  const userId = [...owners][0] as string;
  const { data: profile } = await db.from('profiles').select('id').eq('id', userId).maybeSingle().throwOnError();
  if (!profile) throw new Error('Billing profile missing');
  return userId;
}

function invoiceSubscription(invoice: Stripe.Invoice) {
  const current = invoice.parent?.type === 'subscription_details' ? invoice.parent.subscription_details?.subscription : null;
  return idOf(current) || idOf((invoice as unknown as { subscription?: unknown }).subscription);
}

async function syncSubscription(stripe: Stripe, db: Db, event: Stripe.Event, id: string, fallback?: string | null) {
  const subscription = await stripe.subscriptions.retrieve(id);
  const customerId = idOf(subscription.customer);
  if (!customerId) throw new Error('Subscription customer missing');
  const userId = await resolveOwner(stripe, db, customerId, [fallback, subscription.metadata?.user_id]);
  const item = subscription.items.data[0];
  if (!item) throw new Error('Subscription item missing');
  const status = ['active', 'trialing', 'past_due', 'canceled', 'unpaid'].includes(subscription.status) ? subscription.status : 'inactive';
  await db.rpc('sync_stripe_subscription_state', {
    p_user_id: userId, p_stripe_customer_id: customerId, p_stripe_subscription_id: subscription.id,
    p_status: status, p_tier: getSubscriptionTier(subscription), p_stripe_price_id: item.price.id,
    p_stripe_product_id: idOf(item.price.product),
    p_current_period_start: new Date(item.current_period_start * 1000).toISOString(),
    p_current_period_end: new Date(item.current_period_end * 1000).toISOString(),
    p_cancel_at_period_end: subscription.cancel_at_period_end, p_metadata: subscription.metadata,
    p_event_id: event.id, p_event_created_at: new Date(event.created * 1000).toISOString(),
  }).throwOnError();
}

async function fulfillCheckout(stripe: Stripe, db: Db, event: Stripe.Event) {
  const sessionId = idOf(event.data.object);
  if (!sessionId) throw new Error('Checkout session ID missing');
  const session = await stripe.checkout.sessions.retrieve(sessionId);
  if (!['paid', 'no_payment_required'].includes(session.payment_status)) return;
  if (session.mode === 'subscription' && session.subscription) {
    if (session.client_reference_id && session.metadata?.user_id && session.client_reference_id !== session.metadata.user_id) throw new Error('Conflicting checkout owner');
    await syncSubscription(stripe, db, event, idOf(session.subscription)!, session.client_reference_id || session.metadata?.user_id);
    return;
  }
  if (session.mode !== 'payment' || session.payment_status !== 'paid') return;
  const lines = await stripe.checkout.sessions.listLineItems(session.id, { limit: 2 });
  const line = lines.data[0];
  if (lines.has_more || lines.data.length !== 1 || line.quantity !== 1 || line.price?.id !== DOCUMENT_PRICE ||
    line.price.unit_amount !== 500 || line.price.currency !== 'usd' || line.price.recurring) throw new Error('Unexpected document purchase');
  const customerId = idOf(session.customer);
  if (!customerId) throw new Error('Checkout customer missing');
  const userId = await resolveOwner(stripe, db, customerId, [session.client_reference_id, session.metadata?.user_id]);
  await db.from('payment_records').upsert({
    user_id: userId, tier: 'document', amount: (session.amount_total || 0) / 100, payment_method: 'stripe',
    status: 'paid', expires_at: null, stripe_customer_id: customerId, stripe_price_id: DOCUMENT_PRICE,
    stripe_product_id: idOf(line.price.product), stripe_checkout_session_id: session.id,
    last_event_id: event.id, metadata: { documents_remaining: 1, payment_intent: idOf(session.payment_intent) },
  }, { onConflict: 'stripe_checkout_session_id', ignoreDuplicates: true }).throwOnError();
}

export async function processVerifiedEvent(event: Stripe.Event, stripe: Stripe, db: Db) {
  if (!SUPPORTED_EVENTS.has(event.type)) return { status: 200, body: { received: true, ignored: true } };
  let claimId: string | undefined;
  try {
    const object = event.data.object as unknown as Record<string, unknown>;
    const { data } = await db.rpc('claim_webhook_log', {
      p_source: 'stripe', p_event_id: event.id, p_event_type: event.type, p_payload: event,
      p_stripe_customer_id: idOf(object.customer),
      p_stripe_subscription_id: event.type.startsWith('customer.subscription.') ? idOf(object) : idOf(object.subscription),
    }).throwOnError();
    const claim = Array.isArray(data) ? data[0] : data;
    if (!claim) throw new Error('Webhook claim unavailable');
    if (!claim.claimed) return claim.processing_status === 'processed'
      ? { status: 200, body: { received: true, duplicate: true } }
      : { status: 503, body: { error: 'Webhook processing is pending; retry required' } };
    claimId = claim.id;
    if (!claimId) throw new Error('Webhook claim ID missing');
    if (event.type.startsWith('checkout.session.') && event.type !== 'checkout.session.async_payment_failed') {
      await fulfillCheckout(stripe, db, event);
    } else if (event.type.startsWith('customer.subscription.')) {
      const subscriptionId = idOf(event.data.object);
      if (!subscriptionId) throw new Error('Subscription ID missing');
      await syncSubscription(stripe, db, event, subscriptionId);
    } else if (event.type.startsWith('invoice.')) {
      const subscriptionId = invoiceSubscription(event.data.object as Stripe.Invoice);
      if (subscriptionId) await syncSubscription(stripe, db, event, subscriptionId);
    }
    await db.from('webhook_logs').update({ processing_status: 'processed', processed_at: new Date().toISOString(), processing_error: null }).eq('id', claimId).throwOnError();
    return { status: 200, body: { received: true } };
  } catch {
    if (claimId) {
      try { await db.from('webhook_logs').update({ processing_status: 'error', processing_error: 'Processing failed; retry required' }).eq('id', claimId).throwOnError(); } catch { /* Claim lease permits later recovery. */ }
    }
    console.error('[stripe-webhook] processing failed');
    return { status: 503, body: { error: 'Event processing failed; retry required' } };
  }
}

export async function checkStripeHealth() {
  try { const { stripe } = getClients(); const account = await stripe.accounts.retrieve(); return { ok: true, accountId: account.id, supportedEvents: [...SUPPORTED_EVENTS] }; }
  catch { return { ok: false, error: 'Stripe webhook configuration or connectivity requires review' }; }
}

// Stripe signs the exact request bytes, so never parse the body before verification.
// Next.js-style flag (requested in LEG-24); @vercel/node itself parses req.body lazily and
// leaves the request stream intact, so we read the raw bytes from the stream and never touch req.body.
export const config = { api: { bodyParser: false } };

const MAX_WEBHOOK_BYTES = 1048576;

export async function readRawBody(req: AsyncIterable<unknown>): Promise<Buffer> {
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk as string | Uint8Array);
    size += buffer.length;
    if (size > MAX_WEBHOOK_BYTES) throw new Error('Webhook body too large');
    chunks.push(buffer);
  }
  if (!chunks.length) throw new Error('Exact raw webhook body unavailable');
  return Buffer.concat(chunks);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  let clients: ReturnType<typeof getClients>;
  try { clients = getClients(); } catch { return res.status(503).json({ error: 'Webhook temporarily unavailable' }); }
  const signature = req.headers['stripe-signature'];
  if (typeof signature !== 'string') return res.status(400).json({ error: 'Missing Stripe signature' });
  let event: Stripe.Event;
  try { event = clients.stripe.webhooks.constructEvent(await readRawBody(req), signature, clients.secret); }
  catch { return res.status(400).json({ error: 'Webhook verification failed' }); }
  const result = await processVerifiedEvent(event, clients.stripe, clients.db);
  return res.status(result.status).json(result.body);
}
