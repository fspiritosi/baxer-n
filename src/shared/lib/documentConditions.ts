import type { Gender, CostType } from '@/generated/prisma/enums';

// ============================================
// TIPOS
// ============================================

/**
 * Condiciones de un tipo de documento
 */
export interface DocumentTypeConditions {
  isConditional: boolean;
  // Condiciones de empleado
  jobPositionIds: string[];
  contractTypeIds: string[];
  jobCategoryIds: string[];
  unionIds: string[];
  collectiveAgreementIds: string[];
  genders: Gender[];
  costTypes: CostType[];
  // Condiciones de equipo
  vehicleBrandIds: string[];
  vehicleTypeIds: string[];
}

/**
 * Datos del empleado para evaluación
 */
export interface EmployeeForConditionCheck {
  jobPositionId?: string | null;
  contractTypeId?: string | null;
  jobCategoryId?: string | null;
  unionId?: string | null;
  collectiveAgreementId?: string | null;
  gender?: Gender | null;
  costType?: CostType | null;
}

/**
 * Datos del equipo para evaluación
 */
export interface EquipmentForConditionCheck {
  vehicleBrandId?: string | null;
  vehicleTypeId?: string | null;
}

// ============================================
// FUNCIONES DE EVALUACIÓN
// ============================================

/**
 * Verifica si un tipo de documento aplica a un empleado específico.
 *
 * Lógica:
 * - Si isConditional es false, siempre aplica
 * - Cada grupo de condiciones funciona como OR (el empleado debe cumplir al menos una)
 * - Entre grupos es AND (debe cumplir al menos una condición de cada grupo no vacío)
 * - Grupos vacíos no restringen
 *
 * @param conditions - Las condiciones del tipo de documento
 * @param employee - Los datos del empleado a evaluar
 * @returns true si el documento aplica al empleado
 *
 * @example
 * ```ts
 * const conditions = {
 *   isConditional: true,
 *   jobPositionIds: ['pos-1', 'pos-2'],
 *   contractTypeIds: [],
 *   genders: ['MALE'],
 *   // ...resto vacío
 * };
 *
 * const employee = {
 *   jobPositionId: 'pos-1',
 *   gender: 'MALE',
 * };
 *
 * checkDocumentTypeAppliesToEmployee(conditions, employee); // true
 * ```
 */
export function checkDocumentTypeAppliesToEmployee(
  conditions: DocumentTypeConditions,
  employee: EmployeeForConditionCheck
): boolean {
  // Si no es condicional, siempre aplica
  if (!conditions.isConditional) {
    return true;
  }

  // Cada grupo: si está vacío, pasa automáticamente (true)
  // Si tiene valores, el empleado debe tener al menos uno de esos valores

  const checks: boolean[] = [];

  // Job Position
  if (conditions.jobPositionIds.length > 0) {
    checks.push(
      employee.jobPositionId !== null &&
        employee.jobPositionId !== undefined &&
        conditions.jobPositionIds.includes(employee.jobPositionId)
    );
  }

  // Contract Type
  if (conditions.contractTypeIds.length > 0) {
    checks.push(
      employee.contractTypeId !== null &&
        employee.contractTypeId !== undefined &&
        conditions.contractTypeIds.includes(employee.contractTypeId)
    );
  }

  // Job Category
  if (conditions.jobCategoryIds.length > 0) {
    checks.push(
      employee.jobCategoryId !== null &&
        employee.jobCategoryId !== undefined &&
        conditions.jobCategoryIds.includes(employee.jobCategoryId)
    );
  }

  // Union
  if (conditions.unionIds.length > 0) {
    checks.push(
      employee.unionId !== null &&
        employee.unionId !== undefined &&
        conditions.unionIds.includes(employee.unionId)
    );
  }

  // Collective Agreement
  if (conditions.collectiveAgreementIds.length > 0) {
    checks.push(
      employee.collectiveAgreementId !== null &&
        employee.collectiveAgreementId !== undefined &&
        conditions.collectiveAgreementIds.includes(employee.collectiveAgreementId)
    );
  }

  // Gender
  if (conditions.genders.length > 0) {
    checks.push(
      employee.gender !== null &&
        employee.gender !== undefined &&
        conditions.genders.includes(employee.gender)
    );
  }

  // Cost Type
  if (conditions.costTypes.length > 0) {
    checks.push(
      employee.costType !== null &&
        employee.costType !== undefined &&
        conditions.costTypes.includes(employee.costType)
    );
  }

  // Si no hay checks (todos los grupos estaban vacíos), aplica a todos
  if (checks.length === 0) {
    return true;
  }

  // AND entre todos los grupos - todos deben pasar
  return checks.every(Boolean);
}

/**
 * Verifica si un tipo de documento aplica a un equipo específico.
 *
 * Lógica igual que para empleados:
 * - Si isConditional es false, siempre aplica
 * - Cada grupo funciona como OR
 * - Entre grupos es AND
 * - Grupos vacíos no restringen
 *
 * @param conditions - Las condiciones del tipo de documento
 * @param equipment - Los datos del equipo a evaluar
 * @returns true si el documento aplica al equipo
 */
export function checkDocumentTypeAppliesToEquipment(
  conditions: DocumentTypeConditions,
  equipment: EquipmentForConditionCheck
): boolean {
  // Si no es condicional, siempre aplica
  if (!conditions.isConditional) {
    return true;
  }

  const checks: boolean[] = [];

  // Vehicle Brand
  if (conditions.vehicleBrandIds.length > 0) {
    checks.push(
      equipment.vehicleBrandId !== null &&
        equipment.vehicleBrandId !== undefined &&
        conditions.vehicleBrandIds.includes(equipment.vehicleBrandId)
    );
  }

  // Vehicle Type
  if (conditions.vehicleTypeIds.length > 0) {
    checks.push(
      equipment.vehicleTypeId !== null &&
        equipment.vehicleTypeId !== undefined &&
        conditions.vehicleTypeIds.includes(equipment.vehicleTypeId)
    );
  }

  // Si no hay checks (todos los grupos estaban vacíos), aplica a todos
  if (checks.length === 0) {
    return true;
  }

  // AND entre todos los grupos - todos deben pasar
  return checks.every(Boolean);
}

/**
 * Filtra una lista de tipos de documento para obtener solo los que aplican a un empleado.
 *
 * @param documentTypes - Lista de tipos de documento con sus condiciones
 * @param employee - Los datos del empleado
 * @returns Lista filtrada de tipos de documento que aplican
 */
export function filterDocumentTypesForEmployee<T extends DocumentTypeConditions>(
  documentTypes: T[],
  employee: EmployeeForConditionCheck
): T[] {
  return documentTypes.filter((dt) => checkDocumentTypeAppliesToEmployee(dt, employee));
}

/**
 * Filtra una lista de tipos de documento para obtener solo los que aplican a un equipo.
 *
 * @param documentTypes - Lista de tipos de documento con sus condiciones
 * @param equipment - Los datos del equipo
 * @returns Lista filtrada de tipos de documento que aplican
 */
export function filterDocumentTypesForEquipment<T extends DocumentTypeConditions>(
  documentTypes: T[],
  equipment: EquipmentForConditionCheck
): T[] {
  return documentTypes.filter((dt) => checkDocumentTypeAppliesToEquipment(dt, equipment));
}
