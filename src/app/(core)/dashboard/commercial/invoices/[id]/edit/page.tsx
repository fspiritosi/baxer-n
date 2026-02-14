import { EditInvoice } from '@/modules/commercial/features/sales/features/invoices/edit';

interface EditInvoicePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditInvoicePage({ params }: EditInvoicePageProps) {
  const { id } = await params;
  return <EditInvoice id={id} />;
}
