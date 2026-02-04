/**
 * Hooks globales del proyecto
 *
 * Exporta hooks que se usan en múltiples features.
 * Los hooks específicos de cada feature deben estar en su carpeta hooks/
 */

export { useDebounce } from './useDebounce';
export { usePermissions } from './usePermissions';

// Geography hooks
export {
  useCountries,
  useProvinces,
  useCities,
  useCitiesByProvince,
} from './useGeography';

// Catalog hooks for forms
export {
  // Employee catalogs
  useContractTypes,
  useJobPositions,
  useCostCenters,
  useUnions,
  useCollectiveAgreements,
  useCollectiveAgreementsByUnion,
  useJobCategories,
  useJobCategoriesByAgreement,
  // Equipment catalogs
  useVehicleBrands,
  useVehicleBrandsWithModels,
  useVehicleTypes,
  useTypesOfVehicle,
  useTypeOperatives,
  useSectors,
  useContractors,
  useEquipmentOwners,
} from './useCatalogs';
