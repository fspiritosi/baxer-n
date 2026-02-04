// ============================================
// EMPLOYEES MODULE - BARREL EXPORT
// ============================================
// Re-exports from features with backward-compatible names

// List Feature
export { EmployeesList as EmployeesPage } from './features/list';
export type { EmployeeListItem, EmployeeOption } from './features/list';

// Detail Feature
export { EmployeeDetail as EmployeeDetailPage } from './features/detail';
export type { Employee } from './features/detail';

// Create Feature
export { EmployeeCreate as EmployeeNewPage } from './features/create';

// Edit Feature
export { EmployeeEdit as EmployeeEditPage } from './features/edit';

// Re-export shared types
export type { CreateEmployeeInput } from './features/create';
export type { UpdateEmployeeInput, EmployeeForEdit } from './features/edit';
