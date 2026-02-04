import type { Metadata } from 'next';

import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { JobPositionsPage } from '@/modules/company/features/job-positions';

export const metadata: Metadata = {
  title: 'Puestos de Trabajo',
};

interface Props {
  searchParams: Promise<DataTableSearchParams>;
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  return <JobPositionsPage searchParams={params} />;
}
