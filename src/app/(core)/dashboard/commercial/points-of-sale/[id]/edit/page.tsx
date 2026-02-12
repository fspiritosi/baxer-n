import { EditPointOfSale } from '@/modules/commercial/features/sales/features/points-of-sale/edit';

interface EditPointOfSalePageProps {
  params: Promise<{ id: string }>;
}

export default async function EditPointOfSalePage({ params }: EditPointOfSalePageProps) {
  const { id } = await params;
  return <EditPointOfSale id={id} />;
}
