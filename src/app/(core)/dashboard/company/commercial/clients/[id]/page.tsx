import type { Metadata } from 'next';

import { ClientDetail } from '@/modules/commercial/features/clients';

export const metadata: Metadata = {
  title: 'Detalle de Cliente',
};

interface Props {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function ClientDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const resolvedSearchParams = await searchParams;

  return <ClientDetail id={id} searchParams={resolvedSearchParams} />;
}
