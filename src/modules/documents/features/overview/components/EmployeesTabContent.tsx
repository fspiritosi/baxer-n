import type { DataTableSearchParams } from '@/shared/components/common/DataTable';

import {
  getEmployeeDocumentsPaginated,
  getEmployeeDocumentsStats,
  getEmployeeDocumentTypesForFilter,
  getMultiResourceEmployeeDocumentsStats,
  getMultiResourceEmployeeDocumentTypesWithStatus,
  type DocumentsSubTab,
} from '../actions.server';
import { _EmployeeDocumentsTab } from './_EmployeeDocumentsTab';

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
 * Server Component que carga datos de documentos de empleados.
 * Hace fetch independiente - se renderiza con su propio Suspense.
 */
export async function EmployeesTabContent({ searchParams, currentSubTab }: Props) {
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
    getEmployeeDocumentsStats(false),
    getEmployeeDocumentsStats(true),
    getMultiResourceEmployeeDocumentsStats(),
    // Datos paginados
    getEmployeeDocumentsPaginated(searchParams, false),
    getEmployeeDocumentsPaginated(searchParams, true),
    getMultiResourceEmployeeDocumentTypesWithStatus(),
    // Filtros
    getEmployeeDocumentTypesForFilter(false),
    getEmployeeDocumentTypesForFilter(true),
  ]);

  return (
    <_EmployeeDocumentsTab
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
