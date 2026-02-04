'use server';

import { prisma } from '@/shared/lib/prisma';
import { logger } from '@/shared/lib/logger';
import { getActiveCompanyId } from '@/shared/lib/company';

// ============================================
// FUNCIONES DE BÚSQUEDA PARA CATÁLOGOS
// Usadas en multi-select con búsqueda server-side
// ============================================

const DEFAULT_LIMIT = 20;

/**
 * Busca puestos de trabajo por nombre
 */
export async function searchJobPositionsForSelect(query: string, limit = DEFAULT_LIMIT) {
  const companyId = await getActiveCompanyId();
  if (!companyId) return [];

  try {
    return await prisma.jobPosition.findMany({
      where: {
        companyId,
        isActive: true,
        ...(query && { name: { contains: query, mode: 'insensitive' } }),
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
      take: limit,
    });
  } catch (error) {
    logger.error('Error searching job positions', { data: { error, query } });
    return [];
  }
}

/**
 * Busca tipos de contrato por nombre
 */
export async function searchContractTypesForSelect(query: string, limit = DEFAULT_LIMIT) {
  const companyId = await getActiveCompanyId();
  if (!companyId) return [];

  try {
    return await prisma.contractType.findMany({
      where: {
        companyId,
        isActive: true,
        ...(query && { name: { contains: query, mode: 'insensitive' } }),
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
      take: limit,
    });
  } catch (error) {
    logger.error('Error searching contract types', { data: { error, query } });
    return [];
  }
}

/**
 * Busca categorías laborales por nombre
 */
export async function searchJobCategoriesForSelect(query: string, limit = DEFAULT_LIMIT) {
  const companyId = await getActiveCompanyId();
  if (!companyId) return [];

  try {
    return await prisma.jobCategory.findMany({
      where: {
        isActive: true,
        agreement: {
          union: { companyId },
        },
        ...(query && { name: { contains: query, mode: 'insensitive' } }),
      },
      select: {
        id: true,
        name: true,
        agreement: {
          select: { name: true },
        },
      },
      orderBy: { name: 'asc' },
      take: limit,
    });
  } catch (error) {
    logger.error('Error searching job categories', { data: { error, query } });
    return [];
  }
}

/**
 * Busca sindicatos por nombre
 */
export async function searchUnionsForSelect(query: string, limit = DEFAULT_LIMIT) {
  const companyId = await getActiveCompanyId();
  if (!companyId) return [];

  try {
    return await prisma.union.findMany({
      where: {
        companyId,
        isActive: true,
        ...(query && { name: { contains: query, mode: 'insensitive' } }),
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
      take: limit,
    });
  } catch (error) {
    logger.error('Error searching unions', { data: { error, query } });
    return [];
  }
}

/**
 * Busca convenios colectivos por nombre
 */
export async function searchCollectiveAgreementsForSelect(query: string, limit = DEFAULT_LIMIT) {
  const companyId = await getActiveCompanyId();
  if (!companyId) return [];

  try {
    return await prisma.collectiveAgreement.findMany({
      where: {
        isActive: true,
        union: { companyId },
        ...(query && { name: { contains: query, mode: 'insensitive' } }),
      },
      select: {
        id: true,
        name: true,
        union: {
          select: { name: true },
        },
      },
      orderBy: { name: 'asc' },
      take: limit,
    });
  } catch (error) {
    logger.error('Error searching collective agreements', { data: { error, query } });
    return [];
  }
}

/**
 * Busca marcas de vehículo por nombre
 */
export async function searchVehicleBrandsForSelect(query: string, limit = DEFAULT_LIMIT) {
  const companyId = await getActiveCompanyId();
  if (!companyId) return [];

  try {
    return await prisma.vehicleBrand.findMany({
      where: {
        companyId,
        isActive: true,
        ...(query && { name: { contains: query, mode: 'insensitive' } }),
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
      take: limit,
    });
  } catch (error) {
    logger.error('Error searching vehicle brands', { data: { error, query } });
    return [];
  }
}

/**
 * Busca tipos de vehículo por nombre
 */
export async function searchVehicleTypesForSelect(query: string, limit = DEFAULT_LIMIT) {
  const companyId = await getActiveCompanyId();
  if (!companyId) return [];

  try {
    return await prisma.vehicleType.findMany({
      where: {
        companyId,
        isActive: true,
        ...(query && { name: { contains: query, mode: 'insensitive' } }),
      },
      select: { id: true, name: true },
      orderBy: { name: 'asc' },
      take: limit,
    });
  } catch (error) {
    logger.error('Error searching vehicle types', { data: { error, query } });
    return [];
  }
}

// ============================================
// TIPOS INFERIDOS
// ============================================

export type JobPositionOption = Awaited<ReturnType<typeof searchJobPositionsForSelect>>[number];
export type ContractTypeOption = Awaited<ReturnType<typeof searchContractTypesForSelect>>[number];
export type JobCategoryOption = Awaited<ReturnType<typeof searchJobCategoriesForSelect>>[number];
export type UnionOption = Awaited<ReturnType<typeof searchUnionsForSelect>>[number];
export type CollectiveAgreementOption = Awaited<ReturnType<typeof searchCollectiveAgreementsForSelect>>[number];
export type VehicleBrandOption = Awaited<ReturnType<typeof searchVehicleBrandsForSelect>>[number];
export type VehicleTypeOption = Awaited<ReturnType<typeof searchVehicleTypesForSelect>>[number];
