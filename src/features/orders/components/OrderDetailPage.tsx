'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useQuery } from '@tanstack/react-query';
import {
  CheckCircle2,
  Loader2,
  ChevronDown,
  Package,
  MapPin,
  FileText,
  Star,
  MessageSquare,
  X,
  Truck,
  Home,
  ArrowLeft,
} from 'lucide-react';
import ProtectedRoute from '@/components/auth/ProtectedRoute';
import { fetchOrderById } from '../api';
import { Order, OrderItem } from '../types';
import OrderStatusBadge from './OrderStatusBadge';
import { mockProducts } from '@/features/products';

interface OrderDetailPageProps {
  orderId: string;
  isNewOrder?: boolean;
}

type MockReview = {
  productId: string;
  rating: number;
  comment: string;
};

function formatTurkishDate(dateStr: string) {
  try {
    return new Date(dateStr).toLocaleString('tr-TR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return dateStr;
  }
}

function OrderItemRow({
  item,
  isDelivered,
  onReviewClick,
  mockReview,
  onDeleteReview,
}: {
  item: OrderItem;
  isDelivered: boolean;
  onReviewClick: (item: OrderItem) => void;
  mockReview?: MockReview;
  onDeleteReview: (productId: string) => void;
}) {
  const product = mockProducts.find((p) => p.id === String(item.product_id));
  const imageSrc = product?.image ?? '/placeholder.png';
  const name = product?.name ?? item.name;

  return (
    <div className="flex items-start gap-3">
      <div className="relative shrink-0">
        <div className="relative w-16 h-16 rounded-xl overflow-hidden bg-slate-50 border border-slate-100">
          <Image
            src={imageSrc}
            alt={name}
            fill
            className="object-contain p-1"
            sizes="64px"
          />
        </div>
        <span className="absolute -top-1.5 -left-1.5 w-5 h-5 rounded-full bg-indigo-700 text-white text-[10px] font-bold flex items-center justify-center">
          {item.quantity}
        </span>
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-slate-800 line-clamp-2">{name}</p>
        <p className="text-xs text-slate-400 mt-0.5">
          {item.quantity} Paket
        </p>
        {isDelivered && !mockReview && (
          <button
            onClick={() => onReviewClick(item)}
            className="mt-2 text-xs font-bold text-amber-600 hover:text-amber-700 flex items-center gap-1 transition-colors bg-amber-50 hover:bg-amber-100 px-2 py-1 rounded-md w-fit"
          >
            <Star className="w-3 h-3 fill-amber-600" />
            Ürünü Değerlendir
          </button>
        )}
        {isDelivered && mockReview && (
          <div className="mt-3 p-3 bg-white border border-slate-200 rounded-xl space-y-2 max-w-sm">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3.5 h-3.5 ${
                      star <= mockReview.rating
                        ? 'fill-amber-400 text-amber-400'
                        : 'fill-slate-100 text-slate-200'
                    }`}
                  />
                ))}
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => onReviewClick(item)}
                  className="text-xs text-indigo-600 hover:text-indigo-700 font-bold transition-colors"
                >
                  Düzenle
                </button>
                <button
                  onClick={() => onDeleteReview(String(item.product_id))}
                  className="text-xs text-red-500 hover:text-red-700 font-bold transition-colors"
                >
                  Sil
                </button>
              </div>
            </div>
            {mockReview.comment && (
              <p className="text-xs text-slate-600 italic">&quot;{mockReview.comment}&quot;</p>
            )}
          </div>
        )}
      </div>
      <div className="text-right shrink-0">
        <p className="text-sm font-bold text-slate-900">{item.price * item.quantity} TL</p>
      </div>
    </div>
  );
}

function CollapsibleSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border border-slate-100 rounded-2xl overflow-hidden">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-slate-50 transition-colors"
      >
        <span className="flex items-center gap-2 font-bold text-slate-800 text-sm">
          {icon}
          {title}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && <div className="px-5 pb-5 pt-1 border-t border-slate-100">{children}</div>}
    </div>
  );
}

const TRACKER_STEPS = [
  { id: 'created', label: 'Sipariş Alındı', icon: FileText },
  { id: 'processing', label: 'Hazırlanıyor', icon: Package },
  { id: 'shipped', label: 'Kargoya Verildi', icon: Truck },
  { id: 'delivered', label: 'Teslim Edildi', icon: Home },
];

function OrderTracker({ status }: { status: string }) {
  if (status === 'cancelled' || status === 'returned') {
    return (
      <div className="bg-red-50 rounded-2xl p-6 border border-red-100 flex items-center gap-3">
        <div className="p-2 bg-red-100 rounded-full shrink-0">
          <X className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <p className="font-bold text-red-900">
            {status === 'cancelled' ? 'Sipariş İptal Edildi' : 'Sipariş İade Edildi'}
          </p>
          <p className="text-sm text-red-700 mt-0.5">Bu siparişin teslimat süreci sonlandırılmıştır.</p>
        </div>
      </div>
    );
  }

  const currentIndex = TRACKER_STEPS.findIndex((s) => s.id === status);
  // Default to first step if status not recognized in array
  const activeIndex = currentIndex === -1 ? 0 : currentIndex;

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 overflow-hidden">
      <h2 className="text-sm font-bold text-slate-800 uppercase tracking-widest mb-8">Teslimat Durumu</h2>
      <div className="relative flex items-center justify-between px-4 sm:px-8">
        {/* Progress bar background */}
        <div className="absolute left-8 right-8 sm:left-12 sm:right-12 top-1/2 -translate-y-1/2 h-1.5 bg-slate-100 rounded-full" />
        
        {/* Active progress bar */}
        <div 
          className="absolute left-8 sm:left-12 top-1/2 -translate-y-1/2 h-1.5 bg-indigo-600 rounded-full transition-all duration-700 ease-in-out"
          style={{ width: `calc(${(activeIndex / (TRACKER_STEPS.length - 1)) * 100}% - 3rem)` }}
        />

        {TRACKER_STEPS.map((step, index) => {
          const isActive = index <= activeIndex;
          const isCurrent = index === activeIndex;
          const Icon = step.icon;
          
          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center gap-3">
              <div 
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-500 border-4 ${
                  isActive 
                    ? 'bg-indigo-600 border-indigo-100 text-white shadow-md shadow-indigo-200' 
                    : 'bg-slate-50 border-white text-slate-300 ring-1 ring-slate-200'
                } ${isCurrent ? 'scale-110' : ''}`}
              >
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-xs sm:text-sm font-bold absolute -bottom-7 whitespace-nowrap transition-colors duration-500 ${
                isActive ? 'text-slate-900' : 'text-slate-400'
              }`}>
                {step.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="h-8" /> {/* Spacer for absolute labels */}
    </div>
  );
}

export default function OrderDetailPage({ orderId, isNewOrder }: OrderDetailPageProps) {
  const {
    data: order,
    isLoading,
    isError,
  } = useQuery<Order>({
    queryKey: ['order', orderId],
    queryFn: () => fetchOrderById(orderId),
    retry: 1,
  });

  const [reviewModalOpen, setReviewModalOpen] = useState(false);
  const [reviewingItem, setReviewingItem] = useState<OrderItem | null>(null);
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [mockReviews, setMockReviews] = useState<MockReview[]>([]);

  const handleReviewClick = (item: OrderItem) => {
    setReviewingItem(item);
    const existingReview = mockReviews.find((r) => r.productId === String(item.product_id));
    if (existingReview) {
      setRating(existingReview.rating);
      setHoverRating(existingReview.rating);
      setComment(existingReview.comment);
    } else {
      setRating(0);
      setHoverRating(0);
      setComment('');
    }
    setReviewModalOpen(true);
  };

  const handleReviewSubmit = async () => {
    if (rating === 0 || !reviewingItem) return;
    setIsSubmittingReview(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 800));

    setMockReviews((prev) => [
      ...prev.filter((r) => r.productId !== String(reviewingItem.product_id)),
      {
        productId: String(reviewingItem.product_id),
        rating,
        comment,
      },
    ]);

    setIsSubmittingReview(false);
    setReviewModalOpen(false);
  };

  const handleDeleteReview = (productId: string) => {
    if (window.confirm('Değerlendirmenizi silmek istediğinize emin misiniz?')) {
      setMockReviews((prev) => prev.filter((r) => r.productId !== productId));
    }
  };

  const totalItems = order?.items.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  const taxAmount = order
    ? parseFloat((order.total * 0.01 / 1.01).toFixed(2))
    : 0;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-slate-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {isLoading && (
            <div className="flex items-center justify-center py-24">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
                <p className="text-sm text-slate-500 font-medium">Sipariş bilgileri yükleniyor...</p>
              </div>
            </div>
          )}

          {isError && (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-8 text-center max-w-md mx-auto">
              <p className="text-red-600 font-bold">Sipariş bulunamadı.</p>
              <p className="text-red-400 text-sm mt-1">Sipariş numarasını kontrol edin.</p>
              <Link
                href="/orders"
                className="inline-block mt-4 px-5 py-2.5 bg-indigo-700 text-white text-sm font-bold rounded-xl hover:bg-indigo-800 transition-colors"
              >
                Siparişlerime Dön
              </Link>
            </div>
          )}

          {!isLoading && !isError && order && (
            <div className="flex flex-col gap-6">
              {/* Back Link */}
              <div>
                <Link
                  href="/orders"
                  className="inline-flex items-center gap-2 text-sm font-bold text-slate-500 hover:text-indigo-600 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Siparişlerime Dön
                </Link>
              </div>

              {/* Thank you / Status header */}
              {isNewOrder ? (
                <div className="bg-white rounded-2xl border border-slate-100 p-6">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle2 className="w-7 h-7 text-green-600" />
                    </div>
                    <h1 className="text-xl font-black text-slate-900">
                      Siparişiniz için teşekkür ederiz!
                    </h1>
                  </div>
                  <p className="text-sm text-slate-600">
                    Siparişiniz bize ulaşmıştır. Siparişiniz kargoya verildiğinde sizi
                    e-posta ile bilgilendireceğiz.
                  </p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-black text-slate-900">Sipariş Detayı</h1>
                  <OrderStatusBadge status={order.status} />
                </div>
              )}

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
                {/* Left: Order info */}
                <div className="space-y-4">
                  {/* Order Tracker Timeline */}
                  <OrderTracker status={order.status} />

                {/* Order meta */}
                <div className="bg-white rounded-2xl border border-slate-100 p-5 flex flex-col gap-1.5">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Sipariş No</span>
                    <span className="font-bold text-slate-800">#{order.id}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Sipariş Tarihi</span>
                    <span className="font-semibold text-slate-800">{formatTurkishDate(order.created_at)}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-slate-500 font-medium">Sipariş Tutarı</span>
                    <span className="font-bold text-slate-800">
                      {order.total} TL / {totalItems} ürün
                    </span>
                  </div>
                </div>

                {/* Shipping Summary */}
                <CollapsibleSection
                  title="Teslimat Özeti"
                  icon={<MapPin className="w-4 h-4 text-slate-500" />}
                >
                  <p className="text-sm text-slate-700">{order.delivery_address}</p>
                </CollapsibleSection>

                {/* Footer actions */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2">
                  <p className="text-sm text-slate-500">
                    Yardıma mı ihtiyacınız var?{' '}
                    <a href="#" className="text-indigo-600 font-semibold hover:underline">
                      Bizimle iletişime geçin
                    </a>
                  </p>
                  <div className="flex items-center gap-2">
                    {order.invoice_id != null && (
                      <Link
                        href={`/orders/${order.id}/invoice`}
                        className="flex items-center gap-1.5 px-4 py-2.5 border border-indigo-200 text-indigo-700 font-bold rounded-xl hover:bg-indigo-50 transition-colors text-sm"
                      >
                        <FileText className="w-4 h-4" />
                        Fatura Görüntüle
                      </Link>
                    )}
                    <Link
                      href="/search"
                      className="px-6 py-3 bg-indigo-700 text-white font-bold rounded-xl hover:bg-indigo-800 transition-colors text-sm"
                    >
                      Alışverişe Dön
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right: Order Summary Panel */}
              <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 sticky top-24">
                <div className="flex flex-col gap-4 pb-4 border-b border-slate-100">
                  {order.items.map((item, index) => (
                    <OrderItemRow
                      key={`${item.product_id}-${index}`}
                      item={item}
                      isDelivered={order.status === 'delivered'}
                      onReviewClick={handleReviewClick}
                      mockReview={mockReviews.find((r) => r.productId === String(item.product_id))}
                      onDeleteReview={handleDeleteReview}
                    />
                  ))}
                </div>
                <div className="pt-4 flex items-start justify-between">
                  <span className="text-lg font-black text-slate-900">Toplam</span>
                  <div className="text-right">
                    <p className="text-xl font-black text-slate-900">{order.total} TL</p>
                    <p className="text-xs text-slate-400 font-medium">Vergi {taxAmount} TL</p>
                    {(order.payment_method?.includes('Nakit') || order.payment_method?.includes('Kapıda')) && (
                      <p className="text-xs text-slate-400 font-medium mt-0.5">Kapıda Ödeme Hizmet Bedeli 59.90 TL</p>
                    )}
                  </div>
                </div>
                {!isNewOrder && (
                  <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
                    <Package className="w-4 h-4 text-slate-400 shrink-0" />
                    <OrderStatusBadge status={order.status} />
                  </div>
                )}
              </div>
              </div>
            </div>
          )}
          {/* Review Modal UI Simulation */}
          {reviewModalOpen && reviewingItem && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                  <h3 className="text-lg font-bold text-slate-900">Ürünü Değerlendir</h3>
                  <button onClick={() => setReviewModalOpen(false)} className="text-slate-400 hover:text-slate-600 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <div className="p-5 space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 relative bg-slate-50 rounded-xl border border-slate-100">
                      <Image
                        src={mockProducts.find((p) => p.id === String(reviewingItem.product_id))?.image ?? '/placeholder.png'}
                        alt={reviewingItem.name}
                        fill
                        className="object-contain p-1"
                        sizes="48px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-slate-900 line-clamp-1">{reviewingItem.name}</p>
                      <p className="text-xs text-slate-500">Nasıl buldunuz?</p>
                    </div>
                  </div>

                  <div className="flex flex-col items-center gap-2">
                    <div className="flex items-center gap-1">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <button
                          key={star}
                          type="button"
                          className="p-1 focus:outline-none transition-transform hover:scale-110"
                          onMouseEnter={() => setHoverRating(star)}
                          onMouseLeave={() => setHoverRating(0)}
                          onClick={() => setRating(star)}
                        >
                          <Star
                            className={`w-8 h-8 ${
                              star <= (hoverRating || rating)
                                ? 'fill-amber-400 text-amber-400'
                                : 'fill-slate-100 text-slate-200'
                            } transition-colors`}
                          />
                        </button>
                      ))}
                    </div>
                    <span className="text-sm font-medium text-slate-500 min-h-[20px]">
                      {rating === 0 ? 'Puan verin' : rating === 1 ? 'Çok Kötü' : rating === 2 ? 'Kötü' : rating === 3 ? 'Normal' : rating === 4 ? 'İyi' : 'Mükemmel'}
                    </span>
                  </div>

                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-slate-400" />
                      Yorumunuz
                    </label>
                    <textarea
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="Ürün hakkındaki düşüncelerinizi paylaşın..."
                      className="w-full h-28 px-4 py-3 rounded-xl border border-slate-200 focus:border-indigo-600 focus:ring-2 focus:ring-indigo-600/20 outline-none resize-none text-sm transition-all"
                    />
                  </div>
                </div>
                <div className="p-5 bg-slate-50 border-t border-slate-100 flex gap-3">
                  <button
                    onClick={() => setReviewModalOpen(false)}
                    className="flex-1 px-4 py-2.5 text-sm font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    İptal
                  </button>
                  <button
                    onClick={handleReviewSubmit}
                    disabled={rating === 0 || isSubmittingReview}
                    className="flex-1 px-4 py-2.5 text-sm font-bold text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isSubmittingReview ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Gönder'}
                  </button>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </ProtectedRoute>
  );
}
