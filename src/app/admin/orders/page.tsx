'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Truck } from 'lucide-react';
import DeliveryQueueTable from '@/features/admin/orders/components/DeliveryQueueTable';
import { fetchAdminOrders, updateOrderStatus } from '@/features/admin/orders/api';
import { mockOrders, filterOrdersByStatus } from '@/features/admin/orders/data/mock-orders';
import { AdminOrder, OrderStatus } from '@/features/admin/orders/types';

const STATUS_OPTIONS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tüm Siparişler' },
  { value: 'processing', label: 'Hazırlanıyor' },
  { value: 'in_transit', label: 'Kargoya Verildi' },
  { value: 'delivered', label: 'Teslim Edildi' },
];

export default function AdminDeliveryQueuePage() {
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>(undefined);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminOrders()
      .then(setOrders)
      .catch(() => {
        console.warn('API unavailable, using mock data');
        setOrders(mockOrders);
      })
      .finally(() => setLoading(false));
  }, []);

  const filteredOrders = useMemo(
    () => filterOrdersByStatus(orders, selectedStatus),
    [orders, selectedStatus]
  );

  const handleViewOrder = (orderId: number) => {
    window.location.href = `/orders/${orderId}`;
  };

  const handleUpdateStatus = async (orderId: number, status: OrderStatus) => {
    // Update local state immediately
    setOrders((prev) =>
      prev.map((order) =>
        order.order_id === orderId ? { ...order, status } : order
      )
    );
    
    // Try API call
    try {
      await updateOrderStatus(orderId, status);
    } catch (error) {
      console.warn('API update failed:', error);
    }
  };

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8">
        <div className="mb-2 text-sm text-slate-400">
          <Link href="/" className="transition-colors hover:text-indigo-600">Ana Sayfa</Link>
          <span className="mx-2">•</span>
          <span className="font-bold text-slate-700">Yönetim Paneli</span>
          <span className="mx-2">•</span>
          <span className="font-bold text-slate-700">Teslimat Kuyruğu</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-100 rounded-xl">
            <Truck className="h-6 w-6 text-indigo-600" />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Teslimat Kuyruğu
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Siparişlerin teslimat durumlarını görüntüleyin ve yönetin.
            </p>
          </div>
        </div>
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUS_OPTIONS.map((option) => {
          const isActive = option.value === 'all' ? !selectedStatus : selectedStatus === option.value;
          return (
            <button
              key={option.value}
              onClick={() => setSelectedStatus(option.value === 'all' ? undefined : option.value as OrderStatus)}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      <DeliveryQueueTable orders={filteredOrders} onViewOrder={handleViewOrder} onUpdateStatus={handleUpdateStatus} />
    </div>
  );
}