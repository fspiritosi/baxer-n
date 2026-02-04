import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
import { getModulePermissions } from '@/shared/lib/permissions';

import { getCompanyDocuments, getCompanyDocumentsSummary } from './actions.server';
import { _CompanyDocumentsGrid } from './components/_CompanyDocumentsGrid';

// ============================================
// COMPONENT
// ============================================

export async function CompanyDocumentsList() {
  const [documents, summary, permissions] = await Promise.all([
    getCompanyDocuments(),
    getCompanyDocumentsSummary(),
    getModulePermissions('company.documents'),
  ]);

  return (
    <PermissionGuard module="company.documents" action="view" redirect>
      <_CompanyDocumentsGrid
        initialData={documents}
        initialSummary={summary}
        permissions={permissions}
      />
    </PermissionGuard>
  );
}
