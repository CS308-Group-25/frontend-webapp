import ProtectedRoute from '@/components/auth/ProtectedRoute';
import AccountSidebar from '@/features/orders/components/AccountSidebar';
import { MapPin } from 'lucide-react';

export const metadata = {
  title: 'Adreslerim',
};

export default function AddressesRoute() {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row gap-8 items-start">
            <AccountSidebar />

            <main className="flex-1 min-w-0">
              <h2 className="text-lg font-black text-slate-900 mb-4">Adreslerim</h2>

              <div className="bg-white rounded-2xl border border-slate-100 p-12 flex flex-col items-center text-center">
                <div className="p-4 bg-slate-50 rounded-2xl mb-4">
                  <MapPin className="w-10 h-10 text-slate-300" />
                </div>
                <p className="font-bold text-slate-700 text-lg">Kayıtlı adresiniz bulunmuyor</p>
                <p className="text-slate-400 text-sm mt-1">
                  Sipariş verirken kaydettiğiniz adresler burada görünecek.
                </p>
              </div>
            </main>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
