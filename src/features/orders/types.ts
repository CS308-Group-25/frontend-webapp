export type OrderStatus =
  | 'created'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned';

export interface OrderItem {
  id: number;
  product_id: number;
  product_name: string;
  product_image?: string;
  quantity: number;
  unit_price: number;
  original_price?: number;
  variant_id?: string;
}

export interface OrderAddress {
  name: string;
  phone: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  district: string;
  country?: string;
}

export interface Order {
  id: number;
  order_number: string;
  status: OrderStatus;
  created_at: string;
  items: OrderItem[];
  subtotal_amount: number;
  shipping_cost: number;
  tax_amount: number;
  total_amount: number;
  shipping_address: OrderAddress;
  billing_address?: OrderAddress;
  payment_method: string;
  last_four_digits?: string;
}
