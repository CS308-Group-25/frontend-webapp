'use client'; // This is required since QueryClientProvider implies context/state which are client-side features.

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import AuthInitializer from '@/features/auth/components/AuthInitializer';

export default function Providers({ children }: { children: React.ReactNode }) {
  // Creating a new QueryClient per session/render cycle
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            // Data will not be considered stale immediately (1 minute is standard practice)
            staleTime: 60 * 1000,
            // Prevents over-fetching when the user switches tabs back and forth
            refetchOnWindowFocus: false,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      <AuthInitializer />
      {children}
    </QueryClientProvider>
  );
}
