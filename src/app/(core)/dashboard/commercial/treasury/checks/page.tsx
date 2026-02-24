import { type Metadata } from 'next';
import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { ChecksList } from '@/modules/commercial/features/treasury/features/checks/list';

export const metadata: Metadata = {
  title: 'Cheques | Tesorería',
  description: 'Gestión de cartera de cheques',
};

interface Props {
  searchParams: Promise<DataTableSearchParams>;
}

export default async function ChecksPage({ searchParams }: Props) {
  const params = await searchParams;
  return <ChecksList searchParams={params} />;
}
