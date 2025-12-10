import { useState, useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import MobileHeader from "./MobileHeader";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { isDemoMode } from "@/lib/demoMode";

const DashboardLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const isDemo = isDemoMode();

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [navigate]);

  // Redirect to login if not authenticated and not in demo mode
  useEffect(() => {
    if (!isLoading && !user && !isDemo) {
      navigate("/login");
    }
  }, [user, isLoading, isDemo, navigate]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Allow access if user is logged in OR in demo mode
  if (!user && !isDemo) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Header - Only visible on mobile */}
      <MobileHeader 
        onMenuToggle={() => setMobileMenuOpen(!mobileMenuOpen)} 
        menuOpen={mobileMenuOpen}
      />

      {/* Sidebar - Hidden on mobile, shown on desktop */}
      <Sidebar 
        collapsed={collapsed} 
        onToggle={() => setCollapsed(!collapsed)}
        mobileOpen={mobileMenuOpen}
        onMobileClose={() => setMobileMenuOpen(false)}
      />

      {/* Overlay for mobile menu */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Main Content */}
      <main className={cn(
        "min-h-screen transition-all duration-300",
        "pt-16 lg:pt-0", // Add padding-top on mobile for fixed header
        collapsed ? "lg:ml-20" : "lg:ml-64" // Only apply margin on desktop
      )}>
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
