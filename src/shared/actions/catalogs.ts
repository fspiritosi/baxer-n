'use server';

/**
 * Server Actions para catálogos compartidos que no tienen módulo propio.
 * Usados por hooks en useCatalogs.ts
 */

import { prisma } from '@/shared/lib/prisma';
import { logger } from '@/shared/lib/logger';
import { getActiveCompanyId } from '@/shared/lib/company';

// Select optimizado para dropdowns - solo id y name
const selectForDropdown = { id: true, name: true } as const;

// ============================================
// TYPE OF VEHICLE
// ============================================

/**
 * Obtiene tipos de vehículo genéricos (Vehículos, Otros, etc.) para select
 */
export async function getTypesOfVehicleForSelect() {
  const companyId = await getActiveCompanyId();
  if (!companyId) return [];

  try {
    return await prisma.typeOfVehicle.findMany({
      where: { companyId, isActive: true },
      select: selectForDropdown,
      orderBy: { name: 'asc' },
    });
  } catch (error) {
    logger.error('Error al obtener tipos de vehículo para select', { data: { error } });
    return [];
  }
}

// ============================================
// TIPOS INFERIDOS
// ============================================

export type TypeOfVehicleOption = Awaited<ReturnType<typeof getTypesOfVehicleForSelect>>[number];
