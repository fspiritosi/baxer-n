'use server';

import type { VehicleStatus } from '@/generated/prisma/enums';
import { prisma } from '@/shared/lib/prisma';
import { logger } from '@/shared/lib/logger';
import {
  checkDocumentTypeAppliesToEquipment,
  type DocumentTypeConditions,
  type EquipmentForConditionCheck,
} from '@/shared/lib/documentConditions';
import type { VehicleStatusInfo } from './vehicleStatus.types';

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
  conditionVehicleBrands?: { vehicleBrandId: string }[];
  conditionVehicleTypes?: { vehicleTypeId: string }[];
}): DocumentTypeConditions {
  return {
    isConditional: docType.isConditional,
    // Condiciones de empleado (no aplican para equipos)
    jobPositionIds: [],
    contractTypeIds: [],
    jobCategoryIds: [],
    unionIds: [],
    collectiveAgreementIds: [],
    genders: docType.genders as DocumentTypeConditions['genders'],
    costTypes: docType.costTypes as DocumentTypeConditions['costTypes'],
    // Condiciones de equipo
    vehicleBrandIds: docType.conditionVehicleBrands?.map((c) => c.vehicleBrandId) ?? [],
    vehicleTypeIds: docType.conditionVehicleTypes?.map((c) => c.vehicleTypeId) ?? [],
  };
}

/**
 * Obtiene los datos del vehículo necesarios para verificar condiciones
 */
async function getVehicleForConditions(
  vehicleId: string,
  companyId: string
): Promise<EquipmentForConditionCheck | null> {
  const vehicle = await prisma.vehicle.findFirst({
    where: { id: vehicleId, companyId },
    select: {
      id: true,
      brandId: true,
      typeId: true,
    },
  });

  if (!vehicle) return null;

  return {
    vehicleBrandId: vehicle.brandId,
    vehicleTypeId: vehicle.typeId,
  };
}

// ============================================
// MAIN FUNCTIONS
// ============================================

/**
 * Calcula el estado de documentos de un vehículo/equipo
 * Retorna información detallada sobre documentos faltantes, vencidos y completos
 */
export async function calculateVehicleStatusInfo(
  vehicleId: string,
  companyId: string
): Promise<VehicleStatusInfo> {
  // Obtener datos del vehículo para verificar condiciones
  const vehicleData = await getVehicleForConditions(vehicleId, companyId);

  if (!vehicleData) {
    return {
      status: 'INCOMPLETE',
      missingDocuments: [],
      expiredDocuments: [],
      completedDocuments: [],
    };
  }

  // Obtener tipos de documento obligatorios para equipos CON condiciones
  const mandatoryTypes = await prisma.documentType.findMany({
    where: {
      companyId,
      appliesTo: 'EQUIPMENT',
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
      conditionVehicleBrands: { select: { vehicleBrandId: true } },
      conditionVehicleTypes: { select: { vehicleTypeId: true } },
    },
  });

  // Filtrar por condiciones: solo tipos obligatorios que aplican al equipo
  const applicableTypes = mandatoryTypes.filter((type) => {
    const conditions = mapDocumentTypeConditions(type);
    return checkDocumentTypeAppliesToEquipment(conditions, vehicleData);
  });

  // Obtener documentos del vehículo (solo permanentes)
  const vehicleDocuments = await prisma.equipmentDocument.findMany({
    where: {
      vehicleId,
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
  for (const doc of vehicleDocuments) {
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
  let status: VehicleStatus;
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
 * Recalcula y actualiza el estado de un vehículo basándose en sus documentos
 */
export async function recalculateVehicleStatus(
  vehicleId: string,
  companyId: string
): Promise<VehicleStatus> {
  try {
    const statusInfo = await calculateVehicleStatusInfo(vehicleId, companyId);

    // Actualizar el estado en la base de datos
    await prisma.vehicle.update({
      where: { id: vehicleId },
      data: { status: statusInfo.status },
    });

    logger.info('Vehicle status recalculated', {
      data: {
        vehicleId,
        status: statusInfo.status,
        missing: statusInfo.missingDocuments.length,
        expired: statusInfo.expiredDocuments.length,
        completed: statusInfo.completedDocuments.length,
      },
    });

    return statusInfo.status;
  } catch (error) {
    logger.error('Error recalculating vehicle status', {
      data: { error, vehicleId },
    });
    throw error;
  }
}

/**
 * Obtiene la información del estado de un vehículo (para tooltip)
 */
export async function getVehicleStatusInfo(
  vehicleId: string,
  companyId: string
): Promise<VehicleStatusInfo> {
  return calculateVehicleStatusInfo(vehicleId, companyId);
}
