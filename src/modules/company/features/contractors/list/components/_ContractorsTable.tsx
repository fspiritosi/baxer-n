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

import { deleteContractor, getAllContractors, type ContractorListItem } from '../actions.server';
import { _ContractorFormModal } from './_ContractorFormModal';

interface Props {
  initialData: ContractorListItem[];
}

export function _ContractorsTable({ initialData }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedContractor, setSelectedContractor] = useState<ContractorListItem | null>(null);

  const { data: contractors } = useQuery({
    queryKey: ['contractors'],
    queryFn: getAllContractors,
    initialData,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContractor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractors'] });
      toast.success('Contratista eliminado');
      setDeleteDialogOpen(false);
      setSelectedContractor(null);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar');
    },
  });

  // Handlers
  const handleCreate = () => {
    setSelectedContractor(null);
    setFormModalOpen(true);
  };

  const handleEdit = (contractor: ContractorListItem) => {
    setSelectedContractor(contractor);
    setFormModalOpen(true);
  };

  const handleDelete = (contractor: ContractorListItem) => {
    setSelectedContractor(contractor);
    setDeleteDialogOpen(true);
  };

  const handleFormModalClose = (open: boolean) => {
    setFormModalOpen(open);
    if (!open) setSelectedContractor(null);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-end mb-4">
        <Button onClick={handleCreate} data-testid="new-contractor-button">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Contratista
        </Button>
      </div>

      {/* Table or Empty State */}
      {contractors.length === 0 ? (
        <div
          data-testid="contractors-empty-state"
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <p className="text-muted-foreground mb-4">No hay contratistas registrados</p>
          <Button onClick={handleCreate}>Crear primer contratista</Button>
        </div>
      ) : (
        <Table data-testid="contractors-table">
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>CUIT</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Telefono</TableHead>
              <TableHead>Vehiculos</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contractors.map((contractor) => (
              <TableRow key={contractor.id} data-testid={`contractor-row-${contractor.id}`}>
                <TableCell className="font-medium">{contractor.name}</TableCell>
                <TableCell>{contractor.taxId || '-'}</TableCell>
                <TableCell>{contractor.email || '-'}</TableCell>
                <TableCell>{contractor.phone || '-'}</TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {contractor._count.vehicleAllocations} vehiculo
                    {contractor._count.vehicleAllocations !== 1 ? 's' : ''}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid={`contractor-actions-${contractor.id}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(contractor)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(contractor)}
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
      <_ContractorFormModal
        open={formModalOpen}
        onOpenChange={handleFormModalClose}
        contractor={selectedContractor}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar contratista?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. El contratista &quot;{selectedContractor?.name}
              &quot; sera eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedContractor && deleteMutation.mutate(selectedContractor.id)}
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
