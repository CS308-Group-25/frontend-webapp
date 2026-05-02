'use client';

import React from 'react';
import { OrderStatus } from '../types';

const STATUS_CONFIG: Record<OrderStatus, { label: string; className: string }> = {
  created: {
    label: 'Oluşturuldu',
    className: 'text-blue-700 bg-blue-50 border-blue-200',
  },
  pending: {
    label: 'Oluşturuldu',
    className: 'text-blue-700 bg-blue-50 border-blue-200',
  },
  confirmed: {
    label: 'Oluşturuldu',
    className: 'text-blue-700 bg-blue-50 border-blue-200',
  },
  processing: {
    label: 'Hazırlanıyor',
    className: 'text-amber-700 bg-amber-50 border-amber-200',
  },
  shipped: {
    label: 'Kargoya Verildi',
    className: 'text-purple-700 bg-purple-50 border-purple-200',
  },
  delivered: {
    label: 'Teslim Edildi',
    className: 'text-green-700 bg-green-50 border-green-200',
  },
  cancelled: {
    label: 'İptal Edildi',
    className: 'text-red-700 bg-red-50 border-red-200',
  },
  returned: {
    label: 'İade Edildi',
    className: 'text-slate-700 bg-slate-100 border-slate-200',
  },
};

interface OrderStatusBadgeProps {
  status: OrderStatus;
}

export default function OrderStatusBadge({ status }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.created;
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold border ${config.className}`}
    >
      {config.label}
    </span>
  );
}
