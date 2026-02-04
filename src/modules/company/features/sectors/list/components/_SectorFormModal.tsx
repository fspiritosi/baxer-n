'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import { Textarea } from '@/shared/components/ui/textarea';

import { createSector, type SectorListItem, updateSector } from '../actions.server';

// ============================================
// SCHEMA
// ============================================

const sectorSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  shortDescription: z.string().optional(),
});

type SectorFormData = z.infer<typeof sectorSchema>;

// ============================================
// PROPS
// ============================================

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sector?: SectorListItem | null;
}

// ============================================
// COMPONENT
// ============================================

export function _SectorFormModal({ open, onOpenChange, sector }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!sector;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SectorFormData>({
    resolver: zodResolver(sectorSchema),
    defaultValues: { name: '', shortDescription: '' },
  });

  // Reset form cuando cambia sector o se abre el modal
  useEffect(() => {
    if (open) {
      reset({
        name: sector?.name ?? '',
        shortDescription: sector?.shortDescription ?? '',
      });
    }
  }, [open, sector, reset]);

  const createMutation = useMutation({
    mutationFn: createSector,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sectors'] });
      toast.success('Sector creado');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al crear sector');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: SectorFormData) => updateSector(sector!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sectors'] });
      toast.success('Sector actualizado');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar sector');
    },
  });

  const onSubmit = (data: SectorFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="sector-form-modal">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Sector' : 'Nuevo Sector'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifica los datos del sector'
                : 'Ingresa los datos del nuevo sector'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Nombre del sector"
                data-testid="sector-name-input"
              />
              {errors.name && (
                <p className="text-sm text-destructive" data-testid="sector-name-error">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="shortDescription">Descripcion</Label>
              <Textarea
                id="shortDescription"
                {...register('shortDescription')}
                placeholder="Descripcion breve del sector"
                rows={3}
                data-testid="sector-description-input"
              />
              {errors.shortDescription && (
                <p className="text-sm text-destructive" data-testid="sector-description-error">
                  {errors.shortDescription.message}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              data-testid="sector-cancel-button"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || isSubmitting}
              data-testid="sector-submit-button"
            >
              {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
