'use client';

import { useAuthStore } from '@/features/auth';

interface BuyerNameProps {
  /** Fallback: the name that was stored in the order at purchase time */
  fallback: string;
}

/**
 * Displays the current logged-in user's name.
 * Falls back to the billing address name if no user is in the store.
 */
export default function BuyerName({ fallback }: BuyerNameProps) {
  const { user } = useAuthStore();
  return (
    <p className="font-bold text-slate-900">{user?.name ?? fallback}</p>
  );
}
