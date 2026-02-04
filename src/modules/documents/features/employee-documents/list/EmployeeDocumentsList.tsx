import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
import { getModulePermissions } from '@/shared/lib/permissions';

import {
  getDocumentsByEmployee,
  getEmployeeDocumentsSummary,
  getPendingDocumentTypes,
  getAvailableDocumentTypesForUpload,
  getMultiResourceDocumentsForEmployee,
} from './actions.server';
import { _EmployeeDocumentsGrid } from './components/_EmployeeDocumentsGrid';

// ============================================
// PROPS
// ============================================

interface Props {
  employeeId: string;
}

// ============================================
// COMPONENT
// ============================================

export async function EmployeeDocumentsList({ employeeId }: Props) {
  const [documents, summary, pendingTypes, availableTypes, multiResourceDocs, permissions] = await Promise.all([
    getDocumentsByEmployee(employeeId),
    getEmployeeDocumentsSummary(employeeId),
    getPendingDocumentTypes(employeeId),
    getAvailableDocumentTypesForUpload(employeeId),
    getMultiResourceDocumentsForEmployee(),
    getModulePermissions('documents'),
  ]);

  return (
    <PermissionGuard module="documents" action="view" redirect>
      <_EmployeeDocumentsGrid
        employeeId={employeeId}
        initialData={documents}
        initialSummary={summary}
        initialPendingTypes={pendingTypes}
        initialAvailableTypes={availableTypes}
        initialMultiResourceDocs={multiResourceDocs}
        permissions={permissions}
      />
    </PermissionGuard>
  );
}
