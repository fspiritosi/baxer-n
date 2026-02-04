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
  getDocumentsByEmployee,
  getEmployeeDocumentsSummary,
  getDocumentDownloadUrl,
  getPendingDocumentTypes,
  getAvailableDocumentTypesForUpload,
  getMultiResourceDocumentsForEmployee,
  type EmployeeDocumentListItem,
  type EmployeeDocumentsSummary,
  type PendingDocumentType,
  type AvailableDocumentType,
  type MultiResourceDocumentItem,
} from '../actions.server';
import { deleteEmployeeDocument } from '../../upload/actions.server';
import { _DocumentUploadForm } from '../../upload/components/_DocumentUploadForm';
import { _EmployeeDocumentsDataTable } from './_EmployeeDocumentsDataTable';
import { getColumns } from '../columns';

// ============================================
// TIPOS
// ============================================

interface Props {
  employeeId: string;
  initialData: EmployeeDocumentListItem[];
  initialSummary: EmployeeDocumentsSummary;
  initialPendingTypes: PendingDocumentType[];
  initialAvailableTypes: AvailableDocumentType[];
  initialMultiResourceDocs: MultiResourceDocumentItem[];
  permissions: ModulePermissions;
}

// ============================================
// COMPONENT
// ============================================

export function _EmployeeDocumentsGrid({
  employeeId,
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
  const [documentToDelete, setDocumentToDelete] = useState<EmployeeDocumentListItem | null>(null);
  const [preselectedTypeId, setPreselectedTypeId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('permanent');

  // Queries
  const { data: documents } = useQuery({
    queryKey: ['employeeDocuments', employeeId],
    queryFn: () => getDocumentsByEmployee(employeeId),
    initialData,
  });

  const { data: summary } = useQuery({
    queryKey: ['employeeDocumentsSummary', employeeId],
    queryFn: () => getEmployeeDocumentsSummary(employeeId),
    initialData: initialSummary,
  });

  const { data: pendingTypes } = useQuery({
    queryKey: ['pendingDocumentTypes', employeeId],
    queryFn: () => getPendingDocumentTypes(employeeId),
    initialData: initialPendingTypes,
  });

  const { data: availableTypes } = useQuery({
    queryKey: ['availableDocumentTypes', employeeId],
    queryFn: () => getAvailableDocumentTypesForUpload(employeeId),
    initialData: initialAvailableTypes,
  });

  const { data: multiResourceDocs } = useQuery({
    queryKey: ['multiResourceEmployeeDocs'],
    queryFn: () => getMultiResourceDocumentsForEmployee(),
    initialData: initialMultiResourceDocs,
  });

  // Separar documentos en permanentes y mensuales
  const { permanentDocs, monthlyDocs } = useMemo(() => {
    const permanent: EmployeeDocumentListItem[] = [];
    const monthly: EmployeeDocumentListItem[] = [];

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
    mutationFn: (id: string) => deleteEmployeeDocument(id, employeeId),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ['employeeDocuments', employeeId],
      });
      queryClient.invalidateQueries({
        queryKey: ['employeeDocumentsSummary', employeeId],
      });
      queryClient.invalidateQueries({
        queryKey: ['availableDocumentTypes', employeeId],
      });
      queryClient.invalidateQueries({
        queryKey: ['pendingDocumentTypes', employeeId],
      });
      setDeleteDialogOpen(false);
      setDocumentToDelete(null);
      toast.success('Documento eliminado');
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar documento');
    },
  });

  // Handlers
  const handleViewDocument = async (doc: EmployeeDocumentListItem) => {
    try {
      const result = await getDocumentDownloadUrl(doc.id, employeeId);
      if (result.success && result.url) {
        window.open(result.url, '_blank');
      } else {
        toast.error(result.error || 'Error al obtener documento');
      }
    } catch {
      toast.error('Error al obtener documento');
    }
  };

  const handleDownloadDocument = async (doc: EmployeeDocumentListItem) => {
    try {
      const result = await getDocumentDownloadUrl(doc.id, employeeId);
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

  const handleDeleteRequest = (doc: EmployeeDocumentListItem) => {
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
      getColumns({
        employeeId,
        onView: handleViewDocument,
        onDownload: handleDownloadDocument,
        onDelete: handleDeleteRequest,
        permissions: {
          canUpdate: permissions.canUpdate,
          canDelete: permissions.canDelete,
        },
      }),
    [employeeId, permissions.canUpdate, permissions.canDelete]
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
        data-testid="employee-documents-summary"
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
            {permissions.canCreate && (
              <CardDescription>
                Haz click en un documento para subirlo directamente
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2" data-testid="pending-document-types">
              {pendingTypes.map((type) => (
                <Badge
                  key={type.id}
                  variant="outline"
                  className={`border-destructive/50 text-destructive gap-1 ${
                    permissions.canCreate
                      ? 'cursor-pointer hover:bg-destructive/10 transition-colors'
                      : ''
                  }`}
                  onClick={permissions.canCreate ? () => handleNewUpload(type.id) : undefined}
                >
                  {permissions.canCreate && <Plus className="h-3 w-3" />}
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
            <CardDescription>Gestiona los documentos del empleado</CardDescription>
          </div>
          {permissions.canCreate && (
            <Button onClick={() => handleNewUpload()} data-testid="upload-document-button">
              <Plus className="mr-2 h-4 w-4" />
              Subir Documento
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {documents.length === 0 && multiResourceDocs.length === 0 ? (
            <div
              className="py-8 text-center text-muted-foreground"
              data-testid="employee-documents-empty"
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
                <_EmployeeDocumentsDataTable
                  columns={permanentColumns}
                  data={permanentDocs}
                  emptyMessage="No hay documentos permanentes"
                />
              </TabsContent>

              <TabsContent value="monthly">
                <_EmployeeDocumentsDataTable
                  columns={allColumns}
                  data={monthlyDocs}
                  emptyMessage="No hay documentos mensuales"
                  showYearFilter
                />
              </TabsContent>

              <TabsContent value="general">
                <_EmployeeDocumentsDataTable
                  columns={permanentColumns}
                  data={multiResourceDocs as unknown as EmployeeDocumentListItem[]}
                  emptyMessage="No hay documentos generales"
                />
              </TabsContent>
            </Tabs>
          )}
        </CardContent>
      </Card>

      {/* Upload Dialog */}
      <_DocumentUploadForm
        employeeId={employeeId}
        documentTypes={availableTypes}
        open={uploadDialogOpen}
        onOpenChange={handleCloseUploadDialog}
        mode="new"
        preselectedTypeId={preselectedTypeId}
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
