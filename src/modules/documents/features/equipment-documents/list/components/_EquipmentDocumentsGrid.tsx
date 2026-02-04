'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, FileText, Filter, Plus } from 'lucide-react';
import { useMemo, useState } from 'react';
import { toast } from 'sonner';

import { Badge } from '@/shared/components/ui/badge';
import { Button } from '@/shared/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

import type { ModulePermissions } from '@/shared/lib/permissions';

import {
  getDocumentsByEquipment,
  getEquipmentDocumentsSummary,
  getEquipmentDocumentDownloadUrl,
  getPendingEquipmentDocumentTypes,
  getAvailableEquipmentDocumentTypesForUpload,
  getMultiResourceDocumentsForEquipment,
  type EquipmentDocumentListItem,
  type EquipmentDocumentsSummary,
  type PendingEquipmentDocumentType,
  type AvailableEquipmentDocumentType,
  type MultiResourceEquipmentDocumentItem,
} from '../actions.server';
import { deleteEquipmentDocument } from '../../upload/actions.server';
import { _EquipmentDocumentUploadForm } from '../../upload/components/_EquipmentDocumentUploadForm';
import { _EquipmentDocumentsDataTable } from './_EquipmentDocumentsDataTable';
import { getEquipmentDocumentsColumns } from '../columns';

// ============================================
// TIPOS
// ============================================

interface Props {
  vehicleId: string;
  initialData: EquipmentDocumentListItem[];
  initialSummary: EquipmentDocumentsSummary;
  initialPendingTypes: PendingEquipmentDocumentType[];
  initialAvailableTypes: AvailableEquipmentDocumentType[];
  initialMultiResourceDocs: MultiResourceEquipmentDocumentItem[];
  permissions: ModulePermissions;
}

// ============================================
// COMPONENT
// ============================================

export function _EquipmentDocumentsGrid({
  vehicleId,
  initialData,
  initialSummary,
  initialPendingTypes,
  initialAvailableTypes,
  initialMultiResourceDocs,
  permissions,
}: Props) {
  const queryClient = useQueryClient();

  // State
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [documentToDelete, setDocumentToDelete] = useState<EquipmentDocumentListItem | null>(null);
  const [preselectedTypeId, setPreselectedTypeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('permanent');

  // Queries
  const { data: documents } = useQuery({
    queryKey: ['equipmentDocuments', vehicleId],
    queryFn: () => getDocumentsByEquipment(vehicleId),
    initialData,
  });

  const { data: summary } = useQuery({
    queryKey: ['equipmentDocumentsSummary', vehicleId],
    queryFn: () => getEquipmentDocumentsSummary(vehicleId),
    initialData: initialSummary,
  });

  const { data: pendingTypes } = useQuery({
    queryKey: ['pendingEquipmentDocumentTypes', vehicleId],
    queryFn: () => getPendingEquipmentDocumentTypes(vehicleId),
    initialData: initialPendingTypes,
  });

  const { data: availableTypes } = useQuery({
    queryKey: ['availableEquipmentDocumentTypes', vehicleId],
    queryFn: () => getAvailableEquipmentDocumentTypesForUpload(vehicleId),
    initialData: initialAvailableTypes,
  });

  const { data: multiResourceDocs } = useQuery({
    queryKey: ['multiResourceEquipmentDocs'],
    queryFn: () => getMultiResourceDocumentsForEquipment(),
    initialData: initialMultiResourceDocs,
  });

  // Separar documentos en permanentes y mensuales
  const { permanentDocs, monthlyDocs } = useMemo(() => {
    const permanent: EquipmentDocumentListItem[] = [];
    const monthly: EquipmentDocumentListItem[] = [];

    documents.forEach((doc) => {
      if (doc.documentType.isMonthly) {
        monthly.push(doc);
      } else {
        permanent.push(doc);
      }
    });

    // Ordenar mensuales por periodo descendente (más recientes primero)
    monthly.sort((a, b) => {
      if (!a.period || !b.period) return 0;
      return b.period.localeCompare(a.period);
    });

    return { permanentDocs: permanent, monthlyDocs: monthly };
  }, [documents]);

  // Mutations
  const deleteMutation = useMutation({
    mutationFn: (id: string) => deleteEquipmentDocument(id, vehicleId),
    onSuccess: (result) => {
      if (result.success) {
        queryClient.invalidateQueries({
          queryKey: ['equipmentDocuments', vehicleId],
        });
        queryClient.invalidateQueries({
          queryKey: ['equipmentDocumentsSummary', vehicleId],
        });
        queryClient.invalidateQueries({
          queryKey: ['availableEquipmentDocumentTypes', vehicleId],
        });
        queryClient.invalidateQueries({
          queryKey: ['pendingEquipmentDocumentTypes', vehicleId],
        });
        // Invalidate vehicle status for header update
        queryClient.invalidateQueries({
          queryKey: ['vehicleStatusInfo', vehicleId],
        });
        setDeleteDialogOpen(false);
        setDocumentToDelete(null);
        toast.success('Documento eliminado');
      } else {
        toast.error(result.error || 'Error al eliminar documento');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar documento');
    },
  });

  // Handlers
  const handleViewDocument = async (doc: EquipmentDocumentListItem) => {
    try {
      const result = await getEquipmentDocumentDownloadUrl(doc.id, vehicleId);
      if (result.success && result.url) {
        window.open(result.url, '_blank');
      } else {
        toast.error(result.error || 'Error al obtener documento');
      }
    } catch {
      toast.error('Error al obtener documento');
    }
  };

  const handleDownloadDocument = async (doc: EquipmentDocumentListItem) => {
    try {
      const result = await getEquipmentDocumentDownloadUrl(doc.id, vehicleId);
      if (result.success && result.url) {
        const link = document.createElement('a');
        link.href = result.url;
        link.download = doc.fileName || 'documento';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        toast.error(result.error || 'Error al descargar documento');
      }
    } catch {
      toast.error('Error al descargar documento');
    }
  };

  const handleNewUpload = (typeId?: string) => {
    setPreselectedTypeId(typeId || null);
    setUploadDialogOpen(true);
  };

  const handleCloseUploadDialog = (open: boolean) => {
    setUploadDialogOpen(open);
    if (!open) {
      setPreselectedTypeId(null);
    }
  };

  const handleUploadSuccess = () => {
    // Invalidate vehicle status for header update
    queryClient.invalidateQueries({
      queryKey: ['vehicleStatusInfo', vehicleId],
    });
  };

  const handleDeleteRequest = (doc: EquipmentDocumentListItem) => {
    setDocumentToDelete(doc);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (documentToDelete) {
      deleteMutation.mutate(documentToDelete.id);
    }
  };

  // Columnas memoizadas
  const allColumns = useMemo(
    () =>
      getEquipmentDocumentsColumns({
        vehicleId,
        onView: handleViewDocument,
        onDownload: handleDownloadDocument,
        onDelete: handleDeleteRequest,
        permissions,
      }),
    [vehicleId, permissions]
  );

  // Columnas para permanentes (sin la columna de periodo)
  const permanentColumns = useMemo(() => {
    return allColumns.filter((col) => {
      const meta = col.meta as { title?: string } | undefined;
      return meta?.title !== 'Periodo';
    });
  }, [allColumns]);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
        data-testid="equipment-documents-summary"
      >
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Documentos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Obligatorios Completados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {summary.mandatoryCompleted}/{summary.mandatory}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Vencidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{summary.expired}</div>
          </CardContent>
        </Card>
      </div>

      {/* Missing Mandatory Documents Alert */}
      {pendingTypes.length > 0 && (
        <Card className="border-destructive/50 bg-destructive/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5 text-destructive" />
              <CardTitle className="text-base text-destructive">
                Documentos Obligatorios Faltantes ({pendingTypes.length})
              </CardTitle>
            </div>
            {permissions.canUpdate && (
              <CardDescription>
                Haz click en un documento para subirlo directamente
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2" data-testid="pending-equipment-document-types">
              {pendingTypes.map((type) => (
                <Badge
                  key={type.id}
                  variant="outline"
                  className={`border-destructive/50 text-destructive gap-1 ${
                    permissions.canUpdate
                      ? 'cursor-pointer hover:bg-destructive/10 transition-colors'
                      : ''
                  }`}
                  onClick={permissions.canUpdate ? () => handleNewUpload(type.id) : undefined}
                >
                  {permissions.canUpdate && <Plus className="h-3 w-3" />}
                  {type.isConditional && <Filter className="h-3 w-3" />}
                  {type.name}
                  {type.hasExpiration && ' (con vencimiento)'}
                  {type.isMonthly && ' (mensual)'}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Documents Tabs */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0">
          <div>
            <CardTitle>Documentos</CardTitle>
            <CardDescription>Gestiona los documentos del equipo</CardDescription>
          </div>
          {permissions.canUpdate && (
            <Button onClick={() => handleNewUpload()} data-testid="upload-equipment-document-button">
              <Plus className="mr-2 h-4 w-4" />
              Subir Documento
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {documents.length === 0 && multiResourceDocs.length === 0 ? (
            <div
              className="py-8 text-center text-muted-foreground"
              data-testid="equipment-documents-empty"
            >
              <FileText className="mx-auto h-12 w-12 opacity-50" />
              <p className="mt-2">No hay documentos registrados</p>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab}>
              <TabsList className="mb-4">
                <TabsTrigger value="permanent" className="gap-2">
                  Permanentes
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {permanentDocs.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="monthly" className="gap-2">
                  Mensuales
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {monthlyDocs.length}
                  </Badge>
                </TabsTrigger>
                <TabsTrigger value="general" className="gap-2">
                  Generales
                  <Badge variant="secondary" className="ml-1 h-5 px-1.5">
                    {multiResourceDocs.length}
                  </Badge>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="permanent">
                <_EquipmentDocumentsDataTable
                  columns={permanentColumns}
                  data={permanentDocs}
                  emptyMessage="No hay documentos permanentes"
                />
              </TabsContent>

              <TabsContent value="monthly">
                <_EquipmentDocumentsDataTable
                  columns={allColumns}
                  data={monthlyDocs}
                  emptyMessage="No hay documentos mensuales"
                  showYearFilter
                />
              </TabsContent>

              <TabsContent value="general">
                <_EquipmentDocumentsDataTable
                  columns={permanentColumns}
                  data={multiResourceDocs as unknown as EquipmentDocumentListItem[]}
                  emptyMessage="No hay documentos generales"
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <_EquipmentDocumentUploadForm
        vehicleId={vehicleId}
        documentTypes={availableTypes}
        open={uploadDialogOpen}
        onOpenChange={handleCloseUploadDialog}
        preselectedTypeId={preselectedTypeId}
        onSuccess={handleUploadSuccess}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar documento</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que deseas eliminar el documento &quot;
              {documentToDelete?.documentType.name}&quot;? Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
