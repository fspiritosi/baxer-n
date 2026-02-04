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

import { deleteSector, getAllSectors, type SectorListItem } from '../actions.server';
import { _SectorFormModal } from './_SectorFormModal';

interface Props {
  initialData: SectorListItem[];
}

export function _SectorsTable({ initialData }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  // Modal states
  const [formModalOpen, setFormModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedSector, setSelectedSector] = useState<SectorListItem | null>(null);

  const { data: sectors } = useQuery({
    queryKey: ['sectors'],
    queryFn: getAllSectors,
    initialData,
  });

  const deleteMutation = useMutation({
    mutationFn: deleteSector,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sectors'] });
      toast.success('Sector eliminado');
      setDeleteDialogOpen(false);
      setSelectedSector(null);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al eliminar');
    },
  });

  // Handlers
  const handleCreate = () => {
    setSelectedSector(null);
    setFormModalOpen(true);
  };

  const handleEdit = (sector: SectorListItem) => {
    setSelectedSector(sector);
    setFormModalOpen(true);
  };

  const handleDelete = (sector: SectorListItem) => {
    setSelectedSector(sector);
    setDeleteDialogOpen(true);
  };

  const handleFormModalClose = (open: boolean) => {
    setFormModalOpen(open);
    if (!open) setSelectedSector(null);
  };

  return (
    <>
      {/* Toolbar */}
      <div className="flex items-center justify-end mb-4">
        <Button onClick={handleCreate} data-testid="new-sector-button">
          <Plus className="mr-2 h-4 w-4" />
          Nuevo Sector
        </Button>
      </div>

      {/* Table or Empty State */}
      {sectors.length === 0 ? (
        <div
          data-testid="sectors-empty-state"
          className="flex flex-col items-center justify-center py-12 text-center"
        >
          <p className="text-muted-foreground mb-4">No hay sectores registrados</p>
          <Button onClick={handleCreate}>Crear primer sector</Button>
        </div>
      ) : (
        <Table data-testid="sectors-table">
          <TableHeader>
            <TableRow>
              <TableHead>Nombre</TableHead>
              <TableHead>Descripcion</TableHead>
              <TableHead>Vehiculos</TableHead>
              <TableHead className="w-[70px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sectors.map((sector) => (
              <TableRow key={sector.id} data-testid={`sector-row-${sector.id}`}>
                <TableCell className="font-medium">{sector.name}</TableCell>
                <TableCell className="max-w-xs truncate">
                  {sector.shortDescription || '-'}
                </TableCell>
                <TableCell>
                  <Badge variant="outline">
                    {sector._count.vehicles} vehiculo
                    {sector._count.vehicles !== 1 ? 's' : ''}
                  </Badge>
                </TableCell>
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        data-testid={`sector-actions-${sector.id}`}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleEdit(sector)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleDelete(sector)}
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
      <_SectorFormModal
        open={formModalOpen}
        onOpenChange={handleFormModalClose}
        sector={selectedSector}
      />

      {/* Delete Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Eliminar sector?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta accion no se puede deshacer. El sector &quot;{selectedSector?.name}&quot; sera
              eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => selectedSector && deleteMutation.mutate(selectedSector.id)}
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
