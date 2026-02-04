import {
  Briefcase,
  FileText,
  Users,
  Building2,
  Car,
  Truck,
  type LucideIcon,
  DollarSign,
} from 'lucide-react';
import { Gender, CostType } from '@/generated/prisma/enums';

// ============================================
// TIPOS
// ============================================

export interface ConditionFieldConfig {
  key: string;
  label: string;
  icon: LucideIcon;
  type: 'relation' | 'enum';
  // Para type='relation': nombre de la función de búsqueda
  searchFnName?: string;
  // Para type='enum': valores disponibles
  enumValues?: { value: string; label: string }[];
}

export interface ConditionsFormData {
  // Empleados - Relaciones
  jobPositionIds: string[];
  contractTypeIds: string[];
  jobCategoryIds: string[];
  unionIds: string[];
  collectiveAgreementIds: string[];
  // Empleados - Enums
  genders: Gender[];
  costTypes: CostType[];
  // Equipos - Relaciones
  vehicleBrandIds: string[];
  vehicleTypeIds: string[];
}

// ============================================
// MAPEO DE ENUMS
// ============================================

export const GENDER_OPTIONS: { value: Gender; label: string }[] = [
  { value: 'MALE', label: 'Masculino' },
  { value: 'FEMALE', label: 'Femenino' },
  { value: 'NOT_DECLARED', label: 'No declarado' },
];

export const COST_TYPE_OPTIONS: { value: CostType; label: string }[] = [
  { value: 'DIRECT', label: 'Directo' },
  { value: 'INDIRECT', label: 'Indirecto' },
];

// ============================================
// CONFIGURACIÓN DE CONDICIONES POR TIPO
// ============================================

export const EMPLOYEE_CONDITIONS: ConditionFieldConfig[] = [
  {
    key: 'jobPositionIds',
    label: 'Puestos de Trabajo',
    icon: Briefcase,
    type: 'relation',
    searchFnName: 'searchJobPositionsForSelect',
  },
  {
    key: 'contractTypeIds',
    label: 'Tipos de Contrato',
    icon: FileText,
    type: 'relation',
    searchFnName: 'searchContractTypesForSelect',
  },
  {
    key: 'jobCategoryIds',
    label: 'Categorías Laborales',
    icon: Users,
    type: 'relation',
    searchFnName: 'searchJobCategoriesForSelect',
  },
  {
    key: 'unionIds',
    label: 'Sindicatos',
    icon: Building2,
    type: 'relation',
    searchFnName: 'searchUnionsForSelect',
  },
  {
    key: 'collectiveAgreementIds',
    label: 'Convenios Colectivos',
    icon: FileText,
    type: 'relation',
    searchFnName: 'searchCollectiveAgreementsForSelect',
  },
  {
    key: 'genders',
    label: 'Géneros',
    icon: Users,
    type: 'enum',
    enumValues: GENDER_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
  },
  {
    key: 'costTypes',
    label: 'Tipos de Costo',
    icon: DollarSign,
    type: 'enum',
    enumValues: COST_TYPE_OPTIONS.map((o) => ({ value: o.value, label: o.label })),
  },
];

export const EQUIPMENT_CONDITIONS: ConditionFieldConfig[] = [
  {
    key: 'vehicleBrandIds',
    label: 'Marcas de Vehículo',
    icon: Car,
    type: 'relation',
    searchFnName: 'searchVehicleBrandsForSelect',
  },
  {
    key: 'vehicleTypeIds',
    label: 'Tipos de Vehículo',
    icon: Truck,
    type: 'relation',
    searchFnName: 'searchVehicleTypesForSelect',
  },
];

export const COMPANY_CONDITIONS: ConditionFieldConfig[] = [];

// ============================================
// HELPERS
// ============================================

/**
 * Obtiene la configuración de condiciones según el tipo de documento
 */
export function getConditionsForAppliesTo(
  appliesTo: 'EMPLOYEE' | 'EQUIPMENT' | 'COMPANY'
): ConditionFieldConfig[] {
  switch (appliesTo) {
    case 'EMPLOYEE':
      return EMPLOYEE_CONDITIONS;
    case 'EQUIPMENT':
      return EQUIPMENT_CONDITIONS;
    case 'COMPANY':
      return COMPANY_CONDITIONS;
    default:
      return [];
  }
}

/**
 * Verifica si un tipo de documento soporta condiciones
 */
export function supportsConditions(appliesTo: 'EMPLOYEE' | 'EQUIPMENT' | 'COMPANY'): boolean {
  return appliesTo !== 'COMPANY';
}

/**
 * Obtiene las condiciones de tipo relación para un appliesTo
 */
export function getRelationConditions(
  appliesTo: 'EMPLOYEE' | 'EQUIPMENT' | 'COMPANY'
): ConditionFieldConfig[] {
  return getConditionsForAppliesTo(appliesTo).filter((c) => c.type === 'relation');
}

/**
 * Obtiene las condiciones de tipo enum para un appliesTo
 */
export function getEnumConditions(
  appliesTo: 'EMPLOYEE' | 'EQUIPMENT' | 'COMPANY'
): ConditionFieldConfig[] {
  return getConditionsForAppliesTo(appliesTo).filter((c) => c.type === 'enum');
}

/**
 * Crea un estado inicial vacío para las condiciones
 */
export function createEmptyConditionsState(): ConditionsFormData {
  return {
    jobPositionIds: [],
    contractTypeIds: [],
    jobCategoryIds: [],
    unionIds: [],
    collectiveAgreementIds: [],
    genders: [],
    costTypes: [],
    vehicleBrandIds: [],
    vehicleTypeIds: [],
  };
}
