import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
import { getModulePermissions } from '@/shared/lib/permissions';

import { getTypeOperativesPaginated } from './actions.server';
import { _TypeOperativesDataTable } from './components/_TypeOperativesDataTable';

interface Props {
  searchParams: DataTableSearchParams;
}

export async function TypeOperativesList({ searchParams }: Props) {
  const [{ data, total }, permissions] = await Promise.all([
    getTypeOperativesPaginated(searchParams),
    getModulePermissions('company.type-operatives'),
  ]);

  return (
    <PermissionGuard module="company.type-operatives" action="view" redirect>
      <div className="space-y-6">
        <div>
          <h1 data-testid="type-operatives-page-title" className="text-3xl font-bold tracking-tight">
            Tipos Operativos
          </h1>
          <p className="text-muted-foreground">Administra los tipos operativos de tu empresa</p>
        </div>

        <_TypeOperativesDataTable
          data={data}
          totalRows={total}
          searchParams={searchParams}
          permissions={permissions}
        />
      </div>
    </PermissionGuard>
  );
}
