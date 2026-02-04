'use server';

import { getActiveCompanyId } from '@/shared/lib/company';
import { logger } from '@/shared/lib/logger';
import { prisma } from '@/shared/lib/prisma';
import { getPresignedDownloadUrl } from '@/shared/lib/storage';
import { revalidatePath } from 'next/cache';

// Select optimizado para relaciones
const relationSelect = { select: { id: true, name: true } } as const;

/**
 * Obtiene un cliente por ID con información completa para el detalle
 */
export async function getClientDetailById(id: string) {
  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    const client = await prisma.contractor.findFirst({
      where: { id, companyId },
      include: {
        contact: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            position: true,
          },
        },
        vehicleAllocations: {
          include: {
            vehicle: {
              select: {
                id: true,
                internNumber: true,
                domain: true,
                brand: { select: { id: true, name: true } },
                model: { select: { id: true, name: true } },
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        employeeAllocations: {
          include: {
            employee: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                employeeNumber: true,
                jobPosition: relationSelect,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!client) throw new Error('Cliente no encontrado');

    // Generar URL de logo dinámicamente si existe logoKey
    let logoUrl: string | null = null;
    if (client.logoKey) {
      try {
        logoUrl = await getPresignedDownloadUrl(client.logoKey, { expiresIn: 3600 });
      } catch (e) {
        logger.warn('No se pudo generar URL de logo', { data: { key: client.logoKey } });
      }
    }

    return {
      ...client,
      logoUrl,
    };
  } catch (error) {
    logger.error('Error getting client detail', { data: { error, id } });
    throw error instanceof Error ? error : new Error('Error al obtener el cliente');
  }
}

/**
 * Obtiene vehículos disponibles para asignar a un cliente
 * (vehículos que no están asignados a este cliente)
 */
export async function getAvailableVehiclesForClient(clientId: string) {
  const companyId = await getActiveCompanyId();
  if (!companyId) return [];

  try {
    // Obtener IDs de vehículos ya asignados a este cliente
    const assignedVehicleIds = await prisma.contractorVehicle.findMany({
      where: { contractorId: clientId },
      select: { vehicleId: true },
    });

    const excludeIds = assignedVehicleIds.map((v) => v.vehicleId);

    return await prisma.vehicle.findMany({
      where: {
        companyId,
        isActive: true,
        id: { notIn: excludeIds },
      },
      select: {
        id: true,
        internNumber: true,
        domain: true,
        brand: { select: { id: true, name: true } },
        model: { select: { id: true, name: true } },
      },
      orderBy: { internNumber: 'asc' },
    });
  } catch (error) {
    logger.error('Error getting available vehicles', { data: { error, clientId } });
    return [];
  }
}

/**
 * Obtiene empleados disponibles para asignar a un cliente
 * (empleados que no están asignados a este cliente)
 */
export async function getAvailableEmployeesForClient(clientId: string) {
  const companyId = await getActiveCompanyId();
  if (!companyId) return [];

  try {
    // Obtener IDs de empleados ya asignados a este cliente
    const assignedEmployeeIds = await prisma.contractorEmployee.findMany({
      where: { contractorId: clientId },
      select: { employeeId: true },
    });

    const excludeIds = assignedEmployeeIds.map((e) => e.employeeId);

    return await prisma.employee.findMany({
      where: {
        companyId,
        isActive: true,
        id: { notIn: excludeIds },
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        employeeNumber: true,
        jobPosition: relationSelect,
      },
      orderBy: [{ lastName: 'asc' }, { firstName: 'asc' }],
    });
  } catch (error) {
    logger.error('Error getting available employees', { data: { error, clientId } });
    return [];
  }
}

/**
 * Asigna un vehículo a un cliente
 */
export async function assignVehicleToClient(clientId: string, vehicleId: string) {
  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    // Verificar que el cliente pertenece a la empresa
    const client = await prisma.contractor.findFirst({
      where: { id: clientId, companyId },
      select: { id: true },
    });
    if (!client) throw new Error('Cliente no encontrado');

    // Verificar que el vehículo pertenece a la empresa
    const vehicle = await prisma.vehicle.findFirst({
      where: { id: vehicleId, companyId },
      select: { id: true },
    });
    if (!vehicle) throw new Error('Vehículo no encontrado');

    // Verificar que no existe ya la asignación
    const existing = await prisma.contractorVehicle.findUnique({
      where: {
        vehicleId_contractorId: { vehicleId, contractorId: clientId },
      },
    });
    if (existing) throw new Error('El vehículo ya está asignado a este cliente');

    await prisma.contractorVehicle.create({
      data: {
        vehicleId,
        contractorId: clientId,
      },
    });

    revalidatePath(`/dashboard/company/commercial/clients/${clientId}`);
    return { success: true };
  } catch (error) {
    logger.error('Error assigning vehicle to client', { data: { error, clientId, vehicleId } });
    throw error instanceof Error ? error : new Error('Error al asignar vehículo');
  }
}

/**
 * Desasigna un vehículo de un cliente
 */
export async function unassignVehicleFromClient(clientId: string, vehicleId: string) {
  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    // Verificar que el cliente pertenece a la empresa
    const client = await prisma.contractor.findFirst({
      where: { id: clientId, companyId },
      select: { id: true },
    });
    if (!client) throw new Error('Cliente no encontrado');

    await prisma.contractorVehicle.delete({
      where: {
        vehicleId_contractorId: { vehicleId, contractorId: clientId },
      },
    });

    revalidatePath(`/dashboard/company/commercial/clients/${clientId}`);
    return { success: true };
  } catch (error) {
    logger.error('Error unassigning vehicle from client', { data: { error, clientId, vehicleId } });
    throw error instanceof Error ? error : new Error('Error al desasignar vehículo');
  }
}

/**
 * Asigna un empleado a un cliente
 */
export async function assignEmployeeToClient(clientId: string, employeeId: string) {
  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    // Verificar que el cliente pertenece a la empresa
    const client = await prisma.contractor.findFirst({
      where: { id: clientId, companyId },
      select: { id: true },
    });
    if (!client) throw new Error('Cliente no encontrado');

    // Verificar que el empleado pertenece a la empresa
    const employee = await prisma.employee.findFirst({
      where: { id: employeeId, companyId },
      select: { id: true },
    });
    if (!employee) throw new Error('Empleado no encontrado');

    // Verificar que no existe ya la asignación
    const existing = await prisma.contractorEmployee.findUnique({
      where: {
        employeeId_contractorId: { employeeId, contractorId: clientId },
      },
    });
    if (existing) throw new Error('El empleado ya está asignado a este cliente');

    await prisma.contractorEmployee.create({
      data: {
        employeeId,
        contractorId: clientId,
      },
    });

    revalidatePath(`/dashboard/company/commercial/clients/${clientId}`);
    return { success: true };
  } catch (error) {
    logger.error('Error assigning employee to client', { data: { error, clientId, employeeId } });
    throw error instanceof Error ? error : new Error('Error al asignar empleado');
  }
}

/**
 * Desasigna un empleado de un cliente
 */
export async function unassignEmployeeFromClient(clientId: string, employeeId: string) {
  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    // Verificar que el cliente pertenece a la empresa
    const client = await prisma.contractor.findFirst({
      where: { id: clientId, companyId },
      select: { id: true },
    });
    if (!client) throw new Error('Cliente no encontrado');

    await prisma.contractorEmployee.delete({
      where: {
        employeeId_contractorId: { employeeId, contractorId: clientId },
      },
    });

    revalidatePath(`/dashboard/company/commercial/clients/${clientId}`);
    return { success: true };
  } catch (error) {
    logger.error('Error unassigning employee from client', {
      data: { error, clientId, employeeId },
    });
    throw error instanceof Error ? error : new Error('Error al desasignar empleado');
  }
}

// ============================================
// TIPOS INFERIDOS
// ============================================

export type ClientDetail = Awaited<ReturnType<typeof getClientDetailById>>;
export type ClientVehicleAllocation = ClientDetail['vehicleAllocations'][number];
export type ClientEmployeeAllocation = ClientDetail['employeeAllocations'][number];
export type AvailableVehicle = Awaited<ReturnType<typeof getAvailableVehiclesForClient>>[number];
export type AvailableEmployee = Awaited<ReturnType<typeof getAvailableEmployeesForClient>>[number];
