// Subscription Management Hook
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { SubscriptionData, PlanType } from '@/lib/stripe';

export const useSubscription = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState<SubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    } else {
      setSubscription(null);
      setLoading(false);
    }
  }, [user]);

  const fetchSubscription = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('subscriptions')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Error fetching subscription:', error);
        setSubscription(getDefaultSubscription());
        return;
      }

      if (data) {
        setSubscription({
          plan: data.plan as PlanType,
          interval: data.interval,
          status: data.status,
          current_period_end: data.current_period_end,
          cancel_at_period_end: data.cancel_at_period_end,
          stripe_customer_id: data.stripe_customer_id,
          stripe_subscription_id: data.stripe_subscription_id,
        });
      } else {
        setSubscription(getDefaultSubscription());
      }
    } catch (error) {
      console.error('Error in fetchSubscription:', error);
      setSubscription(getDefaultSubscription());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultSubscription = (): SubscriptionData => ({
    plan: 'free',
    interval: 'monthly',
    status: 'active',
    current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
    cancel_at_period_end: false,
  });

  const isPro = () => {
    return subscription?.plan === 'pro' || subscription?.plan === 'enterprise';
  };

  const isEnterprise = () => {
    return subscription?.plan === 'enterprise';
  };

  const hasActiveSubscription = () => {
    return subscription?.status === 'active' && isPro();
  };

  return {
    subscription,
    loading,
    isPro: isPro(),
    isEnterprise: isEnterprise(),
    hasActiveSubscription: hasActiveSubscription(),
    refetch: fetchSubscription,
  };
};
