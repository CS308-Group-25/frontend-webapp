'use client';

import { Eye } from 'lucide-react';
import { AdminOrder } from '../types';

interface DeliveryQueueTableProps {
  orders: AdminOrder[];
  onViewOrder: (orderId: number) => void;
}

export default function DeliveryQueueTable({ orders, onViewOrder }: DeliveryQueueTableProps) {
  if (orders.length === 0) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center rounded-2xl bg-white p-8 shadow-sm">
        <p className="text-lg font-medium text-slate-500">Bu durumda sipariş bulunamadı.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-200">
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-6 py-4 font-bold">Sipariş No</th>
              <th className="px-6 py-4 font-bold">Müşteri</th>
              <th className="px-6 py-4 font-bold">Ürünler</th>
              <th className="px-6 py-4 font-bold">Teslimat Adresi</th>
              <th className="px-6 py-4 font-bold">Toplam</th>
              <th className="px-6 py-4 font-bold">Durum</th>
              <th className="px-6 py-4 font-bold text-right">İşlemler</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {orders.map((order) => (
              <tr
                key={order.order_id}
                className="transition-colors duration-200 hover:bg-slate-50"
              >
                <td className="px-6 py-4 font-semibold text-slate-900">
                  #{order.order_id}
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col">
                    <span className="font-semibold text-slate-900">{order.customer_name}</span>
                    <span className="text-xs text-slate-500">{order.customer_email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex flex-col gap-1">
                    {order.items.slice(0, 2).map((item, idx) => (
                      <span key={idx} className="text-sm text-slate-700">
                        {item.quantity}x {item.name}
                      </span>
                    ))}
                    {order.items.length > 2 && (
                      <span className="text-xs text-slate-400">
                        +{order.items.length - 2} ürün daha
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="text-sm text-slate-600 max-w-[200px] block truncate">
                    {order.delivery_address}
                  </span>
                </td>
                <td className="px-6 py-4 font-semibold text-slate-700">
                  {order.total} TL
                </td>
                <td className="px-6 py-4">
                  <StatusBadge status={order.status} />
                </td>
                <td className="px-6 py-4 text-right">
                  <button
                    onClick={() => onViewOrder(order.order_id)}
                    className="rounded-lg p-2 text-indigo-600 transition-colors hover:bg-indigo-50 active:scale-95"
                    title="Siparişi Görüntüle"
                  >
                    <Eye className="h-4 w-4" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; className: string }> = {
    confirmed: { label: 'Onaylandı', className: 'text-blue-700 bg-blue-50 border-blue-200' },
    processing: { label: 'Hazırlanıyor', className: 'text-amber-700 bg-amber-50 border-amber-200' },
    in_transit: { label: 'Kargoya Verildi', className: 'text-purple-700 bg-purple-50 border-purple-200' },
    delivered: { label: 'Teslim Edildi', className: 'text-green-700 bg-green-50 border-green-200' },
  };

  const { label, className } = config[status] ?? { label: status, className: 'text-slate-700 bg-slate-50 border-slate-200' };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${className}`}>
      {label}
    </span>
  );
}