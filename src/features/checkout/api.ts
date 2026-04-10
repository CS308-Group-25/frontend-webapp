import apiClient from '@/lib/api-client';

export interface CreateOrderPayload {
  delivery_address: string;
  card_number: string;
  card_last4: string;
  card_brand: string;
}

export interface CreateOrderResponse {
  id: number;
  status: string;
  total: number;
  invoice_id: number | null;
  items: Array<{
    product_id: number;
    name: string;
    quantity: number;
    price: number;
  }>;
  delivery_address: string;
  created_at: string;
}

export const createOrder = async (
  payload: CreateOrderPayload
): Promise<CreateOrderResponse> => {
  return apiClient.post('/v1/orders', payload);
};
