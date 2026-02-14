import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
import { getModulePermissions } from '@/shared/lib/permissions';
import { getWarehouses } from './actions.server';
import { _WarehousesTable } from './components/_WarehousesTable';

interface WarehousesListProps {
  searchParams?: DataTableSearchParams;
}

export async function WarehousesList({ searchParams = {} }: WarehousesListProps) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const pageSize = searchParams.pageSize ? parseInt(searchParams.pageSize) : 10;
  const search = searchParams.search;

  const [result, permissions] = await Promise.all([
    getWarehouses({
      page,
      pageSize,
      search,
    }),
    getModulePermissions('commercial.warehouses'),
  ]);

  return (
    <PermissionGuard module="commercial.warehouses" action="view" redirect>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Almacenes</h1>
          <p className="text-muted-foreground">
            Gestiona los almacenes y depósitos de la empresa
          </p>
        </div>

        <_WarehousesTable
          data={result.data}
          totalRows={result.pagination.total}
          searchParams={searchParams}
          permissions={permissions}
        />
      </div>
    </PermissionGuard>
  );
}
