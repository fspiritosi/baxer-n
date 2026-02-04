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

import { deleteContractType, getAllContractTypes, type ContractTypeListItem } from '../actions.server';
import { _ContractTypeFormModal } from './_ContractTypeFormModal';

interface Props {
  initialData: ContractTypeListItem[];
}

export function _ContractTypesTable({ initialData }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedContractType, setSelectedContractType] = useState<ContractTypeListItem | null>(null);

  const { data: contractTypes } = useQuery({
    queryKey: ['contractTypes'],
    queryFn: getAllContractTypes,
    initialData,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteContractType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractTypes'] });
      toast.success('Tipo de contrato eliminado');
      setDeleteDialogOpen(false);
      setSelectedContractType(null);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar');
    },
  });

  // Handlers
  const handleCreate = () => {
    setSelectedContractType(null);
    setFormModalOpen(true);
  };

  const handleEdit = (contractType: ContractTypeListItem) => {
    setSelectedContractType(contractType);
    setFormModalOpen(true);
  };

  const handleDelete = (contractType: ContractTypeListItem) => {
    setSelectedContractType(contractType);
    setDeleteDialogOpen(true);
  };

  const handleFormModalClose = (open: boolean) => {
    setFormModalOpen(open);
    if (!open) setSelectedContractType(null);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-end mb-4">
        <Button onClick={handleCreate} data-testid="new-contract-type-button">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Tipo de Contrato
        </Button>
      </div>

      {/* Table or Empty State */}
      {contractTypes.length === 0 ? (
        <div
          data-testid="contract-types-empty-state"
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <p className="text-muted-foreground mb-4">No hay tipos de contrato registrados</p>
          <Button onClick={handleCreate}>Crear primer tipo de contrato</Button>
        </div>
      ) : (
        <Table data-testid="contract-types-table">
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Codigo</TableHead>
              <TableHead>Descripcion</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {contractTypes.map((contractType) => (
              <TableRow key={contractType.id} data-testid={`contract-type-row-${contractType.id}`}>
                <TableCell className="font-medium">{contractType.name}</TableCell>
                <TableCell>{contractType.code || '-'}</TableCell>
                <TableCell className="max-w-xs truncate">{contractType.description || '-'}</TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid={`contract-type-actions-${contractType.id}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(contractType)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(contractType)}
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
      <_ContractTypeFormModal
        open={formModalOpen}
        onOpenChange={handleFormModalClose}
        contractType={selectedContractType}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar tipo de contrato?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. El tipo de contrato &quot;{selectedContractType?.name}&quot; sera eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedContractType && deleteMutation.mutate(selectedContractType.id)}
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
