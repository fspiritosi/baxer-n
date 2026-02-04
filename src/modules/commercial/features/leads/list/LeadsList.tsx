import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
import { getModulePermissions } from '@/shared/lib/permissions';
import { getLeads } from './actions.server';
import { _LeadsDataTable } from './components/_LeadsDataTable';

interface Props {
  searchParams?: DataTableSearchParams;
}

export async function LeadsList({ searchParams = {} }: Props) {
  const page = searchParams.page ? parseInt(searchParams.page) : 1;
  const search = searchParams.search;
  const pageSize = searchParams.pageSize ? parseInt(searchParams.pageSize) : 10;

  const [result, permissions] = await Promise.all([
    getLeads({
      page,
      pageSize,
      search,
    }),
    getModulePermissions('commercial.leads'),
  ]);

  return (
    <PermissionGuard module="commercial.leads" action="view" redirect>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
          <p className="text-muted-foreground">
            Gestiona tus prospectos y conviértelos en clientes
          </p>
        </div>

        <_LeadsDataTable
          data={result.data}
          totalRows={result.pagination.total}
          searchParams={searchParams}
          permissions={permissions}
        />
      </div>
    </PermissionGuard>
  );
}
