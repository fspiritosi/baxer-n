import { EditProduct } from '@/modules/commercial/products/features/edit';

export const metadata = {
  title: 'Editar Producto | Commercial',
  description: 'Editar información de producto',
};

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  return <EditProduct productId={id} />;
}
