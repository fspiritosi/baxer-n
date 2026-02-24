import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { StockMovements } from '@/modules/commercial/features/warehouses';

export default async function MovementsPage({
  searchParams,
}: {
  searchParams: Promise<DataTableSearchParams & {
    warehouseId?: string;
    productId?: string;
    type?: string;
    dateFrom?: string;
    dateTo?: string;
  }>;
}) {
  const params = await searchParams;
  return <StockMovements searchParams={params} />;
}
