import apiClient from '@/lib/api-client';
import { Order, Invoice } from './types';

const MOCK_ORDERS: Order[] = [
  {
    id: 999999,
    status: 'delivered',
    created_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    total: 514.90, // 450.50 + 59.90 kapıda ödeme
    payment_method: 'Kapıda Ödeme (Nakit)',
    delivery_address: 'Örnek Mah. Test Sok. No:1 D:2 Kadıköy / İstanbul',
    invoice_id: 1001,
    items: [
      {
        product_id: 1,
        name: 'Optimum Nutrition Gold Standard Whey',
        quantity: 1,
        price: 250.00
      },
      {
        product_id: 2,
        name: 'Creatine Monohydrate',
        quantity: 2,
        price: 100.25
      }
    ]
  },
  {
    id: 999998,
    status: 'delivered',
    created_at: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
    total: 120.00,
    delivery_address: 'Merkez Mah. Cumhuriyet Cad. No:45 Beşiktaş / İstanbul',
    invoice_id: 1002,
    items: [
      {
        product_id: 3,
        name: 'BCAA Energy Amino Acids',
        quantity: 1,
        price: 120.00
      }
    ]
  },
  {
    id: 999997,
    status: 'cancelled',
    created_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    total: 890.00,
    delivery_address: 'Örnek Mah. Test Sok. No:1 D:2 Kadıköy / İstanbul',
    invoice_id: null,
    items: [
      {
        product_id: 4,
        name: 'Mass Gainer Pro 5kg',
        quantity: 1,
        price: 890.00
      }
    ]
  },
  {
    id: 999996,
    status: 'processing',
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    total: 350.00,
    delivery_address: 'Örnek Mah. Test Sok. No:1 D:2 Kadıköy / İstanbul',
    invoice_id: null,
    items: [
      {
        product_id: 5,
        name: 'Pre-Workout Explosive Energy',
        quantity: 1,
        price: 350.00
      }
    ]
  }
];

const MOCK_INVOICES: Record<number, Invoice> = {
  999999: {
    invoice_id: 1001,
    order_id: 999999,
    created_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
    customer_name: 'Temel Yılmaz',
    customer_email: 'temel.yilmaz@example.com',
    delivery_address: 'Örnek Mah. Test Sok. No:1 D:2 Kadıköy / İstanbul',
    items: [
      {
        product_id: 1,
        name: 'Optimum Nutrition Gold Standard Whey',
        quantity: 1,
        unit_price: 250.00,
        total_price: 250.00
      },
      {
        product_id: 2,
        name: 'Creatine Monohydrate',
        quantity: 2,
        unit_price: 100.25,
        total_price: 200.50
      }
    ],
    subtotal: 450.50,
    tax_amount: 4.50,
    total_amount: 514.90, // 455.00 + 59.90 kapıda ödeme
    payment_method: 'Kapıda Ödeme (Nakit)'
  },
  999998: {
    invoice_id: 1002,
    order_id: 999998,
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    customer_name: 'Temel Yılmaz',
    customer_email: 'temel.yilmaz@example.com',
    delivery_address: 'Merkez Mah. Cumhuriyet Cad. No:45 Beşiktaş / İstanbul',
    items: [
      {
        product_id: 3,
        name: 'BCAA Energy Amino Acids',
        quantity: 1,
        unit_price: 120.00,
        total_price: 120.00
      }
    ],
    subtotal: 118.80,
    tax_amount: 1.20,
    total_amount: 120.00,
    payment_method: 'Kredi Kartı'
  }
};

export const fetchOrders = async (): Promise<Order[]> => {
  try {
    const orders = await apiClient.get('/v1/orders') as Order[];
    return Array.isArray(orders) ? [...MOCK_ORDERS, ...orders] : [...MOCK_ORDERS];
  } catch (error) {
    console.warn('Failed to fetch orders, returning mock data.', error);
    return MOCK_ORDERS;
  }
};

export const fetchOrderById = async (id: string): Promise<Order> => {
  const mockOrder = MOCK_ORDERS.find(o => String(o.id) === id);
  if (mockOrder) return mockOrder;
  
  try {
    return await apiClient.get(`/v1/orders/${id}`);
  } catch (error) {
    console.warn(`Failed to fetch order ${id}, returning fallback.`, error);
    throw error;
  }
};

export const fetchInvoice = async (orderId: string): Promise<Invoice> => {
  const mockInvoice = MOCK_INVOICES[Number(orderId)];
  if (mockInvoice) return mockInvoice;

  // Fallback generation for mock orders that don't have a hardcoded invoice
  const mockOrder = MOCK_ORDERS.find((o) => String(o.id) === orderId);
  if (mockOrder && mockOrder.invoice_id === null) {
    throw new Error('Bu siparişe ait fatura bulunmamaktadır.');
  }
  if (mockOrder) {
    return {
      invoice_id: Math.floor(Math.random() * 10000),
      order_id: mockOrder.id,
      created_at: mockOrder.created_at,
      customer_name: 'Temel Yılmaz',
      customer_email: 'temel.yilmaz@example.com',
      delivery_address: mockOrder.delivery_address,
      items: mockOrder.items.map(item => ({
        product_id: item.product_id,
        name: item.name,
        quantity: item.quantity,
        unit_price: item.price,
        total_price: item.price * item.quantity
      })),
      subtotal: mockOrder.total,
      tax_amount: parseFloat((mockOrder.total * 0.01 / 1.01).toFixed(2)),
      total_amount: mockOrder.total,
      payment_method: mockOrder.payment_method || 'Kredi Kartı'
    };
  }

  try {
    return await apiClient.get(`/v1/orders/${orderId}/invoice`);
  } catch (error) {
    console.warn(`Failed to fetch invoice for order ${orderId}, returning fallback.`, error);
    throw error;
  }
};
