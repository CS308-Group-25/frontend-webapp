export type OrderStatus =
  | 'created'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface OrderItem {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: number;
  status: OrderStatus;
  total: number;
  invoice_id: number | null;
  items: OrderItem[];
  delivery_address: string;
  created_at: string;
}
