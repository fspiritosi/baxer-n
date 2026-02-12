import { ProductsList } from '@/modules/commercial/features/products/features/list';

export const metadata = {
  title: 'Productos | Commercial',
  description: 'Gestión de productos y servicios',
};

export default function ProductsPage() {
  return <ProductsList />;
}
