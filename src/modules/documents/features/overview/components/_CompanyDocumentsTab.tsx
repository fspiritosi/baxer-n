'use client';

import type { DataTableSearchParams } from '@/shared/components/common/DataTable';

import type {
  CompanyDocumentListItem,
  DocumentsStats,
  DocumentTypeFilterOption,
} from '../actions.server';
import { _CompanyDocumentsDataTable } from './_CompanyDocumentsDataTable';
import { _DocumentsStatsCards } from './_DocumentsStatsCards';

interface Props {
  stats: DocumentsStats;
  data: CompanyDocumentListItem[];
  totalRows: number;
  documentTypes: DocumentTypeFilterOption[];
  searchParams: DataTableSearchParams;
}

export function _CompanyDocumentsTab({
  stats,
  data,
  totalRows,
  documentTypes,
  searchParams,
}: Props) {
  return (
    <div className="space-y-4">
      <_DocumentsStatsCards stats={stats} />
      <_CompanyDocumentsDataTable
        data={data}
        totalRows={totalRows}
        searchParams={searchParams}
        documentTypes={documentTypes}
      />
    </div>
  );
}
