import Link from 'next/link';
import { Package } from 'lucide-react';
import { mockOrders, OrderCard } from '@/features/orders';

export const metadata = {
  title: 'Siparişlerim | SUpplements',
  description: 'Sipariş geçmişinizi görüntüleyin ve faturalarınıza erişin.',
};

export default function OrdersPage() {
  const orders = mockOrders;

  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-slate-400">
        <Link href="/" className="transition-colors hover:text-indigo-600">
          Ana Sayfa
        </Link>
        <span className="mx-2">•</span>
        <span className="font-semibold text-slate-700">Siparişlerim</span>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
          Siparişlerim
        </h1>
        <p className="mt-1 text-sm text-slate-500">
          Tüm sipariş geçmişinizi ve faturalarınızı buradan görüntüleyebilirsiniz.
        </p>
      </div>

      {orders.length === 0 ? (
        /* Empty state */
        <div className="flex min-h-[360px] flex-col items-center justify-center gap-5 rounded-2xl bg-white p-10 shadow-sm ring-1 ring-slate-200">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-indigo-50">
            <Package className="h-10 w-10 text-indigo-300" />
          </div>
          <div className="text-center">
            <p className="text-lg font-extrabold text-slate-800">Henüz siparişiniz yok</p>
            <p className="mt-1.5 max-w-xs text-sm text-slate-400">
              İlk siparişinizi vermek için ürünlerimize göz atın.
            </p>
          </div>
          <Link
            href="/search"
            className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-bold text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-indigo-700 active:scale-95"
          >
            Ürünleri İncele
          </Link>
        </div>
      ) : (
        /* Order list */
        <div className="space-y-4">
          {/* Summary bar */}
          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-5 py-3 ring-1 ring-slate-200">
            <p className="text-sm text-slate-500">
              Toplam{' '}
              <span className="font-bold text-slate-800">{orders.length} sipariş</span> bulundu
            </p>
          </div>

          {orders.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  );
}
