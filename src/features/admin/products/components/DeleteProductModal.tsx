import { Trash2, X } from 'lucide-react';

interface DeleteProductModalProps {
  productName: string | null;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function DeleteProductModal({
  productName,
  onConfirm,
  onCancel,
}: DeleteProductModalProps) {
  if (!productName) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onCancel();
      }}
    >
      <div className="w-full max-w-sm overflow-hidden rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200/60">
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50">
              <Trash2 className="h-4 w-4 text-red-500" />
            </div>
            <h2 className="text-lg font-extrabold text-slate-900">Ürünü Sil</h2>
          </div>
          <button
            onClick={onCancel}
            className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
            aria-label="Kapat"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          <p className="text-sm leading-relaxed text-slate-600">
            <span className="font-bold text-slate-900">
              &quot;{productName}&quot;
            </span>{' '}
            ürününü silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.
          </p>
        </div>

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
