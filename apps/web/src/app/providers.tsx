'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useState } from 'react';
import { LanguageProvider } from '@/lib/i18n';

export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(() => new QueryClient());
  return <QueryClientProvider client={client}><LanguageProvider>{children}</LanguageProvider></QueryClientProvider>;
}
