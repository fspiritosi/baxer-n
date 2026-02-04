'use server';

import { logger } from '@/shared/lib/logger';
import { prisma } from '@/shared/lib/prisma';

/**
 * Obtiene información pública de un vehículo por su ID
 * Esta acción NO requiere autenticación
 */
export async function getPublicVehicleById(id: string) {
  try {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      select: {
        id: true,
        internNumber: true,
        domain: true,
        year: true,
        isActive: true,
        brand: { select: { name: true } },
        model: { select: { name: true } },
        type: { select: { name: true } },
        typeOfVehicle: { select: { name: true } },
        company: {
          select: {
            name: true,
            logoUrl: true,
          },
        },
      },
    });

    if (!vehicle) {
      return null;
    }

    // Solo mostrar equipos activos
    if (!vehicle.isActive) {
      return null;
    }

    return vehicle;
  } catch (error) {
    logger.error('Error getting public vehicle by id', { data: { error, id } });
    return null;
  }
}

export type PublicVehicle = Awaited<ReturnType<typeof getPublicVehicleById>>;
