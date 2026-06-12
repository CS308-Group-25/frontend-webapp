import apiClient from '@/lib/api-client';

export interface NotificationItem {
  id: number;
  message: string;
  is_read: boolean;
  created_at: string;
}

export const fetchUnreadNotifications = async (): Promise<NotificationItem[]> =>
  apiClient.get('/v1/notifications');

export const markAllNotificationsRead = async (): Promise<void> =>
  apiClient.patch('/v1/notifications/read-all');

export const markNotificationRead = async (id: number): Promise<void> =>
  apiClient.patch(`/v1/notifications/${id}/read`);

export const deleteNotification = async (id: number): Promise<void> =>
  apiClient.delete(`/v1/notifications/${id}`);
