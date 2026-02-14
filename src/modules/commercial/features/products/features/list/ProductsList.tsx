import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
import { getModulePermissions } from '@/shared/lib/permissions';
import { getProducts } from './actions.server';
import { _ProductsTable } from './components/_ProductsTable';

interface Props {
  searchParams?: DataTableSearchParams;
}

export async function ProductsList({ searchParams = {} }: Props) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const search = searchParams.search;
  const pageSize = searchParams.pageSize ? parseInt(searchParams.pageSize) : 10;

  const [result, permissions] = await Promise.all([
    getProducts({
      page,
      pageSize,
      search,
    }),
    getModulePermissions('commercial.products'),
  ]);

  return (
    <PermissionGuard module="commercial.products" action="view" redirect>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Productos</h1>
          <p className="text-muted-foreground">
            Gestión de productos y servicios
          </p>
        </div>

        <_ProductsTable
          data={result.data}
          totalRows={result.pagination.total}
          searchParams={searchParams}
          permissions={permissions}
        />
      </div>
    </PermissionGuard>
  );
}
