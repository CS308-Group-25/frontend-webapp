'use client';

import React from 'react';
import { Mail, User, ShieldCheck, Hash } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/features/auth';
import AccountSidebar from './AccountSidebar';

const roleLabels: Record<string, string> = {
  customer: 'Müşteri',
  product_manager: 'Ürün Müdürü',
  sales_manager: 'Satış Müdürü',
};

export default function AccountPageContent() {
  const { user } = useAuthStore();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-8 lg:flex-row">
            <AccountSidebar />

            <main className="min-w-0 flex-1">
              <h2 className="mb-4 text-lg font-black text-slate-900">
                Hesap Bilgilerim
              </h2>
              <div className="flex flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-600 text-xl font-black text-white">
                    {user?.name
                      ? user.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      : 'U'}
                  </div>
                  <div>
                    <p className="text-lg font-black text-slate-900">
                      {user?.name}
                    </p>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 border-t border-slate-100 pt-4 sm:grid-cols-2">
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                    <div className="rounded-lg bg-white p-2 shadow-sm">
                      <User className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Ad Soyad
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                        {user?.name ?? '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                    <div className="rounded-lg bg-white p-2 shadow-sm">
                      <Mail className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        E-Posta
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                        {user?.email ?? '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                    <div className="rounded-lg bg-white p-2 shadow-sm">
                      <ShieldCheck className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Hesap Türü
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                        {user?.role
                          ? (roleLabels[user.role] ?? user.role)
                          : '—'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 rounded-xl bg-slate-50 p-4">
                    <div className="rounded-lg bg-white p-2 shadow-sm">
                      <Hash className="h-4 w-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs font-medium text-slate-400">
                        Üye No
                      </p>
                      <p className="text-sm font-bold text-slate-800">
                        {user?.id ? `#${user.id}` : '—'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
