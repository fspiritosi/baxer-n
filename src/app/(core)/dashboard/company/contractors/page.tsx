import type { Metadata } from 'next';

import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { ContractorsPage } from '@/modules/company/features/contractors';

export const metadata: Metadata = {
  title: 'Contratistas',
};

interface Props {
  searchParams: Promise<DataTableSearchParams>;
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  return <ContractorsPage searchParams={params} />;
}
