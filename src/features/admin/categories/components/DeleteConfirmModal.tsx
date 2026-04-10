import { AlertTriangle, X, Trash2, Package } from 'lucide-react';
import type { Category } from '../types/category.types';

interface DeleteConfirmModalProps {
  category: Category | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteConfirmModal({
  category,
  onConfirm,
  onCancel,
}: DeleteConfirmModalProps) {
  if (!category) return null;

  const hasProducts = category.productCount > 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={(e) => { if (e.target === e.currentTarget) onCancel(); }}
    >
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/60">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
              <Trash2 className="h-4 w-4 text-red-500" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">Kategoriyi Sil</h2>
          </div>
          <button
            onClick={onCancel}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 flex flex-col gap-4">
          <p className="text-sm text-slate-600 leading-relaxed">
            <span className="font-bold text-slate-900">&quot;{category.name}&quot;</span>{' '}
            kategorisini kalıcı olarak silmek istediğinizden emin misiniz?
            Bu işlem geri alınamaz.
          </p>

          {hasProducts ? (
            <div className="flex items-start gap-3 rounded-xl bg-red-50 px-4 py-3 ring-1 ring-red-200">
              <AlertTriangle className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
              <div>
                <p className="text-xs font-bold text-red-700">Bağlı ürünler etkilenecek</p>
                <p className="mt-0.5 text-xs text-red-600">
                  Bu kategoriye ait{' '}
                  <span className="font-bold">{category.productCount} ürün</span>{' '}
                  bulunmaktadır. Silme işlemi bu ürünleri kategorisiz bırakabilir.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 rounded-xl bg-slate-50 px-4 py-3 ring-1 ring-slate-200">
              <Package className="h-4 w-4 flex-shrink-0 text-slate-400" />
              <p className="text-xs text-slate-500">
                Bu kategoriye bağlı herhangi bir ürün bulunmuyor.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-slate-100 bg-slate-50 px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl px-5 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200 active:scale-95"
          >
            İptal
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="flex items-center gap-2 rounded-xl bg-red-600 px-5 py-2.5 text-sm font-bold text-white shadow-sm shadow-red-500/20 transition-all hover:bg-red-700 active:scale-95"
          >
            <Trash2 className="h-4 w-4" />
            Evet, Sil
          </button>
        </div>
      </div>
    </div>
  );
}
