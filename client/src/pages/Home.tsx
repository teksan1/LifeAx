import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { MessageSquare, Calendar, CheckSquare, Zap, Lightbulb, Bell, ArrowRight, ChefHat, Utensils } from "lucide-react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl font-black uppercase mb-4">LIFEAX</div>
          <div className="text-sm font-bold uppercase text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (isAuthenticated && user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Header */}
        <div className="border-b-2 border-foreground px-6 md:px-8 py-6">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <h1 className="text-4xl md:text-5xl font-black uppercase">LIFEAX</h1>
            <div className="text-right">
              <p className="text-sm font-bold uppercase text-muted-foreground">Welcome</p>
              <p className="font-bold">{user.name || user.email}</p>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="max-w-6xl mx-auto px-6 md:px-8 py-12">
          <div className="mb-12">
            <h2 className="text-3xl md:text-4xl font-black uppercase mb-4">Your Life Optimization Dashboard</h2>
            <p className="text-lg text-muted-foreground mb-8">
              Welcome back! Choose a feature to continue optimizing your life.
            </p>
          </div>

          {/* Quick Access Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            <button
              onClick={() => setLocation("/chat")}
              className="border-2 border-foreground p-6 bg-background hover:bg-foreground hover:text-background transition-all text-left group"
            >
              <MessageSquare size={32} className="mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-black uppercase text-lg mb-2">AI Chat</h3>
              <p className="text-sm text-muted-foreground group-hover:text-background/70">Get personalized advice</p>
            </button>

            <button
              onClick={() => setLocation("/calendar")}
              className="border-2 border-foreground p-6 bg-background hover:bg-foreground hover:text-background transition-all text-left group"
            >
              <Calendar size={32} className="mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-black uppercase text-lg mb-2">Calendar</h3>
              <p className="text-sm text-muted-foreground group-hover:text-background/70">Manage your schedule</p>
            </button>

            <button
              onClick={() => setLocation("/tasks")}
              className="border-2 border-foreground p-6 bg-background hover:bg-foreground hover:text-background transition-all text-left group"
            >
              <CheckSquare size={32} className="mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-black uppercase text-lg mb-2">Tasks</h3>
              <p className="text-sm text-muted-foreground group-hover:text-background/70">Track your goals</p>
            </button>

            <button
              onClick={() => setLocation("/notifications")}
              className="border-2 border-foreground p-6 bg-background hover:bg-foreground hover:text-background transition-all text-left group"
            >
              <Bell size={32} className="mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-black uppercase text-lg mb-2">Alerts</h3>
              <p className="text-sm text-muted-foreground group-hover:text-background/70">Stay informed</p>
            </button>

            <button
              onClick={() => setLocation("/meals")}
              className="border-2 border-foreground p-6 bg-background hover:bg-foreground hover:text-background transition-all text-left group"
            >
              <ChefHat size={32} className="mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-black uppercase text-lg mb-2">Meal Plans</h3>
              <p className="text-sm text-muted-foreground group-hover:text-background/70">Plan your meals</p>
            </button>

            <button
              onClick={() => setLocation("/prep")}
              className="border-2 border-foreground p-6 bg-background hover:bg-foreground hover:text-background transition-all text-left group"
            >
              <Utensils size={32} className="mb-3 group-hover:scale-110 transition-transform" />
              <h3 className="font-black uppercase text-lg mb-2">Meal Prep</h3>
              <p className="text-sm text-muted-foreground group-hover:text-background/70">Track prep sessions</p>
            </button>
          </div>

          {/* Features Section */}
          <div className="border-t-2 border-foreground pt-12">
            <h2 className="text-3xl font-black uppercase mb-8">Platform Features</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border-2 border-foreground p-6 bg-card">
                <div className="flex items-start gap-4">
                  <Zap size={28} className="flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-black uppercase mb-2">AI-Powered Insights</h3>
                    <p className="text-sm text-muted-foreground">
                      Receive personalized recommendations based on your habits, tasks, and productivity patterns.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-2 border-foreground p-6 bg-card">
                <div className="flex items-start gap-4">
                  <Lightbulb size={28} className="flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-black uppercase mb-2">Smart Recommendations</h3>
                    <p className="text-sm text-muted-foreground">
                      Get actionable advice for improving productivity, health, learning, and relationships.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-2 border-foreground p-6 bg-card">
                <div className="flex items-start gap-4">
                  <CheckSquare size={28} className="flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-black uppercase mb-2">Task Management</h3>
                    <p className="text-sm text-muted-foreground">
                      Organize tasks by priority, set due dates, and track completion with ease.
                    </p>
                  </div>
                </div>
              </div>

              <div className="border-2 border-foreground p-6 bg-card">
                <div className="flex items-start gap-4">
                  <Calendar size={28} className="flex-shrink-0 mt-1" />
                  <div>
                    <h3 className="font-black uppercase mb-2">Calendar Integration</h3>
                    <p className="text-sm text-muted-foreground">
                      Seamlessly manage events, set reminders, and stay on top of your schedule.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="border-2 border-foreground p-8 md:p-12 bg-card mt-12">
            <h3 className="text-2xl font-black uppercase mb-4">Start Optimizing Your Life</h3>
            <p className="text-muted-foreground mb-6">
              Use the AI chat to get personalized advice, manage your calendar and tasks, and receive smart recommendations for continuous improvement.
            </p>
            <Button
              onClick={() => setLocation("/chat")}
              className="border-2 border-foreground font-bold uppercase"
            >
              Open AI Chat
              <ArrowRight size={18} className="ml-2" />
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated - show landing page
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="border-b-2 border-foreground px-6 md:px-8 py-6">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-5xl md:text-6xl font-black uppercase">LIFEAX</h1>
          <p className="text-sm font-bold uppercase text-muted-foreground mt-2">AI Life Optimization Platform</p>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-6 md:px-8 py-16 md:py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-4xl md:text-5xl font-black uppercase leading-tight mb-6">
              Master Your Life With AI
            </h2>
            <p className="text-lg text-muted-foreground mb-8">
              LifeAx combines artificial intelligence with practical productivity tools to help you optimize every aspect of your life. Get personalized advice, manage your time, track your goals, and receive smart recommendations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={() => window.location.href = getLoginUrl()}
                className="border-2 border-foreground font-bold uppercase px-8 py-3"
              >
                Sign In
                <ArrowRight size={18} className="ml-2" />
              </Button>
              <Button
                onClick={() => window.location.href = getLoginUrl()}
                variant="outline"
                className="border-2 border-foreground font-bold uppercase px-8 py-3"
              >
                Get Started
              </Button>
            </div>
          </div>

          <div className="border-2 border-foreground p-8 bg-card">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <MessageSquare size={24} />
                <span className="font-bold uppercase">AI Chat</span>
              </div>
              <div className="flex items-center gap-3">
                <Calendar size={24} />
                <span className="font-bold uppercase">Calendar</span>
              </div>
              <div className="flex items-center gap-3">
                <CheckSquare size={24} />
                <span className="font-bold uppercase">Tasks</span>
              </div>
              <div className="flex items-center gap-3">
                <Lightbulb size={24} />
                <span className="font-bold uppercase">Recommendations</span>
              </div>
              <div className="flex items-center gap-3">
                <Bell size={24} />
                <span className="font-bold uppercase">Notifications</span>
              </div>
              <div className="flex items-center gap-3">
                <Zap size={24} />
                <span className="font-bold uppercase">Analytics</span>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 border-t-2 border-foreground pt-16">
          <h3 className="text-3xl font-black uppercase mb-12">Why Choose LifeAx?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border-2 border-foreground p-6 bg-card">
              <div className="text-3xl font-black mb-4">🤖</div>
              <h4 className="font-black uppercase mb-2">AI-Powered</h4>
              <p className="text-sm text-muted-foreground">
                Advanced language models provide personalized life optimization advice tailored to your needs.
              </p>
            </div>

            <div className="border-2 border-foreground p-6 bg-card">
              <div className="text-3xl font-black mb-4">📊</div>
              <h4 className="font-black uppercase mb-2">Data-Driven</h4>
              <p className="text-sm text-muted-foreground">
                Track your progress with comprehensive analytics and insights into your productivity patterns.
              </p>
            </div>

            <div className="border-2 border-foreground p-6 bg-card">
              <div className="text-3xl font-black mb-4">⚡</div>
              <h4 className="font-black uppercase mb-2">Brutalist Design</h4>
              <p className="text-sm text-muted-foreground">
                High-contrast, bold interface that prioritizes clarity and efficiency over decoration.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="mt-20 border-2 border-foreground p-12 bg-card text-center">
          <h3 className="text-3xl font-black uppercase mb-4">Ready to Optimize Your Life?</h3>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of users who are using LifeAx to achieve their goals and live their best lives.
          </p>
          <Button
            onClick={() => window.location.href = getLoginUrl()}
            className="border-2 border-foreground font-bold uppercase px-8 py-3"
          >
            Sign In Now
            <ArrowRight size={18} className="ml-2" />
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="border-t-2 border-foreground mt-20 px-6 md:px-8 py-8">
        <div className="max-w-6xl mx-auto text-center text-sm text-muted-foreground">
          <p>LifeAx © 2026 | AI Life Optimization Platform</p>
          <p className="mt-2">Explore data more intuitively • Understand trends better • Easily save or share</p>
        </div>
      </div>
    </div>
  );
}
