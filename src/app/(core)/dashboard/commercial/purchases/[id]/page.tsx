import { PurchaseInvoiceDetail } from '@/modules/commercial/purchases/features/invoices/detail';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PurchaseInvoiceDetailPage({ params }: Props) {
  const { id } = await params;
  return <PurchaseInvoiceDetail invoiceId={id} />;
}
