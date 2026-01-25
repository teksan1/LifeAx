import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayoutBrutalist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, CheckCircle2, Flame, X } from "lucide-react";
import { toast } from "sonner";

export default function Habits() {
  const [habits, setHabits] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    frequency: "daily" as "daily" | "weekly" | "monthly",
  });

  const habitsQuery = trpc.habits.list.useQuery();
  const createMutation = trpc.habits.create.useMutation();

  useEffect(() => {
    if (habitsQuery.data) {
      setHabits(habitsQuery.data);
    }
  }, [habitsQuery.data]);

  const handleCreateHabit = async () => {
    if (!formData.name.trim()) {
      toast.error("Habit name is required");
      return;
    }

    try {
      await createMutation.mutateAsync({
        name: formData.name,
        frequency: formData.frequency,
      });

      setFormData({ name: "", frequency: "daily" });
      setShowForm(false);
      await habitsQuery.refetch();
      toast.success("Habit created successfully");
    } catch (error) {
      toast.error("Failed to create habit");
    }
  };

  const frequencyColors = {
    daily: "border-destructive text-destructive",
    weekly: "border-foreground text-foreground",
    monthly: "border-muted-foreground text-muted-foreground",
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-foreground">
          <h1 className="text-4xl font-black uppercase">Habit Tracker</h1>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="border-2 border-foreground font-bold uppercase"
          >
            <Plus size={20} />
            New Habit
          </Button>
        </div>

        {/* Create Form */}
        {showForm && (
          <Card className="border-2 border-foreground p-6 mb-8 bg-card relative">
            <button
              onClick={() => setShowForm(false)}
              className="absolute top-4 right-4 p-2 hover:bg-foreground hover:text-background transition-all"
              aria-label="Close form"
            >
              <X size={24} />
            </button>
            <h2 className="text-2xl font-black uppercase mb-4">Create Habit</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold uppercase mb-2">Habit Name</label>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Morning Exercise, Read, Meditate..."
                  className="border-2 border-foreground font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase mb-2">Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className="w-full border-2 border-foreground px-3 py-2 font-mono bg-background text-foreground"
                >
                  <option value="daily">Daily</option>
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                </select>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateHabit}
                  disabled={createMutation.isPending}
                  className="flex-1 border-2 border-foreground font-bold uppercase"
                >
                  Create Habit
                </Button>
                <Button
                  onClick={() => setShowForm(false)}
                  variant="outline"
                  className="flex-1 border-2 border-foreground font-bold uppercase"
                >
                  Cancel
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Habits List */}
        <div className="space-y-4">
          {habits.length === 0 ? (
            <Card className="border-2 border-foreground p-8 text-center bg-card">
              <div className="text-4xl font-black mb-4">🎯</div>
              <p className="text-muted-foreground font-bold uppercase">
                No habits yet. Create one to start building better routines!
              </p>
            </Card>
          ) : (
            habits.map((habit) => (
              <Card key={habit.id} className="border-2 border-foreground p-6 bg-card">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-black uppercase">{habit.name}</h3>
                      <span
                        className={`text-xs font-bold uppercase px-2 py-1 border-2 ${
                          frequencyColors[habit.frequency as keyof typeof frequencyColors]
                        }`}
                      >
                        {habit.frequency}
                      </span>
                    </div>

                    {/* Streak Display */}
                    <div className="flex items-center gap-2 mt-4">
                      <Flame size={20} className="text-destructive" />
                      <span className="font-bold text-lg">
                        {habit.streak || 0} day streak
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div className="mt-4 bg-muted border-2 border-foreground p-2">
                      <div
                        className="bg-foreground h-2 transition-all"
                        style={{ width: `${Math.min((habit.streak || 0) * 10, 100)}%` }}
                      ></div>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mt-4">
                      <div className="border border-foreground p-2 text-center">
                        <div className="text-sm text-muted-foreground">Completed</div>
                        <div className="font-black text-lg">{habit.completedCount || 0}</div>
                      </div>
                      <div className="border border-foreground p-2 text-center">
                        <div className="text-sm text-muted-foreground">Completion Rate</div>
                        <div className="font-black text-lg">
                          {habit.completedCount && habit.totalCount
                            ? Math.round((habit.completedCount / habit.totalCount) * 100)
                            : 0}
                          %
                        </div>
                      </div>
                      <div className="border border-foreground p-2 text-center">
                        <div className="text-sm text-muted-foreground">Best Streak</div>
                        <div className="font-black text-lg">{habit.bestStreak || 0}</div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <button className="p-2 border-2 border-foreground hover:bg-foreground hover:text-background transition-all">
                      <CheckCircle2 size={24} />
                    </button>
                    <button className="p-2 border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all">
                      <Trash2 size={24} />
                    </button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Tips Section */}
        <div className="mt-12 border-t-2 border-foreground pt-8">
          <h2 className="text-2xl font-black uppercase mb-6">Habit Building Tips</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="border-2 border-foreground p-4 bg-card">
              <h3 className="font-bold uppercase mb-2">Start Small</h3>
              <p className="text-sm text-muted-foreground">
                Begin with habits that take 5-10 minutes. Small wins build momentum.
              </p>
            </Card>
            <Card className="border-2 border-foreground p-4 bg-card">
              <h3 className="font-bold uppercase mb-2">Be Consistent</h3>
              <p className="text-sm text-muted-foreground">
                Consistency matters more than intensity. Do it every day, even if briefly.
              </p>
            </Card>
            <Card className="border-2 border-foreground p-4 bg-card">
              <h3 className="font-bold uppercase mb-2">Track Progress</h3>
              <p className="text-sm text-muted-foreground">
                Seeing your streak grow is motivating. Mark each day you complete the habit.
              </p>
            </Card>
            <Card className="border-2 border-foreground p-4 bg-card">
              <h3 className="font-bold uppercase mb-2">Stack Habits</h3>
              <p className="text-sm text-muted-foreground">
                Attach new habits to existing routines. After coffee? Do your meditation.
              </p>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
