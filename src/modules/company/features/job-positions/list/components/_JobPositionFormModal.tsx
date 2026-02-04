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

import { createJobPosition, type JobPositionListItem, updateJobPosition } from '../actions.server';

// ============================================
// SCHEMA
// ============================================

const jobPositionSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
});

type JobPositionFormData = z.infer<typeof jobPositionSchema>;

// ============================================
// PROPS
// ============================================

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobPosition?: JobPositionListItem | null;
}

// ============================================
// COMPONENT
// ============================================

export function _JobPositionFormModal({ open, onOpenChange, jobPosition }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!jobPosition;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<JobPositionFormData>({
    resolver: zodResolver(jobPositionSchema),
    defaultValues: { name: '', description: '' },
  });

  // Reset form cuando cambia jobPosition o se abre el modal
  useEffect(() => {
    if (open) {
      reset({
        name: jobPosition?.name ?? '',
        description: jobPosition?.description ?? '',
      });
    }
  }, [open, jobPosition, reset]);

  const createMutation = useMutation({
    mutationFn: createJobPosition,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPositions'] });
      toast.success('Puesto de Trabajo creado');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al crear puesto de trabajo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: JobPositionFormData) => updateJobPosition(jobPosition!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobPositions'] });
      toast.success('Puesto de Trabajo actualizado');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar puesto de trabajo');
    },
  });

  const onSubmit = (data: JobPositionFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="job-position-form-modal">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Puesto de Trabajo' : 'Nuevo Puesto de Trabajo'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifica los datos del puesto de trabajo'
                : 'Ingresa los datos del nuevo puesto de trabajo'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Nombre del puesto de trabajo"
                data-testid="job-position-name-input"
              />
              {errors.name && (
                <p className="text-sm text-destructive" data-testid="job-position-name-error">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripcion</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descripcion del puesto de trabajo (opcional)"
                data-testid="job-position-description-input"
              />
              {errors.description && (
                <p className="text-sm text-destructive" data-testid="job-position-description-error">
                  {errors.description.message}
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
              data-testid="job-position-cancel-button"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || isSubmitting}
              data-testid="job-position-submit-button"
            >
              {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
