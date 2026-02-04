import type { Metadata } from 'next';

import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { JobCategoriesPage } from '@/modules/company/features/job-categories';

export const metadata: Metadata = {
  title: 'Categorías Laborales',
};

interface Props {
  searchParams: Promise<DataTableSearchParams>;
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  return <JobCategoriesPage searchParams={params} />;
}
