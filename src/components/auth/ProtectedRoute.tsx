'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuthStore } from '@/features/auth';

/**
 * ProtectedRoute
 *
 * Wraps page content that requires authentication.
 * Redirects to /auth/login if the user is not authenticated.
 * Shows a loading spinner while the initial auth check is in progress.
 *
 * Usage:
 * ```tsx
 * // In any protected layout or page:
 * export default function AccountLayout({ children }) {
 *   return <ProtectedRoute>{children}</ProtectedRoute>;
 * }
 * ```
 */
export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/auth/login');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading spinner during initial auth check
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-4">
          <div className="p-4 bg-indigo-50 rounded-2xl">
            <Loader2 className="w-8 h-8 text-indigo-600 animate-spin" />
          </div>
          <p className="text-sm text-slate-500 font-medium">Yükleniyor...</p>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated (redirect is in progress)
  if (!isAuthenticated) {
    return null;
  }

  return <>{children}</>;
}
