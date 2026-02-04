import type { Metadata } from 'next';

import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { CollectiveAgreementsPage } from '@/modules/company/features/collective-agreements';

export const metadata: Metadata = {
  title: 'Convenios Colectivos',
};

interface Props {
  searchParams: Promise<DataTableSearchParams>;
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  return <CollectiveAgreementsPage searchParams={params} />;
}
