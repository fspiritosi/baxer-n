import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
import { getModulePermissions } from '@/shared/lib/permissions';

import { getUnionsPaginated } from './actions.server';
import { _UnionsDataTable } from './components/_UnionsDataTable';

interface Props {
  searchParams: DataTableSearchParams;
}

export async function UnionsList({ searchParams }: Props) {
  const [{ data, total }, permissions] = await Promise.all([
    getUnionsPaginated(searchParams),
    getModulePermissions('company.unions'),
  ]);

  return (
    <PermissionGuard module="company.unions" action="view" redirect>
      <div className="space-y-6">
        <div>
          <h1 data-testid="unions-page-title" className="text-3xl font-bold tracking-tight">
            Sindicatos
          </h1>
          <p className="text-muted-foreground">Administra los sindicatos de tu empresa</p>
        </div>

        <_UnionsDataTable
          data={data}
          totalRows={total}
          searchParams={searchParams}
          permissions={permissions}
        />
      </div>
    </PermissionGuard>
  );
}
