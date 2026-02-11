import { checkPermission } from '@/shared/lib/permissions';
import { getCategories } from '../categories/actions.server';
import { _CreateProductForm } from './components/_CreateProductForm';

export async function CreateProduct() {
  await checkPermission('commercial.products', 'create');

  const categories = await getCategories();

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold">Nuevo Producto</h1>
        <p className="text-sm text-muted-foreground">
          Crea un nuevo producto o servicio
        </p>
      </div>

      <_CreateProductForm categories={categories} />
    </div>
  );
}
