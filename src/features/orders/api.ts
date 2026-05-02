import apiClient from '@/lib/api-client';
import { Order, Invoice, OrderStatus } from './types';

// Raw backend order item shape
interface RawOrderItem {
  product_id?: number;
  id?: number;
  name?: string;
  quantity?: number;
  price?: number | string;
  unit_price?: number | string;
}

// Raw backend order shape
interface RawOrder {
  id?: number;
  status?: string;
  total?: number | string;
  total_price?: number | string;
  invoice_id?: number | null;
  delivery_address?: string;
  created_at?: string;
  items?: RawOrderItem[];
  order_items?: RawOrderItem[];
  payment_method?: string;
  customer_name?: string;
  customer_email?: string;
}

// Normalise a raw backend order into our frontend Order type
const normaliseOrder = (raw: RawOrder): Order => {
  const items = ((raw.items ?? raw.order_items ?? []) as RawOrderItem[]).map((item) => ({
    product_id: Number(item.product_id ?? item.id ?? 0),
    name: String(item.name ?? 'Ürün'),
    quantity: Number(item.quantity ?? 1),
    price: Number(item.price ?? item.unit_price ?? 0),
    unit_price: Number(item.unit_price ?? item.price ?? 0),
  }));

  const itemsTotal = items.reduce((sum, i) => sum + i.price * i.quantity, 0);
  const existingTotal = Number(raw.total ?? raw.total_price ?? 0);

  return {
    ...(raw as Order),
    id: Number(raw.id),
    status: (raw.status?.toLowerCase() ?? 'processing') as OrderStatus,
    total: existingTotal > 0 ? existingTotal : itemsTotal,
    delivery_address: raw.delivery_address ?? '',
    created_at: raw.created_at ?? new Date().toISOString(),
    items,
  };
};

export const fetchOrders = async (): Promise<Order[]> => {
  const raw = await apiClient.get('/v1/orders') as unknown as RawOrder[];
  const orders = Array.isArray(raw) ? raw : [];
  return orders.map(normaliseOrder);
};

export const fetchOrderById = async (id: string): Promise<Order> => {
  const raw = await apiClient.get(`/v1/orders/${id}`) as unknown as RawOrder;
  return normaliseOrder(raw);
};

export const fetchInvoice = async (orderId: string): Promise<Invoice> => {
  // 1. Try the dedicated invoice endpoint
  try {
    const apiInvoice = await apiClient.get(`/v1/orders/${orderId}/invoice`) as unknown as Record<string, unknown>;
    if (apiInvoice?.invoice_id && Array.isArray(apiInvoice.items) && apiInvoice.items.length > 0) {
      return apiInvoice as unknown as Invoice;
    }
  } catch {
    // Invoice endpoint not ready yet – fall through to the generated one
  }

  // 2. Fallback: derive invoice from order data
  const order = await fetchOrderById(orderId);
  const items = order.items.map((item) => ({
    product_id: item.product_id,
    name: item.name,
    quantity: item.quantity,
    unit_price: item.unit_price ?? item.price,
    total_price: (item.unit_price ?? item.price) * item.quantity,
  }));

  const subtotal = items.reduce((sum, i) => sum + i.total_price, 0);
  const taxAmount = parseFloat((subtotal * 0.01).toFixed(2));
  const paymentMethod = order.payment_method ?? 'Kredi Kartı';
  const isCash = paymentMethod.includes('Kapıda') || paymentMethod.includes('Nakit');
  const serviceFee = isCash ? 59.9 : 0;
  const totalAmount = parseFloat((subtotal + taxAmount + serviceFee).toFixed(2));

  return {
    invoice_id: order.invoice_id ?? order.id + 1000,
    order_id: order.id,
    created_at: order.created_at,
    customer_name: order.customer_name ?? '',
    customer_email: order.customer_email ?? '',
    delivery_address: order.delivery_address,
    items,
    subtotal,
    tax_amount: taxAmount,
    total_amount: totalAmount,
    payment_method: paymentMethod,
  };
};

export const cancelOrder = async (orderId: string | number): Promise<void> => {
  await apiClient.patch(`/v1/orders/${orderId}`);
};
