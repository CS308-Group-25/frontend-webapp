export type OrderStatus =
  | 'processing'
  | 'shipped'
  | 'delivered'
  | 'cancelled';

export type PaymentMethod = 'credit_card' | 'debit_card' | 'bank_transfer' | 'cash_on_delivery';

export type PaymentStatus = 'paid' | 'pending' | 'refunded' | 'failed';

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
}

export interface BillingAddress {
  fullName: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  district: string;
  country: string;
  postalCode?: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  orderDate: string; // ISO date string
  items: OrderItem[];
  subtotal: number;
  shippingCost: number;
  total: number;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  billingAddress: BillingAddress;
  trackingNumber?: string;
  estimatedDelivery?: string; // ISO date string
}

export interface Invoice {
  invoiceNo: string;
  orderNumber: string;
  invoiceDate: string;
  order: Order;
}
