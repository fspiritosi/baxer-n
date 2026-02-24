import { type Metadata } from 'next';
import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { ReceiptsList } from '@/modules/commercial/features/treasury/features/receipts/list';

export const metadata: Metadata = {
  title: 'Recibos de Cobro | Tesorería',
  description: 'Gestión de recibos de cobro y cobranzas',
};

interface Props {
  searchParams: Promise<DataTableSearchParams>;
}

export default async function ReceiptsPage({ searchParams }: Props) {
  const params = await searchParams;
  return <ReceiptsList searchParams={params} />;
}
