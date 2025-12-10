import { motion } from "framer-motion";
import { 
  Sparkles, 
  Library, 
  TrendingUp, 
  Hash,
  Plus,
  ArrowRight,
  FileText,
  Download,
  Video
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { useCaptions } from "@/hooks/useCaptions";
import { useAuth } from "@/hooks/useAuth";
import { useEffect, useState } from "react";
import CreditDisplay from "@/components/dashboard/CreditDisplay";
import { activityHistory, Activity } from "@/lib/activityHistory";

const DashboardHome = () => {
  const { user } = useAuth();
  const { captions, fetchCaptions, getUsageStats } = useCaptions();
  const [usageStats, setUsageStats] = useState<Record<string, number> | null>(null);
  const [recentActivities, setRecentActivities] = useState<Activity[]>([]);

  useEffect(() => {
    if (user) {
      fetchCaptions();
      loadUsageStats();
      loadRecentActivities();
    }
  }, [user]);

  const loadUsageStats = async () => {
    const stats = await getUsageStats();
    setUsageStats(stats);
  };

  const loadRecentActivities = () => {
    const activities = activityHistory.getRecent(5);
    setRecentActivities(activities);
  };

  const monthlyLimit = 100;
  const currentUsage = usageStats?.caption_generation || 0;
  const savedCount = captions.filter(c => c.saved).length;

  const stats = [
    { 
      label: "Captions Generated", 
      value: currentUsage.toString(), 
      icon: Sparkles, 
      subtext: `${monthlyLimit - currentUsage} remaining this month`,
      color: "text-primary"
    },
    { 
      label: "Total Captions", 
      value: savedCount.toString(), 
      icon: Library, 
      subtext: "In your history",
      color: "text-accent"
    },
    { 
      label: "Most Used Platform", 
      value: getMostUsedPlatform(), 
      icon: TrendingUp, 
      subtext: "This month",
      color: "text-blue-500"
    },
    { 
      label: "Favorite Tone", 
      value: getFavoriteTone(), 
      icon: Hash, 
      subtext: "Most generated",
      color: "text-purple-500"
    },
  ];

  function getMostUsedPlatform() {
    if (captions.length === 0) return "N/A";
    const platforms = captions.map(c => c.platform);
    const counts = platforms.reduce((acc: any, p) => {
      acc[p] = (acc[p] || 0) + 1;
      return acc;
    }, {});
    const sorted = Object.entries(counts).sort((a: any, b: any) => b[1] - a[1]);
    return sorted[0]?.[0]?.charAt(0).toUpperCase() + sorted[0]?.[0]?.slice(1) || "N/A";
  }

  function getFavoriteTone() {
    if (captions.length === 0) return "N/A";
    const tones = captions.map(c => c.tone);
    const counts = tones.reduce((acc: any, t) => {
      acc[t] = (acc[t] || 0) + 1;
      return acc;
    }, {});
    const sorted = Object.entries(counts).sort((a: any, b: any) => b[1] - a[1]);
    return sorted[0]?.[0]?.charAt(0).toUpperCase() + sorted[0]?.[0]?.slice(1) || "N/A";
  }

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'caption':
        return Sparkles;
      case 'social_post':
        return Hash;
      case 'video':
        return Video;
      case 'export':
        return Download;
      default:
        return FileText;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'caption':
        return 'text-primary';
      case 'social_post':
        return 'text-purple-500';
      case 'video':
        return 'text-red-500';
      case 'export':
        return 'text-blue-500';
      default:
        return 'text-accent';
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between mb-8"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground">Welcome back! Here's your caption overview.</p>
        </div>
        <Button variant="hero" asChild>
          <Link to="/dashboard/captions">
            <Plus className="w-5 h-5" />
            Generate Captions
          </Link>
        </Button>
      </motion.div>

      {/* Credit Display */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <CreditDisplay />
      </motion.div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-card p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
            <h3 className="text-2xl font-bold text-foreground mb-1">{stat.value}</h3>
            <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
            <p className="text-xs text-muted-foreground/70">{stat.subtext}</p>
          </motion.div>
        ))}
      </div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card p-6 mb-8"
      >
        <h2 className="text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Link to="/dashboard/captions">
            <div className="p-4 rounded-lg bg-secondary/30 border border-border hover:border-primary/50 transition-all cursor-pointer group">
              <Sparkles className="w-8 h-8 text-primary mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground mb-1">Caption Generator</h3>
              <p className="text-sm text-muted-foreground">AI-powered captions</p>
            </div>
          </Link>

          <Link to="/dashboard/social-posts">
            <div className="p-4 rounded-lg bg-secondary/30 border border-border hover:border-primary/50 transition-all cursor-pointer group">
              <Hash className="w-8 h-8 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground mb-1">Social Posts</h3>
              <p className="text-sm text-muted-foreground">Full post variations</p>
            </div>
          </Link>

          <Link to="/dashboard/youtube-stories">
            <div className="p-4 rounded-lg bg-secondary/30 border border-border hover:border-primary/50 transition-all cursor-pointer group">
              <Video className="w-8 h-8 text-red-500 mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground mb-1">YouTube Stories</h3>
              <p className="text-sm text-muted-foreground">Engaging video stories</p>
            </div>
          </Link>
          
          <Link to="/dashboard/library">
            <div className="p-4 rounded-lg bg-secondary/30 border border-border hover:border-primary/50 transition-all cursor-pointer group">
              <Library className="w-8 h-8 text-accent mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-semibold text-foreground mb-1">Caption History</h3>
              <p className="text-sm text-muted-foreground">View all generated captions</p>
            </div>
          </Link>
        </div>
      </motion.div>

      {/* History */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="glass-card p-6"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-foreground">History</h2>
          <Button variant="ghost" size="sm" asChild>
            <Link to="/dashboard/history">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>

        {recentActivities.length === 0 ? (
          <div className="text-center py-12">
            <Sparkles className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No activity yet</p>
            <Button variant="hero" asChild>
              <Link to="/dashboard/captions">
                <Plus className="w-4 h-4" />
                Get Started
              </Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {recentActivities.map((activity) => {
              const Icon = getActivityIcon(activity.type);
              const colorClass = getActivityColor(activity.type);
              
              return (
                <div
                  key={activity.id}
                  className="p-4 rounded-lg bg-secondary/30 border border-border hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-5 h-5 ${colorClass}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-sm font-semibold text-foreground">{activity.title}</h3>
                        <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary capitalize">
                          {activity.type.replace('_', ' ')}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                        {activity.content}
                      </p>
                      <div className="flex items-center gap-2 flex-wrap">
                        {activity.metadata.platform && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">
                            {activity.metadata.platform}
                          </span>
                        )}
                        {activity.metadata.tone && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground capitalize">
                            {activity.metadata.tone}
                          </span>
                        )}
                        {activity.metadata.format && (
                          <span className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground uppercase">
                            {activity.metadata.format}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </motion.div>


    </div>
  );
};

export default DashboardHome;
