import { PurchaseOrdersList } from '@/modules/commercial/features/purchases/features/purchase-orders/list';
import type { DataTableSearchParams } from '@/shared/components/common/DataTable';

interface Props {
  searchParams: Promise<DataTableSearchParams>;
}

export default async function PurchaseOrdersPage({ searchParams }: Props) {
  const params = await searchParams;
  return <PurchaseOrdersList searchParams={params} />;
}
