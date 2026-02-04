// Re-export types from features
export type {
  CreateDocumentTypeInput,
  DocumentTypeFilters,
  DocumentTypeListItem,
  DocumentTypeOption,
  DocumentTypeTab,
  TabCounts as DocumentTypeTabCounts,
  UpdateDocumentTypeInput,
} from './features/document-types/list/actions.server';

// Employee Documents
export type {
  EmployeeDocumentListItem,
  EmployeeDocumentsFilters,
  EmployeeDocumentsSummary,
  PendingDocumentType,
} from './features/employee-documents/list/actions.server';

export type { UploadEmployeeDocumentInput } from './features/employee-documents/upload/actions.server';

// Equipment Documents
export type {
  EquipmentDocumentListItem,
  EquipmentDocumentsFilters,
  EquipmentDocumentsSummary,
} from './features/equipment-documents/list/actions.server';

export type { UploadEquipmentDocumentInput } from './features/equipment-documents/upload/actions.server';

// Company Documents
export type {
  CompanyDocumentListItem,
  CompanyDocumentsFilters,
  CompanyDocumentsSummary,
} from './features/company-documents/list/actions.server';

export type { UploadCompanyDocumentInput } from './features/company-documents/upload/actions.server';
