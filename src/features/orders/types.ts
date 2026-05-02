export type OrderStatus =
  | 'created'
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'pending'
  | 'confirmed';

export interface OrderItem {
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  unit_price?: number;
  variant_name?: string;
}

export interface InvoiceItem {
  product_id: number;
  name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Invoice {
  invoice_id: number;
  order_id: number;
  created_at: string;
  customer_name: string;
  customer_email: string;
  delivery_address: string;
  items: InvoiceItem[];
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  payment_method?: string;
}

export interface Order {
  id: number;
  status: OrderStatus;
  total: number;
  invoice_id: number | null;
  items: OrderItem[];
  delivery_address: string;
  created_at: string;
  payment_method?: string;
  customer_name?: string;
  customer_email?: string;
}
