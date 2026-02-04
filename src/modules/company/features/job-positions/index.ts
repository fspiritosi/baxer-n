// ============================================
// JOB POSITIONS FEATURE - BARREL EXPORT
// ============================================

// List Feature (Page)
export { JobPositionsList as JobPositionsPage } from './list';

// Actions
export {
  getJobPositionsPaginated,
  getAllJobPositions,
  getJobPositionsForSelect,
  getJobPositionById,
  createJobPosition,
  updateJobPosition,
  deleteJobPosition,
} from './list';

// Types
export type {
  JobPositionListItem,
  JobPosition,
  JobPositionOption,
  CreateJobPositionInput,
  UpdateJobPositionInput,
} from './list';
