import type { Metadata } from 'next';
import type { SearchParams } from 'next/dist/server/request/search-params';

import { RolesList } from '@/modules/company';

export const metadata: Metadata = {
  title: 'Roles | Empresa',
};

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function RolesPage({ searchParams }: Props) {
  const params = await searchParams;
  return <RolesList searchParams={params as Record<string, string>} />;
}
