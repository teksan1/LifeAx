import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import DashboardLayout from "@/components/DashboardLayoutBrutalist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Plus,
  Clock,
  CheckCircle2,
  AlertCircle,
  Trash2,
  Edit2,
  Play,
  Pause,
  ChefHat,
  Calendar,
  Zap,
} from "lucide-react";
import { toast } from "sonner";

export default function MealPrep() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<"sessions" | "containers">("sessions");
  const [showCreateSession, setShowCreateSession] = useState(false);
  const [showCreateContainer, setShowCreateContainer] = useState(false);
  const [selectedSession, setSelectedSession] = useState<number | null>(null);
  const [timerActive, setTimerActive] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Session form state
  const [sessionForm, setSessionForm] = useState({
    title: "",
    date: new Date().toISOString().split("T")[0],
    duration: 60,
    description: "",
  });

  // Container form state
  const [containerForm, setContainerForm] = useState({
    mealName: "",
    quantity: 1,
    containerType: "glass",
    prepDate: new Date().toISOString().split("T")[0],
    expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
    location: "fridge",
    notes: "",
  });

  // Queries
  const sessionsQuery = trpc.mealPrep.listSessions.useQuery();
  const containersQuery = trpc.mealPrepContainers.listContainers.useQuery();
  const sessionDetailsQuery = trpc.mealPrep.getSessionDetails.useQuery(
    { sessionId: selectedSession || 0 },
    { enabled: !!selectedSession }
  );

  // Mutations
  const createSessionMutation = trpc.mealPrep.createSession.useMutation();
  const updateStatusMutation = trpc.mealPrep.updateStatus.useMutation();
  const createContainerMutation = trpc.mealPrepContainers.createContainer.useMutation();
  const deleteContainerMutation = trpc.mealPrepContainers.deleteContainer.useMutation();

  const handleCreateSession = async () => {
    if (!sessionForm.title || !sessionForm.date) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await createSessionMutation.mutateAsync({
        title: sessionForm.title,
        date: new Date(sessionForm.date),
        duration: sessionForm.duration,
        description: sessionForm.description,
      });

      toast.success("Meal prep session created!");
      setShowCreateSession(false);
      setSessionForm({
        title: "",
        date: new Date().toISOString().split("T")[0],
        duration: 60,
        description: "",
      });
      await sessionsQuery.refetch();
    } catch (error) {
      toast.error("Failed to create session");
    }
  };

  const handleCreateContainer = async () => {
    if (!containerForm.mealName || !containerForm.quantity) {
      toast.error("Please fill in required fields");
      return;
    }

    try {
      await createContainerMutation.mutateAsync({
        mealName: containerForm.mealName,
        quantity: containerForm.quantity,
        containerType: containerForm.containerType,
        prepDate: new Date(containerForm.prepDate),
        expiryDate: new Date(containerForm.expiryDate),
        location: containerForm.location,
        notes: containerForm.notes,
      });

      toast.success("Meal container added!");
      setShowCreateContainer(false);
      setContainerForm({
        mealName: "",
        quantity: 1,
        containerType: "glass",
        prepDate: new Date().toISOString().split("T")[0],
        expiryDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
        location: "fridge",
        notes: "",
      });
      await containersQuery.refetch();
    } catch (error) {
      toast.error("Failed to add container");
    }
  };

  const handleDeleteContainer = async (containerId: number) => {
    try {
      await deleteContainerMutation.mutateAsync({ containerId });
      toast.success("Container deleted!");
      await containersQuery.refetch();
    } catch (error) {
      toast.error("Failed to delete container");
    }
  };

  const getExpiryStatus = (expiryDate: Date) => {
    const now = new Date();
    const daysLeft = Math.floor((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysLeft < 0) return { status: "expired", label: "Expired", color: "bg-red-900" };
    if (daysLeft === 0) return { status: "today", label: "Today", color: "bg-orange-900" };
    if (daysLeft <= 2) return { status: "soon", label: `${daysLeft}d left`, color: "bg-yellow-900" };
    return { status: "good", label: `${daysLeft}d left`, color: "bg-green-900" };
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-2 border-foreground bg-card p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <ChefHat size={32} className="font-black" />
              <h1 className="text-3xl font-black uppercase">Meal Preparation</h1>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={() => setShowCreateSession(true)}
                className="border-2 border-foreground font-bold uppercase"
              >
                <Plus size={16} />
                New Session
              </Button>
              <Button
                onClick={() => setShowCreateContainer(true)}
                className="border-2 border-foreground font-bold uppercase bg-foreground text-background"
              >
                <Plus size={16} />
                Add Container
              </Button>
            </div>
          </div>
          <p className="text-sm text-muted-foreground">
            Track your meal prep sessions, manage storage containers, and monitor expiry dates
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b-2 border-foreground">
          <button
            onClick={() => setActiveTab("sessions")}
            className={`px-4 py-2 font-bold uppercase border-b-2 transition-all ${
              activeTab === "sessions"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Calendar size={16} className="inline mr-2" />
            Sessions
          </button>
          <button
            onClick={() => setActiveTab("containers")}
            className={`px-4 py-2 font-bold uppercase border-b-2 transition-all ${
              activeTab === "containers"
                ? "border-foreground text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Zap size={16} className="inline mr-2" />
            Storage
          </button>
        </div>

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Sessions List */}
            <div className="md:col-span-1 border-2 border-foreground bg-card p-4">
              <h3 className="text-lg font-black uppercase mb-4 pb-2 border-b-2 border-foreground">
                Sessions
              </h3>

              <div className="space-y-2">
                {sessionsQuery.data?.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-4">
                    No sessions yet. Create one to get started!
                  </p>
                ) : (
                  sessionsQuery.data?.map((session) => (
                    <button
                      key={session.id}
                      onClick={() => setSelectedSession(session.id)}
                      className={`w-full text-left px-3 py-2 border-2 transition-all text-sm ${
                        selectedSession === session.id
                          ? "border-foreground bg-foreground text-background"
                          : "border-foreground hover:bg-foreground hover:text-background"
                      }`}
                    >
                      <p className="font-bold truncate">{session.title}</p>
                      <p className="text-xs opacity-75">
                        {new Date(session.date).toLocaleDateString()}
                      </p>
                      <p className="text-xs opacity-75">{session.status}</p>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Session Details */}
            <div className="md:col-span-2 space-y-4">
              {selectedSession ? (
                <>
                  {/* Session Header */}
                  <Card className="border-2 border-foreground p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-xl font-black uppercase">
                        {sessionDetailsQuery.data?.title}
                      </h3>
                      <div className="flex gap-2">
                        <Button
                          onClick={() =>
                            updateStatusMutation.mutate({
                              sessionId: selectedSession,
                              status: "in_progress",
                            })
                          }
                          className="border-2 border-foreground font-bold uppercase text-sm"
                        >
                          <Play size={14} />
                          Start
                        </Button>
                        <Button
                          onClick={() =>
                            updateStatusMutation.mutate({
                              sessionId: selectedSession,
                              status: "completed",
                            })
                          }
                          className="border-2 border-foreground font-bold uppercase text-sm bg-foreground text-background"
                        >
                          <CheckCircle2 size={14} />
                          Complete
                        </Button>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-xs font-bold uppercase text-muted-foreground mb-1">
                          Date
                        </p>
                        <p className="text-sm font-bold">
                          {sessionDetailsQuery.data?.date
                            ? new Date(sessionDetailsQuery.data.date).toLocaleDateString()
                            : "N/A"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-muted-foreground mb-1">
                          Duration
                        </p>
                        <p className="text-sm font-bold">
                          {sessionDetailsQuery.data?.duration || 0} min
                        </p>
                      </div>
                      <div>
                        <p className="text-xs font-bold uppercase text-muted-foreground mb-1">
                          Status
                        </p>
                        <p className="text-sm font-bold uppercase">
                          {sessionDetailsQuery.data?.status}
                        </p>
                      </div>
                    </div>

                    {sessionDetailsQuery.data?.description && (
                      <div className="mt-4 pt-4 border-t-2 border-foreground">
                        <p className="text-xs font-bold uppercase text-muted-foreground mb-2">
                          Notes
                        </p>
                        <p className="text-sm">{sessionDetailsQuery.data.description}</p>
                      </div>
                    )}
                  </Card>

                  {/* Checklist */}
                  {sessionDetailsQuery.data?.checklist && sessionDetailsQuery.data.checklist.length > 0 && (
                    <Card className="border-2 border-foreground p-6">
                      <h4 className="text-lg font-black uppercase mb-4">Checklist</h4>
                      <div className="space-y-2">
                        {sessionDetailsQuery.data.checklist.map((item) => (
                          <label
                            key={item.id}
                            className="flex items-center gap-3 p-2 border-2 border-foreground cursor-pointer hover:bg-foreground hover:text-background transition-all"
                          >
                            <Checkbox checked={!!item.completed} />
                            <span className="text-sm font-bold">{item.task}</span>
                          </label>
                        ))}
                      </div>
                    </Card>
                  )}
                </>
              ) : (
                <Card className="border-2 border-foreground p-12 text-center">
                  <Calendar size={48} className="mx-auto mb-4 opacity-50" />
                  <p className="text-muted-foreground font-bold uppercase">
                    Select a session to view details
                  </p>
                </Card>
              )}
            </div>
          </div>
        )}

        {/* Containers Tab */}
        {activeTab === "containers" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {containersQuery.data?.length === 0 ? (
              <Card className="col-span-full border-2 border-foreground p-12 text-center">
                <AlertCircle size={48} className="mx-auto mb-4 opacity-50" />
                <p className="text-muted-foreground font-bold uppercase">
                  No containers yet. Add one to track your meal prep storage!
                </p>
              </Card>
            ) : (
              containersQuery.data?.map((container) => {
                const expiryStatus = getExpiryStatus(new Date(container.expiryDate));
                return (
                  <Card key={container.id} className="border-2 border-foreground p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="font-black uppercase text-sm">{container.mealName}</p>
                        <p className="text-xs text-muted-foreground">{container.containerType}</p>
                      </div>
                      <button
                        onClick={() => handleDeleteContainer(container.id)}
                        className="p-1 hover:bg-foreground hover:text-background transition-all"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Quantity</span>
                        <span className="font-bold">{container.quantity}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Location</span>
                        <span className="font-bold uppercase">{container.location}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-muted-foreground">Prepped</span>
                        <span className="font-bold">
                          {new Date(container.prepDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>

                    <div className={`${expiryStatus.color} text-white p-2 text-center font-bold text-xs uppercase border-2 border-foreground`}>
                      {expiryStatus.label}
                    </div>

                    {container.notes && (
                      <p className="text-xs text-muted-foreground mt-3 p-2 border-t-2 border-foreground">
                        {container.notes}
                      </p>
                    )}
                  </Card>
                );
              })
            )}
          </div>
        )}

        {/* Create Session Modal */}
        {showCreateSession && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md border-2 border-foreground p-6">
              <h2 className="text-2xl font-black uppercase mb-4">Create Meal Prep Session</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase block mb-2">Session Title</label>
                  <Input
                    value={sessionForm.title}
                    onChange={(e) => setSessionForm({ ...sessionForm, title: e.target.value })}
                    placeholder="e.g., Sunday Meal Prep"
                    className="border-2 border-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold uppercase block mb-2">Date</label>
                    <Input
                      type="date"
                      value={sessionForm.date}
                      onChange={(e) => setSessionForm({ ...sessionForm, date: e.target.value })}
                      className="border-2 border-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase block mb-2">Duration (min)</label>
                    <Input
                      type="number"
                      value={sessionForm.duration}
                      onChange={(e) =>
                        setSessionForm({ ...sessionForm, duration: parseInt(e.target.value) })
                      }
                      className="border-2 border-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase block mb-2">Description</label>
                  <Input
                    value={sessionForm.description}
                    onChange={(e) => setSessionForm({ ...sessionForm, description: e.target.value })}
                    placeholder="What are you prepping?"
                    className="border-2 border-foreground"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  onClick={handleCreateSession}
                  disabled={createSessionMutation.isPending}
                  className="flex-1 border-2 border-foreground font-bold uppercase"
                >
                  Create
                </Button>
                <Button
                  onClick={() => setShowCreateSession(false)}
                  variant="outline"
                  className="flex-1 border-2 border-foreground font-bold uppercase"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Create Container Modal */}
        {showCreateContainer && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <Card className="w-full max-w-md border-2 border-foreground p-6 max-h-[90vh] overflow-y-auto">
              <h2 className="text-2xl font-black uppercase mb-4">Add Meal Container</h2>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-bold uppercase block mb-2">Meal Name</label>
                  <Input
                    value={containerForm.mealName}
                    onChange={(e) => setContainerForm({ ...containerForm, mealName: e.target.value })}
                    placeholder="e.g., Chicken & Rice"
                    className="border-2 border-foreground"
                  />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold uppercase block mb-2">Quantity</label>
                    <Input
                      type="number"
                      value={containerForm.quantity}
                      onChange={(e) =>
                        setContainerForm({ ...containerForm, quantity: parseInt(e.target.value) })
                      }
                      min="1"
                      className="border-2 border-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase block mb-2">Container Type</label>
                    <select
                      value={containerForm.containerType}
                      onChange={(e) =>
                        setContainerForm({ ...containerForm, containerType: e.target.value })
                      }
                      className="w-full px-3 py-2 border-2 border-foreground bg-background"
                    >
                      <option>glass</option>
                      <option>plastic</option>
                      <option>aluminum</option>
                      <option>paper</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-bold uppercase block mb-2">Prep Date</label>
                    <Input
                      type="date"
                      value={containerForm.prepDate}
                      onChange={(e) => setContainerForm({ ...containerForm, prepDate: e.target.value })}
                      className="border-2 border-foreground"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold uppercase block mb-2">Expiry Date</label>
                    <Input
                      type="date"
                      value={containerForm.expiryDate}
                      onChange={(e) =>
                        setContainerForm({ ...containerForm, expiryDate: e.target.value })
                      }
                      className="border-2 border-foreground"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase block mb-2">Location</label>
                  <select
                    value={containerForm.location}
                    onChange={(e) => setContainerForm({ ...containerForm, location: e.target.value })}
                    className="w-full px-3 py-2 border-2 border-foreground bg-background"
                  >
                    <option>fridge</option>
                    <option>freezer</option>
                    <option>pantry</option>
                    <option>counter</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold uppercase block mb-2">Notes</label>
                  <Input
                    value={containerForm.notes}
                    onChange={(e) => setContainerForm({ ...containerForm, notes: e.target.value })}
                    placeholder="e.g., Reheat at 350°F for 15 min"
                    className="border-2 border-foreground"
                  />
                </div>
              </div>

              <div className="flex gap-2 mt-6">
                <Button
                  onClick={handleCreateContainer}
                  disabled={createContainerMutation.isPending}
                  className="flex-1 border-2 border-foreground font-bold uppercase"
                >
                  Add
                </Button>
                <Button
                  onClick={() => setShowCreateContainer(false)}
                  variant="outline"
                  className="flex-1 border-2 border-foreground font-bold uppercase"
                >
                  Cancel
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
