import { EditPurchaseInvoice } from '@/modules/commercial/features/purchases/features/invoices/edit';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPurchaseInvoicePage({ params }: PageProps) {
  const { id } = await params;
  return <EditPurchaseInvoice invoiceId={id} />;
}
