import { StockMovements } from '@/modules/commercial/features/warehouses';

interface PageProps {
  searchParams: Promise<{
    page?: string;
    pageSize?: string;
    warehouseId?: string;
    productId?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}

export default async function MovementsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  return <StockMovements searchParams={params} />;
}
