import { ChevronLeft } from 'lucide-react';
import Link from 'next/link';

import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
import { Button } from '@/shared/components/ui/button';
import { _EquipmentForm } from './components/_EquipmentForm';

export async function EquipmentCreate() {
  return (
    <PermissionGuard module="equipment" action="create" redirect>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/dashboard/equipment">
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Nuevo Equipo</h1>
            <p className="text-muted-foreground">Completa los datos del nuevo vehículo o equipo</p>
          </div>
        </div>

        <_EquipmentForm />
      </div>
    </PermissionGuard>
  );
}
