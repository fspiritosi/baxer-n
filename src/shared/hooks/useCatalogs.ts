'use client';

import { useQuery } from '@tanstack/react-query';

// ============================================
// EMPLOYEE CATALOG ACTIONS
// ============================================
import { getContractTypesForSelect } from '@/modules/company/features/contract-types/list/actions.server';
import { getJobPositionsForSelect } from '@/modules/company/features/job-positions/list/actions.server';
import { getCostCentersForSelect } from '@/modules/company/features/cost-centers/list/actions.server';
import { getUnionsForSelect } from '@/modules/company/features/unions/list/actions.server';
import {
  getCollectiveAgreementsForSelect,
  getCollectiveAgreementsByUnion,
} from '@/modules/company/features/collective-agreements/list/actions.server';
import {
  getJobCategoriesForSelect,
  getJobCategoriesByAgreement,
} from '@/modules/company/features/job-categories/list/actions.server';

// ============================================
// EQUIPMENT CATALOG ACTIONS
// ============================================
import {
  getVehicleBrandsForSelect,
  getVehicleBrandsWithModelsForSelect,
} from '@/modules/company/features/vehicle-brands/list/actions.server';
import { getVehicleTypesForSelect } from '@/modules/company/features/vehicle-types/list/actions.server';
import { getTypeOperativesForSelect } from '@/modules/company/features/type-operatives/list/actions.server';
import { getSectorsForSelect } from '@/modules/company/features/sectors/list/actions.server';
import { getContractorsForSelect } from '@/modules/company/features/contractors/list/actions.server';
import { getEquipmentOwnersForSelect } from '@/modules/company/features/equipment-owners/list/actions.server';

// ============================================
// SHARED CATALOG ACTIONS
// ============================================
import { getTypesOfVehicleForSelect } from '@/shared/actions/catalogs';

// ============================================
// CONSTANTS
// ============================================

const STALE_TIME = 1000 * 60 * 60; // 1 hora - datos estáticos que no cambian frecuentemente

// ============================================
// EMPLOYEE CATALOG HOOKS
// ============================================

/**
 * Hook para obtener tipos de contrato para select
 */
export function useContractTypes() {
  return useQuery({
    queryKey: ['contractTypes', 'forSelect'],
    queryFn: getContractTypesForSelect,
    staleTime: STALE_TIME,
  });
}

/**
 * Hook para obtener puestos de trabajo para select
 */
export function useJobPositions() {
  return useQuery({
    queryKey: ['jobPositions', 'forSelect'],
    queryFn: getJobPositionsForSelect,
    staleTime: STALE_TIME,
  });
}

/**
 * Hook para obtener centros de costo para select
 */
export function useCostCenters() {
  return useQuery({
    queryKey: ['costCenters', 'forSelect'],
    queryFn: getCostCentersForSelect,
    staleTime: STALE_TIME,
  });
}

/**
 * Hook para obtener sindicatos para select
 */
export function useUnions() {
  return useQuery({
    queryKey: ['unions', 'forSelect'],
    queryFn: getUnionsForSelect,
    staleTime: STALE_TIME,
  });
}

/**
 * Hook para obtener convenios colectivos para select
 */
export function useCollectiveAgreements() {
  return useQuery({
    queryKey: ['collectiveAgreements', 'forSelect'],
    queryFn: getCollectiveAgreementsForSelect,
    staleTime: STALE_TIME,
  });
}

/**
 * Hook para obtener convenios colectivos filtrados por sindicato
 * @param unionId - ID del sindicato (query se ejecuta solo si es válido)
 */
export function useCollectiveAgreementsByUnion(unionId: string | null | undefined) {
  return useQuery({
    queryKey: ['collectiveAgreements', 'byUnion', unionId],
    queryFn: () => getCollectiveAgreementsByUnion(unionId!),
    enabled: !!unionId && unionId.length > 0,
    staleTime: STALE_TIME,
  });
}

/**
 * Hook para obtener categorías de trabajo para select
 */
export function useJobCategories() {
  return useQuery({
    queryKey: ['jobCategories', 'forSelect'],
    queryFn: getJobCategoriesForSelect,
    staleTime: STALE_TIME,
  });
}

/**
 * Hook para obtener categorías de trabajo filtradas por convenio
 * @param agreementId - ID del convenio (query se ejecuta solo si es válido)
 */
export function useJobCategoriesByAgreement(agreementId: string | null | undefined) {
  return useQuery({
    queryKey: ['jobCategories', 'byAgreement', agreementId],
    queryFn: () => getJobCategoriesByAgreement(agreementId!),
    enabled: !!agreementId && agreementId.length > 0,
    staleTime: STALE_TIME,
  });
}

// ============================================
// EQUIPMENT CATALOG HOOKS
// ============================================

/**
 * Hook para obtener marcas de vehículos para select (sin modelos)
 */
export function useVehicleBrands() {
  return useQuery({
    queryKey: ['vehicleBrands', 'forSelect'],
    queryFn: getVehicleBrandsForSelect,
    staleTime: STALE_TIME,
  });
}

/**
 * Hook para obtener marcas de vehículos con sus modelos para select dependiente
 */
export function useVehicleBrandsWithModels() {
  return useQuery({
    queryKey: ['vehicleBrands', 'withModels', 'forSelect'],
    queryFn: getVehicleBrandsWithModelsForSelect,
    staleTime: STALE_TIME,
  });
}

/**
 * Hook para obtener tipos de vehículo para select (incluye hasHitch, isTractorUnit)
 */
export function useVehicleTypes() {
  return useQuery({
    queryKey: ['vehicleTypes', 'forSelect'],
    queryFn: getVehicleTypesForSelect,
    staleTime: STALE_TIME,
  });
}

/**
 * Hook para obtener tipos de vehículo genéricos (Vehículos, Otros, etc.)
 */
export function useTypesOfVehicle() {
  return useQuery({
    queryKey: ['typesOfVehicle', 'forSelect'],
    queryFn: getTypesOfVehicleForSelect,
    staleTime: STALE_TIME,
  });
}

/**
 * Hook para obtener tipos operativos para select
 */
export function useTypeOperatives() {
  return useQuery({
    queryKey: ['typeOperatives', 'forSelect'],
    queryFn: getTypeOperativesForSelect,
    staleTime: STALE_TIME,
  });
}

/**
 * Hook para obtener sectores para select
 */
export function useSectors() {
  return useQuery({
    queryKey: ['sectors', 'forSelect'],
    queryFn: getSectorsForSelect,
    staleTime: STALE_TIME,
  });
}

/**
 * Hook para obtener contratistas para select
 */
export function useContractors() {
  return useQuery({
    queryKey: ['contractors', 'forSelect'],
    queryFn: getContractorsForSelect,
    staleTime: STALE_TIME,
  });
}

/**
 * Hook para obtener titulares de equipo para select (incluye titularityTypes para filtrado)
 */
export function useEquipmentOwners() {
  return useQuery({
    queryKey: ['equipmentOwners', 'forSelect'],
    queryFn: getEquipmentOwnersForSelect,
    staleTime: STALE_TIME,
  });
}
