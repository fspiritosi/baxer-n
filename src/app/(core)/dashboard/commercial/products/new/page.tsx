import { CreateProduct } from '@/modules/commercial/features/products/features/create';

export const metadata = {
  title: 'Nuevo Producto | Commercial',
  description: 'Crear nuevo producto o servicio',
};

export default function NewProductPage() {
  return <CreateProduct />;
}
