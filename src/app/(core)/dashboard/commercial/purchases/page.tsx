import { PurchaseInvoicesList } from '@/modules/commercial/purchases/features/invoices/list';
import type { DataTableSearchParams } from '@/shared/components/common/DataTable';

interface Props {
  searchParams: Promise<DataTableSearchParams>;
}

export default async function PurchaseInvoicesPage({ searchParams }: Props) {
  const params = await searchParams;
  return <PurchaseInvoicesList searchParams={params} />;
}
