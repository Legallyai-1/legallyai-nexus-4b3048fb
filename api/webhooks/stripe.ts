import type { VercelRequest, VercelResponse } from '@vercel/node';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-02-24.acacia',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || '';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
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
      case 'invoice.paid': {
        const invoice = event.data.object as Stripe.Invoice;
        const customerId = typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;
        const subscriptionId = typeof invoice.subscription === 'string' ? invoice.subscription : invoice.subscription?.id;
        await Promise.resolve({ customerId, subscriptionId });
        break;
      }
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        const status = subscription.status;
        const tier = subscription.items.data[0]?.price?.metadata?.tier || 'premium';
        await Promise.resolve({ status, tier });
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        await Promise.resolve({ status: subscription.status, canceled: true });
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
