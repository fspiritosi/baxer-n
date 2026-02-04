import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
import { getModulePermissions } from '@/shared/lib/permissions';

import { getVehicleTypesPaginated } from './actions.server';
import { _VehicleTypesDataTable } from './components/_VehicleTypesDataTable';

interface Props {
  searchParams: DataTableSearchParams;
}

export async function VehicleTypesList({ searchParams }: Props) {
  const [{ data, total }, permissions] = await Promise.all([
    getVehicleTypesPaginated(searchParams),
    getModulePermissions('company.vehicle-types'),
  ]);

  return (
    <PermissionGuard module="company.vehicle-types" action="view" redirect>
      <div className="space-y-6">
        <div>
          <h1 data-testid="vehicle-types-page-title" className="text-3xl font-bold tracking-tight">
            Tipos de Equipo
          </h1>
          <p className="text-muted-foreground">
            Administra los tipos de equipos y vehiculos de tu empresa
          </p>
        </div>

        <_VehicleTypesDataTable
          data={data}
          totalRows={total}
          searchParams={searchParams}
          permissions={permissions}
        />
      </div>
    </PermissionGuard>
  );
}
