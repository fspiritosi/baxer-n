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

import { createUnion, type UnionListItem, updateUnion } from '../actions.server';

// ============================================
// SCHEMA
// ============================================

const unionSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
});

type UnionFormData = z.infer<typeof unionSchema>;

// ============================================
// PROPS
// ============================================

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  union?: UnionListItem | null;
}

// ============================================
// COMPONENT
// ============================================

export function _UnionFormModal({ open, onOpenChange, union }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!union;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UnionFormData>({
    resolver: zodResolver(unionSchema),
    defaultValues: { name: '' },
  });

  // Reset form cuando cambia union o se abre el modal
  useEffect(() => {
    if (open) {
      reset({ name: union?.name ?? '' });
    }
  }, [open, union, reset]);

  const createMutation = useMutation({
    mutationFn: createUnion,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unions'] });
      toast.success('Sindicato creado');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al crear sindicato');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: UnionFormData) => updateUnion(union!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['unions'] });
      toast.success('Sindicato actualizado');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar sindicato');
    },
  });

  const onSubmit = (data: UnionFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="union-form-modal">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Sindicato' : 'Nuevo Sindicato'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifica los datos del sindicato'
                : 'Ingresa el nombre del nuevo sindicato'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Nombre del sindicato"
                data-testid="union-name-input"
              />
              {errors.name && (
                <p className="text-sm text-destructive" data-testid="union-name-error">
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
              data-testid="union-cancel-button"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || isSubmitting}
              data-testid="union-submit-button"
            >
              {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
