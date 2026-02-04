import type { Metadata } from 'next';

import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { UnionsPage } from '@/modules/company/features/unions';

export const metadata: Metadata = {
  title: 'Sindicatos',
};

interface Props {
  searchParams: Promise<DataTableSearchParams>;
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  return <UnionsPage searchParams={params} />;
}
