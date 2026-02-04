import type { Metadata } from 'next';

import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { VehicleTypesPage } from '@/modules/company/features/vehicle-types';

export const metadata: Metadata = {
  title: 'Tipos de Equipo',
};

interface Props {
  searchParams: Promise<DataTableSearchParams>;
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  return <VehicleTypesPage searchParams={params} />;
}
