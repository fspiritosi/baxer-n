'use client';

import { useRouter, useSearchParams } from 'next/navigation';

import type { DataTableSearchParams } from '@/shared/components/common/DataTable';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

import type {
  DocumentsStats,
  DocumentsSubTab,
  DocumentTypeFilterOption,
  EquipmentDocumentListItem,
  MultiResourceDocumentTypeWithStatus,
} from '../actions.server';
import { _DocumentsStatsCards } from './_DocumentsStatsCards';
import { _EquipmentDocumentsDataTable } from './_EquipmentDocumentsDataTable';
import { _MultiResourceDocumentsDataTable } from './_MultiResourceDocumentsDataTable';

interface Props {
  permanentStats: DocumentsStats;
  monthlyStats: DocumentsStats;
  generalStats: DocumentsStats;
  permanentData: EquipmentDocumentListItem[];
  permanentTotal: number;
  monthlyData: EquipmentDocumentListItem[];
  monthlyTotal: number;
  generalTypesWithStatus: MultiResourceDocumentTypeWithStatus[];
  permanentDocTypes: DocumentTypeFilterOption[];
  monthlyDocTypes: DocumentTypeFilterOption[];
  searchParams: DataTableSearchParams;
  currentSubTab: DocumentsSubTab;
}

export function _EquipmentDocumentsTab({
  permanentStats,
  monthlyStats,
  generalStats,
  permanentData,
  permanentTotal,
  monthlyData,
  monthlyTotal,
  generalTypesWithStatus,
  permanentDocTypes,
  monthlyDocTypes,
  searchParams,
  currentSubTab,
}: Props) {
  const router = useRouter();
  const params = useSearchParams();

  const handleSubTabChange = (subtab: string) => {
    const newParams = new URLSearchParams();
    newParams.set('tab', 'equipment');
    newParams.set('subtab', subtab);
    // No copiar otros params para evitar duplicación
    router.push(`/dashboard/documents?${newParams.toString()}`);
  };

  return (
    <Tabs value={currentSubTab} onValueChange={handleSubTabChange} className="space-y-4">
      <TabsList>
        <TabsTrigger value="permanent">Permanentes ({permanentStats.total})</TabsTrigger>
        <TabsTrigger value="monthly">Mensuales ({monthlyStats.total})</TabsTrigger>
        <TabsTrigger value="general">Generales ({generalTypesWithStatus.length})</TabsTrigger>
      </TabsList>

      <TabsContent value="permanent" className="space-y-4">
        <_DocumentsStatsCards stats={permanentStats} />
        <_EquipmentDocumentsDataTable
          data={permanentData}
          totalRows={permanentTotal}
          searchParams={searchParams}
          documentTypes={permanentDocTypes}
        />
      </TabsContent>

      <TabsContent value="monthly" className="space-y-4">
        <_DocumentsStatsCards stats={monthlyStats} />
        <_EquipmentDocumentsDataTable
          data={monthlyData}
          totalRows={monthlyTotal}
          searchParams={searchParams}
          documentTypes={monthlyDocTypes}
        />
      </TabsContent>

      <TabsContent value="general" className="space-y-4">
        <_DocumentsStatsCards stats={generalStats} />
        <_MultiResourceDocumentsDataTable
          data={generalTypesWithStatus}
          appliesTo="EQUIPMENT"
          emptyMessage="No hay tipos de documento multirrecurso configurados para equipos"
        />
      </TabsContent>
    </Tabs>
  );
}
