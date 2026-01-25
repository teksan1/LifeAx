import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import DashboardLayout from "@/components/DashboardLayoutBrutalist";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, CheckCircle2, Zap, Target, Lightbulb, Trash2 } from "lucide-react";
import { format } from "date-fns";

export default function Notifications() {
  const [notifications, setNotifications] = useState<any[]>([]);

  const notificationsQuery = trpc.notifications.list.useQuery();
  const markAsReadMutation = trpc.notifications.markAsRead.useMutation();
  const recommendationsQuery = trpc.recommendations.list.useQuery();
  const generateRecommendationsMutation = trpc.recommendations.generate.useQuery();

  useEffect(() => {
    if (notificationsQuery.data) {
      setNotifications(notificationsQuery.data);
    }
  }, [notificationsQuery.data]);

  const handleMarkAsRead = async (notificationId: number) => {
    await markAsReadMutation.mutateAsync({ id: notificationId });
    await notificationsQuery.refetch();
  };

  const handleGenerateRecommendations = async () => {
    await recommendationsQuery.refetch();
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "task_reminder":
        return <CheckCircle2 size={20} />;
      case "event_reminder":
        return <Bell size={20} />;
      case "recommendation":
        return <Lightbulb size={20} />;
      case "milestone":
        return <Zap size={20} />;
      default:
        return <Bell size={20} />;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DashboardLayout>
      <div className="max-w-4xl">
        <div className="flex items-center justify-between mb-8 pb-4 border-b-2 border-foreground">
          <div>
            <h1 className="text-4xl font-black uppercase">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-muted-foreground mt-1">
                {unreadCount} unread notification{unreadCount > 1 ? "s" : ""}
              </p>
            )}
          </div>
          <Button
            onClick={handleGenerateRecommendations}
            disabled={generateRecommendationsMutation.isPending}
            className="border-2 border-foreground font-bold uppercase"
          >
            <Lightbulb size={20} />
            Generate Recommendations
          </Button>
        </div>

        {/* Notifications List */}
        <div className="space-y-3 mb-8">
          {notifications.length === 0 ? (
            <Card className="border-2 border-foreground p-8 text-center bg-card">
              <p className="text-muted-foreground font-bold uppercase">No notifications yet</p>
            </Card>
          ) : (
            notifications.map((notification) => (
              <Card
                key={notification.id}
                className={`border-2 border-foreground p-4 transition-all ${
                  notification.read ? "opacity-60" : "bg-muted"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 mt-1 text-foreground">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold uppercase text-lg">{notification.title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{notification.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs font-bold uppercase px-2 py-1 border border-foreground">
                        {notification.type.replace("_", " ")}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {format(new Date(notification.createdAt), "MMM dd, HH:mm")}
                      </span>
                    </div>
                  </div>

                  {!notification.read && (
                    <button
                      onClick={() => handleMarkAsRead(notification.id)}
                      className="flex-shrink-0 px-3 py-1 border-2 border-foreground hover:bg-foreground hover:text-background transition-all font-bold uppercase text-xs"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Recommendations Section */}
        {recommendationsQuery.data && recommendationsQuery.data.length > 0 && (
          <div>
            <h2 className="text-3xl font-black uppercase mb-4 pb-2 border-b-2 border-foreground">
              AI Recommendations
            </h2>
            <div className="space-y-3">
              {recommendationsQuery.data.map((rec, idx) => (
                <Card key={idx} className="border-2 border-foreground p-4 bg-card">
                  <div className="flex items-start gap-4">
                    <Lightbulb size={20} className="flex-shrink-0 mt-1" />
                    <div className="flex-1">
                      <h3 className="font-bold uppercase text-lg">{rec.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{rec.content}</p>
                      <span className="inline-block text-xs font-bold uppercase px-2 py-1 border border-foreground mt-2">
                        {rec.category}
                      </span>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
