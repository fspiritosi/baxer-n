import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
import { getModulePermissions } from '@/shared/lib/permissions';

import { getEquipmentOwnersPaginated } from './actions.server';
import { _EquipmentOwnersDataTable } from './components/_EquipmentOwnersDataTable';

interface Props {
  searchParams: DataTableSearchParams;
}

export async function EquipmentOwnersList({ searchParams }: Props) {
  const [{ data, total }, permissions] = await Promise.all([
    getEquipmentOwnersPaginated(searchParams),
    getModulePermissions('company.equipment-owners'),
  ]);

  return (
    <PermissionGuard module="company.equipment-owners" action="view" redirect>
      <div className="space-y-6">
        <div>
          <h1 data-testid="equipment-owners-page-title" className="text-3xl font-bold tracking-tight">
            Titulares de Equipos
          </h1>
          <p className="text-muted-foreground">
            Administra los titulares (dueños, locadores) de los equipos de tu empresa
          </p>
        </div>

        <_EquipmentOwnersDataTable
          data={data}
          totalRows={total}
          searchParams={searchParams}
          permissions={permissions}
        />
      </div>
    </PermissionGuard>
  );
}
