import { CreateReceivingNote } from '@/modules/commercial/features/purchases/features/receiving-notes/create';

interface Props {
  searchParams: Promise<{
    purchaseInvoiceId?: string;
    supplierId?: string;
  }>;
}

export default async function NewReceivingNotePage({ searchParams }: Props) {
  const params = await searchParams;
  return (
    <CreateReceivingNote
      purchaseInvoiceId={params.purchaseInvoiceId}
      supplierId={params.supplierId}
    />
  );
}
