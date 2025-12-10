import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  History as HistoryIcon, 
  Sparkles, 
  MessageSquare, 
  Download, 
  Trash2, 
  Copy,
  Search,
  Filter,
  Calendar,
  X,
  RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { toast } from "sonner";
import { activityHistory, type Activity, type ActivityType } from "@/lib/activityHistory";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const activityIcons: Record<ActivityType, any> = {
  caption: Sparkles,
  social_post: MessageSquare,
  video: Download,
  export: Download,
  schedule: Calendar,
};

const activityColors: Record<ActivityType, string> = {
  caption: "text-primary bg-primary/10 border-primary/20",
  social_post: "text-purple-500 bg-purple-500/10 border-purple-500/20",
  video: "text-blue-500 bg-blue-500/10 border-blue-500/20",
  export: "text-accent bg-accent/10 border-accent/20",
  schedule: "text-green-500 bg-green-500/10 border-green-500/20",
};

const History = () => {
  const [activities, setActivities] = useState<Activity[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [stats, setStats] = useState(activityHistory.getStats());

  useEffect(() => {
    loadActivities();
    
    // Listen for activity updates
    const handleActivityUpdate = () => {
      console.log('Activity update detected, refreshing history...');
      loadActivities();
    };
    
    window.addEventListener('activityHistoryUpdated', handleActivityUpdate);
    
    return () => {
      window.removeEventListener('activityHistoryUpdated', handleActivityUpdate);
    };
  }, []);

  const loadActivities = () => {
    const allActivities = activityHistory.getAll();
    setActivities(allActivities);
    setStats(activityHistory.getStats());
  };

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = searchQuery.trim() === "" || 
      activity.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      activity.content.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesType = filterType === "all" || activity.type === filterType;
    
    return matchesSearch && matchesType;
  });

  const handleCopy = (activity: Activity) => {
    let textToCopy = activity.content;
    if (activity.metadata.hashtags && activity.metadata.hashtags.length > 0) {
      textToCopy += `\n\n${activity.metadata.hashtags.map(tag => `#${tag}`).join(" ")}`;
    }
    navigator.clipboard.writeText(textToCopy);
    toast.success("Copied to clipboard!");
  };

  const handleDelete = (id: string) => {
    if (confirm("Delete this activity from history?")) {
      activityHistory.delete(id);
      loadActivities();
      toast.success("Activity deleted");
    }
  };

  const handleClearAll = () => {
    if (confirm("Clear all history? This cannot be undone.")) {
      activityHistory.clear();
      loadActivities();
      toast.success("History cleared");
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
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
          <HistoryIcon className="w-8 h-8 text-primary" />
          Activity History
        </h1>
        <p className="text-muted-foreground mt-1">
          All your generated content and activities
        </p>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card p-4"
        >
          <p className="text-sm text-muted-foreground mb-1">Total</p>
          <p className="text-2xl font-bold text-foreground">{stats.total}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="glass-card p-4"
        >
          <p className="text-sm text-muted-foreground mb-1">Captions</p>
          <p className="text-2xl font-bold text-primary">{stats.captions}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card p-4"
        >
          <p className="text-sm text-muted-foreground mb-1">Posts</p>
          <p className="text-2xl font-bold text-purple-500">{stats.socialPosts}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="glass-card p-4"
        >
          <p className="text-sm text-muted-foreground mb-1">Exports</p>
          <p className="text-2xl font-bold text-accent">{stats.exports}</p>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card p-4"
        >
          <p className="text-sm text-muted-foreground mb-1">Today</p>
          <p className="text-2xl font-bold text-green-500">{stats.today}</p>
        </motion.div>
      </div>

      {/* Search & Filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="glass-card p-4 mb-6"
      >
        <div className="grid md:grid-cols-3 gap-4">
          <div className="md:col-span-2 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search activities..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-10 bg-secondary border-border"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="bg-secondary">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="caption">Captions</SelectItem>
              <SelectItem value="social_post">Social Posts</SelectItem>
              <SelectItem value="export">Exports</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            {filteredActivities.length} activities found
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={loadActivities}>
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh
            </Button>
            {activities.length > 0 && (
              <Button variant="ghost" size="sm" onClick={handleClearAll}>
                <Trash2 className="w-4 h-4 mr-2" />
                Clear All
              </Button>
            )}
          </div>
        </div>
      </motion.div>

      {/* Activities List */}
      {filteredActivities.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="glass-card p-12 text-center"
        >
          <HistoryIcon className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            {searchQuery || filterType !== "all" ? "No activities found" : "No history yet"}
          </h3>
          <p className="text-sm text-muted-foreground">
            {searchQuery || filterType !== "all"
              ? "Try adjusting your filters"
              : "Start generating content to see your activity history"}
          </p>
        </motion.div>
      ) : (
        <div className="space-y-3">
          {filteredActivities.map((activity, index) => {
            const Icon = activityIcons[activity.type];
            const colorClass = activityColors[activity.type];

            return (
              <motion.div
                key={activity.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.03 }}
              >
                <Card className="p-4 bg-secondary/30 border-border hover:border-primary/50 transition-colors">
                  <div className="flex items-start gap-4">
                    {/* Icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 border ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-4 mb-2">
                        <div>
                          <h3 className="font-semibold text-foreground">{activity.title}</h3>
                          <p className="text-xs text-muted-foreground mt-1">
                            {formatDate(activity.created_at)}
                          </p>
                        </div>
                        <div className="flex gap-2 flex-shrink-0">
                          {activity.type !== 'export' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleCopy(activity)}
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDelete(activity.id)}
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Activity Content */}
                      <p className="text-sm text-foreground/80 line-clamp-2 mb-2">
                        {activity.content}
                      </p>

                      {/* Metadata */}
                      <div className="flex flex-wrap gap-2">
                        {activity.metadata.platform && (
                          <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary capitalize">
                            {activity.metadata.platform}
                          </span>
                        )}
                        {activity.metadata.tone && (
                          <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent capitalize">
                            {activity.metadata.tone}
                          </span>
                        )}
                        {activity.metadata.language && (
                          <span className="text-xs px-2 py-1 rounded-full bg-blue-500/10 text-blue-500 capitalize">
                            {activity.metadata.language}
                          </span>
                        )}
                        {activity.metadata.variations && (
                          <span className="text-xs px-2 py-1 rounded-full bg-purple-500/10 text-purple-500">
                            {activity.metadata.variations} variations
                          </span>
                        )}
                      </div>

                      {/* Hashtags */}
                      {activity.metadata.hashtags && activity.metadata.hashtags.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {activity.metadata.hashtags.slice(0, 5).map((tag, i) => (
                            <span
                              key={i}
                              className="text-xs px-2 py-0.5 rounded-full bg-secondary text-muted-foreground"
                            >
                              #{tag}
                            </span>
                          ))}
                          {activity.metadata.hashtags.length > 5 && (
                            <span className="text-xs text-muted-foreground">
                              +{activity.metadata.hashtags.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default History;
