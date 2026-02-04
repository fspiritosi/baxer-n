// ============================================
// VEHICLE-BRANDS FEATURE - BARREL EXPORT
// ============================================

// List Feature (Page)
export { VehicleBrandsList as VehicleBrandsPage } from './list';

// Actions
export {
  getVehicleBrandsPaginated,
  getAllVehicleBrands,
  getVehicleBrandsForSelect,
  getVehicleBrandById,
  createVehicleBrand,
  updateVehicleBrand,
  deleteVehicleBrand,
  createVehicleModel,
  deleteVehicleModel,
} from './list';

// Types
export type {
  VehicleBrandListItem,
  VehicleBrandSelectItem,
  VehicleBrand,
  CreateVehicleBrandInput,
  UpdateVehicleBrandInput,
  CreateVehicleModelInput,
} from './list';
