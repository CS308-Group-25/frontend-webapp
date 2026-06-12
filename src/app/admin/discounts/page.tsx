'use client';

import { useAuthStore } from '@/features/auth';
import DiscountManagementPage from '@/features/admin/discounts/components/DiscountManagementPage';

export default function AdminDiscountsPage() {
  const user = useAuthStore((s) => s.user);

  if (!user || user.role !== 'sales_manager') {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-sm font-medium text-red-500">
          Bu sayfaya erişim yetkiniz yok.
        </p>
      </div>
    );
  }

  return <DiscountManagementPage />;
}
