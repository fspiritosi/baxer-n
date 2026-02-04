import type { DataTableSearchParams } from '@/shared/components/common/DataTable';

import {
  getEquipmentDocumentsPaginated,
  getEquipmentDocumentsStats,
  getEquipmentDocumentTypesForFilter,
  getMultiResourceEquipmentDocumentsStats,
  getMultiResourceEquipmentDocumentTypesWithStatus,
  type DocumentsSubTab,
} from '../actions.server';
import { _EquipmentDocumentsTab } from './_EquipmentDocumentsTab';

// ============================================
// PROPS
// ============================================

interface Props {
  searchParams: DataTableSearchParams;
  currentSubTab: DocumentsSubTab;
}

// ============================================
// SERVER COMPONENT
// ============================================

/**
 * Server Component que carga datos de documentos de equipos.
 * Hace fetch independiente - se renderiza con su propio Suspense.
 */
export async function EquipmentTabContent({ searchParams, currentSubTab }: Props) {
  // Fetch solo los datos necesarios para este tab
  const [
    // Stats para los contadores de subtabs
    permanentStats,
    monthlyStats,
    generalStats,
    // Datos según el subtab activo
    permanentResult,
    monthlyResult,
    generalTypesWithStatus,
    // Filtros para DataTable
    permanentDocTypes,
    monthlyDocTypes,
  ] = await Promise.all([
    // Stats (ligeras, siempre cargar para contadores)
    getEquipmentDocumentsStats(false),
    getEquipmentDocumentsStats(true),
    getMultiResourceEquipmentDocumentsStats(),
    // Datos paginados
    getEquipmentDocumentsPaginated(searchParams, false),
    getEquipmentDocumentsPaginated(searchParams, true),
    getMultiResourceEquipmentDocumentTypesWithStatus(),
    // Filtros
    getEquipmentDocumentTypesForFilter(false),
    getEquipmentDocumentTypesForFilter(true),
  ]);

  return (
    <_EquipmentDocumentsTab
      permanentStats={permanentStats}
      monthlyStats={monthlyStats}
      generalStats={generalStats}
      permanentData={permanentResult.data}
      permanentTotal={permanentResult.total}
      monthlyData={monthlyResult.data}
      monthlyTotal={monthlyResult.total}
      generalTypesWithStatus={generalTypesWithStatus}
      permanentDocTypes={permanentDocTypes}
      monthlyDocTypes={monthlyDocTypes}
      searchParams={searchParams}
      currentSubTab={currentSubTab}
    />
  );
}
