import type { Metadata } from 'next';

import { LeadsList } from '@/modules/commercial';

export const metadata: Metadata = {
  title: 'Leads',
};

interface Props {
  searchParams: Promise<{
    page?: string;
    search?: string;
    status?: string;
  }>;
}

export default async function LeadsPage({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  return <LeadsList searchParams={resolvedSearchParams} />;
}
