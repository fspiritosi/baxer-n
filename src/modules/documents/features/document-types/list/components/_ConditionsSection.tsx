'use client';

import { Filter, ChevronDown } from 'lucide-react';
import { Gender, CostType } from '@/generated/prisma/enums';

import { cn } from '@/shared/lib/utils';
import { Label } from '@/shared/components/ui/label';
import { Switch } from '@/shared/components/ui/switch';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/shared/components/ui/collapsible';
import { Card, CardContent, CardDescription } from '@/shared/components/ui/card';
import { supportsConditions } from '@/shared/config/documentConditions';

import { _EmployeeConditions } from './_EmployeeConditions';
import { _EquipmentConditions } from './_EquipmentConditions';

// ============================================
// TIPOS
// ============================================

export interface ConditionsState {
  jobPositionIds: string[];
  contractTypeIds: string[];
  jobCategoryIds: string[];
  unionIds: string[];
  collectiveAgreementIds: string[];
  genders: Gender[];
  costTypes: CostType[];
  vehicleBrandIds: string[];
  vehicleTypeIds: string[];
}

interface ConditionsSectionProps {
  appliesTo: 'EMPLOYEE' | 'EQUIPMENT' | 'COMPANY';
  isConditional: boolean;
  onIsConditionalChange: (value: boolean) => void;
  conditions: ConditionsState;
  onConditionsChange: (conditions: Partial<ConditionsState>) => void;
  disabled?: boolean;
}

// ============================================
// COMPONENTE
// ============================================

export function _ConditionsSection({
  appliesTo,
  isConditional,
  onIsConditionalChange,
  conditions,
  onConditionsChange,
  disabled = false,
}: ConditionsSectionProps) {
  // No mostrar si no soporta condiciones (COMPANY)
  if (!supportsConditions(appliesTo)) {
    return null;
  }

  // Contar condiciones activas
  const countActiveConditions = () => {
    let count = 0;
    if (appliesTo === 'EMPLOYEE') {
      count += conditions.jobPositionIds.length;
      count += conditions.contractTypeIds.length;
      count += conditions.jobCategoryIds.length;
      count += conditions.unionIds.length;
      count += conditions.collectiveAgreementIds.length;
      count += conditions.genders.length;
      count += conditions.costTypes.length;
    } else if (appliesTo === 'EQUIPMENT') {
      count += conditions.vehicleBrandIds.length;
      count += conditions.vehicleTypeIds.length;
    }
    return count;
  };

  const activeCount = isConditional ? countActiveConditions() : 0;

  return (
    <div className="space-y-3">
      {/* Switch de activación */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Label htmlFor="is-conditional" className="font-medium">
            Documento condicional
          </Label>
          {activeCount > 0 && (
            <span className="rounded-full bg-primary px-2 py-0.5 text-xs text-primary-foreground">
              {activeCount} condicion{activeCount !== 1 ? 'es' : ''}
            </span>
          )}
        </div>
        <Switch
          id="is-conditional"
          checked={isConditional}
          onCheckedChange={onIsConditionalChange}
          disabled={disabled}
        />
      </div>

      {/* Contenido colapsable */}
      <Collapsible open={isConditional}>
        <CollapsibleContent className="overflow-hidden data-[state=closed]:animate-accordion-up data-[state=open]:animate-accordion-down">
          <Card className="mt-2 border-dashed">
            <CardContent className="pt-4">
              <CardDescription className="mb-4">
                Este documento solo aplicará a{' '}
                {appliesTo === 'EMPLOYEE' ? 'empleados' : 'equipos'} que cumplan
                al menos una condición de cada grupo configurado. Los grupos
                vacíos no restringen.
              </CardDescription>

              {appliesTo === 'EMPLOYEE' && (
                <_EmployeeConditions
                  jobPositionIds={conditions.jobPositionIds}
                  contractTypeIds={conditions.contractTypeIds}
                  jobCategoryIds={conditions.jobCategoryIds}
                  unionIds={conditions.unionIds}
                  collectiveAgreementIds={conditions.collectiveAgreementIds}
                  genders={conditions.genders}
                  costTypes={conditions.costTypes}
                  onJobPositionIdsChange={(ids) =>
                    onConditionsChange({ jobPositionIds: ids })
                  }
                  onContractTypeIdsChange={(ids) =>
                    onConditionsChange({ contractTypeIds: ids })
                  }
                  onJobCategoryIdsChange={(ids) =>
                    onConditionsChange({ jobCategoryIds: ids })
                  }
                  onUnionIdsChange={(ids) =>
                    onConditionsChange({ unionIds: ids })
                  }
                  onCollectiveAgreementIdsChange={(ids) =>
                    onConditionsChange({ collectiveAgreementIds: ids })
                  }
                  onGendersChange={(values) =>
                    onConditionsChange({ genders: values })
                  }
                  onCostTypesChange={(values) =>
                    onConditionsChange({ costTypes: values })
                  }
                  disabled={disabled}
                />
              )}

              {appliesTo === 'EQUIPMENT' && (
                <_EquipmentConditions
                  vehicleBrandIds={conditions.vehicleBrandIds}
                  vehicleTypeIds={conditions.vehicleTypeIds}
                  onVehicleBrandIdsChange={(ids) =>
                    onConditionsChange({ vehicleBrandIds: ids })
                  }
                  onVehicleTypeIdsChange={(ids) =>
                    onConditionsChange({ vehicleTypeIds: ids })
                  }
                  disabled={disabled}
                />
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
