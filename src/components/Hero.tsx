import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Play, Sparkles, ArrowRight, Zap, Clock, Share2 } from "lucide-react";

const Hero = () => {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 hero-gradient" />
      <div className="absolute inset-0 mesh-gradient" />
      
      {/* Animated Orbs */}
      <motion.div
        animate={{ 
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3]
        }}
        transition={{ duration: 8, repeat: Infinity }}
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl"
      />
      <motion.div
        animate={{ 
          scale: [1.2, 1, 1.2],
          opacity: [0.2, 0.4, 0.2]
        }}
        transition={{ duration: 10, repeat: Infinity }}
        className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl"
      />

      <div className="container mx-auto px-6 relative z-10">
        <div className="max-w-4xl mx-auto text-center">
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-glass-border mb-8"
          >
            <Sparkles className="w-4 h-4 text-primary" />
            <span className="text-sm text-muted-foreground">AI-Powered Video Creation</span>
          </motion.div>

          {/* Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-5xl md:text-7xl font-bold mb-6 leading-tight"
          >
            Create Viral
            <span className="gradient-text"> Captions & Videos </span>
            in Seconds
          </motion.h1>

          {/* Subheadline */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="text-xl text-muted-foreground mb-10 max-w-2xl mx-auto"
          >
            AI-powered caption generator for Instagram, TikTok, LinkedIn & more. Generate videos, add captions, and automate social posts. Free tier — no credit card.
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16"
          >
            <Button variant="hero" size="xl" asChild>
              <Link to="/register">
                Start Free Trial
                <ArrowRight className="w-5 h-5" />
              </Link>
            </Button>
            <Button variant="glass" size="xl" asChild>
              <Link to="/#demo">
                <Play className="w-5 h-5" />
                Watch Demo
              </Link>
            </Button>
          </motion.div>

          {/* Feature Pills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="flex flex-wrap items-center justify-center gap-4"
          >
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/30 border border-glass-border">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">10 Caption Variations</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/30 border border-glass-border">
              <Zap className="w-4 h-4 text-accent" />
              <span className="text-sm text-foreground">5 Platforms Supported</span>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-secondary/30 border border-glass-border">
              <Clock className="w-4 h-4 text-primary" />
              <span className="text-sm text-foreground">100% Free</span>
            </div>
          </motion.div>
        </div>

        {/* Video Preview */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.5 }}
          className="mt-20 max-w-5xl mx-auto"
        >
          <div className="relative glass-card p-2 glow-primary">
            <div className="aspect-video rounded-lg bg-gradient-to-br from-secondary to-card overflow-hidden relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur-xl border border-primary/30 flex items-center justify-center cursor-pointer"
                >
                  <Play className="w-8 h-8 text-primary ml-1" />
                </motion.div>
              </div>
              
              {/* Fake UI Elements */}
              <div className="absolute top-4 left-4 flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-destructive" />
                <div className="w-3 h-3 rounded-full bg-accent" />
                <div className="w-3 h-3 rounded-full bg-primary" />
              </div>
              
              <div className="absolute bottom-4 left-4 right-4">
                <div className="h-1 bg-secondary rounded-full overflow-hidden">
                  <div className="w-1/3 h-full bg-gradient-to-r from-primary to-accent" />
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Hero;
