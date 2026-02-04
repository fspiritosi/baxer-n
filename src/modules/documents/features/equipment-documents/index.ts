// List feature
export { EquipmentDocumentsList } from './list';
export {
  getAvailableEquipmentDocumentTypesForUpload,
  getDocumentsByEquipment,
  getEquipmentDocumentDownloadUrl,
  getEquipmentDocumentsSummary,
  getPendingEquipmentDocumentTypes,
  type AvailableEquipmentDocumentType,
  type EquipmentDocumentListItem,
  type EquipmentDocumentsFilters,
  type EquipmentDocumentsSummary,
  type PendingEquipmentDocumentType,
} from './list/actions.server';

// Detail feature
export { EquipmentDocumentDetail } from './detail';
export {
  getEquipmentDocumentDetailById,
  getEquipmentHistoryVersionDownloadUrl,
  type EquipmentDocumentDetailData,
} from './detail/actions.server';

// Upload feature
export {
  deleteEquipmentDocument,
  revertEquipmentDocumentVersion,
  uploadEquipmentDocument,
} from './upload/actions.server';

// Review feature
export { markEquipmentDocumentAsExpired } from './review/actions.server';
