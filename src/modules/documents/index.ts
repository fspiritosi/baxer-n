// Overview feature
export {
  DocumentsOverview,
  getCompanyDocumentTypesForFilter,
  getCompanyDocumentsPaginated,
  getCompanyDocumentsStats,
  getEmployeeDocumentTypesForFilter,
  getEmployeeDocumentsPaginated,
  getEmployeeDocumentsStats,
  getEquipmentDocumentTypesForFilter,
  getEquipmentDocumentsPaginated,
  getEquipmentDocumentsStats,
} from './features/overview';

// Document Types feature
export {
  _DocumentTypeFormModal,
  _DocumentTypesDataTable,
  createDocumentType,
  deleteDocumentType,
  getAllDocumentTypes,
  getColumns as getDocumentTypeColumns,
  getDocumentTypeTabCounts,
  getDocumentTypesForSelect,
  getDocumentTypesPaginated,
  updateDocumentType,
} from './features/document-types';

// Employee Documents feature
export {
  EmployeeDocumentsList,
  _DocumentUploadForm,
  deleteEmployeeDocument,
  getDocumentsByEmployee,
  getEmployeeDocumentsSummary,
  getPendingDocumentTypes,
  markDocumentAsExpired,
  uploadEmployeeDocument,
} from './features/employee-documents';

// Equipment Documents feature
export {
  EquipmentDocumentDetail,
  EquipmentDocumentsList,
  deleteEquipmentDocument,
  getDocumentsByEquipment,
  getEquipmentDocumentDetailById,
  getEquipmentDocumentDownloadUrl,
  getEquipmentDocumentsSummary,
  getEquipmentHistoryVersionDownloadUrl,
  revertEquipmentDocumentVersion,
  uploadEquipmentDocument,
} from './features/equipment-documents';

// Company Documents feature
export {
  CompanyDocumentsList,
  deleteCompanyDocument,
  getCompanyDocuments,
  getCompanyDocumentsSummary,
  uploadCompanyDocument,
} from './features/company-documents';

// Types
export type * from './types';
