import type { OrderStatus } from '../types/order.types';

const STATUS_CONFIG: Record<
  OrderStatus,
  { label: string; bg: string; text: string; dot: string }
> = {
  delivered: {
    label: 'Teslim Edildi',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    dot: 'bg-emerald-500',
  },
  shipped: {
    label: 'Kargoda',
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    dot: 'bg-blue-500',
  },
  processing: {
    label: 'Hazırlanıyor',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    dot: 'bg-amber-500',
  },
  cancelled: {
    label: 'İptal Edildi',
    bg: 'bg-rose-50',
    text: 'text-rose-700',
    dot: 'bg-rose-400',
  },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md';
}

export default function OrderStatusBadge({
  status,
  size = 'md',
}: OrderStatusBadgeProps) {
  const cfg = STATUS_CONFIG[status];
  const padding = size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs';

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full font-bold uppercase tracking-wide ${padding} ${cfg.bg} ${cfg.text}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
      {cfg.label}
    </span>
  );
}
