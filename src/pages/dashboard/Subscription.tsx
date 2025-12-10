import { useState } from "react";
import { motion } from "framer-motion";
import { 
  Crown, 
  Check, 
  Zap,
  Sparkles,
  TrendingUp,
  Shield,
  Headphones,
  Infinity,
  Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import { isDemoMode } from "@/lib/demoMode";
import { getStripe, STRIPE_PRICES } from "@/lib/stripe";
import { supabase } from "@/integrations/supabase/client";

const Subscription = () => {
  const { user } = useAuth();
  const { subscription, loading: subLoading, refetch } = useSubscription();
  const isDemo = isDemoMode();
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">("monthly");
  const [loadingPlan, setLoadingPlan] = useState<string | null>(null);
  
  const currentPlan = subscription?.plan || "free";

  const plans = [
    {
      id: "free",
      name: "Free",
      icon: Sparkles,
      price: { monthly: 0, yearly: 0 },
      description: "Perfect for getting started",
      features: [
        "10 AI credits/month",
        "2 social platforms (Facebook & Instagram)",
        "Basic templates",
        "Standard support",
        "Export to CSV/JSON",
        "7-day history"
      ],
      limitations: [
        "Limited AI generations",
        "Basic features only"
      ],
      color: "from-gray-500 to-gray-600",
      popular: false
    },
    {
      id: "pro",
      name: "Pro",
      icon: Crown,
      price: { monthly: 9, yearly: 99 },
      description: "For content creators & businesses",
      features: [
        "Unlimited AI captions",
        "All social platforms",
        "Premium templates",
        "Priority support",
        "Advanced analytics",
        "Export to all formats",
        "Unlimited history",
        "Custom branding",
        "Bulk generation",
        "API access"
      ],
      limitations: [],
      color: "from-primary to-accent",
      popular: true
    },
    {
      id: "enterprise",
      name: "Enterprise",
      icon: TrendingUp,
      price: { monthly: 15, yearly: 180 },
      description: "For teams & agencies",
      features: [
        "Everything in Pro",
        "Unlimited team members",
        "White-label solution",
        "Dedicated account manager",
        "Custom AI training",
        "SLA guarantee",
        "Advanced security",
        "Custom integrations",
        "Onboarding & training",
        "24/7 phone support"
      ],
      limitations: [],
      color: "from-purple-500 to-pink-500",
      popular: false
    }
  ];

  const handleUpgrade = async (planId: string) => {
    if (isDemo && !user) {
      toast.error("Please sign up to upgrade your plan");
      return;
    }

    if (!user) {
      toast.error("Please log in to upgrade");
      return;
    }

    if (planId === "free") {
      toast.info("You're already on the free plan");
      return;
    }

    if (planId === currentPlan) {
      toast.info("You're already on this plan");
      return;
    }

    try {
      setLoadingPlan(planId);

      // Get the price ID based on plan and billing cycle
      const priceId = getPriceId(planId, billingCycle);
      
      // Check if Stripe is configured
      if (!priceId || priceId === 'price_xxxxxxxxxxxxx' || priceId === '') {
        // Show setup instructions
        toast.error("Stripe Payment Not Configured", {
          description: "Please set up Stripe Price IDs in .env file",
          duration: 6000
        });
        
        // Open instructions in new tab
        setTimeout(() => {
          toast.info("Opening setup guide...", {
            description: "Follow the steps to configure Stripe payments"
          });
        }, 1000);
        
        return;
      }

      // Try to create checkout session
      try {
        const { data, error } = await supabase.functions.invoke('create-checkout', {
          body: {
            priceId,
            userId: user.id,
            userEmail: user.email,
            successUrl: `${window.location.origin}/dashboard/subscription?success=true`,
            cancelUrl: `${window.location.origin}/dashboard/subscription?canceled=true`,
          },
        });

        if (error) throw error;

        // Redirect directly to Stripe Checkout URL
        if (data && data.url) {
          window.location.href = data.url;
        } else {
          toast.error("Failed to create checkout session");
        }
      } catch (edgeFunctionError: any) {
        // Edge Functions not deployed yet
        console.log('Edge Function not available:', edgeFunctionError);
        toast.error("Supabase Edge Functions Not Deployed", {
          description: "Run: npx supabase functions deploy create-checkout",
          duration: 6000
        });
      }
    } catch (error: any) {
      console.error('Upgrade error:', error);
      toast.error(error.message || "Failed to start checkout");
    } finally {
      setLoadingPlan(null);
    }
  };

  const handleManageSubscription = async () => {
    if (!user || !subscription?.stripe_customer_id) {
      toast.error("No active subscription found");
      return;
    }

    try {
      setLoadingPlan('manage');

      const { data, error } = await supabase.functions.invoke('create-portal', {
        body: {
          customerId: subscription.stripe_customer_id,
          returnUrl: `${window.location.origin}/dashboard/subscription`,
        },
      });

      if (error) throw error;

      // Redirect to customer portal
      window.location.href = data.url;
    } catch (error: any) {
      console.error('Portal error:', error);
      toast.info("Deploy Edge Functions to enable subscription management", {
        description: "Run: npx supabase functions deploy create-portal"
      });
    } finally {
      setLoadingPlan(null);
    }
  };

  const getPriceId = (planId: string, cycle: "monthly" | "yearly"): string => {
    if (planId === "pro") {
      return cycle === "monthly" ? STRIPE_PRICES.pro_monthly : STRIPE_PRICES.pro_yearly;
    }
    if (planId === "enterprise") {
      return cycle === "monthly" ? STRIPE_PRICES.enterprise_monthly : STRIPE_PRICES.enterprise_yearly;
    }
    return "";
  };

  const getSavings = () => {
    return billingCycle === "yearly" ? "Save 17%" : "";
  };

  return (
    <div className="p-8 max-w-7xl mx-auto">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <h1 className="text-4xl font-bold text-foreground mb-3 flex items-center justify-center gap-3">
          <Crown className="w-10 h-10 text-primary" />
          Choose Your Plan
        </h1>
        <p className="text-muted-foreground text-lg">
          Unlock the full power of AI-driven content creation
        </p>
      </motion.div>

      {/* Billing Toggle */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex items-center justify-center gap-4 mb-12"
      >
        <span className={`text-sm font-medium ${billingCycle === "monthly" ? "text-foreground" : "text-muted-foreground"}`}>
          Monthly
        </span>
        <button
          onClick={() => setBillingCycle(billingCycle === "monthly" ? "yearly" : "monthly")}
          className={`relative w-14 h-7 rounded-full transition-colors ${
            billingCycle === "yearly" ? "bg-primary" : "bg-secondary"
          }`}
        >
          <div
            className={`absolute top-1 left-1 w-5 h-5 rounded-full bg-white transition-transform ${
              billingCycle === "yearly" ? "translate-x-7" : ""
            }`}
          />
        </button>
        <span className={`text-sm font-medium ${billingCycle === "yearly" ? "text-foreground" : "text-muted-foreground"}`}>
          Yearly
        </span>
        {billingCycle === "yearly" && (
          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-semibold">
            {getSavings()}
          </span>
        )}
      </motion.div>

      {/* Demo Mode Banner */}
      {isDemo && !user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <Card className="p-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-amber-500/20">
            <div className="flex items-center gap-3">
              <Zap className="w-5 h-5 text-amber-500" />
              <p className="text-sm text-foreground">
                <strong>Demo Mode:</strong> Sign up to unlock premium features and start your free trial
              </p>
            </div>
          </Card>
        </motion.div>
      )}

      {/* Pricing Cards */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        {plans.map((plan, index) => {
          const Icon = plan.icon;
          const isCurrentPlan = plan.id === currentPlan;
          
          return (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * (index + 1) }}
            >
              <Card className={`relative p-6 h-full flex flex-col ${
                plan.popular ? "border-primary shadow-lg shadow-primary/20" : ""
              }`}>
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="px-4 py-1 rounded-full bg-gradient-to-r from-primary to-accent text-primary-foreground text-xs font-bold">
                      MOST POPULAR
                    </span>
                  </div>
                )}

                {isCurrentPlan && (
                  <div className="absolute top-4 right-4">
                    <span className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-semibold">
                      Current Plan
                    </span>
                  </div>
                )}

                <div className="mb-6">
                  <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${plan.color} flex items-center justify-center mb-4`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-2">{plan.name}</h3>
                  <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>
                  
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-foreground">
                      ${plan.price[billingCycle]}
                    </span>
                    <span className="text-muted-foreground">
                      /{billingCycle === "monthly" ? "mo" : "yr"}
                    </span>
                  </div>
                  {billingCycle === "yearly" && plan.price.yearly > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      ${(plan.price.yearly / 12).toFixed(2)}/month billed annually
                    </p>
                  )}
                </div>

                <Button
                  variant={plan.popular ? "hero" : "outline"}
                  className="w-full mb-6"
                  onClick={() => handleUpgrade(plan.id)}
                  disabled={isCurrentPlan || loadingPlan === plan.id || subLoading}
                >
                  {loadingPlan === plan.id ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Processing...
                    </>
                  ) : isCurrentPlan ? (
                    "Current Plan"
                  ) : plan.id === "free" ? (
                    "Get Started"
                  ) : (
                    "Upgrade Now"
                  )}
                </Button>
                
                {isCurrentPlan && plan.id !== "free" && subscription?.stripe_customer_id && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleManageSubscription}
                    disabled={loadingPlan === 'manage'}
                  >
                    {loadingPlan === 'manage' ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                        Loading...
                      </>
                    ) : (
                      "Manage Subscription"
                    )}
                  </Button>
                )}

                <div className="space-y-3 flex-1">
                  {plan.features.map((feature, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-foreground">{feature}</span>
                    </div>
                  ))}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Features Comparison */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="mb-12"
      >
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
          Why Upgrade to Pro?
        </h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: Infinity,
              title: "Unlimited Generations",
              desc: "Create as many captions and posts as you need without limits"
            },
            {
              icon: Zap,
              title: "Advanced AI Models",
              desc: "Access to the latest and most powerful AI models"
            },
            {
              icon: Shield,
              title: "Priority Support",
              desc: "Get help faster with dedicated priority support"
            }
          ].map((feature, i) => {
            const Icon = feature.icon;
            return (
              <Card key={i} className="p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Icon className="w-6 h-6 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                <p className="text-sm text-muted-foreground">{feature.desc}</p>
              </Card>
            );
          })}
        </div>
      </motion.div>

      {/* FAQ */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-8"
      >
        <h2 className="text-2xl font-bold text-foreground mb-6 text-center">
          Frequently Asked Questions
        </h2>
        <div className="grid md:grid-cols-2 gap-6">
          {[
            {
              q: "Can I change plans anytime?",
              a: "Yes! You can upgrade, downgrade, or cancel your subscription at any time."
            },
            {
              q: "What payment methods do you accept?",
              a: "We accept all major credit cards, PayPal, and bank transfers for enterprise plans."
            },
            {
              q: "Is there a free trial?",
              a: "Yes! Pro plan comes with a 14-day free trial. No credit card required."
            },
            {
              q: "What happens if I cancel?",
              a: "You'll keep access until the end of your billing period. Your data is saved for 30 days."
            }
          ].map((faq, i) => (
            <div key={i}>
              <h3 className="font-semibold text-foreground mb-2">{faq.q}</h3>
              <p className="text-sm text-muted-foreground">{faq.a}</p>
            </div>
          ))}
        </div>

        <div className="mt-8 pt-8 border-t border-border text-center">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Headphones className="w-5 h-5 text-primary" />
            <span className="font-semibold text-foreground">Need help choosing?</span>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Our team is here to help you find the perfect plan for your needs
          </p>
          <Button variant="outline">Contact Sales</Button>
        </div>
      </motion.div>
    </div>
  );
};

export default Subscription;
