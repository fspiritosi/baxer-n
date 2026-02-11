import { EditWarehouse } from '@/modules/commercial/warehouses';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditWarehousePage({ params }: PageProps) {
  const { id } = await params;
  return <EditWarehouse warehouseId={id} />;
}
