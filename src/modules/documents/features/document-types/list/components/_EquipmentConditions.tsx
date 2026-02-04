'use client';

import { _MultiSelectField } from '@/shared/components/common/_MultiSelectField';
import {
  searchVehicleBrandsForSelect,
  searchVehicleTypesForSelect,
} from '@/shared/actions/catalogSearch.server';
import { EQUIPMENT_CONDITIONS } from '@/shared/config/documentConditions';

// ============================================
// TIPOS
// ============================================

interface EquipmentConditionsProps {
  vehicleBrandIds: string[];
  vehicleTypeIds: string[];
  onVehicleBrandIdsChange: (ids: string[]) => void;
  onVehicleTypeIdsChange: (ids: string[]) => void;
  disabled?: boolean;
}

// ============================================
// COMPONENTE
// ============================================

export function _EquipmentConditions({
  vehicleBrandIds,
  vehicleTypeIds,
  onVehicleBrandIdsChange,
  onVehicleTypeIdsChange,
  disabled = false,
}: EquipmentConditionsProps) {
  const brandConfig = EQUIPMENT_CONDITIONS.find((c) => c.key === 'vehicleBrandIds')!;
  const typeConfig = EQUIPMENT_CONDITIONS.find((c) => c.key === 'vehicleTypeIds')!;

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <_MultiSelectField
        label={brandConfig.label}
        placeholder="Buscar marcas..."
        icon={brandConfig.icon}
        queryKey={['conditions', 'vehicleBrands']}
        searchFn={searchVehicleBrandsForSelect}
        selected={vehicleBrandIds}
        onChange={onVehicleBrandIdsChange}
        disabled={disabled}
      />

      <_MultiSelectField
        label={typeConfig.label}
        placeholder="Buscar tipos..."
        icon={typeConfig.icon}
        queryKey={['conditions', 'vehicleTypes']}
        searchFn={searchVehicleTypesForSelect}
        selected={vehicleTypeIds}
        onChange={onVehicleTypeIdsChange}
        disabled={disabled}
      />
    </div>
  );
}
