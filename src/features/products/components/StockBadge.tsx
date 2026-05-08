import { StockStatus } from '../types/product.types';

interface StockBadgeProps {
  status: StockStatus;
  count?: number;
}

export default function StockBadge({ status, count }: StockBadgeProps) {
  // Guard against negative stock values from the backend
  const safeCount = typeof count === 'number' ? Math.max(count, 0) : count;

  // Dynamically treat as low stock if safeCount is 5 or below, unless it's naturally out of stock.
  const isActuallyLowStock = status === 'low_stock' || (status === 'in_stock' && typeof safeCount === 'number' && safeCount > 0 && safeCount <= 5);

  if (status === 'out_of_stock' || safeCount === 0) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-600 ring-1 ring-red-200/60">
        <span className="h-2 w-2 rounded-full bg-red-400" />
        Tükendi
      </span>
    );
  }

  if (isActuallyLowStock) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700 ring-1 ring-amber-200/60">
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-400 opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-500" />
        </span>
        Son {safeCount} adet
      </span>
    );
  }

  // in_stock
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700 ring-1 ring-emerald-200/60">
      <span className="h-2 w-2 rounded-full bg-emerald-500" />
      Stokta {safeCount ? `${safeCount} adet` : 'Var'}
    </span>
  );
}
