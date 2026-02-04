import type { Metadata } from 'next';

import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { SectorsPage } from '@/modules/company/features/sectors';

export const metadata: Metadata = {
  title: 'Sectores',
};

interface Props {
  searchParams: Promise<DataTableSearchParams>;
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  return <SectorsPage searchParams={params} />;
}
