import { checkPermission } from '@/shared/lib/permissions';
import { getPriceLists } from './actions.server';
import { _PriceListsTable } from './components/_PriceListsTable';

export async function PriceListsList() {
  await checkPermission('commercial.products', 'read');

  const priceLists = await getPriceLists();

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Listas de Precios</h1>
          <p className="text-sm text-muted-foreground">
            Gestión de listas de precios y asignación de precios por producto
          </p>
        </div>
      </div>

      <_PriceListsTable priceLists={priceLists} />
    </div>
  );
}
