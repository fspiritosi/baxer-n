import { PurchaseOrderDetail } from '@/modules/commercial/features/purchases/features/purchase-orders/detail';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function PurchaseOrderDetailPage({ params }: Props) {
  const { id } = await params;
  return <PurchaseOrderDetail orderId={id} />;
}
