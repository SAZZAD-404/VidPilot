// Create Stripe Checkout Session - Supabase Edge Function
import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.5.0?target=deno';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') || '', {
  apiVersion: '2023-10-16',
  httpClient: Stripe.createFetchHttpClient(),
});

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { priceId, userId, userEmail, successUrl, cancelUrl } = await req.json();

    console.log('Received request:', { priceId, userId, userEmail });

    if (!priceId || !userId || !userEmail) {
      console.error('Missing parameters:', { priceId, userId, userEmail });
      return new Response(
        JSON.stringify({ error: 'Missing required parameters', details: { priceId: !!priceId, userId: !!userId, userEmail: !!userEmail } }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if Stripe key is set
    const stripeKey = Deno.env.get('STRIPE_SECRET_KEY');
    if (!stripeKey || stripeKey === '') {
      console.error('Stripe secret key not set');
      return new Response(
        JSON.stringify({ error: 'Stripe configuration error' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: successUrl || `${req.headers.get('origin')}/dashboard/subscription?success=true`,
      cancel_url: cancelUrl || `${req.headers.get('origin')}/dashboard/subscription?canceled=true`,
      customer_email: userEmail,
      client_reference_id: userId,
      metadata: {
        user_id: userId,
      },
      subscription_data: {
        metadata: {
          user_id: userId,
        },
      },
    });

    return new Response(
      JSON.stringify({ sessionId: session.id, url: session.url }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (err) {
    console.error('Error creating checkout session:', err);
    console.error('Error details:', err.type, err.code, err.message);
    return new Response(
      JSON.stringify({ 
        error: err.message,
        type: err.type,
        code: err.code,
        details: 'Check function logs for more information'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
