import type { Order } from '../types/order.types';

export const mockOrders: Order[] = [
  {
    id: 'ord-104582',
    orderNumber: '104582',
    status: 'delivered',
    orderDate: '2026-04-08T10:30:00Z',
    items: [
      {
        productId: '1',
        productName: 'Whey Protein Isolate',
        quantity: 1,
        unitPrice: 539.00,
      },
      {
        productId: '2',
        productName: 'Creatine Monohydrate',
        quantity: 1,
        unitPrice: 249.00,
      },
      {
        productId: '4',
        productName: 'Protein Bar Paketi 6\'lı Paket',
        quantity: 1,
        unitPrice: 329.00,
      },
    ],
    subtotal: 1117.00,
    shippingCost: 0,
    total: 1117.00,
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    billingAddress: {
      fullName: 'Ertem Yılmaz',
      phone: '+90 532 000 00 00',
      addressLine1: 'Bağcılar Mah. Ergenekon Cad. No:14 Daire:7',
      city: 'İstanbul',
      district: 'Bağcılar',
      country: 'Türkiye',
      postalCode: '34202',
    },
    trackingNumber: 'PTT-40220240408-01',
    estimatedDelivery: '2026-04-10T18:00:00Z',
  },

  {
    id: 'ord-104511',
    orderNumber: '104511',
    status: 'shipped',
    orderDate: '2026-04-06T14:15:00Z',
    items: [
      {
        productId: '5',
        productName: 'Pre-Workout Formula 300g',
        quantity: 2,
        unitPrice: 399.00,
      },
      {
        productId: '6',
        productName: 'ZMA Vitamin Kompleks 90 Kapsül',
        quantity: 1,
        unitPrice: 179.00,
      },
    ],
    subtotal: 977.00,
    shippingCost: 0,
    total: 977.00,
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    billingAddress: {
      fullName: 'Ertem Yılmaz',
      phone: '+90 532 000 00 00',
      addressLine1: 'Bağcılar Mah. Ergenekon Cad. No:14 Daire:7',
      city: 'İstanbul',
      district: 'Bağcılar',
      country: 'Türkiye',
      postalCode: '34202',
    },
    trackingNumber: 'YK-83910240406',
    estimatedDelivery: '2026-04-12T18:00:00Z',
  },
  {
    id: 'ord-104480',
    orderNumber: '104480',
    status: 'processing',
    orderDate: '2026-04-10T09:00:00Z',
    items: [
      {
        productId: '8',
        productName: 'Kazein Protein 700g',
        quantity: 1,
        unitPrice: 619.00,
      },
      {
        productId: '3',
        productName: 'BCAA+ Amino Asit 300g',
        quantity: 1,
        unitPrice: 299.00,
      },
    ],
    subtotal: 918.00,
    shippingCost: 0,
    total: 918.00,
    paymentMethod: 'bank_transfer',
    paymentStatus: 'paid',
    billingAddress: {
      fullName: 'Ertem Yılmaz',
      phone: '+90 532 000 00 00',
      addressLine1: 'Bağcılar Mah. Ergenekon Cad. No:14 Daire:7',
      city: 'İstanbul',
      district: 'Bağcılar',
      country: 'Türkiye',
      postalCode: '34202',
    },
    estimatedDelivery: '2026-04-14T18:00:00Z',
  },
  {
    id: 'ord-104320',
    orderNumber: '104320',
    status: 'cancelled',
    orderDate: '2026-03-30T11:45:00Z',
    items: [
      {
        productId: '7',
        productName: 'Omega-3 Balık Yağı 60 Kapsül',
        quantity: 1,
        unitPrice: 219.00,
      },
    ],
    subtotal: 219.00,
    shippingCost: 29.90,
    total: 248.90,
    paymentMethod: 'credit_card',
    paymentStatus: 'refunded',
    billingAddress: {
      fullName: 'Ertem Yılmaz',
      phone: '+90 532 000 00 00',
      addressLine1: 'Bağcılar Mah. Ergenekon Cad. No:14 Daire:7',
      city: 'İstanbul',
      district: 'Bağcılar',
      country: 'Türkiye',
      postalCode: '34202',
    },
  },
  {
    id: 'ord-104601',
    orderNumber: '104601',
    status: 'processing',
    orderDate: '2026-04-11T08:00:00Z',
    items: [
      {
        productId: '9',
        productName: 'Vahşi Trenbolon İğnesi',
        quantity: 2,
        unitPrice: 749.00,
      },
      {
        productId: '2',
        productName: 'Creatine Monohydrate',
        quantity: 1,
        unitPrice: 249.00,
      },
    ],
    subtotal: 1747.00,
    shippingCost: 0,
    total: 1747.00,
    paymentMethod: 'credit_card',
    paymentStatus: 'paid',
    billingAddress: {
      fullName: 'Ertem Yılmaz',
      phone: '+90 532 000 00 00',
      addressLine1: 'Bağcılar Mah. Ergenekon Cad. No:14 Daire:7',
      city: 'İstanbul',
      district: 'Bağcılar',
      country: 'Türkiye',
      postalCode: '34202',
    },
    estimatedDelivery: '2026-04-15T18:00:00Z',
  },
];


/**
 * Derives an Invoice object from an Order.
 * Invoice number is INV-{orderNumber}.
 * Invoice date equals order date.
 */
export function getInvoiceFromOrder(order: Order) {
  return {
    invoiceNo: `INV-${order.orderNumber}`,
    orderNumber: order.orderNumber,
    invoiceDate: order.orderDate,
    order,
  };
}

export function findOrderByNumber(orderNumber: string): Order | undefined {
  return mockOrders.find((o) => o.orderNumber === orderNumber);
}
