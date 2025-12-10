// Stripe Webhook Handler - Supabase Edge Function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET') || '';

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return new Response('No signature', { status: 400 });
  }

  try {
    const body = await req.text();
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);

    console.log('Webhook event:', event.type);

    // Handle different event types
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;

      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(event.data.object);
        break;

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object);
        break;

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object);
        break;

      case 'invoice.payment_failed':
        await handlePaymentFailed(event.data.object);
        break;

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (err) {
    console.error('Webhook error:', err.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }
});

async function handleCheckoutCompleted(session: any) {
  console.log('handleCheckoutCompleted called', { session_id: session.id });
  
  const { customer, subscription, client_reference_id } = session;

  console.log('Session data:', { customer, subscription, client_reference_id });

  if (!client_reference_id) {
    console.error('No user ID in checkout session - cannot update subscription');
    console.error('Full session:', JSON.stringify(session));
    return;
  }

  if (!subscription) {
    console.error('No subscription ID in checkout session');
    return;
  }

  try {
    // Get subscription details
    console.log('Retrieving subscription from Stripe:', subscription);
    const stripeSubscription = await stripe.subscriptions.retrieve(subscription);
    const priceId = stripeSubscription.items.data[0].price.id;
    
    console.log('Subscription retrieved:', { priceId, status: stripeSubscription.status });
    
    // Determine plan and interval
    const { plan, interval } = getPlanFromPriceId(priceId);
    
    console.log('Plan determined:', { plan, interval });

    // Update or create subscription in database
    const subscriptionData = {
      user_id: client_reference_id,
      stripe_customer_id: customer,
      stripe_subscription_id: subscription,
      plan,
      interval,
      status: stripeSubscription.status,
      current_period_end: new Date(stripeSubscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: stripeSubscription.cancel_at_period_end,
    };
    
    console.log('Upserting subscription:', subscriptionData);
    await upsertSubscription(subscriptionData);

    console.log(`✅ Subscription created successfully for user ${client_reference_id}`);
  } catch (error) {
    console.error('Error in handleCheckoutCompleted:', error);
    throw error;
  }
}

async function handleSubscriptionUpdate(subscription: any) {
  const { customer, id, status, current_period_end, cancel_at_period_end } = subscription;
  const priceId = subscription.items.data[0].price.id;
  const { plan, interval } = getPlanFromPriceId(priceId);

  // Find user by customer ID
  const user = await getUserByCustomerId(customer);
  if (!user) {
    console.error('User not found for customer:', customer);
    return;
  }

  await upsertSubscription({
    user_id: user.id,
    stripe_customer_id: customer,
    stripe_subscription_id: id,
    plan,
    interval,
    status,
    current_period_end: new Date(current_period_end * 1000).toISOString(),
    cancel_at_period_end,
  });

  console.log(`Subscription updated for user ${user.id}`);
}

async function handleSubscriptionDeleted(subscription: any) {
  const { customer } = subscription;

  const user = await getUserByCustomerId(customer);
  if (!user) return;

  // Downgrade to free plan
  await upsertSubscription({
    user_id: user.id,
    stripe_customer_id: customer,
    stripe_subscription_id: null,
    plan: 'free',
    interval: 'monthly',
    status: 'canceled',
    current_period_end: new Date().toISOString(),
    cancel_at_period_end: false,
  });

  console.log(`Subscription canceled for user ${user.id}`);
}

async function handlePaymentSucceeded(invoice: any) {
  console.log('Payment succeeded:', invoice.id);
  // Additional logic if needed (e.g., send receipt email)
}

async function handlePaymentFailed(invoice: any) {
  console.log('Payment failed:', invoice.id);
  // Additional logic (e.g., send payment failed email)
}

function getPlanFromPriceId(priceId: string): { plan: string; interval: string } {
  const priceMap: Record<string, { plan: string; interval: string }> = {
    [Deno.env.get('VITE_STRIPE_PRO_MONTHLY_PRICE_ID') || '']: { plan: 'pro', interval: 'monthly' },
    [Deno.env.get('VITE_STRIPE_PRO_YEARLY_PRICE_ID') || '']: { plan: 'pro', interval: 'yearly' },
    [Deno.env.get('VITE_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID') || '']: { plan: 'enterprise', interval: 'monthly' },
    [Deno.env.get('VITE_STRIPE_ENTERPRISE_YEARLY_PRICE_ID') || '']: { plan: 'enterprise', interval: 'yearly' },
  };

  return priceMap[priceId] || { plan: 'free', interval: 'monthly' };
}

async function getUserByCustomerId(customerId: string) {
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.38.4');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  const { data, error } = await supabase
    .from('subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', customerId)
    .single();

  if (error) {
    console.error('Error finding user:', error);
    return null;
  }

  return data ? { id: data.user_id } : null;
}

async function upsertSubscription(data: any) {
  const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2.38.4');
  const supabase = createClient(
    Deno.env.get('SUPABASE_URL') || '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''
  );

  const { error } = await supabase
    .from('subscriptions')
    .upsert(data, { onConflict: 'user_id' });

  if (error) {
    console.error('Error upserting subscription:', error);
    throw error;
  }
}
