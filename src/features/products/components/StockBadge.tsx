import { StockStatus } from '../types/product.types';

interface StockBadgeProps {
  status: StockStatus;
  count?: number;
}

export default function StockBadge({ status, count }: StockBadgeProps) {
  if (status === 'in_stock') return null;

  if (status === 'low_stock') {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200/60">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
        </span>
        Son {count} adet
      </span>
    );
  }

  // out_of_stock
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 ring-1 ring-red-200/60">
      <span className="h-2 w-2 rounded-full bg-red-400" />
      Tükendi
    </span>
  );
}
