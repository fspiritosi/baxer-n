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

import { createContractType, type ContractTypeListItem, updateContractType } from '../actions.server';

// ============================================
// SCHEMA
// ============================================

const contractTypeSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  code: z.string().optional(),
  description: z.string().optional(),
});

type ContractTypeFormData = z.infer<typeof contractTypeSchema>;

// ============================================
// PROPS
// ============================================

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contractType?: ContractTypeListItem | null;
}

// ============================================
// COMPONENT
// ============================================

export function _ContractTypeFormModal({ open, onOpenChange, contractType }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!contractType;

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContractTypeFormData>({
    resolver: zodResolver(contractTypeSchema),
    defaultValues: { name: '', code: '', description: '' },
  });

  // Reset form cuando cambia contractType o se abre el modal
  useEffect(() => {
    if (open) {
      reset({
        name: contractType?.name ?? '',
        code: contractType?.code ?? '',
        description: contractType?.description ?? '',
      });
    }
  }, [open, contractType, reset]);

  const createMutation = useMutation({
    mutationFn: createContractType,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractTypes'] });
      toast.success('Tipo de contrato creado');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al crear tipo de contrato');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: ContractTypeFormData) => updateContractType(contractType!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['contractTypes'] });
      toast.success('Tipo de contrato actualizado');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar tipo de contrato');
    },
  });

  const onSubmit = (data: ContractTypeFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="contract-type-form-modal">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Tipo de Contrato' : 'Nuevo Tipo de Contrato'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifica los datos del tipo de contrato'
                : 'Ingresa los datos del nuevo tipo de contrato'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Nombre del tipo de contrato"
                data-testid="contract-type-name-input"
              />
              {errors.name && (
                <p className="text-sm text-destructive" data-testid="contract-type-name-error">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="code">Codigo</Label>
              <Input
                id="code"
                {...register('code')}
                placeholder="Codigo (opcional)"
                data-testid="contract-type-code-input"
              />
              {errors.code && (
                <p className="text-sm text-destructive" data-testid="contract-type-code-error">
                  {errors.code.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripcion</Label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Descripcion (opcional)"
                data-testid="contract-type-description-input"
              />
              {errors.description && (
                <p className="text-sm text-destructive" data-testid="contract-type-description-error">
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
              data-testid="contract-type-cancel-button"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || isSubmitting}
              data-testid="contract-type-submit-button"
            >
              {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
