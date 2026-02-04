import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
import { getModulePermissions } from '@/shared/lib/permissions';

import { getCostCentersPaginated } from './actions.server';
import { _CostCentersDataTable } from './components/_CostCentersDataTable';

interface Props {
  searchParams: DataTableSearchParams;
}

export async function CostCentersList({ searchParams }: Props) {
  const [{ data, total }, permissions] = await Promise.all([
    getCostCentersPaginated(searchParams),
    getModulePermissions('company.cost-centers'),
  ]);

  return (
    <PermissionGuard module="company.cost-centers" action="view" redirect>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight" data-testid="cost-centers-page-title">
            Centros de Costo
          </h1>
          <p className="text-muted-foreground">Administra los centros de costo de tu empresa</p>
        </div>

        <_CostCentersDataTable
          data={data}
          totalRows={total}
          searchParams={searchParams}
          permissions={permissions}
        />
      </div>
    </PermissionGuard>
  );
}
