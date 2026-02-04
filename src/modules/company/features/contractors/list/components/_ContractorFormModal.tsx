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

import { createContractor, type ContractorListItem, updateContractor } from '../actions.server';

// ============================================
// SCHEMA
// ============================================

const contractorSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  taxId: z.string().optional(),
  email: z.string().email('Email invalido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
});

type ContractorFormData = z.infer<typeof contractorSchema>;

// ============================================
// PROPS
// ============================================

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractor?: ContractorListItem | null;
}

// ============================================
// COMPONENT
// ============================================

export function _ContractorFormModal({ open, onOpenChange, contractor }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!contractor;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContractorFormData>({
    resolver: zodResolver(contractorSchema),
    defaultValues: {
      name: '',
      taxId: '',
      email: '',
      phone: '',
      address: '',
    },
  });

  // Reset form cuando cambia contractor o se abre el modal
  useEffect(() => {
    if (open) {
      reset({
        name: contractor?.name ?? '',
        taxId: contractor?.taxId ?? '',
        email: contractor?.email ?? '',
        phone: contractor?.phone ?? '',
        address: contractor?.address ?? '',
      });
    }
  }, [open, contractor, reset]);

  const createMutation = useMutation({
    mutationFn: createContractor,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractors'] });
      toast.success('Contratista creado');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al crear contratista');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ContractorFormData) => updateContractor(contractor!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractors'] });
      toast.success('Contratista actualizado');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar contratista');
    },
  });

  const onSubmit = (data: ContractorFormData) => {
    // Clean empty strings to undefined
    const cleanedData = {
      name: data.name,
      taxId: data.taxId || undefined,
      email: data.email || undefined,
      phone: data.phone || undefined,
      address: data.address || undefined,
    };

    if (isEditing) {
      updateMutation.mutate(cleanedData);
    } else {
      createMutation.mutate(cleanedData);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="contractor-form-modal">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Contratista' : 'Nuevo Contratista'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifica los datos del contratista'
                : 'Ingresa los datos del nuevo contratista'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Nombre del contratista"
                data-testid="contractor-name-input"
              />
              {errors.name && (
                <p className="text-sm text-destructive" data-testid="contractor-name-error">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* CUIT */}
            <div className="space-y-2">
              <Label htmlFor="taxId">CUIT</Label>
              <Input
                id="taxId"
                {...register('taxId')}
                placeholder="XX-XXXXXXXX-X"
                data-testid="contractor-taxId-input"
              />
            </div>

            {/* Email */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register('email')}
                placeholder="email@ejemplo.com"
                data-testid="contractor-email-input"
              />
              {errors.email && (
                <p className="text-sm text-destructive" data-testid="contractor-email-error">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* Telefono */}
            <div className="space-y-2">
              <Label htmlFor="phone">Telefono</Label>
              <Input
                id="phone"
                {...register('phone')}
                placeholder="+54 11 1234-5678"
                data-testid="contractor-phone-input"
              />
            </div>

            {/* Direccion */}
            <div className="space-y-2">
              <Label htmlFor="address">Direccion</Label>
              <Input
                id="address"
                {...register('address')}
                placeholder="Direccion del contratista"
                data-testid="contractor-address-input"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isPending}
              data-testid="contractor-cancel-button"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || isSubmitting}
              data-testid="contractor-submit-button"
            >
              {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
