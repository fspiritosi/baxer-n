'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

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
import { Button } from '@/shared/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/shared/components/ui/dropdown-menu';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';

import { deleteJobPosition, getAllJobPositions, type JobPositionListItem } from '../actions.server';
import { _JobPositionFormModal } from './_JobPositionFormModal';

interface Props {
  initialData: JobPositionListItem[];
}

export function _JobPositionsTable({ initialData }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedJobPosition, setSelectedJobPosition] = useState<JobPositionListItem | null>(null);

  const { data: jobPositions } = useQuery({
    queryKey: ['jobPositions'],
    queryFn: getAllJobPositions,
    initialData,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteJobPosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPositions'] });
      toast.success('Puesto de Trabajo eliminado');
      setDeleteDialogOpen(false);
      setSelectedJobPosition(null);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar');
    },
  });

  // Handlers
  const handleCreate = () => {
    setSelectedJobPosition(null);
    setFormModalOpen(true);
  };

  const handleEdit = (jobPosition: JobPositionListItem) => {
    setSelectedJobPosition(jobPosition);
    setFormModalOpen(true);
  };

  const handleDelete = (jobPosition: JobPositionListItem) => {
    setSelectedJobPosition(jobPosition);
    setDeleteDialogOpen(true);
  };

  const handleFormModalClose = (open: boolean) => {
    setFormModalOpen(open);
    if (!open) setSelectedJobPosition(null);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-end mb-4">
        <Button onClick={handleCreate} data-testid="new-job-position-button">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Puesto de Trabajo
        </Button>
      </div>

      {/* Table or Empty State */}
      {jobPositions.length === 0 ? (
        <div
          data-testid="job-positions-empty-state"
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <p className="text-muted-foreground mb-4">No hay puestos de trabajo registrados</p>
          <Button onClick={handleCreate}>Crear primer puesto de trabajo</Button>
        </div>
      ) : (
        <Table data-testid="job-positions-table">
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripcion</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {jobPositions.map((jobPosition) => (
              <TableRow key={jobPosition.id} data-testid={`job-position-row-${jobPosition.id}`}>
                <TableCell className="font-medium">{jobPosition.name}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {jobPosition.description || '-'}
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid={`job-position-actions-${jobPosition.id}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(jobPosition)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(jobPosition)}
                        className="text-destructive"
                      >
                        <Trash2 className="mr-2 h-4 w-4" />
                        Eliminar
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}

      {/* Form Modal */}
      <_JobPositionFormModal
        open={formModalOpen}
        onOpenChange={handleFormModalClose}
        jobPosition={selectedJobPosition}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar puesto de trabajo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. El puesto &quot;{selectedJobPosition?.name}&quot;
              sera eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedJobPosition && deleteMutation.mutate(selectedJobPosition.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
