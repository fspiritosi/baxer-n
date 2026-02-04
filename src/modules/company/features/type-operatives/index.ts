// ============================================
// TYPE OPERATIVES FEATURE - BARREL EXPORT
// ============================================

// List Feature (Page)
export { TypeOperativesList as TypeOperativesPage } from './list';

// Actions
export {
  getTypeOperativesPaginated,
  getAllTypeOperatives,
  getTypeOperativesForSelect,
  getTypeOperativeById,
  createTypeOperative,
  updateTypeOperative,
  deleteTypeOperative,
} from './list';

// Types
export type {
  TypeOperativeListItem,
  TypeOperative,
  TypeOperativeOption,
  CreateTypeOperativeInput,
  UpdateTypeOperativeInput,
} from './list';
