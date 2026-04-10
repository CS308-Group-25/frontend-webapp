import apiClient from '@/lib/api-client';
import { Order } from './types';

export const fetchOrders = async (): Promise<Order[]> => {
  return apiClient.get('/v1/orders');
};

export const fetchOrderById = async (id: string): Promise<Order> => {
  return apiClient.get(`/v1/orders/${id}`);
};
