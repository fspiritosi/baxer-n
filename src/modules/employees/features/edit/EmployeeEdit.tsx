import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
import { Button } from '@/shared/components/ui/button';
import { _EmployeeForm } from '../create/components/_EmployeeForm';
import { getEmployeeForEdit } from './actions.server';

interface Props {
  id: string;
}

export async function EmployeeEdit({ id }: Props) {
  let employee;
  try {
    employee = await getEmployeeForEdit(id);
  } catch {
    notFound();
  }

  return (
    <PermissionGuard module="employees" action="update" redirect>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href={`/dashboard/employees/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Empleado</h1>
            <p className="text-muted-foreground">
              {employee.firstName} {employee.lastName} - Legajo {employee.employeeNumber}
            </p>
          </div>
        </div>

        <_EmployeeForm initialData={employee} />
      </div>
    </PermissionGuard>
  );
}
