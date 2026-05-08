'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { Truck, ShieldX } from 'lucide-react';
import DeliveryQueueTable from '@/features/admin/orders/components/DeliveryQueueTable';
import { fetchAdminOrders, updateOrderStatus } from '@/features/admin/orders/api';
import { AdminOrder, OrderStatus } from '@/features/admin/orders/types';
import { useAuthStore } from '@/features/auth';

const STATUS_OPTIONS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'Tüm Siparişler' },
  { value: 'confirmed', label: 'Onaylandı' },
  { value: 'processing', label: 'Hazırlanıyor' },
  { value: 'in_transit', label: 'Kargoya Verildi' },
  { value: 'delivered', label: 'Teslim Edildi' },
];

export default function AdminDeliveryQueuePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const [selectedStatus, setSelectedStatus] = useState<OrderStatus | undefined>(undefined);
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const isAuthorized = isAuthenticated && user?.role === 'product_manager';

  const loadOrders = () => {
    setFetchError(false);
    setLoading(true);
    fetchAdminOrders()
      .then(setOrders)
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    if (!isAuthorized) return;
    fetchAdminOrders()
      .then(setOrders)
      .catch(() => setFetchError(true))
      .finally(() => setLoading(false));
  }, [isAuthorized]);

  const filteredOrders = useMemo(
    () => selectedStatus ? orders.filter((o) => o.status === selectedStatus) : orders,
    [orders, selectedStatus]
  );

  const handleViewOrder = (orderId: number) => {
    window.location.href = `/orders/${orderId}`;
  };

  const handleUpdateStatus = async (orderId: number, status: OrderStatus) => {
    const previous = orders;
    setOrders((prev) =>
      prev.map((order) =>
        order.order_id === orderId ? { ...order, status } : order
      )
    );

    try {
      await updateOrderStatus(orderId, status);
    } catch {
      setOrders(previous);
      setUpdateError('Durum güncellenemedi, lütfen tekrar deneyin.');
      setTimeout(() => setUpdateError(null), 3000);
    }
  };

  if (authLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 bg-red-50 rounded-2xl">
            <ShieldX className="h-10 w-10 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Yetkisiz Erişim</h2>
            <p className="mt-1 text-sm text-slate-500">
              Bu sayfaya erişim için ürün yöneticisi yetkisi gereklidir.
            </p>
          </div>
          <Link href="/" className="text-sm font-medium text-indigo-600 hover:underline">
            Ana Sayfaya Dön
          </Link>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500">Siparişler yükleniyor...</p>
        </div>
      </div>
    );
  }

  if (fetchError) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="p-4 bg-red-50 rounded-2xl">
            <ShieldX className="h-10 w-10 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Siparişler Yüklenemedi</h2>
            <p className="mt-1 text-sm text-slate-500">
              Bir hata oluştu. Lütfen sayfayı yenileyip tekrar deneyin.
            </p>
          </div>
          <button
            onClick={loadOrders}
            className="text-sm font-medium text-indigo-600 hover:underline"
          >
            Tekrar Dene
          </button>
        </div>
      </div>
    );
  }

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

      {updateError && (
        <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {updateError}
        </div>
      )}

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
