'use client';

import Link from 'next/link';
import { ShieldX } from 'lucide-react';
import { useAuthStore } from '@/features/auth';
import DiscountManagementPage from '@/features/admin/discounts/components/DiscountManagementPage';

export default function AdminDiscountsPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthStore();
  const isAuthorized = isAuthenticated && user?.role === 'sales_manager';

  if (authLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-600 border-t-transparent" />
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
              Bu sayfaya erişim için satış yöneticisi yetkisi gereklidir.
            </p>
          </div>
          <Link href="/" className="text-sm font-medium text-indigo-600 hover:underline">
            Ana sayfaya dön
          </Link>
        </div>
      </div>
    );
  }

  return <DiscountManagementPage />;
}
