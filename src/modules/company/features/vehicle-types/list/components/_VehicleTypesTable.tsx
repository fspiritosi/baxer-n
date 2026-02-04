'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Check, MoreHorizontal, Pencil, Plus, Trash2, X } from 'lucide-react';
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

import { deleteVehicleType, getAllVehicleTypes, type VehicleTypeListItem } from '../actions.server';
import { _VehicleTypeFormModal } from './_VehicleTypeFormModal';

interface Props {
  initialData: VehicleTypeListItem[];
}

export function _VehicleTypesTable({ initialData }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedVehicleType, setSelectedVehicleType] = useState<VehicleTypeListItem | null>(null);

  const { data: vehicleTypes } = useQuery({
    queryKey: ['vehicleTypes'],
    queryFn: getAllVehicleTypes,
    initialData,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteVehicleType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicleTypes'] });
      toast.success('Tipo de Equipo eliminado');
      setDeleteDialogOpen(false);
      setSelectedVehicleType(null);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar');
    },
  });

  // Handlers
  const handleCreate = () => {
    setSelectedVehicleType(null);
    setFormModalOpen(true);
  };

  const handleEdit = (vehicleType: VehicleTypeListItem) => {
    setSelectedVehicleType(vehicleType);
    setFormModalOpen(true);
  };

  const handleDelete = (vehicleType: VehicleTypeListItem) => {
    setSelectedVehicleType(vehicleType);
    setDeleteDialogOpen(true);
  };

  const handleFormModalClose = (open: boolean) => {
    setFormModalOpen(open);
    if (!open) setSelectedVehicleType(null);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-end mb-4">
        <Button onClick={handleCreate} data-testid="new-vehicle-type-button">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Tipo de Equipo
        </Button>
      </div>

      {/* Table or Empty State */}
      {vehicleTypes.length === 0 ? (
        <div
          data-testid="vehicle-types-empty-state"
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <p className="text-muted-foreground mb-4">No hay tipos de equipo registrados</p>
          <Button onClick={handleCreate}>Crear primer tipo de equipo</Button>
        </div>
      ) : (
        <Table data-testid="vehicle-types-table">
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Enganche</TableHead>
              <TableHead>Unidad Tractora</TableHead>
              <TableHead>Vehiculos</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vehicleTypes.map((vehicleType) => (
              <TableRow key={vehicleType.id} data-testid={`vehicle-type-row-${vehicleType.id}`}>
                <TableCell className="font-medium">{vehicleType.name}</TableCell>
                <TableCell>
                  {vehicleType.hasHitch ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell>
                  {vehicleType.isTractorUnit ? (
                    <Check className="h-4 w-4 text-green-600" />
                  ) : (
                    <X className="h-4 w-4 text-muted-foreground" />
                  )}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{vehicleType._count.vehicles} vehiculos</Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid={`vehicle-type-actions-${vehicleType.id}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(vehicleType)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(vehicleType)}
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
      <_VehicleTypeFormModal
        open={formModalOpen}
        onOpenChange={handleFormModalClose}
        vehicleType={selectedVehicleType}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar tipo de equipo?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. El tipo &quot;{selectedVehicleType?.name}&quot; sera
              eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedVehicleType && deleteMutation.mutate(selectedVehicleType.id)}
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
