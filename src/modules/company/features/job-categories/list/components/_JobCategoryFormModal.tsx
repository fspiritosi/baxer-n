'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Controller, useForm } from 'react-hook-form';
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

import { getCollectiveAgreementsForSelect } from '@/modules/company/features/collective-agreements';
import { createJobCategory, type JobCategoryListItem, updateJobCategory } from '../actions.server';

// ============================================
// SCHEMA
// ============================================

const jobCategorySchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  agreementId: z.string().min(1, 'Debe seleccionar un convenio colectivo'),
});

type JobCategoryFormData = z.infer<typeof jobCategorySchema>;

// ============================================
// PROPS
// ============================================

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  jobCategory?: JobCategoryListItem | null;
}

// ============================================
// COMPONENT
// ============================================

export function _JobCategoryFormModal({ open, onOpenChange, jobCategory }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!jobCategory;

  // Fetch collective agreements for select
  const { data: agreements = [] } = useQuery({
    queryKey: ['collectiveAgreementsForSelect'],
    queryFn: getCollectiveAgreementsForSelect,
    enabled: open,
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting },
  } = useForm<JobCategoryFormData>({
    resolver: zodResolver(jobCategorySchema),
    defaultValues: { name: '', agreementId: '' },
  });

  // Reset form cuando cambia jobCategory o se abre el modal
  useEffect(() => {
    if (open) {
      reset({
        name: jobCategory?.name ?? '',
        agreementId: jobCategory?.agreement?.id ?? '',
      });
    }
  }, [open, jobCategory, reset]);

  const createMutation = useMutation({
    mutationFn: createJobCategory,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobCategories'] });
      toast.success('Categoría laboral creada');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al crear categoría laboral');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: JobCategoryFormData) => updateJobCategory(jobCategory!.id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['jobCategories'] });
      toast.success('Categoría laboral actualizada');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar categoría laboral');
    },
  });

  const onSubmit = (data: JobCategoryFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]" data-testid="job-category-form-modal">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Editar Categoría Laboral' : 'Nueva Categoría Laboral'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Modifica los datos de la categoría laboral'
                : 'Ingresa los datos de la nueva categoría laboral'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {/* Convenio Colectivo Select */}
            <div className="space-y-2">
              <Label htmlFor="agreementId">Convenio Colectivo *</Label>
              <Controller
                control={control}
                name="agreementId"
                render={({ field }) => (
                  <Select
                    value={field.value}
                    onValueChange={field.onChange}
                    disabled={isPending}
                  >
                    <SelectTrigger data-testid="job-category-agreement-select">
                      <SelectValue placeholder="Seleccionar convenio..." />
                    </SelectTrigger>
                    <SelectContent>
                      {agreements.map((agreement) => (
                        <SelectItem key={agreement.id} value={agreement.id}>
                          {agreement.name} ({agreement.union.name})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              />
              {errors.agreementId && (
                <p className="text-sm text-destructive" data-testid="job-category-agreement-error">
                  {errors.agreementId.message}
                </p>
              )}
            </div>

            {/* Nombre */}
            <div className="space-y-2">
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                {...register('name')}
                placeholder="Nombre de la categoría laboral"
                data-testid="job-category-name-input"
              />
              {errors.name && (
                <p className="text-sm text-destructive" data-testid="job-category-name-error">
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
              data-testid="job-category-cancel-button"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isPending || isSubmitting}
              data-testid="job-category-submit-button"
            >
              {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
