import { useState } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayoutBrutalist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { User, Settings, Bell, Lock, LogOut } from "lucide-react";
import { toast } from "sonner";

export default function Profile() {
  const { user, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "settings" | "notifications">("profile");
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
  });
  const [settings, setSettings] = useState({
    theme: "dark",
    notifications: true,
    emailUpdates: true,
    dailyReminders: true,
  });

  const handleSaveProfile = () => {
    toast.success("Profile updated successfully");
  };

  const handleSaveSettings = () => {
    toast.success("Settings saved successfully");
  };

  const handleLogout = async () => {
    await logout();
    toast.success("Logged out successfully");
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-foreground">
          <h1 className="text-4xl font-black uppercase">Profile & Settings</h1>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 border-b-2 border-foreground pb-4">
          <button
            onClick={() => setActiveTab("profile")}
            className={`px-4 py-2 font-bold uppercase border-b-2 transition-all ${
              activeTab === "profile"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <User size={18} className="inline mr-2" />
            Profile
          </button>
          <button
            onClick={() => setActiveTab("settings")}
            className={`px-4 py-2 font-bold uppercase border-b-2 transition-all ${
              activeTab === "settings"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Settings size={18} className="inline mr-2" />
            Settings
          </button>
          <button
            onClick={() => setActiveTab("notifications")}
            className={`px-4 py-2 font-bold uppercase border-b-2 transition-all ${
              activeTab === "notifications"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Bell size={18} className="inline mr-2" />
            Notifications
          </button>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="space-y-6">
            <Card className="border-2 border-foreground p-6 bg-card">
              <h2 className="text-2xl font-black uppercase mb-6">Account Information</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Full Name</label>
                  <Input
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                    className="border-2 border-foreground font-mono"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Email</label>
                  <Input
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                    className="border-2 border-foreground font-mono"
                    disabled
                  />
                  <p className="text-xs text-muted-foreground mt-1">Email cannot be changed</p>
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Account Status</label>
                  <div className="border-2 border-foreground p-3 bg-background">
                    <p className="font-bold text-green-600">✓ Active</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Member since {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : "N/A"}
                    </p>
                  </div>
                </div>

                <Button
                  onClick={handleSaveProfile}
                  className="w-full border-2 border-foreground font-bold uppercase"
                >
                  Save Changes
                </Button>
              </div>
            </Card>

            <Card className="border-2 border-destructive p-6 bg-card">
              <h2 className="text-2xl font-black uppercase mb-6 text-destructive">Danger Zone</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Logging out will end your current session. You can log back in anytime.
              </p>
              <Button
                onClick={handleLogout}
                className="w-full border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground font-bold uppercase"
              >
                <LogOut size={18} />
                Logout
              </Button>
            </Card>
          </div>
        )}

        {/* Settings Tab */}
        {activeTab === "settings" && (
          <div className="space-y-6">
            <Card className="border-2 border-foreground p-6 bg-card">
              <h2 className="text-2xl font-black uppercase mb-6">Preferences</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border-2 border-foreground">
                  <div>
                    <h3 className="font-bold uppercase">Dark Theme</h3>
                    <p className="text-sm text-muted-foreground">Use dark mode by default</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.theme === "dark"}
                    onChange={(e) => setSettings({ ...settings, theme: e.target.checked ? "dark" : "light" })}
                    className="w-6 h-6 border-2 border-foreground cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border-2 border-foreground">
                  <div>
                    <h3 className="font-bold uppercase">Enable Notifications</h3>
                    <p className="text-sm text-muted-foreground">Receive app notifications</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.notifications}
                    onChange={(e) => setSettings({ ...settings, notifications: e.target.checked })}
                    className="w-6 h-6 border-2 border-foreground cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border-2 border-foreground">
                  <div>
                    <h3 className="font-bold uppercase">Email Updates</h3>
                    <p className="text-sm text-muted-foreground">Receive weekly summary emails</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.emailUpdates}
                    onChange={(e) => setSettings({ ...settings, emailUpdates: e.target.checked })}
                    className="w-6 h-6 border-2 border-foreground cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between p-4 border-2 border-foreground">
                  <div>
                    <h3 className="font-bold uppercase">Daily Reminders</h3>
                    <p className="text-sm text-muted-foreground">Get daily task reminders</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={settings.dailyReminders}
                    onChange={(e) => setSettings({ ...settings, dailyReminders: e.target.checked })}
                    className="w-6 h-6 border-2 border-foreground cursor-pointer"
                  />
                </div>

                <Button
                  onClick={handleSaveSettings}
                  className="w-full border-2 border-foreground font-bold uppercase"
                >
                  Save Settings
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Notifications Tab */}
        {activeTab === "notifications" && (
          <div className="space-y-6">
            <Card className="border-2 border-foreground p-6 bg-card">
              <h2 className="text-2xl font-black uppercase mb-6">Notification Preferences</h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border-2 border-foreground">
                  <div>
                    <h3 className="font-bold uppercase">Task Reminders</h3>
                    <p className="text-sm text-muted-foreground">Notify when tasks are due</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-6 h-6 border-2 border-foreground cursor-pointer" />
                </div>

                <div className="flex items-center justify-between p-4 border-2 border-foreground">
                  <div>
                    <h3 className="font-bold uppercase">Event Reminders</h3>
                    <p className="text-sm text-muted-foreground">Notify about upcoming events</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-6 h-6 border-2 border-foreground cursor-pointer" />
                </div>

                <div className="flex items-center justify-between p-4 border-2 border-foreground">
                  <div>
                    <h3 className="font-bold uppercase">Habit Streaks</h3>
                    <p className="text-sm text-muted-foreground">Notify about habit completion</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-6 h-6 border-2 border-foreground cursor-pointer" />
                </div>

                <div className="flex items-center justify-between p-4 border-2 border-foreground">
                  <div>
                    <h3 className="font-bold uppercase">AI Recommendations</h3>
                    <p className="text-sm text-muted-foreground">Receive AI-generated suggestions</p>
                  </div>
                  <input type="checkbox" defaultChecked className="w-6 h-6 border-2 border-foreground cursor-pointer" />
                </div>

                <Button
                  onClick={() => toast.success("Notification preferences saved")}
                  className="w-full border-2 border-foreground font-bold uppercase"
                >
                  Save Preferences
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
