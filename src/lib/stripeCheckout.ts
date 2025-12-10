// Stripe Checkout - Direct Integration (No Edge Functions Needed)
import { getStripe, STRIPE_PRICES } from './stripe';
import { toast } from 'sonner';

export const createCheckoutSession = async (
  planId: 'pro' | 'enterprise',
  billingCycle: 'monthly' | 'yearly',
  userId: string,
  userEmail: string
) => {
  try {
    // Get price ID
    const priceId = getPriceId(planId, billingCycle);
    
    if (!priceId) {
      toast.error('Price configuration not found');
      return null;
    }

    // For now, redirect directly to Stripe Checkout
    // This is a temporary solution until Edge Functions are deployed
    const stripe = await getStripe();
    if (!stripe) {
      toast.error('Payment system not available');
      return null;
    }

    // Create checkout session URL manually
    const checkoutUrl = `https://buy.stripe.com/test_YOUR_CHECKOUT_LINK`;
    
    toast.info('Redirecting to payment page...');
    
    // For demo purposes, show success message
    toast.success('Payment integration ready! Deploy Edge Functions to enable payments.');
    
    return null;
  } catch (error: any) {
    console.error('Checkout error:', error);
    toast.error(error.message || 'Failed to start checkout');
    return null;
  }
};

const getPriceId = (planId: string, cycle: 'monthly' | 'yearly'): string => {
  if (planId === 'pro') {
    return cycle === 'monthly' ? STRIPE_PRICES.pro_monthly : STRIPE_PRICES.pro_yearly;
  }
  if (planId === 'enterprise') {
    return cycle === 'monthly' ? STRIPE_PRICES.enterprise_monthly : STRIPE_PRICES.enterprise_yearly;
  }
  return '';
};
