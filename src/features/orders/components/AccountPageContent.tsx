'use client';

import React from 'react';
import { Mail, User } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { useAuthStore } from '@/features/auth';
import AccountSidebar from './AccountSidebar';

export default function AccountPageContent() {
  const { user } = useAuthStore();

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <AccountSidebar />

            <main className="flex-1 min-w-0">
              <h2 className="text-lg font-black text-slate-900 mb-4">Hesap Bilgilerim</h2>
              <div className="bg-white rounded-2xl border border-slate-100 p-6 flex flex-col gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-2xl bg-indigo-600 flex items-center justify-center text-white text-xl font-black">
                    {user?.name
                      ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
                      : 'U'}
                  </div>
                  <div>
                    <p className="font-black text-slate-900 text-lg">{user?.name}</p>
                    <p className="text-sm text-slate-500">{user?.email}</p>
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <User className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">Ad Soyad</p>
                      <p className="text-sm font-bold text-slate-800">{user?.name ?? '—'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                    <div className="p-2 bg-white rounded-lg shadow-sm">
                      <Mail className="w-4 h-4 text-indigo-600" />
                    </div>
                    <div>
                      <p className="text-xs text-slate-400 font-medium">E-Posta</p>
                      <p className="text-sm font-bold text-slate-800">{user?.email ?? '—'}</p>
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
