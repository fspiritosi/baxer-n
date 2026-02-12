import { checkPermission } from '@/shared/lib/permissions';
import { getProducts } from './actions.server';
import { _ProductsTable } from './components/_ProductsTable';

export async function ProductsList() {
  await checkPermission('commercial.products', 'read');

  const products = await getProducts();

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Productos</h1>
          <p className="text-sm text-muted-foreground">
            Gestión de productos y servicios
          </p>
        </div>
      </div>

      <_ProductsTable products={products} />
    </div>
  );
}
