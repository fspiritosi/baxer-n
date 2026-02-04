import type { DataTableSearchParams } from '@/shared/components/common/DataTable';

import {
  getDocumentTypesPaginated,
  getDocumentTypeTabCounts,
  type DocumentTypeTab,
} from '../../document-types/list/actions.server';
import { _DocumentTypesTab } from './_DocumentTypesTab';

// ============================================
// PROPS
// ============================================

interface Props {
  searchParams: DataTableSearchParams;
  currentDocTypeTab: DocumentTypeTab;
}

// ============================================
// SERVER COMPONENT
// ============================================

/**
 * Server Component que carga datos de tipos de documento.
 * Hace fetch independiente - se renderiza con su propio Suspense.
 */
export async function DocumentTypesTabContent({ searchParams, currentDocTypeTab }: Props) {
  const [result, tabCounts] = await Promise.all([
    getDocumentTypesPaginated(searchParams, currentDocTypeTab),
    getDocumentTypeTabCounts(),
  ]);

  return (
    <_DocumentTypesTab
      data={result.data}
      totalRows={result.total}
      tabCounts={tabCounts}
      currentTab={currentDocTypeTab}
      searchParams={searchParams}
    />
  );
}
