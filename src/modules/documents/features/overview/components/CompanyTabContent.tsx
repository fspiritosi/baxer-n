import type { DataTableSearchParams } from '@/shared/components/common/DataTable';

import {
  getCompanyDocumentsPaginated,
  getCompanyDocumentsStats,
  getCompanyDocumentTypesForFilter,
} from '../actions.server';
import { _CompanyDocumentsTab } from './_CompanyDocumentsTab';

// ============================================
// PROPS
// ============================================

interface Props {
  searchParams: DataTableSearchParams;
}

// ============================================
// SERVER COMPONENT
// ============================================

/**
 * Server Component que carga datos de documentos de empresa.
 * Hace fetch independiente - se renderiza con su propio Suspense.
 */
export async function CompanyTabContent({ searchParams }: Props) {
  const [stats, result, docTypes] = await Promise.all([
    getCompanyDocumentsStats(),
    getCompanyDocumentsPaginated(searchParams),
    getCompanyDocumentTypesForFilter(),
  ]);

  return (
    <_CompanyDocumentsTab
      stats={stats}
      data={result.data}
      totalRows={result.total}
      documentTypes={docTypes}
      searchParams={searchParams}
    />
  );
}
