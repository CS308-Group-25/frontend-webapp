import { create } from 'zustand';
import {
  fetchUnreadNotifications,
  markNotificationRead,
  deleteNotification,
  type NotificationItem,
} from '../api/notifications.api';

interface NotificationsState {
  items: NotificationItem[];
  fetch: () => Promise<void>;
  markRead: (id: number) => Promise<void>;
  remove: (id: number) => Promise<void>;
}

export const useNotificationsStore = create<NotificationsState>((set, get) => ({
  items: [],

  fetch: async () => {
    try {
      const data = await fetchUnreadNotifications();
      set({ items: data });
    } catch {
      // silently ignore — user may not be logged in
    }
  },

  markRead: async (id: number) => {
    try {
      await markNotificationRead(id);
      set({ items: get().items.filter((n) => n.id !== id) });
    } catch {
      // ignore
    }
  },

  remove: async (id: number) => {
    try {
      await deleteNotification(id);
      set({ items: get().items.filter((n) => n.id !== id) });
    } catch {
      // ignore
    }
  },
}));
