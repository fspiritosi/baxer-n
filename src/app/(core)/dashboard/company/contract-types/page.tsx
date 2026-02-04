import type { Metadata } from 'next';

import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { ContractTypesPage } from '@/modules/company/features/contract-types';

export const metadata: Metadata = {
  title: 'Tipos de Contrato',
};

interface Props {
  searchParams: Promise<DataTableSearchParams>;
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  return <ContractTypesPage searchParams={params} />;
}
