import apiClient from '@/lib/api-client';

export interface SavedAddress {
  id: number;
  title: string;
  first_name: string;
  last_name: string;
  address: string;
  apartment: string | null;
  city: string;
  district: string;
  phone: string;
}

export const getAddresses = (): Promise<SavedAddress[]> =>
  apiClient.get('/v1/addresses');

export const saveAddress = (data: {
  title: string;
  first_name: string;
  last_name: string;
  address: string;
  apartment: string;
  city: string;
  district: string;
  phone: string;
}): Promise<SavedAddress> => apiClient.post('/v1/addresses', data);

export const deleteAddress = (id: number): Promise<void> =>
  apiClient.delete(`/v1/addresses/${id}`);
