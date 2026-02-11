import { WarehousesList } from '@/modules/commercial/warehouses';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    search?: string;
    isActive?: string;
  }>;
}

export default async function WarehousesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return <WarehousesList searchParams={params} />;
}
