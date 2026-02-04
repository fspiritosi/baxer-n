import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
import { getModulePermissions } from '@/shared/lib/permissions';

import { getUnionsForSelect } from '@/modules/company/features/unions';
import { getCollectiveAgreementsPaginated } from './actions.server';
import { _CollectiveAgreementsDataTable } from './components/_CollectiveAgreementsDataTable';

interface Props {
  searchParams: DataTableSearchParams;
}

export async function CollectiveAgreementsList({ searchParams }: Props) {
  const [{ data, total }, unions, permissions] = await Promise.all([
    getCollectiveAgreementsPaginated(searchParams),
    getUnionsForSelect(),
    getModulePermissions('company.collective-agreements'),
  ]);

  return (
    <PermissionGuard module="company.collective-agreements" action="view" redirect>
      <div className="space-y-6">
        <div>
          <h1
            className="text-3xl font-bold tracking-tight"
            data-testid="collective-agreements-page-title"
          >
            Convenios Colectivos
          </h1>
          <p className="text-muted-foreground">
            Gestiona los convenios colectivos de trabajo de tu empresa
          </p>
        </div>

        <_CollectiveAgreementsDataTable
          data={data}
          totalRows={total}
          searchParams={searchParams}
          unions={unions}
          permissions={permissions}
        />
      </div>
    </PermissionGuard>
  );
}
