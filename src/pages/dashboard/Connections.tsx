import { motion } from "framer-motion";
import { 
  Link2, 
  Check,
  Plus,
  ExternalLink,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useSocialAccounts } from "@/hooks/useSocialAccounts";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";

const platforms = [
  { 
    name: "YouTube", 
    icon: "▶", 
    color: "#FF0000",
    value: "youtube",
    authUrl: "https://accounts.google.com/o/oauth2/auth"
  },
  { 
    name: "TikTok", 
    icon: "♪", 
    color: "#00F2EA",
    value: "tiktok",
    authUrl: "https://www.tiktok.com/auth/authorize"
  },
  { 
    name: "Instagram", 
    icon: "📷", 
    color: "#E4405F",
    value: "instagram",
    authUrl: "https://www.facebook.com/dialog/oauth"
  },
  { 
    name: "Facebook", 
    icon: "f", 
    color: "#1877F2",
    value: "facebook",
    authUrl: "https://www.facebook.com/dialog/oauth"
  },
  { 
    name: "LinkedIn", 
    icon: "in", 
    color: "#0A66C2",
    value: "linkedin",
    authUrl: "https://www.linkedin.com/oauth/v2/authorization"
  },
];

const Connections = () => {
  const { accounts, connectAccount, disconnectAccount, getAccountByPlatform } = useSocialAccounts();
  const [connectingPlatform, setConnectingPlatform] = useState<string | null>(null);
  const [accessToken, setAccessToken] = useState("");
  const [pageId, setPageId] = useState("");

  const handleConnect = async (platform: string) => {
    setConnectingPlatform(platform);
    // In production, this should redirect to OAuth flow
    // For now, show a dialog to manually enter token
  };

  const handleManualConnect = async () => {
    if (!connectingPlatform || !accessToken) {
      toast.error("Please enter access token");
      return;
    }

    await connectAccount({
      platform: connectingPlatform,
      access_token: accessToken,
      page_id: pageId || undefined,
    });

    setConnectingPlatform(null);
    setAccessToken("");
    setPageId("");
  };

  const handleDisconnect = async (accountId: string) => {
    await disconnectAccount(accountId);
  };

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <Link2 className="w-8 h-8 text-primary" />
          Connections
        </h1>
        <p className="text-muted-foreground mt-1">
          Connect your social media accounts to enable posting
        </p>
      </motion.div>

      {/* Connection Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {platforms.map((platform, i) => {
          const account = getAccountByPlatform(platform.value);
          const isConnected = !!account;
          
          return (
            <motion.div
              key={platform.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card p-6"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-bold"
                    style={{ backgroundColor: `${platform.color}20`, color: platform.color }}
                  >
                    {platform.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{platform.name}</h3>
                    {isConnected ? (
                      <p className="text-sm text-muted-foreground">
                        {account.page_id || "Connected"}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground">Not connected</p>
                    )}
                  </div>
                </div>
                {isConnected && (
                  <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                    <Check className="w-4 h-4 text-primary" />
                  </div>
                )}
              </div>

              {isConnected ? (
                <>
                  <div className="mb-4">
                    <p className="text-xs text-muted-foreground mb-2">Status</p>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 rounded-md bg-secondary/50 text-xs text-foreground">
                        {account.expires_at && new Date(account.expires_at) > new Date() 
                          ? "Active" 
                          : "Expired"}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => account && handleDisconnect(account.id)}
                    >
                      Disconnect
                    </Button>
                    <Button variant="ghost" size="icon">
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-2 mb-4 p-3 rounded-lg bg-secondary/30">
                    <AlertCircle className="w-4 h-4 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">
                      Connect to enable posting and analytics
                    </p>
                  </div>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="hero" 
                        size="sm" 
                        className="w-full"
                        onClick={() => handleConnect(platform.value)}
                      >
                        <Plus className="w-4 h-4" />
                        Connect {platform.name}
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Connect {platform.name}</DialogTitle>
                      </DialogHeader>
                      <div className="space-y-4 mt-4">
                        <div>
                          <Label>Access Token</Label>
                          <Input
                            type="text"
                            placeholder="Enter access token"
                            value={accessToken}
                            onChange={(e) => setAccessToken(e.target.value)}
                          />
                          <p className="text-xs text-muted-foreground mt-1">
                            Get this from {platform.name} developer console
                          </p>
                        </div>
                        {(platform.value === "facebook" || platform.value === "instagram") && (
                          <div>
                            <Label>Page ID (Optional)</Label>
                            <Input
                              type="text"
                              placeholder="Enter page ID"
                              value={pageId}
                              onChange={(e) => setPageId(e.target.value)}
                            />
                          </div>
                        )}
                        <Button variant="hero" className="w-full" onClick={handleManualConnect}>
                          Connect
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full"
                          onClick={() => window.open(platform.authUrl, "_blank")}
                        >
                          Open {platform.name} OAuth
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </>
              )}
            </motion.div>
          );
        })}
      </div>

      {/* Info Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="mt-8 glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-2">About Connections</h3>
        <p className="text-muted-foreground text-sm mb-4">
          When you connect a social media account, VidFlow gets permission to post content on your behalf and access analytics. 
          Your credentials are encrypted and stored securely. You can disconnect anytime.
        </p>
        <div className="flex items-center gap-2 text-sm text-primary">
          <Link2 className="w-4 h-4" />
          <span>Learn more about our security practices</span>
        </div>
      </motion.div>
    </div>
  );
};

export default Connections;
