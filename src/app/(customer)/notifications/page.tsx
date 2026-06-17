"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";
import { NotificationService, AppNotification } from "@/services/notification.service";
import { formatDistanceToNow } from "date-fns";
import { Bell, CheckCheck, Trash2, ShieldAlert, Package, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NotificationCenterPage() {
  const { user, profile } = useAuthStore();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    if (!user || !profile) return;

    // Use snapshot listeners but with a higher limit for the center
    const allNotifications = new Map<string, AppNotification>();

    const updateNotifications = () => {
      const sorted = Array.from(allNotifications.values()).sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setNotifications(sorted);
    };

    const unsubscribeCustomer = NotificationService.subscribeToUserNotifications(user.uid, (data) => {
      data.forEach(n => allNotifications.set(n.id!, n));
      updateNotifications();
    }, 100);

    let unsubscribeAdmin: (() => void) | undefined;
    if (profile.role === "admin") {
      unsubscribeAdmin = NotificationService.subscribeToAdminNotifications((data) => {
        data.forEach(n => allNotifications.set(n.id!, n));
        updateNotifications();
      }, 100);
    }

    return () => {
      if (unsubscribeCustomer) unsubscribeCustomer();
      if (unsubscribeAdmin) unsubscribeAdmin();
    };
  }, [user, profile]);

  if (!user || !profile) return null;

  const handleMarkAllRead = async () => {
    await NotificationService.markAllAsRead(user.uid, "customer");
    if (profile.role === "admin") {
      await NotificationService.markAllAsRead(user.uid, "admin");
    }
  };

  const handleMarkAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await NotificationService.markAsRead(id);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await NotificationService.deleteNotification(id);
  };

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.isRead) {
      await NotificationService.markAsRead(notification.id!);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const filteredNotifications = notifications.filter((n) => {
    if (activeTab === "all") return true;
    if (activeTab === "unread") return !n.isRead;
    if (activeTab === "admin") return n.recipientRole === "admin";
    if (activeTab === "orders") return n.referenceType === "order";
    return true;
  });

  const getIcon = (type: string, role: string) => {
    if (role === "admin") return <ShieldAlert className="w-5 h-5 text-indigo-500" />;
    if (type.includes("Order")) return <Package className="w-5 h-5 text-blue-500" />;
    return <Bell className="w-5 h-5 text-slate-500" />;
  };

  return (
    <div className="container max-w-4xl py-10">
      <div className="flex items-center gap-4 mb-8">
        <Button variant="ghost" size="icon" onClick={() => router.back()}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Notification Center</h1>
          <p className="text-muted-foreground">Manage your alerts and updates.</p>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between pb-4 space-y-4 sm:space-y-0">
          <div>
            <CardTitle>Your Notifications</CardTitle>
            <CardDescription>
              You have {notifications.filter(n => !n.isRead).length} unread messages.
            </CardDescription>
          </div>
          <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
            <CheckCheck className="w-4 h-4 mr-2" />
            Mark all as read
          </Button>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="unread">Unread</TabsTrigger>
              <TabsTrigger value="orders">Orders</TabsTrigger>
              {profile.role === "admin" && (
                <TabsTrigger value="admin">Admin Alerts</TabsTrigger>
              )}
            </TabsList>

            <div className="space-y-4">
              {filteredNotifications.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground bg-slate-50 rounded-lg border border-dashed">
                  <Bell className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                  <p>No notifications found in this category.</p>
                </div>
              ) : (
                filteredNotifications.map((notification) => (
                  <div
                    key={notification.id}
                    onClick={() => handleNotificationClick(notification)}
                    className={`flex items-start gap-4 p-4 rounded-lg border transition-colors cursor-pointer hover:border-slate-300 ${
                      !notification.isRead ? "bg-blue-50/30 border-blue-100" : "bg-card"
                    }`}
                  >
                    <div className={`p-2 rounded-full mt-1 shrink-0 ${!notification.isRead ? 'bg-white shadow-sm' : 'bg-slate-100'}`}>
                      {getIcon(notification.type, notification.recipientRole)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-2">
                          <h4 className={`font-semibold text-base ${!notification.isRead ? "text-slate-900" : "text-slate-700"}`}>
                            {notification.title}
                          </h4>
                          {notification.recipientRole === "admin" && (
                            <Badge variant="outline" className="text-[10px] uppercase text-indigo-600 border-indigo-200 bg-indigo-50">Admin</Badge>
                          )}
                          {!notification.isRead && (
                            <Badge className="bg-blue-500 hover:bg-blue-600 text-[10px]">New</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                      <p className={`text-sm mb-2 ${!notification.isRead ? "text-slate-700 font-medium" : "text-muted-foreground"}`}>
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center justify-between mt-3">
                        <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                          {notification.type}
                        </span>
                        
                        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 sm:opacity-100 transition-opacity">
                          {!notification.isRead && (
                            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={(e) => handleMarkAsRead(notification.id!, e)}>
                              Mark as read
                            </Button>
                          )}
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-500 hover:bg-red-50" onClick={(e) => handleDelete(notification.id!, e)}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
