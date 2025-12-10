import { Link } from "react-router-dom";
import { Menu, X, Video } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MobileHeaderProps {
  onMenuToggle: () => void;
  menuOpen: boolean;
}

const MobileHeader = ({ onMenuToggle, menuOpen }: MobileHeaderProps) => {
  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-sidebar border-b border-sidebar-border z-40 lg:hidden">
      <div className="h-full px-4 flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center">
            <Video className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">VidPilot</span>
        </Link>

        {/* Menu Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={onMenuToggle}
          className="h-10 w-10"
        >
          {menuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </Button>
      </div>
    </header>
  );
};

export default MobileHeader;
