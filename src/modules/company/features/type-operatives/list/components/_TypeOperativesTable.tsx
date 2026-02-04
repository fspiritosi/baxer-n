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

import { deleteTypeOperative, getAllTypeOperatives, type TypeOperativeListItem } from '../actions.server';
import { _TypeOperativeFormModal } from './_TypeOperativeFormModal';

interface Props {
  initialData: TypeOperativeListItem[];
}

export function _TypeOperativesTable({ initialData }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedTypeOperative, setSelectedTypeOperative] = useState<TypeOperativeListItem | null>(null);

  const { data: typeOperatives } = useQuery({
    queryKey: ['typeOperatives'],
    queryFn: getAllTypeOperatives,
    initialData,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTypeOperative,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['typeOperatives'] });
      toast.success('Tipo operativo eliminado');
      setDeleteDialogOpen(false);
      setSelectedTypeOperative(null);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar');
    },
  });

  // Handlers
  const handleCreate = () => {
    setSelectedTypeOperative(null);
    setFormModalOpen(true);
  };

  const handleEdit = (typeOperative: TypeOperativeListItem) => {
    setSelectedTypeOperative(typeOperative);
    setFormModalOpen(true);
  };

  const handleDelete = (typeOperative: TypeOperativeListItem) => {
    setSelectedTypeOperative(typeOperative);
    setDeleteDialogOpen(true);
  };

  const handleFormModalClose = (open: boolean) => {
    setFormModalOpen(open);
    if (!open) setSelectedTypeOperative(null);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-end mb-4">
        <Button onClick={handleCreate} data-testid="new-type-operative-button">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Tipo Operativo
        </Button>
      </div>

      {/* Table or Empty State */}
      {typeOperatives.length === 0 ? (
        <div
          data-testid="type-operatives-empty-state"
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <p className="text-muted-foreground mb-4">No hay tipos operativos registrados</p>
          <Button onClick={handleCreate}>Crear primer tipo operativo</Button>
        </div>
      ) : (
        <Table data-testid="type-operatives-table">
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Vehiculos</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {typeOperatives.map((typeOperative) => (
              <TableRow key={typeOperative.id} data-testid={`type-operative-row-${typeOperative.id}`}>
                <TableCell className="font-medium">{typeOperative.name}</TableCell>
                <TableCell>
                  <Badge variant="outline">{typeOperative._count.vehicles} vehiculos</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid={`type-operative-actions-${typeOperative.id}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(typeOperative)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(typeOperative)}
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
      <_TypeOperativeFormModal
        open={formModalOpen}
        onOpenChange={handleFormModalClose}
        typeOperative={selectedTypeOperative}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar tipo operativo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. El tipo operativo &quot;{selectedTypeOperative?.name}&quot; sera
              eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedTypeOperative && deleteMutation.mutate(selectedTypeOperative.id)}
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
