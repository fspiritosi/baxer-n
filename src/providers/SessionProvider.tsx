'use client';

import { ClerkProvider } from '@clerk/nextjs';
import { esES } from '@clerk/localizations';
import type { ReactNode } from 'react';

interface SessionProviderProps {
  children: ReactNode;
}

/**
 * Provider de autenticación con Clerk
 *
 * Configurado con localización en español
 */
export function SessionProvider({ children }: SessionProviderProps) {
  return (
    <ClerkProvider localization={esES}>
      {children}
    </ClerkProvider>
  );
}
