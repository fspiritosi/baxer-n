import type { Metadata } from 'next';

import { ClientsList } from '@/modules/commercial';

export const metadata: Metadata = {
  title: 'Clientes',
};

interface Props {
  searchParams: Promise<{
    page?: string;
    search?: string;
    isActive?: string;
  }>;
}

export default async function ClientsPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  return <ClientsList searchParams={resolvedSearchParams} />;
}
