import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
import { Button } from '@/shared/components/ui/button';
import { getNextEmployeeNumber } from './actions.server';
import { _EmployeeForm } from './components/_EmployeeForm';

export async function EmployeeCreate() {
  const nextEmployeeNumber = await getNextEmployeeNumber();

  return (
    <PermissionGuard module="employees" action="create" redirect>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/employees">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nuevo Empleado</h1>
            <p className="text-muted-foreground">Registra un nuevo empleado en el sistema</p>
          </div>
        </div>

        <_EmployeeForm nextEmployeeNumber={nextEmployeeNumber} />
      </div>
    </PermissionGuard>
  );
}
