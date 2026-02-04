import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
import { getModulePermissions } from '@/shared/lib/permissions';

import { getContractTypesPaginated } from './actions.server';
import { _ContractTypesDataTable } from './components/_ContractTypesDataTable';

interface Props {
  searchParams: DataTableSearchParams;
}

export async function ContractTypesList({ searchParams }: Props) {
  const [{ data, total }, permissions] = await Promise.all([
    getContractTypesPaginated(searchParams),
    getModulePermissions('company.contract-types'),
  ]);

  return (
    <PermissionGuard module="company.contract-types" action="view" redirect>
      <div className="space-y-6">
        <div>
          <h1 data-testid="contract-types-page-title" className="text-3xl font-bold tracking-tight">
            Tipos de Contrato
          </h1>
          <p className="text-muted-foreground">Administra los tipos de contrato de tu empresa</p>
        </div>

        <_ContractTypesDataTable
          data={data}
          totalRows={total}
          searchParams={searchParams}
          permissions={permissions}
        />
      </div>
    </PermissionGuard>
  );
}
