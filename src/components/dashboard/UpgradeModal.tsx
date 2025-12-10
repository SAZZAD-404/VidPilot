import { motion } from "framer-motion";
import { Crown, X, Zap, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  creditsRemaining: number;
  resetDate: string;
}

const UpgradeModal = ({ isOpen, onClose, creditsRemaining, resetDate }: UpgradeModalProps) => {
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-card p-8 max-w-lg w-full relative"
      >
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-muted-foreground hover:text-foreground"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center mx-auto mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-foreground mb-2">
            No Credits Remaining
          </h2>
          <p className="text-muted-foreground">
            You've used all {10 - creditsRemaining} of your free credits this month.
          </p>
        </div>

        <div className="glass-card p-6 mb-6 bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <div className="flex items-center gap-3 mb-4">
            <Zap className="w-6 h-6 text-primary" />
            <h3 className="font-semibold text-foreground">Upgrade to Pro</h3>
          </div>
          <ul className="space-y-2 mb-4">
            <li className="flex items-center gap-2 text-sm text-foreground">
              <Check className="w-4 h-4 text-primary" />
              <span>Unlimited AI generations</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-foreground">
              <Check className="w-4 h-4 text-primary" />
              <span>All social platforms</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-foreground">
              <Check className="w-4 h-4 text-primary" />
              <span>Priority support</span>
            </li>
            <li className="flex items-center gap-2 text-sm text-foreground">
              <Check className="w-4 h-4 text-primary" />
              <span>Advanced features</span>
            </li>
          </ul>
          <div className="text-center">
            <span className="text-3xl font-bold text-foreground">$29</span>
            <span className="text-muted-foreground">/month</span>
          </div>
        </div>

        <div className="space-y-3">
          <Button
            variant="hero"
            className="w-full"
            onClick={() => {
              navigate("/dashboard/subscription");
              onClose();
            }}
          >
            <Crown className="w-4 h-4 mr-2" />
            Upgrade to Pro Now
          </Button>
          <Button
            variant="outline"
            className="w-full"
            onClick={onClose}
          >
            Maybe Later
          </Button>
        </div>

        <p className="text-xs text-center text-muted-foreground mt-4">
          Your credits will reset on {resetDate}
        </p>
      </motion.div>
    </div>
  );
};

export default UpgradeModal;
