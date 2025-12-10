import { Link, useLocation, useNavigate } from "react-router-dom";
import { 
  Video, 
  LayoutDashboard, 
  Library,
  Settings,
  LogOut,
  ChevronLeft,
  Sparkles,
  MessageSquare,
  Eye,
  Crown
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { isDemoMode, exitDemoMode } from "@/lib/demoMode";

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
  { icon: Sparkles, label: "Caption Generator", href: "/dashboard/captions" },
  { icon: MessageSquare, label: "Social Posts", href: "/dashboard/social-posts" },
  { icon: Video, label: "YouTube Stories", href: "/dashboard/youtube-stories" },
  { icon: Library, label: "History", href: "/dashboard/history" },
  { icon: Crown, label: "Subscription", href: "/dashboard/subscription" },
  { icon: Settings, label: "Settings", href: "/dashboard/settings" },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
  mobileOpen?: boolean;
  onMobileClose?: () => void;
}

const Sidebar = ({ collapsed = false, onToggle, mobileOpen = false, onMobileClose }: SidebarProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const isDemo = isDemoMode() && !user; // Only show demo mode if not logged in

  const handleLogout = async () => {
    try {
      if (isDemo) {
        exitDemoMode();
        toast.success("Exited demo mode");
        navigate("/login");
        return;
      }
      
      await signOut();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
      toast.error("Failed to logout");
    }
  };

  return (
    <aside className={cn(
      "fixed left-0 top-0 h-screen bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-300 z-40",
      // Desktop styles
      "hidden lg:flex",
      collapsed ? "lg:w-20" : "lg:w-64",
      // Mobile styles
      "lg:translate-x-0",
      mobileOpen ? "flex translate-x-0" : "-translate-x-full",
      "w-64" // Full width on mobile
    )}>
      {/* Logo - Only show on desktop */}
      <div className="h-16 items-center justify-between px-4 border-b border-sidebar-border hidden lg:flex">
        <Link to="/dashboard" className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
            <Video className="w-5 h-5 text-primary-foreground" />
          </div>
          {!collapsed && <span className="text-xl font-bold text-foreground">VidPilot</span>}
        </Link>
        {onToggle && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onToggle}
            className="h-8 w-8"
          >
            <ChevronLeft className={cn(
              "w-4 h-4 transition-transform",
              collapsed && "rotate-180"
            )} />
          </Button>
        )}
      </div>

      {/* Mobile Header inside sidebar */}
      <div className="h-16 flex items-center px-4 border-b border-sidebar-border lg:hidden">
        <Link to="/dashboard" className="flex items-center gap-2" onClick={onMobileClose}>
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-primary to-accent flex items-center justify-center flex-shrink-0">
            <Video className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="text-xl font-bold text-foreground">VidPilot</span>
        </Link>
      </div>

      {/* Demo Mode Banner */}
      {isDemo && !collapsed && (
        <div className="mx-3 mt-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
          <div className="flex items-center gap-2 mb-1">
            <Eye className="w-4 h-4 text-amber-500" />
            <span className="text-sm font-semibold text-amber-500">Demo Mode</span>
          </div>
          <p className="text-xs text-amber-500/80">View only - Sign up to unlock features</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={onMobileClose}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200",
                isActive 
                  ? "bg-sidebar-primary text-sidebar-primary-foreground" 
                  : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                // Always show text on mobile
                "lg:justify-start",
                collapsed && "lg:justify-center"
              )}
            >
              <item.icon className="w-5 h-5 flex-shrink-0" />
              <span className={cn(
                "font-medium",
                collapsed && "lg:hidden"
              )}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Bottom Section */}
      <div className="p-3 border-t border-sidebar-border space-y-2">
        {isDemo && (
          <Button
            variant="hero"
            className="w-full"
            onClick={() => {
              if (onMobileClose) onMobileClose();
              navigate("/register");
            }}
          >
            Sign Up to Unlock
          </Button>
        )}
        <button
          onClick={() => {
            if (onMobileClose) onMobileClose();
            handleLogout();
          }}
          className={cn(
            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-all duration-200",
            collapsed && "lg:justify-center"
          )}
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          <span className={cn(
            "font-medium",
            collapsed && "lg:hidden"
          )}>{isDemo ? "Exit Demo" : "Logout"}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
