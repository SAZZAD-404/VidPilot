import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Settings as SettingsIcon, 
  User,
  Bell,
  CreditCard,
  Camera,
  Check,
  Crown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useAuth } from "@/hooks/useAuth";
import { useSubscription } from "@/hooks/useSubscription";
import { toast } from "sonner";
import { isDemoMode } from "@/lib/demoMode";
import { Card } from "@/components/ui/card";

const Settings = () => {
  const { user, updatePassword, updateProfile } = useAuth();
  const { subscription, isPro, isEnterprise } = useSubscription();
  const navigate = useNavigate();
  const isDemo = isDemoMode();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.user_metadata?.name || "");
      setEmail(user.email || "");
    } else if (isDemo) {
      setName("Demo User");
      setEmail("demo@vidpilot.com");
    }
  }, [user, isDemo]);

  const handleSaveProfile = async () => {
    if (isDemo) {
      toast.error("Demo mode - Cannot save changes");
      return;
    }

    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    setIsSaving(true);
    try {
      const { error } = await updateProfile(name, email);
      
      if (error) throw error;
      
      toast.success("Profile updated successfully!");
    } catch (error: any) {
      console.error("Profile update error:", error);
      toast.error(error.message || "Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };



  const getInitials = () => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    return email ? email[0].toUpperCase() : 'U';
  };

  const handleChangePassword = async () => {
    if (isDemo && !user) {
      toast.error("Demo mode - Cannot change password");
      return;
    }

    if (!newPassword || !confirmPassword) {
      toast.error("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("New passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      const { error } = await updatePassword(newPassword);
      
      if (error) throw error;
      
      toast.success("Password updated successfully!");
      setShowPasswordDialog(false);
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      console.error("Password update error:", error);
      toast.error(error.message || "Failed to update password");
    } finally {
      setIsChangingPassword(false);
    }
  };
  return (
    <div className="p-8 max-w-4xl">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <SettingsIcon className="w-8 h-8 text-primary" />
          Settings
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage your account preferences
        </p>
      </motion.div>

      <div className="space-y-6">
        {/* Profile Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <User className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Profile</h2>
          </div>
          
          <div className="flex items-start gap-6 mb-6">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-3xl font-bold text-primary-foreground">
                {getInitials()}
              </div>
              <button className="absolute bottom-0 right-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center hover:bg-primary/90 transition-colors">
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-foreground mb-1">{name || "User"}</h3>
              <p className="text-sm text-muted-foreground mb-3">{email}</p>
              {(isDemo && !user) && (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
                  <span className="text-xs font-medium text-amber-500">Demo Account</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name"
                value={name} 
                onChange={(e) => setName(e.target.value)}
                className="bg-secondary border-border" 
                disabled={isDemo}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input 
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-secondary border-border" 
                disabled={isDemo}
              />
            </div>
          </div>

          <Button 
            variant="hero" 
            className="mt-6"
            onClick={handleSaveProfile}
            disabled={isSaving || isDemo}
          >
            {isSaving ? "Saving..." : "Save Changes"}
          </Button>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <Bell className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Notifications</h2>
          </div>
          
          <div className="space-y-4">
            {[
              { label: "Email notifications", desc: "Receive updates about your posts" },
              { label: "Post reminders", desc: "Get reminded before scheduled posts" },
              { label: "Analytics reports", desc: "Weekly performance summaries" },
              { label: "Marketing emails", desc: "Tips and product updates" },
            ].map((item, i) => (
              <div key={i} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                <div>
                  <p className="font-medium text-foreground">{item.label}</p>
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                </div>
                <Switch defaultChecked={i < 3} />
              </div>
            ))}
          </div>
        </motion.div>

        {/* Subscription */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card p-6"
        >
          <div className="flex items-center gap-3 mb-6">
            <CreditCard className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-semibold text-foreground">Subscription</h2>
          </div>
          
          {isDemo ? (
            <Card className="p-6 bg-gradient-to-br from-amber-500/10 to-orange-500/10 border-amber-500/20">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Crown className="w-6 h-6 text-amber-500" />
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-foreground mb-2">Demo Mode - Limited Access</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Sign up to unlock all features including unlimited captions, social posts, and exports.
                  </p>
                  <Button variant="default" className="bg-amber-500 hover:bg-amber-600" onClick={() => navigate("/register")}>
                    Sign Up Now
                  </Button>
                </div>
              </div>
            </Card>
          ) : (
            <>
              <div className={`p-4 rounded-lg border mb-4 ${
                isPro || isEnterprise
                  ? 'bg-gradient-to-r from-primary/20 to-accent/20 border-primary/30'
                  : 'bg-gradient-to-r from-primary/10 to-accent/10 border-primary/20'
              }`}>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-foreground flex items-center gap-2">
                      {isEnterprise ? 'Enterprise Plan' : isPro ? 'Pro Plan' : 'Free Plan'}
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary capitalize">
                        {subscription?.status || 'Active'}
                      </span>
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      {isPro || isEnterprise ? 'Unlimited credits' : '10 credits/month'}
                    </p>
                  </div>
                  {!isPro && !isEnterprise && (
                    <Button variant="accent" onClick={() => navigate("/dashboard/subscription")}>
                      <Crown className="w-4 h-4 mr-2" />
                      Upgrade to Pro
                    </Button>
                  )}
                  {(isPro || isEnterprise) && (
                    <Button variant="outline" onClick={() => navigate("/dashboard/subscription")}>
                      <CreditCard className="w-4 h-4 mr-2" />
                      Manage Plan
                    </Button>
                  )}
                </div>
              </div>

              <div className="grid md:grid-cols-3 gap-4 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  <span>{isPro || isEnterprise ? 'Unlimited credits' : '10 credits/month'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  <span>{isPro || isEnterprise ? 'All platforms' : '2 platforms'}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Check className="w-4 h-4 text-primary" />
                  <span>{isPro || isEnterprise ? 'Priority support' : 'Basic support'}</span>
                </div>
              </div>
            </>
          )}
        </motion.div>


      </div>

      {/* Change Password Dialog */}
      {showPasswordDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="glass-card p-6 max-w-md w-full"
          >
            <h3 className="text-lg font-semibold text-foreground mb-4">Change Password</h3>
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input
                  id="new-password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="bg-secondary border-border"
                  placeholder="Enter new password"
                />
                <p className="text-xs text-muted-foreground">
                  Must be at least 6 characters
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input
                  id="confirm-password"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="bg-secondary border-border"
                  placeholder="Confirm new password"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => {
                  setShowPasswordDialog(false);
                  setNewPassword("");
                  setConfirmPassword("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="hero"
                className="flex-1"
                onClick={handleChangePassword}
                disabled={isChangingPassword}
              >
                {isChangingPassword ? "Updating..." : "Update Password"}
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  );
};

export default Settings;
