import { useEffect, useState } from "react";
import { Crown, Zap } from "lucide-react";
import { getCredits, getCreditPercentage, updatePlan, type CreditInfo } from "@/lib/creditSystem";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

const CreditDisplay = () => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const navigate = useNavigate();
  const [credits, setCredits] = useState<CreditInfo>(getCredits(user?.id));
  const [percentage, setPercentage] = useState(getCreditPercentage(user?.id));

  useEffect(() => {
    // Update plan in credit system when subscription changes
    if (subscription && user) {
      updatePlan(subscription.plan, user.id);
    }
  }, [subscription, user]);

  useEffect(() => {
    const updateCredits = () => {
      const newCredits = getCredits(user?.id);
      const newPercentage = getCreditPercentage(user?.id);
      setCredits(newCredits);
      setPercentage(newPercentage);
    };

    updateCredits();

    // Update every 5 seconds
    const interval = setInterval(updateCredits, 5000);
    return () => clearInterval(interval);
  }, [user?.id, subscription]);

  const isUnlimited = credits.plan === "pro" || credits.plan === "enterprise";
  const isHigh = percentage > 80 && !isUnlimited; // High usage (80%+ used)

  return (
    <div className="glass-card p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Zap className={`w-5 h-5 ${isHigh ? "text-red-500" : "text-primary"}`} />
          <span className="font-semibold text-foreground">
            {isUnlimited ? "Unlimited Credits" : "AI Credits"}
          </span>
        </div>
        {credits.plan === "free" && (
          <Button
            variant="ghost"
            size="sm"
            className="h-7 text-xs"
            onClick={() => navigate("/dashboard/subscription")}
          >
            <Crown className="w-3 h-3 mr-1" />
            Upgrade
          </Button>
        )}
      </div>

      {!isUnlimited && (
        <>
          <div className="flex items-center justify-between mb-2">
            <span className="text-2xl font-bold text-foreground">
              {credits.used}/{credits.total}
            </span>
            <span className="text-xs text-muted-foreground">
              Resets {credits.resetDate}
            </span>
          </div>

          <Progress value={percentage} className="h-2" />

          {credits.remaining === 0 && (
            <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs text-red-500 font-semibold mb-2">
                ⚠️ No credits remaining!
              </p>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={() => navigate("/dashboard/subscription")}
              >
                <Crown className="w-3 h-3 mr-1" />
                Upgrade Now
              </Button>
            </div>
          )}
          
          {isHigh && credits.remaining > 0 && (
            <p className="text-xs text-amber-500 mt-2">
              ⚠️ Running low on credits! Upgrade for unlimited access
            </p>
          )}
        </>
      )}

      {isUnlimited && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Crown className="w-4 h-4 text-primary" />
          <span>Enjoy unlimited AI generations</span>
        </div>
      )}
    </div>
  );
};

export default CreditDisplay;
