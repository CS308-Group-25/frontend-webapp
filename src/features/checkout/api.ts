import apiClient from '@/lib/api-client';

export interface CreateOrderPayload {
  address: {
    first_name: string;
    last_name: string;
    address_line1: string;
    address_line2?: string;
    city: string;
    district: string;
    phone: string;
    save_address?: boolean;
    title?: string;
  };
  payment_method: 'credit_card' | 'cod_cash' | 'cod_card';
  card_details?: {
    card_number: string;
    card_holder: string;
    expiry_month: string;
    expiry_year: string;
    cvv: string;
  };
  billing_address_same_as_shipping: boolean;
}

export interface CreateOrderResponse {
  id: number;
  order_number: string;
  status: string;
  created_at: string;
  total_amount: number;
}

export const createOrder = async (
  payload: CreateOrderPayload
): Promise<CreateOrderResponse> => {
  return apiClient.post('/v1/orders', payload);
};
