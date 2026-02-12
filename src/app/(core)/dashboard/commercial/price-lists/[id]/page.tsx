import { PriceListDetail } from '@/modules/commercial/features/products/features/price-lists/detail';

export const metadata = {
  title: 'Detalle de Lista de Precios | Commercial',
  description: 'Ver detalle de lista de precios',
};

interface PriceListDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PriceListDetailPage({ params }: PriceListDetailPageProps) {
  const { id } = await params;
  return <PriceListDetail priceListId={id} />;
}
