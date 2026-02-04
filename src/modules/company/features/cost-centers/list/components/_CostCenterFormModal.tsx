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

import { createCostCenter, type CostCenterListItem, updateCostCenter } from '../actions.server';

// ============================================
// SCHEMA
// ============================================

const costCenterSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
});

type CostCenterFormData = z.infer<typeof costCenterSchema>;

// ============================================
// PROPS
// ============================================

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  costCenter?: CostCenterListItem | null;
}

// ============================================
// COMPONENT
// ============================================

export function _CostCenterFormModal({ open, onOpenChange, costCenter }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!costCenter;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CostCenterFormData>({
    resolver: zodResolver(costCenterSchema),
    defaultValues: { name: '' },
  });

  useEffect(() => {
    if (open) {
      reset({ name: costCenter?.name ?? '' });
    }
  }, [open, costCenter, reset]);

  const createMutation = useMutation({
    mutationFn: createCostCenter,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costCenters'] });
      toast.success('Centro de costo creado');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al crear centro de costo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CostCenterFormData) => updateCostCenter(costCenter!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['costCenters'] });
      toast.success('Centro de costo actualizado');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar centro de costo');
    },
  });

  const onSubmit = (data: CostCenterFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="cost-center-form-modal">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Centro de Costo' : 'Nuevo Centro de Costo'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifica los datos del centro de costo'
                : 'Ingresa el nombre del nuevo centro de costo'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Nombre del centro de costo"
                data-testid="cost-center-name-input"
              />
              {errors.name && (
                <p className="text-sm text-destructive" data-testid="cost-center-name-error">
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
              data-testid="cost-center-cancel-button"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || isSubmitting}
              data-testid="cost-center-submit-button"
            >
              {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
