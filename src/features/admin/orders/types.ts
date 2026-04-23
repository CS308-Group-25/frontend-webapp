export type OrderStatus = 'confirmed' | 'processing' | 'in_transit' | 'delivered';

export interface OrderItem {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
}

export interface AdminOrder {
  order_id: number;
  customer_id: number;
  total: number;
  items: OrderItem[];
  delivery_address: string;
  status: OrderStatus;
  completed: boolean;
  customer_name: string;
  customer_email: string;
}