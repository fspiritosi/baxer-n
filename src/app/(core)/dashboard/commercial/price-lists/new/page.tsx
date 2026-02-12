import { CreatePriceList } from '@/modules/commercial/features/products/features/price-lists/create';

export const metadata = {
  title: 'Nueva Lista de Precios | Commercial',
  description: 'Crear nueva lista de precios',
};

export default function NewPriceListPage() {
  return <CreatePriceList />;
}
