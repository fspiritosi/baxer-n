import { WarehouseDetail } from '@/modules/commercial/warehouses';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function WarehouseDetailPage({ params }: PageProps) {
  const { id } = await params;
  return <WarehouseDetail warehouseId={id} />;
}
