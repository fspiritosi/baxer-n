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

import { deleteUnion, getAllUnions, type UnionListItem } from '../actions.server';
import { _UnionFormModal } from './_UnionFormModal';

interface Props {
  initialData: UnionListItem[];
}

export function _UnionsTable({ initialData }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedUnion, setSelectedUnion] = useState<UnionListItem | null>(null);

  const { data: unions } = useQuery({
    queryKey: ['unions'],
    queryFn: getAllUnions,
    initialData,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteUnion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unions'] });
      toast.success('Sindicato eliminado');
      setDeleteDialogOpen(false);
      setSelectedUnion(null);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar');
    },
  });

  // Handlers
  const handleCreate = () => {
    setSelectedUnion(null);
    setFormModalOpen(true);
  };

  const handleEdit = (union: UnionListItem) => {
    setSelectedUnion(union);
    setFormModalOpen(true);
  };

  const handleDelete = (union: UnionListItem) => {
    setSelectedUnion(union);
    setDeleteDialogOpen(true);
  };

  const handleFormModalClose = (open: boolean) => {
    setFormModalOpen(open);
    if (!open) setSelectedUnion(null);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-end mb-4">
        <Button onClick={handleCreate} data-testid="new-union-button">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Sindicato
        </Button>
      </div>

      {/* Table or Empty State */}
      {unions.length === 0 ? (
        <div
          data-testid="unions-empty-state"
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <p className="text-muted-foreground mb-4">No hay sindicatos registrados</p>
          <Button onClick={handleCreate}>Crear primer sindicato</Button>
        </div>
      ) : (
        <Table data-testid="unions-table">
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Convenios</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {unions.map((union) => (
              <TableRow key={union.id} data-testid={`union-row-${union.id}`}>
                <TableCell className="font-medium">{union.name}</TableCell>
                <TableCell>
                  <Badge variant="secondary">
                    {union._count.collectiveAgreements} convenio
                    {union._count.collectiveAgreements !== 1 ? 's' : ''}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid={`union-actions-${union.id}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(union)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(union)}
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
      <_UnionFormModal
        open={formModalOpen}
        onOpenChange={handleFormModalClose}
        union={selectedUnion}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar sindicato?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El sindicato &quot;{selectedUnion?.name}&quot; y sus
              convenios serán eliminados permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedUnion && deleteMutation.mutate(selectedUnion.id)}
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
