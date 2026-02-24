import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { InvoicesList } from '@/modules/commercial/features/sales/features/invoices/list';

export default async function InvoicesPage({
  searchParams,
}: {
  searchParams: Promise<DataTableSearchParams>;
}) {
  const params = await searchParams;
  return <InvoicesList searchParams={params} />;
}
