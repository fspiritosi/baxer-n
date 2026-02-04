import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
import { getModulePermissions } from '@/shared/lib/permissions';

import { getVehicleBrandsPaginated } from './actions.server';
import { _VehicleBrandsDataTable } from './components/_VehicleBrandsDataTable';

interface Props {
  searchParams: DataTableSearchParams;
}

export async function VehicleBrandsList({ searchParams }: Props) {
  const [{ data, total }, permissions] = await Promise.all([
    getVehicleBrandsPaginated(searchParams),
    getModulePermissions('company.vehicle-brands'),
  ]);

  return (
    <PermissionGuard module="company.vehicle-brands" action="view" redirect>
      <div className="space-y-6">
        <div>
          <h1 data-testid="vehicle-brands-page-title" className="text-3xl font-bold tracking-tight">
            Marcas de Vehículos
          </h1>
          <p className="text-muted-foreground">
            Administra las marcas y modelos de vehículos de tu empresa
          </p>
        </div>

        <_VehicleBrandsDataTable
          data={data}
          totalRows={total}
          searchParams={searchParams}
          permissions={permissions}
        />
      </div>
    </PermissionGuard>
  );
}
