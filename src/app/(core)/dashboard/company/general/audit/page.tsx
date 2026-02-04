import type { Metadata } from 'next';
import type { SearchParams } from 'next/dist/server/request/search-params';

import { AuditLog } from '@/modules/company';

export const metadata: Metadata = {
  title: 'Auditoría | Empresa',
};

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function AuditPage({ searchParams }: Props) {
  const params = await searchParams;
  return <AuditLog searchParams={params as Record<string, string>} />;
}
