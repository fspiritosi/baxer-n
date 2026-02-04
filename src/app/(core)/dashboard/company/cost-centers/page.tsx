import type { Metadata } from 'next';

import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { CostCentersPage } from '@/modules/company/features/cost-centers';

export const metadata: Metadata = {
  title: 'Centros de Costo',
};

interface Props {
  searchParams: Promise<DataTableSearchParams>;
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  return <CostCentersPage searchParams={params} />;
}
