// ============================================
// COMPANIES MODULE - BARREL EXPORT
// ============================================
// Re-exports from features with backward-compatible names

// List Feature
export { CompaniesPage } from './features/list';
export type { CompanyListItem } from './features/list';

// Detail Feature
export { CompanyDetailPage } from './features/detail';
export type { Company } from './features/detail';

// Create Feature
export { CompanyCreate as CompanyNewPage } from './features/create';
export { NoCompanyFallback } from './features/create';

// Edit Feature
export { CompanyEdit as CompanyEditPage } from './features/edit';

// Re-export shared types
export type { CreateCompanyInput } from './features/create';
export type { UpdateCompanyInput } from './features/edit';

// Re-export shared utils
export { userHasAccessToCompany } from './shared';
