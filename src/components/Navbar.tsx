import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Video, Sparkles } from "lucide-react";
import { motion } from "framer-motion";

const Navbar = () => {
  return (
    <motion.nav
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-glass-border"
    >
      <div className="container mx-auto px-6 h-16 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Video className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">VidPilot</span>
        </Link>

        <div className="hidden md:flex items-center gap-8">
          <Link to="/#features" className="text-muted-foreground hover:text-foreground transition-colors">
            Features
          </Link>
          <Link to="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors">
            Pricing
          </Link>
          <Link to="/#how-it-works" className="text-muted-foreground hover:text-foreground transition-colors">
            How It Works
          </Link>
        </div>

        <div className="flex items-center gap-3">
          <Button variant="ghost" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
          <Button variant="hero" asChild>
            <Link to="/register">
              <Sparkles className="w-4 h-4" />
              Get Started
            </Link>
          </Button>
        </div>
      </div>
    </motion.nav>
  );
};

export default Navbar;
