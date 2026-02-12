import { InvoiceDetail } from '@/modules/commercial/features/sales/features/invoices/detail';

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function InvoiceDetailPage({ params }: InvoiceDetailPageProps) {
  const { id } = await params;
  return <InvoiceDetail id={id} />;
}
