"use client";

import { useEffect, useState } from "react";
import { BroadcastService, Broadcast } from "@/services/broadcast.service";
import { useAuthStore } from "@/store/authStore";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Trash2, CheckCircle2, BellRing, BellOff } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { toast } from "sonner";
import { LoadingSpinner } from "@/components/ui/loading-spinner";

export default function NotificationsPage() {
  const { user, profile, updateProfileData } = useAuthStore();
  const [broadcasts, setBroadcasts] = useState<Broadcast[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || !profile) return;

    const fetchBroadcasts = async () => {
      setLoading(true);
      try {
        const data = await BroadcastService.getActiveBroadcastsForUser(profile.createdAt);
        // Filter out deleted broadcasts
        const activeBroadcasts = data.filter(
          b => !profile.deletedBroadcasts?.includes(b.id!)
        );
        setBroadcasts(activeBroadcasts);
      } catch (error) {
        toast.error("Failed to load notifications");
      } finally {
        setLoading(false);
      }
    };

    fetchBroadcasts();
  }, [user, profile]);

  const handleMarkAsRead = async (broadcastId: string) => {
    if (!profile) return;
    try {
      await BroadcastService.markBroadcastAsReadForUser(profile.uid, broadcastId);
      const newRead = [...(profile.readBroadcasts || []), broadcastId];
      updateProfileData({ readBroadcasts: newRead });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (broadcastId: string) => {
    if (!profile) return;
    try {
      await BroadcastService.markBroadcastAsDeletedForUser(profile.uid, broadcastId);
      const newDeleted = [...(profile.deletedBroadcasts || []), broadcastId];
      updateProfileData({ deletedBroadcasts: newDeleted });
      setBroadcasts(prev => prev.filter(b => b.id !== broadcastId));
      toast.success("Notification deleted");
    } catch (error) {
      toast.error("Failed to delete notification");
    }
  };

  const handleMarkAllAsRead = async () => {
    if (!profile) return;
    try {
      const unreadIds = broadcasts
        .filter(b => !profile.readBroadcasts?.includes(b.id!))
        .map(b => b.id!);
      
      for (const id of unreadIds) {
        await BroadcastService.markBroadcastAsReadForUser(profile.uid, id);
      }
      
      updateProfileData({ 
        readBroadcasts: [...(profile.readBroadcasts || []), ...unreadIds] 
      });
      toast.success("All notifications marked as read");
    } catch (error) {
      toast.error("Failed to update notifications");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const unreadCount = broadcasts.filter(b => !profile?.readBroadcasts?.includes(b.id!)).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Notifications</h1>
          <p className="text-muted-foreground mt-1">Stay updated with the latest offers and alerts.</p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={handleMarkAllAsRead}>
            <CheckCircle2 className="w-4 h-4 mr-2" /> Mark all as read
          </Button>
        )}
      </div>

      {broadcasts.length === 0 ? (
        <Card className="flex flex-col items-center justify-center py-16 text-center border-dashed">
          <div className="h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center mb-4">
            <BellOff className="h-6 w-6 text-slate-400" />
          </div>
          <CardTitle className="mb-2">No new notifications</CardTitle>
          <CardDescription>You're all caught up! Check back later for more updates.</CardDescription>
        </Card>
      ) : (
        <div className="space-y-4">
          {broadcasts.map(broadcast => {
            const isRead = profile?.readBroadcasts?.includes(broadcast.id!);
            return (
              <Card key={broadcast.id} className={`transition-all ${isRead ? 'opacity-70 bg-slate-50' : 'border-primary/20 shadow-sm'}`}>
                <CardContent className="p-6 flex flex-col sm:flex-row gap-4 justify-between items-start">
                  <div className="flex items-start gap-4 flex-1">
                    <div className={`mt-1 flex-shrink-0 p-2 rounded-full ${isRead ? 'bg-slate-200 text-slate-500' : 'bg-blue-100 text-blue-600'}`}>
                      <BellRing className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className={`font-semibold ${!isRead ? 'text-lg text-foreground' : 'text-base text-slate-700'}`}>
                          {broadcast.title}
                        </h3>
                        {!isRead && <span className="px-2 py-0.5 rounded-full bg-blue-500 text-white text-[10px] font-bold uppercase tracking-wider">New</span>}
                      </div>
                      <p className="text-muted-foreground text-sm leading-relaxed mb-3">
                        {broadcast.message}
                      </p>
                      <p className="text-xs text-slate-400 font-medium">
                        {formatDistanceToNow(new Date(broadcast.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2 self-end sm:self-auto w-full sm:w-auto">
                    {!isRead && (
                      <Button variant="outline" size="sm" className="w-full sm:w-auto" onClick={() => handleMarkAsRead(broadcast.id!)}>
                        Mark Read
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" className="w-full sm:w-auto text-red-500 hover:text-red-600 hover:bg-red-50" onClick={() => handleDelete(broadcast.id!)}>
                      <Trash2 className="w-4 h-4 mr-2 hidden sm:inline" /> Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
