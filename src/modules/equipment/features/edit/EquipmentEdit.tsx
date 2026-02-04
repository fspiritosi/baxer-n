import { ChevronLeft } from 'lucide-react';
import moment from 'moment';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
import { Button } from '@/shared/components/ui/button';
import type { GetVehicleForEditType } from './actions.server';
import { getVehicleForEdit } from './actions.server';
import { _EquipmentFormEdit } from './components/_EquipmentFormEdit';

interface Props {
  id: string;
}

export async function EquipmentEdit({ id }: Props) {
  let vehicle: GetVehicleForEditType;

  try {
    vehicle = await getVehicleForEdit(id);
  } catch {
    notFound();
  }

  // Preparar valores por defecto del formulario
  const defaultValues = {
    internNumber: vehicle.internNumber || '',
    domain: vehicle.domain || '',
    chassis: vehicle.chassis || '',
    engine: vehicle.engine,
    serie: vehicle.serie || '',
    year: vehicle.year,
    kilometer: vehicle.kilometer || '0',
    condition: vehicle.condition || 'OPERATIVE',
    titularityType: vehicle.titularityType || '',
    ownerId: vehicle.ownerId || '',
    contractNumber: vehicle.contractNumber || '',
    contractStartDate: vehicle.contractStartDate
      ? moment(vehicle.contractStartDate).format('YYYY-MM-DD')
      : '',
    contractExpirationDate: vehicle.contractExpirationDate
      ? moment(vehicle.contractExpirationDate).format('YYYY-MM-DD')
      : '',
    currency: vehicle.currency || '',
    price: vehicle.price ? String(vehicle.price) : '',
    monthlyPrice: vehicle.monthlyPrice ? String(vehicle.monthlyPrice) : '',
    costType: vehicle.costType || '',
    brandId: vehicle.brandId || '',
    modelId: vehicle.modelId || '',
    typeId: vehicle.typeId,
    typeOfVehicleId: vehicle.typeOfVehicleId,
    costCenterId: vehicle.costCenterId || '',
    sectorId: vehicle.sectorId || '',
    typeOperativeId: vehicle.typeOperativeId || '',
    contractorIds: vehicle.contractorAllocations.map((a) => a.contractorId),
    // Foto
    pictureUrl: vehicle.pictureUrl || '',
    pictureKey: vehicle.pictureKey || '',
  };

  return (
    <PermissionGuard module="equipment" action="update" redirect>
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/dashboard/equipment/${id}`}>
              <ChevronLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Editar Equipo</h1>
            <p className="text-muted-foreground">
              {vehicle.internNumber || vehicle.domain || 'Sin identificación'}
            </p>
          </div>
        </div>

        <_EquipmentFormEdit defaultValues={defaultValues} vehicleId={id} />
      </div>
    </PermissionGuard>
  );
}
