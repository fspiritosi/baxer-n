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

import { deleteCostCenter, getAllCostCenters, type CostCenterListItem } from '../actions.server';
import { _CostCenterFormModal } from './_CostCenterFormModal';

interface Props {
  initialData: CostCenterListItem[];
}

export function _CostCentersTable({ initialData }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCostCenter, setSelectedCostCenter] = useState<CostCenterListItem | null>(null);

  const { data: costCenters } = useQuery({
    queryKey: ['costCenters'],
    queryFn: getAllCostCenters,
    initialData,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCostCenter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costCenters'] });
      toast.success('Centro de costo eliminado');
      setDeleteDialogOpen(false);
      setSelectedCostCenter(null);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar');
    },
  });

  // Handlers
  const handleCreate = () => {
    setSelectedCostCenter(null);
    setFormModalOpen(true);
  };

  const handleEdit = (costCenter: CostCenterListItem) => {
    setSelectedCostCenter(costCenter);
    setFormModalOpen(true);
  };

  const handleDelete = (costCenter: CostCenterListItem) => {
    setSelectedCostCenter(costCenter);
    setDeleteDialogOpen(true);
  };

  const handleFormModalClose = (open: boolean) => {
    setFormModalOpen(open);
    if (!open) setSelectedCostCenter(null);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-end mb-4">
        <Button onClick={handleCreate} data-testid="new-cost-center-button">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Centro de Costo
        </Button>
      </div>

      {/* Table or Empty State */}
      {costCenters.length === 0 ? (
        <div
          className="flex flex-col items-center justify-center py-12 text-center"
          data-testid="cost-centers-empty-state"
        >
          <p className="text-muted-foreground mb-4">No hay centros de costo registrados</p>
          <Button onClick={handleCreate}>Crear primer centro de costo</Button>
        </div>
      ) : (
        <Table data-testid="cost-centers-table">
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {costCenters.map((costCenter) => (
              <TableRow key={costCenter.id} data-testid={`cost-center-row-${costCenter.id}`}>
                <TableCell className="font-medium">{costCenter.name}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid={`cost-center-actions-${costCenter.id}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(costCenter)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(costCenter)}
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
      <_CostCenterFormModal
        open={formModalOpen}
        onOpenChange={handleFormModalClose}
        costCenter={selectedCostCenter}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent data-testid="cost-center-delete-dialog">
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar centro de costo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El centro de costo &quot;
              {selectedCostCenter?.name}&quot; será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedCostCenter && deleteMutation.mutate(selectedCostCenter.id)}
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
