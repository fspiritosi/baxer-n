import { Plus } from 'lucide-react';
import Link from 'next/link';

import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
import { getModulePermissions } from '@/shared/lib/permissions';
import { Button } from '@/shared/components/ui/button';

import {
  getContractTypesForFilter,
  getEmployeesPaginated,
  getJobPositionsForFilter,
} from './actions.server';
import { _EmployeesDataTable } from './components/_EmployeesDataTable';

interface Props {
  searchParams: DataTableSearchParams;
}

export async function EmployeesList({ searchParams }: Props) {
  // Fetch data, opciones de filtros y permisos en paralelo
  const [{ data, total }, jobPositions, contractTypes, permissions] = await Promise.all([
    getEmployeesPaginated(searchParams),
    getJobPositionsForFilter(),
    getContractTypesForFilter(),
    getModulePermissions('employees'),
  ]);

  return (
    <PermissionGuard module="employees" action="view" redirect>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 data-testid="employees-page-title" className="text-3xl font-bold tracking-tight">
              Empleados
            </h1>
            <p className="text-muted-foreground">Gestiona los empleados de tu empresa</p>
          </div>
          <PermissionGuard module="employees" action="create">
            <Button asChild data-testid="new-employee-button">
              <Link href="/dashboard/employees/new">
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Empleado
              </Link>
            </Button>
          </PermissionGuard>
        </div>

        <_EmployeesDataTable
          data={data}
          totalRows={total}
          searchParams={searchParams}
          jobPositions={jobPositions}
          contractTypes={contractTypes}
          permissions={permissions}
        />
      </div>
    </PermissionGuard>
  );
}
