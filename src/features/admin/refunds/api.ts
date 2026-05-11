import apiClient from '@/lib/api-client';
import { AdminRefundRequest, RefundStatus } from './types';

export const fetchAdminRefunds = async (status?: RefundStatus): Promise<AdminRefundRequest[]> => {
  return apiClient.get('/v1/admin/refund-requests', { params: status ? { status } : {} });
};

export const updateRefundStatus = async (id: number, status: RefundStatus): Promise<AdminRefundRequest> => {
  return apiClient.patch(`/v1/admin/refund-requests/${id}`, { status });
};
