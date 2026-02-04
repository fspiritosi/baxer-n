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

import { createVehicleBrand, type VehicleBrandListItem, updateVehicleBrand } from '../actions.server';

// ============================================
// SCHEMA
// ============================================

const vehicleBrandSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
});

type VehicleBrandFormData = z.infer<typeof vehicleBrandSchema>;

// ============================================
// PROPS
// ============================================

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicleBrand?: VehicleBrandListItem | null;
}

// ============================================
// COMPONENT
// ============================================

export function _VehicleBrandFormModal({ open, onOpenChange, vehicleBrand }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!vehicleBrand;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<VehicleBrandFormData>({
    resolver: zodResolver(vehicleBrandSchema),
    defaultValues: { name: '' },
  });

  // Reset form cuando cambia vehicleBrand o se abre el modal
  useEffect(() => {
    if (open) {
      reset({ name: vehicleBrand?.name ?? '' });
    }
  }, [open, vehicleBrand, reset]);

  const createMutation = useMutation({
    mutationFn: createVehicleBrand,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicleBrands'] });
      toast.success('Marca de Vehículo creada');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al crear marca de vehículo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: VehicleBrandFormData) => updateVehicleBrand(vehicleBrand!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['vehicleBrands'] });
      toast.success('Marca de Vehículo actualizada');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar marca de vehículo');
    },
  });

  const onSubmit = (data: VehicleBrandFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="vehicle-brand-form-modal">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Marca de Vehículo' : 'Nueva Marca de Vehículo'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifica los datos de la marca de vehículo'
                : 'Ingresa el nombre de la nueva marca de vehículo'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Nombre de la marca"
                data-testid="vehicle-brand-name-input"
              />
              {errors.name && (
                <p className="text-sm text-destructive" data-testid="vehicle-brand-name-error">
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
              data-testid="vehicle-brand-cancel-button"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || isSubmitting}
              data-testid="vehicle-brand-submit-button"
            >
              {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
