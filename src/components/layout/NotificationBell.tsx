"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { NotificationService, AppNotification } from "@/services/notification.service";
import { useRouter } from "next/navigation";

export function NotificationBell() {
  const { user, profile } = useAuthStore();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const router = useRouter();

  useEffect(() => {
    if (!user || !profile) return;

    // We will listen to customer notifications and admin notifications if user is admin
    let unsubscribeCustomer: (() => void) | undefined;
    let unsubscribeAdmin: (() => void) | undefined;

    const allNotifications = new Map<string, AppNotification>();

    const updateNotifications = () => {
      const sorted = Array.from(allNotifications.values()).sort((a, b) => {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
      setNotifications(sorted.slice(0, 20)); // Keep only top 20 for the dropdown
    };

    unsubscribeCustomer = NotificationService.subscribeToUserNotifications(user.uid, (data) => {
      data.forEach(n => allNotifications.set(n.id!, n));
      updateNotifications();
    });

    if (profile.role === "admin") {
      unsubscribeAdmin = NotificationService.subscribeToAdminNotifications((data) => {
        data.forEach(n => allNotifications.set(n.id!, n));
        updateNotifications();
      });
    }

    return () => {
      if (unsubscribeCustomer) unsubscribeCustomer();
      if (unsubscribeAdmin) unsubscribeAdmin();
    };
  }, [user, profile]);

  if (!user || !profile) return null;

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = async (notification: AppNotification) => {
    if (!notification.isRead) {
      await NotificationService.markAsRead(notification.id!);
    }
    if (notification.actionUrl) {
      router.push(notification.actionUrl);
    }
  };

  const handleMarkAllAsRead = async () => {
    await NotificationService.markAllAsRead(user.uid, "customer");
    if (profile.role === "admin") {
      await NotificationService.markAllAsRead(user.uid, "admin");
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="relative flex h-10 w-10 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2">
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuGroup>
          <div className="flex items-center justify-between px-4 py-2">
            <DropdownMenuLabel className="p-0 font-semibold">Notifications</DropdownMenuLabel>
            <Badge variant="secondary" className="text-xs">{unreadCount} New</Badge>
          </div>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <div className="max-h-[350px] overflow-y-auto">
          {notifications.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Bell className="w-8 h-8 text-muted/30 mx-auto mb-2" />
              You're all caught up!
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem 
                key={notification.id} 
                className={`cursor-pointer p-4 focus:bg-accent ${!notification.isRead ? 'bg-blue-50/50 dark:bg-blue-900/10' : ''}`}
                onSelect={(e) => {
                  e.preventDefault();
                  handleNotificationClick(notification);
                }}
              >
                <div className="flex flex-col gap-1 items-start w-full">
                  <div className="flex w-full justify-between items-start gap-2">
                    <span className={`text-sm font-medium leading-none ${!notification.isRead ? "text-foreground" : "text-muted-foreground"}`}>
                      {notification.title}
                    </span>
                    {!notification.isRead && <span className="h-2 w-2 rounded-full bg-blue-500 flex-shrink-0 mt-0.5" />}
                  </div>
                  <span className={`text-xs line-clamp-2 ${!notification.isRead ? "text-foreground/80" : "text-muted-foreground"}`}>
                    {notification.message}
                  </span>
                  <div className="flex w-full items-center justify-between mt-1">
                    <span className="text-[10px] text-muted-foreground font-medium uppercase">
                      {notification.type}
                    </span>
                    <span className="text-[10px] text-muted-foreground">
                      {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                    </span>
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
        {notifications.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuSeparator />
            <div className="flex items-center justify-between p-2">
              <button
                onClick={handleMarkAllAsRead}
                className="text-xs text-muted-foreground hover:text-foreground p-2 rounded-md hover:bg-accent transition-colors"
              >
                Mark all as read
              </button>
              <Link 
                href="/notifications" 
                className="text-xs font-medium text-primary hover:underline p-2"
              >
                View all
              </Link>
            </div>
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
