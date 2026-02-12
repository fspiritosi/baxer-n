import { EditPriceList } from '@/modules/commercial/features/products/features/price-lists/edit';

export const metadata = {
  title: 'Editar Lista de Precios | Commercial',
  description: 'Editar información de lista de precios',
};

interface EditPriceListPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPriceListPage({ params }: EditPriceListPageProps) {
  const { id } = await params;
  return <EditPriceList priceListId={id} />;
}
