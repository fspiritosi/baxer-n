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

import { createTypeOperative, type TypeOperativeListItem, updateTypeOperative } from '../actions.server';

// ============================================
// SCHEMA
// ============================================

const typeOperativeSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
});

type TypeOperativeFormData = z.infer<typeof typeOperativeSchema>;

// ============================================
// PROPS
// ============================================

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  typeOperative?: TypeOperativeListItem | null;
}

// ============================================
// COMPONENT
// ============================================

export function _TypeOperativeFormModal({ open, onOpenChange, typeOperative }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!typeOperative;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TypeOperativeFormData>({
    resolver: zodResolver(typeOperativeSchema),
    defaultValues: { name: '' },
  });

  // Reset form cuando cambia typeOperative o se abre el modal
  useEffect(() => {
    if (open) {
      reset({ name: typeOperative?.name ?? '' });
    }
  }, [open, typeOperative, reset]);

  const createMutation = useMutation({
    mutationFn: createTypeOperative,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['typeOperatives'] });
      toast.success('Tipo operativo creado');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al crear tipo operativo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: TypeOperativeFormData) => updateTypeOperative(typeOperative!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['typeOperatives'] });
      toast.success('Tipo operativo actualizado');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar tipo operativo');
    },
  });

  const onSubmit = (data: TypeOperativeFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="type-operative-form-modal">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Tipo Operativo' : 'Nuevo Tipo Operativo'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifica los datos del tipo operativo'
                : 'Ingresa el nombre del nuevo tipo operativo'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Nombre del tipo operativo"
                data-testid="type-operative-name-input"
              />
              {errors.name && (
                <p className="text-sm text-destructive" data-testid="type-operative-name-error">
                  {errors.name.message}
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
              data-testid="type-operative-cancel-button"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || isSubmitting}
              data-testid="type-operative-submit-button"
            >
              {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
