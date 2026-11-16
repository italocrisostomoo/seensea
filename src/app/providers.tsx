'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState, type ReactNode } from 'react';
import { trackTraversals } from '@/lib/navigation';
import { AuthProvider } from '@/context/AuthContext';

trackTraversals();

const HOUR = 60 * 60 * 1000;

export function Providers({ children }: { children: ReactNode }) {
  const [client] = useState(
    () => new QueryClient({ defaultOptions: { queries: { staleTime: HOUR, gcTime: HOUR } } }),
  );
  return (
    <AuthProvider>
      <QueryClientProvider client={client}>{children}</QueryClientProvider>
    </AuthProvider>
  );
}
