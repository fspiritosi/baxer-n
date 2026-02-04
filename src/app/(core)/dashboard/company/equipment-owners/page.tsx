import type { Metadata } from 'next';

import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { EquipmentOwnersPage } from '@/modules/company/features/equipment-owners';

export const metadata: Metadata = {
  title: 'Titulares de Equipos',
};

interface Props {
  searchParams: Promise<DataTableSearchParams>;
}

export default async function Page({ searchParams }: Props) {
  const resolvedSearchParams = await searchParams;
  return <EquipmentOwnersPage searchParams={resolvedSearchParams} />;
}
