'use client';

import { useState } from 'react';
import { Star, X, Trash2 } from 'lucide-react';
import { useReviewStore } from '../store/useReviewStore';
import type { Review } from '../types/review.types';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderId: string;
  productId: string;
  productName: string;
  userId: string;
  existingReview?: Review;
}

export default function ReviewModal({
  isOpen,
  onClose,
  orderId,
  productId,
  productName,
  userId,
  existingReview,
}: ReviewModalProps) {
  const [rating, setRating] = useState(existingReview?.rating || 0);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState(existingReview?.comment || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const addReview = useReviewStore((state) => state.addReview);
  const updateReview = useReviewStore((state) => state.updateReview);
  const deleteReview = useReviewStore((state) => state.deleteReview);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) return;

    setIsSubmitting(true);
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 600));

    if (existingReview) {
      updateReview(existingReview.id, { rating, comment });
    } else {
      addReview({
        orderId,
        productId,
        userId,
        rating,
        comment,
      });
    }

    setIsSubmitting(false);
    onClose();
  };

  const handleDelete = async () => {
    if (!existingReview) return;
    setIsSubmitting(true);
    await new Promise((resolve) => setTimeout(resolve, 400));
    deleteReview(existingReview.id);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-200">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <h3 className="text-lg font-bold text-slate-800">Ürünü Değerlendir</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <p className="mb-4 text-sm font-medium text-slate-600">{productName}</p>

          <div className="mb-6 flex justify-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                className="transition-transform hover:scale-110 active:scale-95"
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                onClick={() => setRating(star)}
              >
                <Star
                  className={`h-8 w-8 ${
                    star <= (hoverRating || rating)
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-slate-200'
                  }`}
                />
              </button>
            ))}
          </div>

          <div className="mb-6">
            <label className="mb-2 block text-sm font-bold text-slate-700">Yorumunuz</label>
            <textarea
              rows={4}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full resize-none rounded-xl border border-slate-200 p-3 text-sm text-slate-800 placeholder-slate-400 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              placeholder="Ürün hakkında ne düşünüyorsunuz? (Opsiyonel)"
            />
          </div>

          <div className="flex gap-3">
            {existingReview && (
              <button
                type="button"
                onClick={handleDelete}
                disabled={isSubmitting}
                className="flex items-center justify-center rounded-xl bg-rose-50 px-4 py-3 text-sm font-bold text-rose-600 transition-colors hover:bg-rose-100 disabled:opacity-50"
                title="Değerlendirmeyi Sil"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-700 transition-colors hover:bg-slate-200 disabled:opacity-75"
            >
              İptal
            </button>
            <button
              type="submit"
              disabled={rating === 0 || isSubmitting}
              className="flex-1 rounded-xl bg-indigo-600 px-4 py-3 text-sm font-bold text-white transition-all hover:bg-indigo-700 disabled:opacity-50 disabled:hover:bg-indigo-600"
            >
              {isSubmitting ? 'Bekleyin...' : existingReview ? 'Güncelle' : 'Gönder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
