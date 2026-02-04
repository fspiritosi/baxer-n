'use client';

import { Gender, CostType } from '@/generated/prisma/enums';
import { _MultiSelectField } from '@/shared/components/common/_MultiSelectField';
import {
  searchJobPositionsForSelect,
  searchContractTypesForSelect,
  searchJobCategoriesForSelect,
  searchUnionsForSelect,
  searchCollectiveAgreementsForSelect,
} from '@/shared/actions/catalogSearch.server';
import {
  EMPLOYEE_CONDITIONS,
  GENDER_OPTIONS,
  COST_TYPE_OPTIONS,
} from '@/shared/config/documentConditions';
import { _EnumMultiSelect } from './_EnumMultiSelect';

// ============================================
// TIPOS
// ============================================

interface EmployeeConditionsProps {
  // Relaciones
  jobPositionIds: string[];
  contractTypeIds: string[];
  jobCategoryIds: string[];
  unionIds: string[];
  collectiveAgreementIds: string[];
  // Enums
  genders: Gender[];
  costTypes: CostType[];
  // Callbacks
  onJobPositionIdsChange: (ids: string[]) => void;
  onContractTypeIdsChange: (ids: string[]) => void;
  onJobCategoryIdsChange: (ids: string[]) => void;
  onUnionIdsChange: (ids: string[]) => void;
  onCollectiveAgreementIdsChange: (ids: string[]) => void;
  onGendersChange: (values: Gender[]) => void;
  onCostTypesChange: (values: CostType[]) => void;
  /** Deshabilitado */
  disabled?: boolean;
}

// ============================================
// COMPONENTE
// ============================================

export function _EmployeeConditions({
  jobPositionIds,
  contractTypeIds,
  jobCategoryIds,
  unionIds,
  collectiveAgreementIds,
  genders,
  costTypes,
  onJobPositionIdsChange,
  onContractTypeIdsChange,
  onJobCategoryIdsChange,
  onUnionIdsChange,
  onCollectiveAgreementIdsChange,
  onGendersChange,
  onCostTypesChange,
  disabled = false,
}: EmployeeConditionsProps) {
  // Obtener configuración de campos
  const jobPositionConfig = EMPLOYEE_CONDITIONS.find((c) => c.key === 'jobPositionIds')!;
  const contractTypeConfig = EMPLOYEE_CONDITIONS.find((c) => c.key === 'contractTypeIds')!;
  const jobCategoryConfig = EMPLOYEE_CONDITIONS.find((c) => c.key === 'jobCategoryIds')!;
  const unionConfig = EMPLOYEE_CONDITIONS.find((c) => c.key === 'unionIds')!;
  const agreementConfig = EMPLOYEE_CONDITIONS.find((c) => c.key === 'collectiveAgreementIds')!;
  const genderConfig = EMPLOYEE_CONDITIONS.find((c) => c.key === 'genders')!;
  const costTypeConfig = EMPLOYEE_CONDITIONS.find((c) => c.key === 'costTypes')!;

  return (
    <div className="space-y-4">
      {/* Relaciones - Grid de 2 columnas */}
      <div className="grid gap-4 sm:grid-cols-2">
        <_MultiSelectField
          label={jobPositionConfig.label}
          placeholder="Buscar puestos..."
          icon={jobPositionConfig.icon}
          queryKey={['conditions', 'jobPositions']}
          searchFn={searchJobPositionsForSelect}
          selected={jobPositionIds}
          onChange={onJobPositionIdsChange}
          disabled={disabled}
        />

        <_MultiSelectField
          label={contractTypeConfig.label}
          placeholder="Buscar contratos..."
          icon={contractTypeConfig.icon}
          queryKey={['conditions', 'contractTypes']}
          searchFn={searchContractTypesForSelect}
          selected={contractTypeIds}
          onChange={onContractTypeIdsChange}
          disabled={disabled}
        />

        <_MultiSelectField
          label={jobCategoryConfig.label}
          placeholder="Buscar categorías..."
          icon={jobCategoryConfig.icon}
          queryKey={['conditions', 'jobCategories']}
          searchFn={searchJobCategoriesForSelect}
          selected={jobCategoryIds}
          onChange={onJobCategoryIdsChange}
          disabled={disabled}
        />

        <_MultiSelectField
          label={unionConfig.label}
          placeholder="Buscar sindicatos..."
          icon={unionConfig.icon}
          queryKey={['conditions', 'unions']}
          searchFn={searchUnionsForSelect}
          selected={unionIds}
          onChange={onUnionIdsChange}
          disabled={disabled}
        />

        <_MultiSelectField
          label={agreementConfig.label}
          placeholder="Buscar convenios..."
          icon={agreementConfig.icon}
          queryKey={['conditions', 'collectiveAgreements']}
          searchFn={searchCollectiveAgreementsForSelect}
          selected={collectiveAgreementIds}
          onChange={onCollectiveAgreementIdsChange}
          disabled={disabled}
        />
      </div>

      {/* Enums - Full width */}
      <div className="grid gap-4 sm:grid-cols-2">
        <_EnumMultiSelect
          label={genderConfig.label}
          icon={genderConfig.icon}
          options={GENDER_OPTIONS}
          selected={genders}
          onChange={(values) => onGendersChange(values as Gender[])}
          disabled={disabled}
        />

        <_EnumMultiSelect
          label={costTypeConfig.label}
          icon={costTypeConfig.icon}
          options={COST_TYPE_OPTIONS}
          selected={costTypes}
          onChange={(values) => onCostTypesChange(values as CostType[])}
          disabled={disabled}
        />
      </div>
    </div>
  );
}
