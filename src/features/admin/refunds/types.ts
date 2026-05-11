export type RefundStatus =
  | 'requested'
  | 'approved_waiting_return'
  | 'returned_received'
  | 'refunded'
  | 'rejected';

export interface AdminRefundRequest {
  id: number;
  customer_name: string;
  product_name: string;
  order_date: string;
  refund_amount: number | string;
  reason: string | null;
  status: RefundStatus;
}
