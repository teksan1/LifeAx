import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayoutBrutalist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, CheckCircle2, Circle, Filter, LayoutGrid, List } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

type ViewMode = "list" | "kanban";
type PriorityFilter = "all" | "high" | "medium" | "low";

export default function TasksEnhanced() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>("all");
  const [searchTerm, setSearchTerm] = useState("");
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
    if (!formData.title.trim()) {
      toast.error("Task title is required");
      return;
    }

    try {
      await createMutation.mutateAsync({
        title: formData.title,
        description: formData.description,
        priority: formData.priority,
        dueDate: formData.dueDate ? new Date(formData.dueDate) : undefined,
      });

      setFormData({ title: "", description: "", priority: "medium", dueDate: "" });
      setShowForm(false);
      await tasksQuery.refetch();
      toast.success("Task created successfully");
    } catch (error) {
      toast.error("Failed to create task");
    }
  };

  const handleToggleTask = async (task: any) => {
    try {
      await updateMutation.mutateAsync({
        id: task.id,
        completed: task.completed ? 0 : 1,
      });
      await tasksQuery.refetch();
      toast.success(task.completed ? "Task reopened" : "Task completed");
    } catch (error) {
      toast.error("Failed to update task");
    }
  };

  const handleDeleteTask = async (taskId: number) => {
    try {
      await deleteMutation.mutateAsync({ id: taskId });
      await tasksQuery.refetch();
      toast.success("Task deleted");
    } catch (error) {
      toast.error("Failed to delete task");
    }
  };

  const priorityColors = {
    low: "border-muted-foreground text-muted-foreground",
    medium: "border-foreground text-foreground",
    high: "border-destructive text-destructive",
  };

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = priorityFilter === "all" || task.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const sortedTasks = [...filteredTasks].sort((a, b) => {
    const priorityOrder = { high: 0, medium: 1, low: 2 };
    return (
      priorityOrder[a.priority as keyof typeof priorityOrder] -
      priorityOrder[b.priority as keyof typeof priorityOrder]
    );
  });

  const tasksByStatus = {
    pending: sortedTasks.filter((t) => !t.completed),
    completed: sortedTasks.filter((t) => t.completed),
  };

  const TaskCard = ({ task }: { task: any }) => (
    <Card
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
          <div className="flex gap-2 mt-2 text-xs flex-wrap">
            <span className="font-bold uppercase px-2 py-1 border border-current">
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
  );

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-foreground flex-wrap gap-4">
          <h1 className="text-4xl font-black uppercase">Task Manager</h1>
          <div className="flex gap-2">
            <Button
              onClick={() => setViewMode("list")}
              variant={viewMode === "list" ? "default" : "outline"}
              className="border-2 border-foreground font-bold uppercase text-sm"
            >
              <List size={16} />
            </Button>
            <Button
              onClick={() => setViewMode("kanban")}
              variant={viewMode === "kanban" ? "default" : "outline"}
              className="border-2 border-foreground font-bold uppercase text-sm"
            >
              <LayoutGrid size={16} />
            </Button>
            <Button
              onClick={() => setShowForm(!showForm)}
              className="border-2 border-foreground font-bold uppercase text-sm"
            >
              <Plus size={16} />
              New Task
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6 flex-wrap">
          <Button
            onClick={() => setPriorityFilter("all")}
            variant={priorityFilter === "all" ? "default" : "outline"}
            className="border-2 border-foreground font-bold uppercase text-xs"
          >
            All
          </Button>
          <Button
            onClick={() => setPriorityFilter("high")}
            variant={priorityFilter === "high" ? "default" : "outline"}
            className="border-2 border-destructive font-bold uppercase text-xs"
          >
            High
          </Button>
          <Button
            onClick={() => setPriorityFilter("medium")}
            variant={priorityFilter === "medium" ? "default" : "outline"}
            className="border-2 border-foreground font-bold uppercase text-xs"
          >
            Medium
          </Button>
          <Button
            onClick={() => setPriorityFilter("low")}
            variant={priorityFilter === "low" ? "default" : "outline"}
            className="border-2 border-muted-foreground font-bold uppercase text-xs"
          >
            Low
          </Button>
        </div>

        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search tasks..."
          className="border-2 border-foreground font-mono mb-6"
        />

        {/* Create Form */}
        {showForm && (
          <Card className="border-2 border-foreground p-6 mb-8 bg-card">
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
                    className="w-full border-2 border-foreground px-3 py-2 font-mono bg-background text-foreground"
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

        {/* Tasks Display */}
        {viewMode === "list" ? (
          <div className="space-y-3">
            {sortedTasks.length === 0 ? (
              <Card className="border-2 border-foreground p-8 text-center bg-card">
                <p className="text-muted-foreground font-bold uppercase">No tasks found</p>
              </Card>
            ) : (
              sortedTasks.map((task) => <TaskCard key={task.id} task={task} />)
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pending Column */}
            <div>
              <h3 className="text-xl font-black uppercase mb-4 pb-2 border-b-2 border-foreground">
                Pending ({tasksByStatus.pending.length})
              </h3>
              <div className="space-y-3">
                {tasksByStatus.pending.length === 0 ? (
                  <Card className="border-2 border-muted-foreground p-4 text-center bg-card opacity-50">
                    <p className="text-xs text-muted-foreground font-bold">No pending tasks</p>
                  </Card>
                ) : (
                  tasksByStatus.pending.map((task) => <TaskCard key={task.id} task={task} />)
                )}
              </div>
            </div>

            {/* Completed Column */}
            <div>
              <h3 className="text-xl font-black uppercase mb-4 pb-2 border-b-2 border-foreground">
                Completed ({tasksByStatus.completed.length})
              </h3>
              <div className="space-y-3">
                {tasksByStatus.completed.length === 0 ? (
                  <Card className="border-2 border-muted-foreground p-4 text-center bg-card opacity-50">
                    <p className="text-xs text-muted-foreground font-bold">No completed tasks</p>
                  </Card>
                ) : (
                  tasksByStatus.completed.map((task) => <TaskCard key={task.id} task={task} />)
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
