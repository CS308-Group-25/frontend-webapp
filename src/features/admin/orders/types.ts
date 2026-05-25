export type OrderStatus = 'confirmed' | 'processing' | 'in_transit' | 'delivered' | 'cancelled';

export interface OrderItem {
  id?: number;
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  variant_name?: string | null;
}

export interface AdminOrder {
  order_id: number;
  customer_id: number;
  total: number;
  invoice_id: number | null;
  invoice_number: string | null;
  items: OrderItem[];
  delivery_address: string;
  status: OrderStatus;
  completed: boolean;
  customer_name: string;
  customer_email: string;
  created_at: string;
  payment_method?: string | null;
}
