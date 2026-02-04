import type { Metadata } from 'next';

import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { VehicleBrandsPage } from '@/modules/company/features/vehicle-brands';

export const metadata: Metadata = {
  title: 'Marcas de Vehículos',
};

interface Props {
  searchParams: Promise<DataTableSearchParams>;
}

export default async function Page({ searchParams }: Props) {
  const params = await searchParams;
  return <VehicleBrandsPage searchParams={params} />;
}
