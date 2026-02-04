import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
import { getModulePermissions } from '@/shared/lib/permissions';
import { getClients } from './actions.server';
import { _ClientsDataTable } from './components/_ClientsDataTable';

interface Props {
  searchParams?: DataTableSearchParams;
}

export async function ClientsList({ searchParams = {} }: Props) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const search = searchParams.search;
  const pageSize = searchParams.pageSize ? parseInt(searchParams.pageSize) : 10;

  const [result, permissions] = await Promise.all([
    getClients({
      page,
      pageSize,
      search,
    }),
    getModulePermissions('commercial.clients'),
  ]);

  return (
    <PermissionGuard module="commercial.clients" action="view" redirect>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Clientes</h1>
          <p className="text-muted-foreground">
            Gestiona los clientes de tu empresa
          </p>
        </div>

        <_ClientsDataTable
          data={result.data}
          totalRows={result.pagination.total}
          searchParams={searchParams}
          permissions={permissions}
        />
      </div>
    </PermissionGuard>
  );
}
