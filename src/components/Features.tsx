import { motion } from "framer-motion";
import { 
  Wand2, 
  Captions, 
  Calendar, 
  BarChart3, 
  Globe2, 
  Zap,
  Video,
  Bot
} from "lucide-react";

const features = [
  {
    icon: Wand2,
    title: "AI Script Generation",
    description: "Generate engaging video scripts instantly using advanced AI models. Just describe your topic.",
    color: "primary"
  },
  {
    icon: Captions,
    title: "Auto Captions",
    description: "Automatically add perfectly timed subtitles to your videos using Whisper AI technology.",
    color: "accent"
  },
  {
    icon: Video,
    title: "Template Editor",
    description: "Choose from stunning templates with auto zoom, transitions, and background music.",
    color: "primary"
  },
  {
    icon: Calendar,
    title: "Smart Scheduler",
    description: "Schedule posts across all platforms at optimal times for maximum engagement.",
    color: "accent"
  },
  {
    icon: Globe2,
    title: "Multi-Platform",
    description: "Post to YouTube, TikTok, Instagram, Facebook, and LinkedIn from one dashboard.",
    color: "primary"
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track performance, engagement, and growth across all your social channels.",
    color: "accent"
  },
  {
    icon: Bot,
    title: "AI Optimization",
    description: "AI suggests best posting times, hashtags, and content improvements.",
    color: "primary"
  },
  {
    icon: Zap,
    title: "Bulk Processing",
    description: "Create and schedule dozens of videos at once with batch processing.",
    color: "accent"
  }
];

const Features = () => {
  return (
    <section id="features" className="py-24 relative">
      <div className="absolute inset-0 mesh-gradient opacity-50" />
      
      <div className="container mx-auto px-6 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Everything You Need to
            <span className="gradient-text"> Dominate </span>
            Social
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Powerful AI tools combined with seamless automation. Create once, publish everywhere.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              className="glass-card p-6 group cursor-pointer"
            >
              <div className={`w-12 h-12 rounded-xl mb-4 flex items-center justify-center ${
                feature.color === 'primary' 
                  ? 'bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground' 
                  : 'bg-accent/10 text-accent group-hover:bg-accent group-hover:text-accent-foreground'
              } transition-all duration-300`}>
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2 text-foreground">{feature.title}</h3>
              <p className="text-muted-foreground text-sm">{feature.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
