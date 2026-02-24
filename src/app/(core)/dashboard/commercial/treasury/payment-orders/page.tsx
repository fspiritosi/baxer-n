import { type Metadata } from 'next';
import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { PaymentOrdersList } from '@/modules/commercial/features/treasury/features/payment-orders/list';

export const metadata: Metadata = {
  title: 'Órdenes de Pago | Tesorería',
  description: 'Gestión de órdenes de pago a proveedores',
};

export default async function PaymentOrdersPage({
  searchParams,
}: {
  searchParams: Promise<DataTableSearchParams>;
}) {
  const params = await searchParams;
  return <PaymentOrdersList searchParams={params} />;
}
