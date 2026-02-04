// ============================================
// SECTORS FEATURE - BARREL EXPORT
// ============================================

// List Feature (Page)
export { SectorsList as SectorsPage } from './list';

// Actions
export {
  getSectorsPaginated,
  getAllSectors,
  getSectorsForSelect,
  getSectorById,
  createSector,
  updateSector,
  deleteSector,
} from './list';

// Types
export type {
  SectorListItem,
  Sector,
  SectorOption,
  CreateSectorInput,
  UpdateSectorInput,
} from './list';
