// ============================================
// COLLECTIVE AGREEMENTS FEATURE - BARREL EXPORT
// ============================================

// List Feature (Page)
export { CollectiveAgreementsList as CollectiveAgreementsPage } from './list';

// Actions
export {
  getCollectiveAgreementsPaginated,
  getAllCollectiveAgreements,
  getCollectiveAgreementsForSelect,
  getCollectiveAgreementsByUnion,
  getCollectiveAgreementById,
  createCollectiveAgreement,
  updateCollectiveAgreement,
  deleteCollectiveAgreement,
} from './list';

// Types
export type {
  CollectiveAgreementListItem,
  CollectiveAgreementOption,
  CollectiveAgreement,
  CreateCollectiveAgreementInput,
  UpdateCollectiveAgreementInput,
} from './list';
