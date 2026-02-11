import { getSuppliers } from './actions.server';
import { _SuppliersTable } from './components/_SuppliersTable';
import { checkPermission } from '@/shared/lib/permissions';

export async function SuppliersList() {
  await checkPermission('commercial.suppliers', 'view');

  const suppliers = await getSuppliers();

  return (
    <div className="flex flex-1 flex-col gap-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Proveedores</h1>
          <p className="text-sm text-muted-foreground">
            Gestiona los proveedores de tu empresa
          </p>
        </div>
      </div>

      <_SuppliersTable suppliers={suppliers} />
    </div>
  );
}
