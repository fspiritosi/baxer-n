import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
import { getModulePermissions } from '@/shared/lib/permissions';

import { getJobCategoriesPaginated } from './actions.server';
import { _JobCategoriesDataTable } from './components/_JobCategoriesDataTable';

interface Props {
  searchParams: DataTableSearchParams;
}

export async function JobCategoriesList({ searchParams }: Props) {
  const [{ data, total }, permissions] = await Promise.all([
    getJobCategoriesPaginated(searchParams),
    getModulePermissions('company.job-categories'),
  ]);

  return (
    <PermissionGuard module="company.job-categories" action="view" redirect>
      <div className="space-y-6">
        <div>
          <h1 data-testid="job-categories-page-title" className="text-3xl font-bold tracking-tight">
            Categorías Laborales
          </h1>
          <p className="text-muted-foreground">Administra las categorías laborales de tu empresa</p>
        </div>

        <_JobCategoriesDataTable
          data={data}
          totalRows={total}
          searchParams={searchParams}
          permissions={permissions}
        />
      </div>
    </PermissionGuard>
  );
}
