import { AdminOrder, OrderStatus } from '../types';

export const mockOrders: AdminOrder[] = [
  {
    order_id: 101,
    customer_id: 1,
    total: 539,
    items: [
      { product_id: 1, name: 'Whey Protein Isolate', quantity: 1, price: 539 }
    ],
    delivery_address: 'Atatürk Cad. No:123, Kadıköy, İstanbul',
    status: 'processing',
    completed: false,
    customer_name: 'Ahmet Yılmaz',
    customer_email: 'ahmet@example.com'
  },
  {
    order_id: 102,
    customer_id: 2,
    total: 1799,
    items: [
      { product_id: 2, name: 'Creatine Monohydrate', quantity: 2, price: 899 },
      { product_id: 3, name: 'BCAA 2:1:1', quantity: 1, price: 450 }
    ],
    delivery_address: 'Cumhuriyet Mah. Şehit Sok. No:45, Beşiktaş, İstanbul',
    status: 'in_transit',
    completed: false,
    customer_name: 'Ayşe Demir',
    customer_email: 'ayse@example.com'
  },
  {
    order_id: 103,
    customer_id: 3,
    total: 3299,
    items: [
      { product_id: 4, name: 'Pre-Workout Extreme', quantity: 3, price: 1099 }
    ],
    delivery_address: 'Bağdat Cad. Palmiye Apt. No:78, Maltepe, İstanbul',
    status: 'delivered',
    completed: true,
    customer_name: 'Mehmet Kaya',
    customer_email: 'mehmet@example.com'
  },
  {
    order_id: 104,
    customer_id: 4,
    total: 215,
    items: [
      { product_id: 5, name: 'L-Glutamine', quantity: 1, price: 215 }
    ],
    delivery_address: 'İstiklal Cad. No:32, Taksim, İstanbul',
    status: 'processing',
    completed: false,
    customer_name: 'Fatma Şahin',
    customer_email: 'fatma@example.com'
  },
  {
    order_id: 105,
    customer_id: 5,
    total: 899,
    items: [
      { product_id: 6, name: 'Casein Protein', quantity: 1, price: 899 }
    ],
    delivery_address: 'Nilüfer Mah. Çınar Sok. No:11, Bursa',
    status: 'in_transit',
    completed: false,
    customer_name: 'Ali Çelik',
    customer_email: 'ali@example.com'
  }
];

export const filterOrdersByStatus = (
  orders: AdminOrder[],
  status: OrderStatus | undefined
): AdminOrder[] => {
  if (!status) return orders;
  return orders.filter((order) => order.status === status);
};