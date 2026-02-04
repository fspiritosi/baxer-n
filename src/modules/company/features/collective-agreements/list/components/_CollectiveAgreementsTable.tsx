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
import { Badge } from '@/shared/components/ui/badge';
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

import {
  deleteCollectiveAgreement,
  getAllCollectiveAgreements,
  type CollectiveAgreementListItem,
} from '../actions.server';
import { _CollectiveAgreementFormModal } from './_CollectiveAgreementFormModal';
import type { UnionOption } from '@/modules/company/features/unions';

interface Props {
  initialData: CollectiveAgreementListItem[];
  unions: UnionOption[];
}

export function _CollectiveAgreementsTable({ initialData, unions }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedAgreement, setSelectedAgreement] = useState<CollectiveAgreementListItem | null>(
    null
  );

  const { data: agreements } = useQuery({
    queryKey: ['collectiveAgreements'],
    queryFn: getAllCollectiveAgreements,
    initialData,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCollectiveAgreement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectiveAgreements'] });
      toast.success('Convenio colectivo eliminado');
      setDeleteDialogOpen(false);
      setSelectedAgreement(null);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar');
    },
  });

  // Handlers
  const handleCreate = () => {
    setSelectedAgreement(null);
    setFormModalOpen(true);
  };

  const handleEdit = (agreement: CollectiveAgreementListItem) => {
    setSelectedAgreement(agreement);
    setFormModalOpen(true);
  };

  const handleDelete = (agreement: CollectiveAgreementListItem) => {
    setSelectedAgreement(agreement);
    setDeleteDialogOpen(true);
  };

  const handleFormModalClose = (open: boolean) => {
    setFormModalOpen(open);
    if (!open) setSelectedAgreement(null);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-end mb-4">
        <Button onClick={handleCreate} data-testid="new-collective-agreement-button">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Convenio
        </Button>
      </div>

      {/* Table or Empty State */}
      {agreements.length === 0 ? (
        <div
          data-testid="collective-agreements-empty-state"
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <p className="text-muted-foreground mb-4">No hay convenios colectivos registrados</p>
          <Button onClick={handleCreate}>Crear primer convenio</Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table data-testid="collective-agreements-table">
            <TableHeader>
              <TableRow>
                <TableHead>Convenio</TableHead>
                <TableHead>Sindicato</TableHead>
                <TableHead>Categorias</TableHead>
                <TableHead className="w-[70px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agreements.map((agreement) => (
                <TableRow key={agreement.id} data-testid={`collective-agreement-row-${agreement.id}`}>
                  <TableCell className="font-medium">{agreement.name}</TableCell>
                  <TableCell>{agreement.union.name}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{agreement._count.jobCategories} categorias</Badge>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          data-testid={`collective-agreement-actions-${agreement.id}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Abrir menu</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem
                          onClick={() => handleEdit(agreement)}
                          data-testid={`collective-agreement-edit-${agreement.id}`}
                        >
                          <Pencil className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDelete(agreement)}
                          data-testid={`collective-agreement-delete-${agreement.id}`}
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
        </div>
      )}

      {/* Form Modal */}
      <_CollectiveAgreementFormModal
        open={formModalOpen}
        onOpenChange={handleFormModalClose}
        collectiveAgreement={selectedAgreement}
        unions={unions}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="collective-agreement-delete-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar convenio colectivo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. El convenio colectivo &quot;{selectedAgreement?.name}
              &quot; sera eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="collective-agreement-delete-cancel">
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedAgreement && deleteMutation.mutate(selectedAgreement.id)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              data-testid="collective-agreement-delete-confirm"
            >
              {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
