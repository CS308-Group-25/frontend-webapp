export type OrderStatus =
  | 'created'
  | 'processing'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'cancelled'
  | 'returned'
  | 'pending'
  | 'confirmed';

export type RefundStatus =
  | 'requested'
  | 'approved_waiting_return'
  | 'returned_received'
  | 'refunded'
  | 'rejected';

export interface RefundRequest {
  id: number;
  order_id: number;
  order_item_id: number;
  product_name: string;
  refund_amount: number;
  status: RefundStatus;
  created_at: string;
}

export interface OrderItem {
  id: number;
  product_id: number;
  name: string;
  quantity: number;
  price: number;
  unit_price?: number;
  variant_name?: string;
  refund_request?: RefundRequest | null;
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
