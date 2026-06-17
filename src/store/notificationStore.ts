import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
  type: "order" | "promo" | "system";
}

interface NotificationState {
  notifications: Notification[];
  addNotification: (notification: Omit<Notification, "id" | "read" | "createdAt">) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
  getUnreadCount: () => number;
}

export const useNotificationStore = create<NotificationState>()(
  persist(
    (set, get) => ({
      notifications: [
        {
          id: "welcome-1",
          title: "Welcome to TechyMart!",
          message: "Thank you for joining our premium marketplace. Enjoy a 10% discount on your first order with code: WELCOME10.",
          read: false,
          createdAt: new Date().toISOString(),
          type: "promo",
        }
      ],

      addNotification: (notification) => {
        set((state) => ({
          notifications: [
            {
              ...notification,
              id: `notif-${Date.now()}`,
              read: false,
              createdAt: new Date().toISOString(),
            },
            ...state.notifications,
          ],
        }));
      },

      markAsRead: (id) => {
        set((state) => ({
          notifications: state.notifications.map((n) =>
            n.id === id ? { ...n, read: true } : n
          ),
        }));
      },

      markAllAsRead: () => {
        set((state) => ({
          notifications: state.notifications.map((n) => ({ ...n, read: true })),
        }));
      },

      clearNotifications: () => set({ notifications: [] }),

      getUnreadCount: () => {
        return get().notifications.filter((n) => !n.read).length;
      },
    }),
    {
      name: "TechyMart-notifications",
    }
  )
);
