import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayoutBrutalist";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isSameDay } from "date-fns";

export default function Calendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showForm, setShowForm] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    startTime: "",
    endTime: "",
  });

  const eventsQuery = trpc.calendar.getEvents.useQuery();
  const createMutation = trpc.calendar.createEvent.useMutation();
  const deleteMutation = trpc.calendar.deleteEvent.useMutation();

  useEffect(() => {
    if (eventsQuery.data) {
      setEvents(eventsQuery.data);
    }
  }, [eventsQuery.data]);

  const handleCreateEvent = async () => {
    if (!formData.title.trim() || !selectedDate || !formData.startTime) return;

    const startDateTime = new Date(selectedDate);
    const [startHour, startMin] = formData.startTime.split(":").map(Number);
    startDateTime.setHours(startHour, startMin);

    const endDateTime = new Date(startDateTime);
    if (formData.endTime) {
      const [endHour, endMin] = formData.endTime.split(":").map(Number);
      endDateTime.setHours(endHour, endMin);
    } else {
      endDateTime.setHours(startHour + 1, startMin);
    }

    await createMutation.mutateAsync({
      title: formData.title,
      description: formData.description,
      location: formData.location,
      startTime: startDateTime,
      endTime: endDateTime,
    });

    setFormData({ title: "", description: "", location: "", startTime: "", endTime: "" });
    setShowForm(false);
    setSelectedDate(null);
    await eventsQuery.refetch();
  };

  const handleDeleteEvent = async (eventId: number) => {
    await deleteMutation.mutateAsync({ id: eventId });
    await eventsQuery.refetch();
  };

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getEventsForDate = (date: Date) => {
    return events.filter((event) => isSameDay(new Date(event.startTime), date));
  };

  const weekDays = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  return (
    <DashboardLayout>
      <div className="max-w-6xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-foreground">
          <h1 className="text-4xl font-black uppercase">Calendar</h1>
          <Button
            onClick={() => setShowForm(!showForm)}
            className="border-2 border-foreground font-bold uppercase"
          >
            <Plus size={20} />
            New Event
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Grid */}
          <div className="lg:col-span-2">
            <Card className="border-2 border-foreground p-6 bg-card">
              {/* Month Navigation */}
              <div className="flex items-center justify-between mb-6 pb-4 border-b-2 border-foreground">
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                  className="p-2 border-2 border-foreground hover:bg-foreground hover:text-background"
                >
                  <ChevronLeft size={20} />
                </button>
                <h2 className="text-2xl font-black uppercase">
                  {format(currentDate, "MMMM yyyy")}
                </h2>
                <button
                  onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                  className="p-2 border-2 border-foreground hover:bg-foreground hover:text-background"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Week Days Header */}
              <div className="grid grid-cols-7 gap-2 mb-2">
                {weekDays.map((day) => (
                  <div key={day} className="text-center font-bold uppercase text-sm py-2 border-b border-foreground">
                    {day}
                  </div>
                ))}
              </div>

              {/* Days Grid */}
              <div className="grid grid-cols-7 gap-2">
                {daysInMonth.map((date) => {
                  const dayEvents = getEventsForDate(date);
                  const isCurrentMonth = isSameMonth(date, currentDate);

                  return (
                    <button
                      key={date.toISOString()}
                      onClick={() => {
                        setSelectedDate(date);
                        setShowForm(true);
                      }}
                      className={`aspect-square border-2 p-2 text-center transition-all ${
                        isCurrentMonth
                          ? "border-foreground hover:bg-foreground hover:text-background"
                          : "border-muted-foreground opacity-50"
                      }`}
                    >
                      <div className="font-bold text-sm">{format(date, "d")}</div>
                      {dayEvents.length > 0 && (
                        <div className="text-xs mt-1 text-destructive font-bold">
                          {dayEvents.length} event{dayEvents.length > 1 ? "s" : ""}
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </Card>
          </div>

          {/* Events List & Form */}
          <div className="space-y-4">
            {/* Create Form */}
            {showForm && (
              <Card className="border-2 border-foreground p-4 bg-card relative">
                <button
                  onClick={() => setShowForm(false)}
                  className="absolute top-4 right-4 p-2 hover:bg-foreground hover:text-background transition-all"
                  aria-label="Close form"
                >
                  <X size={20} />
                </button>
                <h3 className="font-black uppercase mb-3 pb-2 border-b-2 border-foreground">
                  {selectedDate ? format(selectedDate, "MMM dd, yyyy") : "New Event"}
                </h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <label className="block font-bold uppercase mb-1">Title</label>
                    <Input
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="Event title..."
                      className="border-2 border-foreground font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase mb-1">Time</label>
                    <div className="flex gap-2">
                      <Input
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        className="flex-1 border-2 border-foreground font-mono text-xs"
                      />
                      <Input
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        className="flex-1 border-2 border-foreground font-mono text-xs"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold uppercase mb-1">Location</label>
                    <Input
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="Location..."
                      className="border-2 border-foreground font-mono text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-bold uppercase mb-1">Description</label>
                    <Input
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Description..."
                      className="border-2 border-foreground font-mono text-xs"
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleCreateEvent}
                      disabled={createMutation.isPending}
                      className="flex-1 border-2 border-foreground font-bold uppercase text-xs"
                    >
                      Create
                    </Button>
                    <Button
                      onClick={() => {
                        setShowForm(false);
                        setSelectedDate(null);
                      }}
                      variant="outline"
                      className="flex-1 border-2 border-foreground font-bold uppercase text-xs"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </Card>
            )}

            {/* Upcoming Events */}
            <Card className="border-2 border-foreground p-4 bg-card">
              <h3 className="font-black uppercase mb-3 pb-2 border-b-2 border-foreground">
                Upcoming Events
              </h3>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {events.length === 0 ? (
                  <p className="text-xs text-muted-foreground font-bold">No events scheduled</p>
                ) : (
                  events
                    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
                    .slice(0, 5)
                    .map((event) => (
                      <div key={event.id} className="border border-foreground p-2 text-xs">
                        <div className="font-bold uppercase">{event.title}</div>
                        <div className="text-muted-foreground">
                          {format(new Date(event.startTime), "MMM dd, HH:mm")}
                        </div>
                        {event.location && <div className="text-muted-foreground">{event.location}</div>}
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="mt-2 w-full p-1 border border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground transition-all text-xs font-bold"
                        >
                          Delete
                        </button>
                      </div>
                    ))
                )}
              </div>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
