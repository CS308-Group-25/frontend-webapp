import apiClient from '@/lib/api-client';
import { FetchAdminInvoicesParams, PaginatedInvoiceResponse } from './types';

export const fetchAdminInvoices = async (
  params: FetchAdminInvoicesParams,
): Promise<PaginatedInvoiceResponse> => {
  return apiClient.get('/v1/admin/invoices', { params });
};

export const fetchAdminInvoicePdf = async (invoiceId: number): Promise<Blob> => {
  return apiClient.get(`/v1/admin/invoices/${invoiceId}/pdf`, {
    responseType: 'blob',
  });
};
