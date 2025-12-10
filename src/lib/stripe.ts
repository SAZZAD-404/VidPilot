// Stripe Client Configuration
import { loadStripe, Stripe } from '@stripe/stripe-js';

let stripePromise: Promise<Stripe | null>;

export const getStripe = () => {
  if (!stripePromise) {
    const key = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
    if (!key) {
      console.error('Stripe publishable key not found in environment variables');
      return null;
    }
    stripePromise = loadStripe(key);
  }
  return stripePromise;
};

// Price IDs from environment
export const STRIPE_PRICES = {
  pro_monthly: import.meta.env.VITE_STRIPE_PRO_MONTHLY_PRICE_ID || '',
  pro_yearly: import.meta.env.VITE_STRIPE_PRO_YEARLY_PRICE_ID || '',
  enterprise_monthly: import.meta.env.VITE_STRIPE_ENTERPRISE_MONTHLY_PRICE_ID || '',
  enterprise_yearly: import.meta.env.VITE_STRIPE_ENTERPRISE_YEARLY_PRICE_ID || '',
};

export type PlanType = 'free' | 'pro' | 'enterprise';
export type BillingInterval = 'monthly' | 'yearly';

export interface SubscriptionData {
  plan: PlanType;
  interval: BillingInterval;
  status: 'active' | 'canceled' | 'past_due' | 'trialing';
  current_period_end: string;
  cancel_at_period_end: boolean;
  stripe_customer_id?: string;
  stripe_subscription_id?: string;
}
