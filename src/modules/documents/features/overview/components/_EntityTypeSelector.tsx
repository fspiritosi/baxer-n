'use client';

import { Building2, Truck, Users } from 'lucide-react';

import { Label } from '@/shared/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/shared/components/ui/radio-group';

// ============================================
// TIPOS
// ============================================

export type EntityType = 'EMPLOYEE' | 'EQUIPMENT' | 'COMPANY';

interface Props {
  value: EntityType;
  onValueChange: (value: EntityType) => void;
  disabled?: boolean;
}

// ============================================
// COMPONENT
// ============================================

export function _EntityTypeSelector({ value, onValueChange, disabled }: Props) {
  return (
    <div className="space-y-2">
      <Label>Tipo de entidad</Label>
      <RadioGroup
        value={value}
        onValueChange={(val) => onValueChange(val as EntityType)}
        disabled={disabled}
        className="grid grid-cols-3 gap-4"
      >
        <div>
          <RadioGroupItem
            value="EMPLOYEE"
            id="entity-employee"
            className="peer sr-only"
          />
          <Label
            htmlFor="entity-employee"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <Users className="mb-3 h-6 w-6" />
            <span className="text-sm font-medium">Empleado</span>
          </Label>
        </div>

        <div>
          <RadioGroupItem
            value="EQUIPMENT"
            id="entity-equipment"
            className="peer sr-only"
          />
          <Label
            htmlFor="entity-equipment"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <Truck className="mb-3 h-6 w-6" />
            <span className="text-sm font-medium">Equipo</span>
          </Label>
        </div>

        <div>
          <RadioGroupItem
            value="COMPANY"
            id="entity-company"
            className="peer sr-only"
          />
          <Label
            htmlFor="entity-company"
            className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
          >
            <Building2 className="mb-3 h-6 w-6" />
            <span className="text-sm font-medium">Empresa</span>
          </Label>
        </div>
      </RadioGroup>
    </div>
  );
}
