import { type Metadata } from 'next';
import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { CashflowProjectionsList } from '@/modules/commercial/features/treasury/features/cashflow-projections/list';

export const metadata: Metadata = {
  title: 'Proyecciones | Tesorería',
  description: 'Gestión de proyecciones de flujo de caja',
};

interface Props {
  searchParams: Promise<DataTableSearchParams>;
}

export default async function ProjectionsPage({ searchParams }: Props) {
  const params = await searchParams;
  return <CashflowProjectionsList searchParams={params} />;
}
