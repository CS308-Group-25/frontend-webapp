'use client';

import { Banknote, CheckCircle2, CreditCard, Package } from 'lucide-react';
import { Invoice } from '../types';

interface InvoiceDocumentProps {
  invoice: Invoice;
  id?: string;
  invoiceNumber?: string;
}

function formatTurkishDate(dateStr: string) {
  try {
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const months = ['Ocak', 'Şubat', 'Mart', 'Nisan', 'Mayıs', 'Haziran', 'Temmuz', 'Ağustos', 'Eylül', 'Ekim', 'Kasım', 'Aralık'];
    const month = months[d.getMonth()];
    const year = d.getFullYear();
    return `${day} ${month} ${year}`;
  } catch {
    return dateStr;
  }
}

function formatCurrency(amount: number) {
  const safeAmount = typeof amount === 'number' ? amount : 0;
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeAmount);
}

function normalizePhone(phone: string) {
  const digits = phone.replace(/\D/g, '');
  const withoutCountryCode = digits.startsWith('90') && digits.length > 10 ? digits.slice(2) : digits;
  const localPhone = withoutCountryCode.startsWith('0') ? withoutCountryCode.slice(1) : withoutCountryCode;

  if (localPhone.length !== 10) return phone.trim();
  return `+90 ${localPhone.slice(0, 3)} ${localPhone.slice(3, 6)} ${localPhone.slice(6, 8)} ${localPhone.slice(8)}`;
}

function splitAddressAndPhone(deliveryAddress: string) {
  const parts = deliveryAddress.split(',').map((part) => part.trim()).filter(Boolean);
  const phoneIndex = parts.findIndex((part) => {
    const digits = part.replace(/\D/g, '');
    return digits.length >= 10 && digits.length <= 12;
  });

  if (phoneIndex === -1) {
    return {
      address: deliveryAddress,
      phone: '',
    };
  }

  const phone = normalizePhone(parts[phoneIndex]);
  const address = parts.filter((_, index) => index !== phoneIndex).join(', ');

  return { address, phone };
}

export default function InvoiceDocument({
  invoice,
  id = 'invoice-content',
  invoiceNumber,
}: InvoiceDocumentProps) {
  const invoiceAddress = splitAddressAndPhone(invoice.delivery_address);
  const displayInvoiceNumber = invoiceNumber ?? `INV-${invoice.invoice_id}`;

  return (
    <div id={id} className="invoice-container bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
      <div className="bg-[#5D5CFF] px-10 py-10 text-white rounded-t-2xl">
        <div className="flex justify-between items-start mb-10">
          <div>
            <p className="text-sm font-bold tracking-widest text-indigo-200 uppercase mb-2">Supplements</p>
            <h2 className="text-4xl font-black tracking-tight">FATURA</h2>
          </div>
          <div className="text-right">
            <p className="text-2xl font-black">{displayInvoiceNumber}</p>
            <p className="text-indigo-200 text-sm mt-1">Sipariş #{invoice.order_id}</p>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-indigo-200 font-bold mb-2 uppercase tracking-wider">Tarih</p>
            <p className="font-bold text-base">{formatTurkishDate(invoice.created_at)}</p>
          </div>
          <div>
            <p className="text-xs text-indigo-200 font-bold mb-2 uppercase tracking-wider">Ödeme Yöntemi</p>
            <div className="flex items-center gap-1.5 text-base font-bold">
              {invoice.payment_method?.includes('Nakit') || invoice.payment_method?.includes('Kapıda') ? (
                <Banknote className="w-5 h-5" />
              ) : (
                <CreditCard className="w-5 h-5" />
              )}
              {invoice.payment_method || 'Kredi Kartı'}
            </div>
          </div>
          <div>
            <p className="text-xs text-indigo-200 font-bold mb-2 uppercase tracking-wider">Ödeme Durumu</p>
            <div className="inline-flex items-center gap-1.5 bg-white text-emerald-600 px-3 py-1 rounded-full text-sm font-bold">
              <CheckCircle2 className="w-4 h-4" />
              Ödendi
            </div>
          </div>
          <div>
            <p className="text-xs text-indigo-200 font-bold mb-2 uppercase tracking-wider">Sipariş Tarihi</p>
            <p className="font-bold text-base">{formatTurkishDate(invoice.created_at)}</p>
          </div>
        </div>
      </div>

      <div className="px-10 py-8 border-b border-slate-100">
        <div className="flex items-center gap-2 mb-5">
          <Package className="w-5 h-5 text-slate-400" />
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Fatura Adresi</h3>
        </div>
        <div className="space-y-1.5">
          <p className="font-bold text-slate-900 text-lg">{invoice.customer_name}</p>
          {invoiceAddress.phone && (
            <p className="text-slate-600">{invoiceAddress.phone}</p>
          )}
          <p className="text-slate-600">{invoiceAddress.address}</p>
          <p className="text-slate-600">Türkiye</p>
        </div>
      </div>

      <div className="px-10 py-8">
        <div className="mb-6 text-xs font-bold text-slate-400 uppercase tracking-widest">Ürünler</div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b-2 border-slate-100">
              <th className="text-left pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Ürün</th>
              <th className="text-center pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-24">Adet</th>
              <th className="text-right pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-32">Birim Fiyat</th>
              <th className="text-right pb-4 text-xs font-bold text-slate-400 uppercase tracking-wider w-32">Tutar</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {(invoice.items || []).map((item, index) => (
              <tr key={`${item.product_id}-${index}`}>
                <td className="py-5 pr-4">
                  <p className="font-semibold text-slate-900 text-base">{item.name}</p>
                </td>
                <td className="py-5 text-center">
                  <span className="inline-flex items-center justify-center bg-indigo-50 text-[#5D5CFF] font-bold px-3.5 py-1.5 rounded-xl text-sm">
                    {item.quantity}
                  </span>
                </td>
                <td className="py-5 text-right text-slate-500 text-base">
                  {formatCurrency(item.unit_price || (item.total_price / item.quantity))} TL
                </td>
                <td className="py-5 text-right font-bold text-slate-900 text-base">
                  {formatCurrency(item.total_price)} TL
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="px-8 pb-8">
        <div className="ml-auto max-w-xs space-y-2 pt-4 border-t border-slate-100">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 font-medium">Ara Toplam</span>
            <span className="font-semibold text-slate-800">{formatCurrency(invoice.subtotal)} TL</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 font-medium">KDV (%1)</span>
            <span className="font-semibold text-slate-800">{formatCurrency(invoice.tax_amount)} TL</span>
          </div>
          {(invoice.payment_method?.includes('Nakit') || invoice.payment_method?.includes('Kapıda')) && (
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500 font-medium">Kapıda Ödeme Hizmet Bedeli</span>
              <span className="font-semibold text-slate-800">59.90 TL</span>
            </div>
          )}
          <div className="flex items-center justify-between pt-2 border-t border-slate-200">
            <span className="text-base font-black text-slate-900">Genel Toplam</span>
            <span className="text-xl font-black text-indigo-700">{formatCurrency(invoice.total_amount)} TL</span>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 border-t border-slate-100 px-8 py-5">
        <p className="text-xs text-slate-400 text-center">
          Bu fatura <span className="font-semibold text-slate-600">SUpplements</span> tarafından elektronik olarak düzenlenmiştir.
          Herhangi bir sorunuz için lütfen <span className="font-semibold text-slate-600">supplements@cs308.com</span> adresiyle iletişime geçin.
        </p>
      </div>
    </div>
  );
}
