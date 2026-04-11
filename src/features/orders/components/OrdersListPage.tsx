'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Package, Loader2 } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AccountSidebar from './AccountSidebar';
import OrderCard from './OrderCard';
import { fetchOrders } from '../api';
import { Order } from '../types';

export default function OrdersListPage() {
  const {
    data: orders,
    isLoading,
    isError,
  } = useQuery<Order[]>({
    queryKey: ['orders'],
    queryFn: fetchOrders,
    retry: 1,
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <AccountSidebar />

            <main className="flex-1 min-w-0">
              <h2 className="text-lg font-black text-slate-900 mb-4">
                Siparişlerim
                {orders && orders.length > 0 && (
                  <span className="text-slate-400 font-medium ml-1">({orders.length})</span>
                )}
              </h2>

              {isLoading && (
                <div className="flex items-center justify-center py-16">
                  <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                    <p className="text-sm text-slate-500 font-medium">Siparişler yükleniyor...</p>
                  </div>
                </div>
              )}

              {isError && (
                <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
                  <p className="text-red-600 font-semibold">Siparişler yüklenemedi.</p>
                  <p className="text-red-400 text-sm mt-1">Lütfen daha sonra tekrar deneyin.</p>
                </div>
              )}

              {!isLoading && !isError && orders && orders.length === 0 && (
                <div className="bg-white rounded-2xl border border-slate-100 p-12 flex flex-col items-center text-center">
                  <div className="p-4 bg-slate-50 rounded-2xl mb-4">
                    <Package className="w-10 h-10 text-slate-300" />
                  </div>
                  <p className="font-bold text-slate-700 text-lg">Henüz siparişiniz bulunmuyor</p>
                  <p className="text-slate-400 text-sm mt-1">
                    İlk siparişinizi vermek için alışverişe başlayın.
                  </p>
                </div>
              )}

              {!isLoading && !isError && orders && orders.length > 0 && (
                <div className="flex flex-col gap-3">
                  {orders.map((order) => (
                    <OrderCard key={order.id} order={order} />
                  ))}
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
