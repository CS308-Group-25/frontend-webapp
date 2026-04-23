import apiClient from '@/lib/api-client';
import { AdminOrder, OrderStatus } from './types';

export const fetchAdminOrders = async (status?: OrderStatus): Promise<AdminOrder[]> => {
  const params = status ? { status } : {};
  return apiClient.get('/v1/admin/orders', { params });
};