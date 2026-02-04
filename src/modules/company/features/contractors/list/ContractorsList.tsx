import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
import { getModulePermissions } from '@/shared/lib/permissions';

import { getContractorsPaginated } from './actions.server';
import { _ContractorsDataTable } from './components/_ContractorsDataTable';

interface Props {
  searchParams: DataTableSearchParams;
}

export async function ContractorsList({ searchParams }: Props) {
  const [{ data, total }, permissions] = await Promise.all([
    getContractorsPaginated(searchParams),
    getModulePermissions('company.contractors'),
  ]);

  return (
    <PermissionGuard module="company.contractors" action="view" redirect>
      <div className="space-y-6">
        <div>
          <h1 data-testid="contractors-page-title" className="text-3xl font-bold tracking-tight">
            Contratistas
          </h1>
          <p className="text-muted-foreground">
            Administra los contratistas y clientes de tu empresa
          </p>
        </div>

        <_ContractorsDataTable
          data={data}
          totalRows={total}
          searchParams={searchParams}
          permissions={permissions}
        />
      </div>
    </PermissionGuard>
  );
}
