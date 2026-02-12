import { ProductDetail } from '@/modules/commercial/features/products/features/detail';

export const metadata = {
  title: 'Detalle de Producto | Commercial',
  description: 'Ver detalle de producto',
};

interface ProductDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const { id } = await params;
  return <ProductDetail productId={id} />;
}
