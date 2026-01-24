import { ReactNode, useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import { useLocation } from "wouter";
import { Menu, X, LogOut, MessageSquare, Calendar, CheckSquare, Bell, Flame, User, ChefHat } from "lucide-react";
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
    <div className="flex h-screen bg-background text-foreground">
      {/* Sidebar */}
      <div
        className={`fixed md:relative transition-all duration-300 h-full border-r-2 border-foreground bg-background z-40 ${
          sidebarOpen ? "w-64" : "w-0 md:w-20"
        }`}
      >
        <div className="flex flex-col h-full p-4 md:p-6">
          {/* Logo */}
          <div className="mb-12">
            <h1 className="text-2xl md:text-3xl font-black tracking-tighter">
              {sidebarOpen ? "LIFEAX" : "LX"}
            </h1>
            <div className="h-1 w-full bg-foreground mt-2"></div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.href}
                  onClick={() => setLocation(item.href)}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-2 transition-all ${
                    isActive(item.href)
                      ? "border-foreground bg-foreground text-background"
                      : "border-foreground text-foreground hover:bg-foreground hover:text-background"
                  }`}
                >
                  <Icon size={20} className="flex-shrink-0" />
                  {sidebarOpen && <span className="font-bold text-sm">{item.label}</span>}
                </button>
              );
            })}
          </nav>

          {/* User Info & Logout */}
          <div className="border-t-2 border-foreground pt-4 space-y-4">
            {sidebarOpen && user && (
              <div className="text-xs">
                <p className="font-bold uppercase">User</p>
                <p className="text-muted-foreground truncate">{user.name || user.email}</p>
              </div>
            )}
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full border-2 border-foreground font-bold uppercase"
            >
              <LogOut size={18} />
              {sidebarOpen && "Logout"}
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="border-b-2 border-foreground bg-background px-4 md:px-8 py-4 flex items-center justify-between">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 border-2 border-foreground hover:bg-foreground hover:text-background transition-all"
          >
            {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
          <h2 className="text-xl md:text-2xl font-black uppercase flex-1 text-center md:text-left">
            Life Optimization Platform
          </h2>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-auto bg-background">
          <div className="p-4 md:p-8">{children}</div>
        </div>
      </div>
    </div>
  );
}
