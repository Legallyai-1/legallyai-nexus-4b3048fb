import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripeSecretKey = process.env.STRIPE_SECRET_KEY || '';
const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const stripe = stripeSecretKey
  ? new Stripe(stripeSecretKey, { apiVersion: '2025-08-27.basil' })
  : null;
const supabase = supabaseUrl && supabaseSecretKey
  ? createClient(supabaseUrl, supabaseSecretKey)
  : null;

const PRICE_TIERS: Record<string, 'premium' | 'pro' | 'document'> = {
  price_1Sdfqp0QhWGUtGKvcQuWONuB: 'premium',
  price_1SckV70QhWGUtGKvvg1tH7lu: 'pro',
  price_1SckVt0QhWGUtGKvl9YdmQqk: 'document',
};

const VALID_TIERS = new Set(['premium', 'pro', 'document']);

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

async function resolveUserId(customerId: string, metadata: Stripe.Metadata) {
  if (!stripe || !supabase) throw new Error('Billing server is not configured');
  if (metadata.user_id) return metadata.user_id;

  const customer = await stripe.customers.retrieve(customerId);
  if (('deleted' in customer && customer.deleted) || !('email' in customer) || !customer.email) {
    throw new Error(`Unable to resolve Stripe customer ${customerId}`);
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('email', customer.email)
    .maybeSingle();
  if (profileError || !profile) {
    throw new Error(`Unable to resolve Supabase profile for Stripe customer ${customerId}`);
  }

  return profile.id;
}

async function persistSubscription(subscription: Stripe.Subscription, userId?: string) {
  if (!stripe || !supabase) throw new Error('Billing server is not configured');
  const customerId = typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;
  const resolvedUserId = userId || await resolveUserId(customerId, subscription.metadata);
  const status = normalizeStatus(subscription.status);
  const tier = status === 'canceled' || status === 'unpaid' ? 'free' : getTier(subscription);
  const period = subscription.items.data[0];
  if (!period) throw new Error(`Stripe subscription ${subscription.id} has no items`);
  const periodStart = new Date(period.current_period_start * 1000).toISOString();
  const periodEnd = new Date(period.current_period_end * 1000).toISOString();

  const { error: subscriptionError } = await supabase.from('subscriptions').upsert({
    user_id: resolvedUserId,
    stripe_customer_id: customerId,
    stripe_subscription_id: subscription.id,
    status,
    tier,
    current_period_start: periodStart,
    current_period_end: periodEnd,
    cancel_at_period_end: subscription.cancel_at_period_end,
    updated_at: new Date().toISOString(),
  }, { onConflict: 'user_id' });
  if (subscriptionError) throw subscriptionError;

  const { error: profileError } = await supabase.from('profiles')
    .update({ subscription_tier: tier, updated_at: new Date().toISOString() })
    .eq('id', resolvedUserId);
  if (profileError) throw profileError;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  if (!stripe || !supabase || !webhookSecret) {
    return res.status(503).json({ error: 'Stripe webhook is not configured' });
  }

  const signature = req.headers['stripe-signature'];

  if (!signature || !webhookSecret) {
    return res.status(401).json({ error: 'Missing stripe signature or webhook secret' });
  }

  let event;

  try {
    const rawBody = req.body;
    const payload = typeof rawBody === 'string' ? rawBody : JSON.stringify(rawBody);
    event = stripe.webhooks.constructEvent(payload, signature as string, webhookSecret);
  } catch (error) {
    console.error('Stripe webhook verification failed', error);
    return res.status(400).json({ error: 'Webhook verification failed' });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription) {
          const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription.id;
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await persistSubscription(subscription, session.client_reference_id || session.metadata?.user_id);
        }
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
          const subscription = await stripe.subscriptions.retrieve(subscriptionId);
          await persistSubscription(subscription);
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        await persistSubscription(subscription);
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await persistSubscription(subscription);
        break;
      }
      default:
        break;
    }

    return res.status(200).json({ received: true });
  } catch (error) {
    console.error('Stripe event processing error', error);
    return res.status(500).json({ error: 'Event processing failed' });
  }
}
