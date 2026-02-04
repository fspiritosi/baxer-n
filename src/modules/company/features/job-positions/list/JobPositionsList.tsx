import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
import { getModulePermissions } from '@/shared/lib/permissions';

import { getJobPositionsPaginated } from './actions.server';
import { _JobPositionsDataTable } from './components/_JobPositionsDataTable';

interface Props {
  searchParams: DataTableSearchParams;
}

export async function JobPositionsList({ searchParams }: Props) {
  const [{ data, total }, permissions] = await Promise.all([
    getJobPositionsPaginated(searchParams),
    getModulePermissions('company.job-positions'),
  ]);

  return (
    <PermissionGuard module="company.job-positions" action="view" redirect>
      <div className="space-y-6">
        <div>
          <h1 data-testid="job-positions-page-title" className="text-3xl font-bold tracking-tight">
            Puestos de Trabajo
          </h1>
          <p className="text-muted-foreground">Administra los puestos de trabajo de tu empresa</p>
        </div>

        <_JobPositionsDataTable
          data={data}
          totalRows={total}
          searchParams={searchParams}
          permissions={permissions}
        />
      </div>
    </PermissionGuard>
  );
}
