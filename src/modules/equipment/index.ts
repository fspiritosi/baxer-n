// Features
export { EquipmentList } from './features/list';
export { EquipmentCreate } from './features/create';
export { EquipmentDetail } from './features/detail';
export { EquipmentEdit } from './features/edit';

// Server Actions - List
export {
  getAllVehicles,
  getActiveVehicles,
  softDeleteVehicle,
  reactivateVehicle,
  type VehicleListItem,
} from './features/list/actions.server';

// Server Actions - Create
export { createVehicle, type CreateVehicleInput } from './features/create/actions.server';

// Server Actions - Detail
export { getVehicleById, type VehicleDetail } from './features/detail/actions.server';

// Types - Detail
export { type EquipmentDetailTab } from './features/detail';

// Server Actions - Edit
export {
  getVehicleForEdit,
  updateVehicle,
  type UpdateVehicleInput,
  type VehicleForEdit,
} from './features/edit/actions.server';
