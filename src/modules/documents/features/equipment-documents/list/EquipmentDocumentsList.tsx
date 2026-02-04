import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
import { getModulePermissions } from '@/shared/lib/permissions';

import {
  getDocumentsByEquipment,
  getEquipmentDocumentsSummary,
  getPendingEquipmentDocumentTypes,
  getAvailableEquipmentDocumentTypesForUpload,
  getMultiResourceDocumentsForEquipment,
} from './actions.server';
import { _EquipmentDocumentsGrid } from './components/_EquipmentDocumentsGrid';

// ============================================
// PROPS
// ============================================

interface Props {
  vehicleId: string;
}

// ============================================
// COMPONENT
// ============================================

export async function EquipmentDocumentsList({ vehicleId }: Props) {
  const [documents, summary, pendingTypes, availableTypes, multiResourceDocs, permissions] = await Promise.all([
    getDocumentsByEquipment(vehicleId),
    getEquipmentDocumentsSummary(vehicleId),
    getPendingEquipmentDocumentTypes(vehicleId),
    getAvailableEquipmentDocumentTypesForUpload(vehicleId),
    getMultiResourceDocumentsForEquipment(),
    getModulePermissions('documents'),
  ]);

  return (
    <PermissionGuard module="documents" action="view" redirect>
      <_EquipmentDocumentsGrid
        vehicleId={vehicleId}
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
