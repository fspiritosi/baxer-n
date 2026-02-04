'use server';

import type { EmployeeStatus } from '@/generated/prisma/enums';
import { prisma } from '@/shared/lib/prisma';
import { logger } from '@/shared/lib/logger';
import {
  checkDocumentTypeAppliesToEmployee,
  type DocumentTypeConditions,
  type EmployeeForConditionCheck,
} from '@/shared/lib/documentConditions';
import type { EmployeeStatusInfo } from './employeeStatus.types';

// ============================================
// HELPERS
// ============================================

/**
 * Mapea las relaciones de condiciones de un DocumentType a DocumentTypeConditions
 */
function mapDocumentTypeConditions(docType: {
  isConditional: boolean;
  genders: string[];
  costTypes: string[];
  conditionJobPositions?: { jobPositionId: string }[];
  conditionContractTypes?: { contractTypeId: string }[];
  conditionJobCategories?: { jobCategoryId: string }[];
  conditionUnions?: { unionId: string }[];
  conditionCollectiveAgreements?: { collectiveAgreementId: string }[];
}): DocumentTypeConditions {
  return {
    isConditional: docType.isConditional,
    jobPositionIds: docType.conditionJobPositions?.map((c) => c.jobPositionId) ?? [],
    contractTypeIds: docType.conditionContractTypes?.map((c) => c.contractTypeId) ?? [],
    jobCategoryIds: docType.conditionJobCategories?.map((c) => c.jobCategoryId) ?? [],
    unionIds: docType.conditionUnions?.map((c) => c.unionId) ?? [],
    collectiveAgreementIds:
      docType.conditionCollectiveAgreements?.map((c) => c.collectiveAgreementId) ?? [],
    genders: docType.genders as DocumentTypeConditions['genders'],
    costTypes: docType.costTypes as DocumentTypeConditions['costTypes'],
    vehicleBrandIds: [],
    vehicleTypeIds: [],
  };
}

/**
 * Obtiene los datos del empleado necesarios para verificar condiciones
 */
async function getEmployeeForConditions(
  employeeId: string,
  companyId: string
): Promise<EmployeeForConditionCheck | null> {
  const employee = await prisma.employee.findFirst({
    where: { id: employeeId, companyId },
    select: {
      id: true,
      jobPositionId: true,
      contractTypeId: true,
      jobCategoryId: true,
      gender: true,
      costType: true,
      jobCategory: {
        select: {
          id: true,
          agreementId: true,
          agreement: {
            select: {
              id: true,
              unionId: true,
            },
          },
        },
      },
    },
  });

  if (!employee) return null;

  return {
    jobPositionId: employee.jobPositionId,
    contractTypeId: employee.contractTypeId,
    jobCategoryId: employee.jobCategoryId,
    gender: employee.gender,
    costType: employee.costType,
    unionId: employee.jobCategory?.agreement?.unionId ?? null,
    collectiveAgreementId: employee.jobCategory?.agreementId ?? null,
  };
}

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Calcula el estado de documentos de un empleado
 * Retorna información detallada sobre documentos faltantes, vencidos y completos
 */
export async function calculateEmployeeStatusInfo(
  employeeId: string,
  companyId: string
): Promise<EmployeeStatusInfo> {
  // Obtener datos del empleado para verificar condiciones
  const employeeData = await getEmployeeForConditions(employeeId, companyId);

  if (!employeeData) {
    return {
      status: 'INCOMPLETE',
      missingDocuments: [],
      expiredDocuments: [],
      completedDocuments: [],
    };
  }

  // Obtener tipos de documento obligatorios para empleados CON condiciones
  const mandatoryTypes = await prisma.documentType.findMany({
    where: {
      companyId,
      appliesTo: 'EMPLOYEE',
      isMandatory: true,
      isActive: true,
      isMonthly: false, // Solo documentos permanentes para el estado
    },
    select: {
      id: true,
      name: true,
      isConditional: true,
      genders: true,
      costTypes: true,
      conditionJobPositions: { select: { jobPositionId: true } },
      conditionContractTypes: { select: { contractTypeId: true } },
      conditionJobCategories: { select: { jobCategoryId: true } },
      conditionUnions: { select: { unionId: true } },
      conditionCollectiveAgreements: { select: { collectiveAgreementId: true } },
    },
  });

  // Filtrar por condiciones: solo tipos obligatorios que aplican al empleado
  const applicableTypes = mandatoryTypes.filter((type) => {
    const conditions = mapDocumentTypeConditions(type);
    return checkDocumentTypeAppliesToEmployee(conditions, employeeData);
  });

  // Obtener documentos del empleado (solo permanentes)
  const employeeDocuments = await prisma.employeeDocument.findMany({
    where: {
      employeeId,
      documentType: {
        isMandatory: true,
        isMonthly: false,
      },
    },
    select: {
      documentTypeId: true,
      state: true,
      documentType: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });

  // Crear mapas para verificación
  const documentsByType = new Map<string, { state: string; name: string }>();
  for (const doc of employeeDocuments) {
    // Solo guardar el documento si no existe o si el nuevo está en mejor estado
    const existing = documentsByType.get(doc.documentTypeId);
    if (!existing || (doc.state === 'APPROVED' && existing.state !== 'APPROVED')) {
      documentsByType.set(doc.documentTypeId, {
        state: doc.state,
        name: doc.documentType.name,
      });
    }
  }

  const missingDocuments: { id: string; name: string }[] = [];
  const expiredDocuments: { id: string; name: string }[] = [];
  const completedDocuments: { id: string; name: string }[] = [];

  // Verificar cada tipo obligatorio
  for (const type of applicableTypes) {
    const doc = documentsByType.get(type.id);

    if (!doc) {
      // No tiene documento
      missingDocuments.push({ id: type.id, name: type.name });
    } else if (doc.state === 'EXPIRED') {
      // Tiene documento pero está vencido
      expiredDocuments.push({ id: type.id, name: type.name });
    } else if (doc.state === 'APPROVED') {
      // Documento completo y vigente
      completedDocuments.push({ id: type.id, name: type.name });
    } else {
      // Documento pendiente (sin archivo) = faltante
      missingDocuments.push({ id: type.id, name: type.name });
    }
  }

  // Determinar estado
  let status: EmployeeStatus;
  if (missingDocuments.length > 0) {
    status = 'INCOMPLETE';
  } else if (expiredDocuments.length > 0) {
    status = 'COMPLETE_EXPIRED_DOCS';
  } else {
    status = 'COMPLETE';
  }

  return {
    status,
    missingDocuments,
    expiredDocuments,
    completedDocuments,
  };
}

/**
 * Recalcula y actualiza el estado de un empleado basándose en sus documentos
 */
export async function recalculateEmployeeStatus(
  employeeId: string,
  companyId: string
): Promise<EmployeeStatus> {
  try {
    const statusInfo = await calculateEmployeeStatusInfo(employeeId, companyId);

    // Actualizar el estado en la base de datos
    await prisma.employee.update({
      where: { id: employeeId },
      data: { status: statusInfo.status },
    });

    logger.info('Employee status recalculated', {
      data: {
        employeeId,
        status: statusInfo.status,
        missing: statusInfo.missingDocuments.length,
        expired: statusInfo.expiredDocuments.length,
        completed: statusInfo.completedDocuments.length,
      },
    });

    return statusInfo.status;
  } catch (error) {
    logger.error('Error recalculating employee status', {
      data: { error, employeeId },
    });
    throw error;
  }
}

/**
 * Obtiene la información del estado de un empleado (para tooltip)
 */
export async function getEmployeeStatusInfo(
  employeeId: string,
  companyId: string
): Promise<EmployeeStatusInfo> {
  return calculateEmployeeStatusInfo(employeeId, companyId);
}
