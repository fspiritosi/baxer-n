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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';

import {
  createCollectiveAgreement,
  type CollectiveAgreementListItem,
  updateCollectiveAgreement,
} from '../actions.server';
import type { UnionOption } from '@/modules/company/features/unions';

// ============================================
// SCHEMA
// ============================================

const collectiveAgreementSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  unionId: z.string().min(1, 'Debe seleccionar un sindicato'),
});

type CollectiveAgreementFormData = z.infer<typeof collectiveAgreementSchema>;

// ============================================
// PROPS
// ============================================

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  collectiveAgreement?: CollectiveAgreementListItem | null;
  unions: UnionOption[];
}

// ============================================
// COMPONENT
// ============================================

export function _CollectiveAgreementFormModal({
  open,
  onOpenChange,
  collectiveAgreement,
  unions,
}: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!collectiveAgreement;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CollectiveAgreementFormData>({
    resolver: zodResolver(collectiveAgreementSchema),
    defaultValues: { name: '', unionId: '' },
  });

  const unionId = watch('unionId');

  // Reset form cuando cambia collectiveAgreement o se abre el modal
  useEffect(() => {
    if (open) {
      reset({
        name: collectiveAgreement?.name ?? '',
        unionId: collectiveAgreement?.union?.id ?? '',
      });
    }
  }, [open, collectiveAgreement, reset]);

  const createMutation = useMutation({
    mutationFn: createCollectiveAgreement,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectiveAgreements'] });
      toast.success('Convenio Colectivo creado');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al crear convenio colectivo');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: CollectiveAgreementFormData) =>
      updateCollectiveAgreement(collectiveAgreement!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['collectiveAgreements'] });
      toast.success('Convenio Colectivo actualizado');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(
        error instanceof Error ? error.message : 'Error al actualizar convenio colectivo'
      );
    },
  });

  const onSubmit = (data: CollectiveAgreementFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="collective-agreement-form-modal">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Editar Convenio Colectivo' : 'Nuevo Convenio Colectivo'}
            </DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifica los datos del convenio colectivo'
                : 'Ingresa los datos del nuevo convenio colectivo'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Nombre del convenio colectivo"
                data-testid="collective-agreement-name-input"
              />
              {errors.name && (
                <p className="text-sm text-destructive" data-testid="collective-agreement-name-error">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="unionId">Sindicato *</Label>
              <Select
                value={unionId}
                onValueChange={(value) => setValue('unionId', value, { shouldValidate: true })}
              >
                <SelectTrigger data-testid="collective-agreement-union-select">
                  <SelectValue placeholder="Seleccionar sindicato" />
                </SelectTrigger>
                <SelectContent>
                  {unions.map((union) => (
                    <SelectItem key={union.id} value={union.id}>
                      {union.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.unionId && (
                <p
                  className="text-sm text-destructive"
                  data-testid="collective-agreement-union-error"
                >
                  {errors.unionId.message}
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
              data-testid="collective-agreement-cancel-button"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || isSubmitting}
              data-testid="collective-agreement-submit-button"
            >
              {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
