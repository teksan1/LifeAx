import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayoutBrutalist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, CheckCircle2, Circle, X } from "lucide-react";
import { format } from "date-fns";

export default function Tasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    priority: "medium" as "low" | "medium" | "high",
    dueDate: "",
  });

  const tasksQuery = trpc.tasks.list.useQuery();
  const createMutation = trpc.tasks.create.useMutation();
  const updateMutation = trpc.tasks.update.useMutation();
  const deleteMutation = trpc.tasks.delete.useMutation();

  useEffect(() => {
    if (tasksQuery.data) {
      setTasks(tasksQuery.data);
    }
  }, [tasksQuery.data]);

  const handleCreateTask = async () => {
    if (!formData.title.trim()) return;

    await createMutation.mutateAsync({
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
    });

    setFormData({ title: "", description: "", priority: "medium", dueDate: "" });
    setShowForm(false);
    await tasksQuery.refetch();
  };

  const handleToggleTask = async (task: any) => {
    await updateMutation.mutateAsync({
      id: task.id,
      completed: task.completed ? 0 : 1,
    });
    await tasksQuery.refetch();
  };

  const handleDeleteTask = async (taskId: number) => {
    await deleteMutation.mutateAsync({ id: taskId });
    await tasksQuery.refetch();
  };

  const priorityColors = {
    low: "border-muted-foreground",
    medium: "border-foreground",
    high: "border-destructive",
  };

  const sortedTasks = [...tasks].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return priorityOrder[a.priority as keyof typeof priorityOrder] - priorityOrder[b.priority as keyof typeof priorityOrder];
  });

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-foreground">
          <h1 className="text-4xl font-black uppercase">Task Manager</h1>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="border-2 border-foreground font-bold uppercase"
          >
            <Plus size={20} />
            New Task
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
            <h2 className="text-2xl font-black uppercase mb-4">Create Task</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-bold uppercase mb-2">Title</label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Task title..."
                  className="border-2 border-foreground font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase mb-2">Description</label>
                <Input
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Task description..."
                  className="border-2 border-foreground font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Priority</label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                    className="w-full border-2 border-foreground px-3 py-2 font-mono"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold uppercase mb-2">Due Date</label>
                  <Input
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    className="border-2 border-foreground font-mono"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <Button
                  onClick={handleCreateTask}
                  disabled={createMutation.isPending}
                  className="flex-1 border-2 border-foreground font-bold uppercase"
                >
                  Create Task
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

        {/* Tasks List */}
        <div className="space-y-3">
          {sortedTasks.length === 0 ? (
            <Card className="border-2 border-foreground p-8 text-center bg-card">
              <p className="text-muted-foreground font-bold uppercase">No tasks yet. Create one to get started!</p>
            </Card>
          ) : (
            sortedTasks.map((task) => (
              <Card
                key={task.id}
                className={`border-2 p-4 transition-all cursor-pointer hover:bg-muted ${
                  priorityColors[task.priority as keyof typeof priorityColors]
                } ${task.completed ? "opacity-60" : ""}`}
              >
                <div className="flex items-start gap-4">
                  <button
                    onClick={() => handleToggleTask(task)}
                    className="flex-shrink-0 mt-1"
                  >
                    {task.completed ? (
                      <CheckCircle2 size={24} className="text-foreground" />
                    ) : (
                      <Circle size={24} className="text-muted-foreground" />
                    )}
                  </button>

                  <div className="flex-1 min-w-0">
                    <h3 className={`font-bold uppercase text-lg ${task.completed ? "line-through" : ""}`}>
                      {task.title}
                    </h3>
                    {task.description && (
                      <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                    )}
                    <div className="flex gap-2 mt-2 text-xs">
                      <span className="font-bold uppercase px-2 py-1 border border-foreground">
                        {task.priority.toUpperCase()}
                      </span>
                      {task.dueDate && (
                        <span className="text-muted-foreground">
                          Due: {format(new Date(task.dueDate), "MMM dd, yyyy")}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDeleteTask(task.id)}
                    className="flex-shrink-0 p-2 hover:bg-destructive hover:text-destructive-foreground transition-all"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
