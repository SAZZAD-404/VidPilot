import { motion } from "framer-motion";
import { 
  BarChart3, 
  TrendingUp, 
  Eye, 
  Heart,
  Share2,
  Users
} from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line, CartesianGrid } from "recharts";

const viewsData: { name: string; views: number }[] = [];
const growthData: { name: string; followers: number }[] = [];
const platformStats: { name: string; followers: string; engagement: string; color: string }[] = [
  { name: "YouTube", followers: "0", engagement: "0%", color: "#FF0000" },
  { name: "TikTok", followers: "0", engagement: "0%", color: "#00F2EA" },
  { name: "Instagram", followers: "0", engagement: "0%", color: "#E4405F" },
  { name: "Facebook", followers: "0", engagement: "0%", color: "#1877F2" },
];

const Analytics = () => {
  return (
    <div className="p-8">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-8"
      >
        <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" />
          Analytics
        </h1>
        <p className="text-muted-foreground mt-1">
          Track your content performance across all platforms
        </p>
      </motion.div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {[
          { icon: Eye, label: "Total Views", value: "0", change: "" },
          { icon: Heart, label: "Total Likes", value: "0", change: "" },
          { icon: Share2, label: "Shares", value: "0", change: "" },
          { icon: Users, label: "New Followers", value: "0", change: "" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass-card p-5"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                <stat.icon className="w-5 h-5 text-primary" />
              </div>
              {stat.change && <span className="text-sm text-primary">{stat.change}</span>}
            </div>
            <p className="text-2xl font-bold text-foreground">{stat.value}</p>
            <p className="text-sm text-muted-foreground">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        {/* Views Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4">Weekly Views</h3>
          <div className="h-64 flex items-center justify-center">
            {viewsData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={viewsData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="views" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </div>
        </motion.div>

        {/* Growth Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-card p-6"
        >
          <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            Follower Growth
          </h3>
          <div className="h-64 flex items-center justify-center">
            {growthData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={growthData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="followers" 
                    stroke="hsl(var(--primary))" 
                    strokeWidth={3}
                    dot={{ fill: 'hsl(var(--primary))' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-muted-foreground">No data available</p>
            )}
          </div>
        </motion.div>
      </div>

      {/* Platform Stats */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card p-6"
      >
        <h3 className="text-lg font-semibold text-foreground mb-4">Platform Breakdown</h3>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
          {platformStats.map(platform => (
            <div 
              key={platform.name}
              className="p-4 rounded-lg bg-secondary/30 border border-border"
            >
              <div className="flex items-center gap-3 mb-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${platform.color}20` }}
                >
                  <div 
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: platform.color }}
                  />
                </div>
                <span className="font-medium text-foreground">{platform.name}</span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xl font-bold text-foreground">{platform.followers}</p>
                  <p className="text-xs text-muted-foreground">Followers</p>
                </div>
                <div>
                  <p className="text-xl font-bold text-foreground">{platform.engagement}</p>
                  <p className="text-xs text-muted-foreground">Engagement</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default Analytics;
