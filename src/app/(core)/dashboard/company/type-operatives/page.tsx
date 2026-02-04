import type { Metadata } from 'next';

import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { TypeOperativesPage } from '@/modules/company/features/type-operatives';

export const metadata: Metadata = {
  title: 'Tipos Operativos',
};

interface Props {
  searchParams: Promise<DataTableSearchParams>;
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  return <TypeOperativesPage searchParams={params} />;
}
