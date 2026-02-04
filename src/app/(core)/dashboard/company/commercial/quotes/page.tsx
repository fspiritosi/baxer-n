import type { Metadata } from 'next';

import { QuotesList } from '@/modules/commercial';

export const metadata: Metadata = {
  title: 'Presupuestos',
};

export default async function QuotesPage() {
  return <QuotesList />;
}
