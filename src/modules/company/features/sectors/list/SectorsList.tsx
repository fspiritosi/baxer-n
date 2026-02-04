import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
import { getModulePermissions } from '@/shared/lib/permissions';

import { getSectorsPaginated } from './actions.server';
import { _SectorsDataTable } from './components/_SectorsDataTable';

interface Props {
  searchParams: DataTableSearchParams;
}

export async function SectorsList({ searchParams }: Props) {
  const [{ data, total }, permissions] = await Promise.all([
    getSectorsPaginated(searchParams),
    getModulePermissions('company.sectors'),
  ]);

  return (
    <PermissionGuard module="company.sectors" action="view" redirect>
      <div className="space-y-6">
        <div>
          <h1 data-testid="sectors-page-title" className="text-3xl font-bold tracking-tight">
            Sectores
          </h1>
          <p className="text-muted-foreground">Administra los sectores de operación de tu empresa</p>
        </div>

        <_SectorsDataTable
          data={data}
          totalRows={total}
          searchParams={searchParams}
          permissions={permissions}
        />
      </div>
    </PermissionGuard>
  );
}
