import type { Metadata } from 'next';
import type { SearchParams } from 'next/dist/server/request/search-params';

import { UsersList } from '@/modules/company';

export const metadata: Metadata = {
  title: 'Usuarios | Empresa',
};

interface Props {
  searchParams: Promise<SearchParams>;
}

export default async function UsersPage({ searchParams }: Props) {
  const params = await searchParams;
  return <UsersList searchParams={params as Record<string, string>} />;
}
