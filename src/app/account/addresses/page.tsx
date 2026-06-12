'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MapPin, Trash2 } from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AccountSidebar from '@/features/orders/components/AccountSidebar';
import {
  getAddresses,
  deleteAddress,
  SavedAddress,
} from '@/features/checkout/addressApi';

export default function AddressesPage() {
  const queryClient = useQueryClient();
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const { data: addresses, isLoading } = useQuery<SavedAddress[]>({
    queryKey: ['addresses'],
    queryFn: getAddresses,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onMutate: (id) => setDeletingId(id),
    onSettled: () => {
      setDeletingId(null);
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
    },
  });

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex flex-col items-start gap-8 lg:flex-row">
            <AccountSidebar />

            <main className="min-w-0 flex-1">
              <h2 className="mb-4 text-lg font-black text-slate-900">
                Adreslerim
              </h2>

              {isLoading ? (
                <div className="flex justify-center rounded-2xl border border-slate-100 bg-white p-8">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
                </div>
              ) : addresses && addresses.length > 0 ? (
                <div className="flex flex-col gap-3">
                  {addresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="flex items-start gap-4 rounded-2xl border border-slate-100 bg-white p-5"
                    >
                      <div className="shrink-0 rounded-xl bg-indigo-50 p-2">
                        <MapPin className="h-5 w-5 text-indigo-600" />
                      </div>
                      <div className="min-w-0 flex-1">
                        {addr.title && (
                          <p className="mb-0.5 text-xs font-semibold text-indigo-600">
                            {addr.title}
                          </p>
                        )}
                        <p className="font-bold text-slate-800">
                          {addr.first_name} {addr.last_name}
                        </p>
                        <p className="mt-0.5 text-sm text-slate-500">
                          {addr.address}
                          {addr.apartment ? `, ${addr.apartment}` : ''}
                        </p>
                        <p className="text-sm text-slate-500">
                          {addr.district}/{addr.city}
                        </p>
                        <p className="text-sm text-slate-500">{addr.phone}</p>
                      </div>
                      <button
                        onClick={() => deleteMutation.mutate(addr.id)}
                        disabled={deletingId === addr.id}
                        className="rounded-xl p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                        aria-label="Adresi sil"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center rounded-2xl border border-slate-100 bg-white p-12 text-center">
                  <div className="mb-4 rounded-2xl bg-slate-50 p-4">
                    <MapPin className="h-10 w-10 text-slate-300" />
                  </div>
                  <p className="text-lg font-bold text-slate-700">
                    Kayıtlı adresiniz bulunmuyor
                  </p>
                  <p className="mt-1 text-sm text-slate-400">
                    Sipariş verirken kaydettiğiniz adresler burada görünecek.
                  </p>
                </div>
              )}
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
