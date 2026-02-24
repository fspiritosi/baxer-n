'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { DataTable, type DataTableSearchParams } from '@/shared/components/common/DataTable';
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

import { deleteProjection } from '../../actions.server';
import type { ProjectionListItem } from '../../../../shared/types';
import { getColumns } from '../columns';
import { _CreateProjectionModal } from './_CreateProjectionModal';
import { _EditProjectionModal } from './_EditProjectionModal';
import { _LinkDocumentModal } from './_LinkDocumentModal';
import { _ProjectionLinksSection } from './_ProjectionLinksSection';

interface Props {
  data: ProjectionListItem[];
  totalRows: number;
  searchParams: DataTableSearchParams;
}

export function _ProjectionsTable({ data, totalRows, searchParams }: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [linkOpen, setLinkOpen] = useState(false);
  const [linksOpen, setLinksOpen] = useState(false);
  const [selectedProjection, setSelectedProjection] = useState<ProjectionListItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (!selectedProjection) return;

    setIsDeleting(true);
    try {
      await deleteProjection(selectedProjection.id);
      toast.success('Proyección eliminada correctamente');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar la proyección');
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedProjection(null);
    }
  };

  const columns = useMemo(
    () =>
      getColumns({
        onEdit: (projection) => {
          setSelectedProjection(projection);
          setEditOpen(true);
        },
        onDelete: (projection) => {
          setSelectedProjection(projection);
          setDeleteDialogOpen(true);
        },
        onLink: (projection) => {
          setSelectedProjection(projection);
          setLinkOpen(true);
        },
        onViewLinks: (projection) => {
          setSelectedProjection(projection);
          setLinksOpen(true);
        },
      }),
    []
  );

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        totalRows={totalRows}
        searchParams={searchParams}
        searchPlaceholder="Buscar proyecciones..."
        toolbarActions={
          <_CreateProjectionModal onSuccess={() => router.refresh()} />
        }
      />

      {/* Diálogo de Eliminación */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar proyección?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente la proyección de cashflow.
              Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Edición */}
      {selectedProjection && (
        <_EditProjectionModal
          projection={selectedProjection}
          open={editOpen}
          onOpenChange={setEditOpen}
          onSuccess={() => router.refresh()}
        />
      )}

      {/* Modal de Vinculación de Documentos */}
      <_LinkDocumentModal
        projection={selectedProjection}
        open={linkOpen}
        onOpenChange={setLinkOpen}
        onSuccess={() => {
          setLinkOpen(false);
          router.refresh();
        }}
      />

      {/* Modal de Documentos Vinculados */}
      <_ProjectionLinksSection
        projection={selectedProjection}
        open={linksOpen}
        onOpenChange={setLinksOpen}
        onSuccess={() => router.refresh()}
      />
    </>
  );
}
