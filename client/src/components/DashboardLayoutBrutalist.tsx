import { ReactNode, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Menu, X, LogOut, MessageSquare, Calendar, CheckSquare, Bell, Flame, User, ChefHat, Utensils } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DashboardLayoutProps {
  children: ReactNode;
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const navItems = [
    { label: "CHAT", href: "/chat", icon: MessageSquare },
    { label: "CALENDAR", href: "/calendar", icon: Calendar },
    { label: "TASKS", href: "/tasks", icon: CheckSquare },
    { label: "MEALS", href: "/meals", icon: ChefHat },
    { label: "PREP", href: "/prep", icon: Utensils },
    { label: "HABITS", href: "/habits", icon: Flame },
    { label: "ALERTS", href: "/notifications", icon: Bell },
    { label: "PROFILE", href: "/profile", icon: User },
  ];

  const isActive = (href: string) => location === href;

  const handleLogout = async () => {
    await logout();
    setLocation("/");
  };

  return (
    <div className="flex h-screen bg-background text-foreground flex-col md:flex-row">
      {/* Sidebar */}
      <div
        className={`fixed md:relative transition-all duration-300 h-auto md:h-full border-b-2 md:border-b-0 md:border-r-2 border-foreground bg-background z-40 w-full md:w-auto ${
          sidebarOpen ? "md:w-64" : "md:w-20"
        }`}
      >
        <div className="flex flex-row md:flex-col h-auto md:h-full p-3 md:p-6 overflow-x-auto md:overflow-x-visible">
          {/* Logo */}
          <div className="mb-6 md:mb-12 flex-shrink-0">
            <h1 className="text-xl md:text-3xl font-black tracking-tighter">
              {sidebarOpen ? "LIFEAX" : "LX"}
            </h1>
            <div className="h-1 w-full bg-foreground mt-2 hidden md:block"></div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 flex flex-row md:flex-col space-x-2 md:space-x-0 md:space-y-2 overflow-x-auto md:overflow-x-visible">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => {
                    setLocation(item.href);
                    // Auto-close sidebar on mobile after navigation
                    if (window.innerWidth < 768) {
                      setSidebarOpen(false);
                    }
                  }}
                  className={`flex-shrink-0 md:w-full flex items-center justify-center md:justify-start gap-3 px-3 md:px-4 py-3 border-2 transition-all ${
                    isActive(item.href)
                      ? "border-foreground bg-foreground text-background"
                      : "border-foreground text-foreground hover:bg-foreground hover:text-background"
                  }`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {sidebarOpen && <span className="font-bold text-sm hidden md:inline">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t-2 md:border-t-2 border-foreground pt-4 space-y-4 flex-shrink-0 ml-auto md:ml-0">
            {sidebarOpen && user && (
              <div className="text-xs hidden md:block">
                <p className="font-bold uppercase">User</p>
                <p className="text-muted-foreground truncate">{user.name || user.email}</p>
              </div>
            )}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-auto md:w-full border-2 border-foreground font-bold uppercase text-xs md:text-base px-2 md:px-4"
            >
              <LogOut size={18} />
              <span className="hidden md:inline ml-2">Logout</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden mt-auto md:mt-0">
        {/* Top Bar */}
        <div className="border-b-2 border-foreground bg-background px-3 md:px-8 py-3 md:py-4 flex items-center justify-between">
          <h2 className="text-lg md:text-2xl font-black uppercase flex-1 text-center">
            Life Optimization Platform
          </h2>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-background">
          <div className="p-3 md:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
