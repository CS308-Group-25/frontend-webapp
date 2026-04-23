import apiClient from '@/lib/api-client';
import { AdminOrder, OrderStatus } from './types';

export const fetchAdminOrders = async (status?: OrderStatus): Promise<AdminOrder[]> => {
  const params = status ? { status } : {};
  return apiClient.get('/v1/admin/orders', { params });
};

export const updateOrderStatus = async (orderId: number, status: OrderStatus): Promise<AdminOrder> => {
  return apiClient.patch(`/v1/admin/orders/${orderId}`, { status });
};