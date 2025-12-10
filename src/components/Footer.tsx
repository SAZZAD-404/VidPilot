import { Link } from "react-router-dom";
import { Video, Twitter, Github, Linkedin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border py-12">
      <div className="container mx-auto px-6">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                <Video className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-foreground">VidPilot</span>
            </Link>
            <p className="text-muted-foreground text-sm">
              AI-powered video creation and social media automation platform.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Github className="w-5 h-5" />
              </a>
              <a href="#" className="text-muted-foreground hover:text-primary transition-colors">
                <Linkedin className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Product</h4>
            <ul className="space-y-2">
              <li><Link to="/#features" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Features</Link></li>
              <li><Link to="/#pricing" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Pricing</Link></li>
              <li><Link to="/dashboard" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Dashboard</Link></li>
              <li><Link to="/#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">API</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Company</h4>
            <ul className="space-y-2">
              <li><Link to="/#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">About</Link></li>
              <li><Link to="/#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Blog</Link></li>
              <li><Link to="/#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Careers</Link></li>
              <li><Link to="/#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Contact</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><Link to="/#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Privacy</Link></li>
              <li><Link to="/#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Terms</Link></li>
              <li><Link to="/#" className="text-muted-foreground hover:text-foreground transition-colors text-sm">Security</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center">
          <p className="text-muted-foreground text-sm">
            © 2024 VidPilot. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
