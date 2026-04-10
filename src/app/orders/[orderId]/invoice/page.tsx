import Link from 'next/link';
import { ArrowLeft, FileSearch } from 'lucide-react';
import { findOrderByNumber, getInvoiceFromOrder, InvoiceDetail } from '@/features/orders';

interface InvoicePageProps {
  params: Promise<{ orderId: string }>;
}

export async function generateMetadata({ params }: InvoicePageProps) {
  const { orderId } = await params;
  return {
    title: `Fatura INV-${orderId} | SUpplements`,
    description: `${orderId} numaralı siparişe ait fatura detayları.`,
  };
}

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { orderId } = await params;
  const order = findOrderByNumber(orderId);

  if (!order) {
    return (
      <div className="mx-auto w-full max-w-3xl px-4 py-16 sm:px-6 lg:px-8 text-center">
        <div className="flex flex-col items-center gap-5">
          <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-slate-100">
            <FileSearch className="h-10 w-10 text-slate-300" />
          </div>
          <div>
            <p className="text-lg font-extrabold text-slate-800">Fatura bulunamadı</p>
            <p className="mt-1 text-sm text-slate-400">
              #{orderId} numaralı siparişe ait fatura mevcut değil veya erişilemiyor.
            </p>
          </div>
          <Link
            href="/orders"
            className="flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-bold text-white shadow-md transition-all hover:bg-indigo-700 active:scale-95"
          >
            <ArrowLeft className="h-4 w-4" />
            Siparişlerime Dön
          </Link>
        </div>
      </div>
    );
  }

  const invoice = getInvoiceFromOrder(order);

  return <InvoiceDetail invoice={invoice} />;
}
