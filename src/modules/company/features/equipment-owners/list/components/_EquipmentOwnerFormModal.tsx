'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';

import { Button } from '@/shared/components/ui/button';
import { Checkbox } from '@/shared/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';

import type { VehicleTitularityType } from '@/generated/prisma/enums';
import { vehicleTitularityTypeLabels } from '@/shared/utils/mappers';
import {
  createEquipmentOwner,
  type EquipmentOwnerListItem,
  updateEquipmentOwner,
} from '../actions.server';

// ============================================
// SCHEMA
// ============================================

// Tipos de titularidad disponibles (sin OWNED)
const availableTitularityTypes: VehicleTitularityType[] = ['LEASING', 'RENTAL', 'PLEDGED'];

const ownerSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  cuit: z.string().min(11, 'El CUIT debe tener al menos 11 caracteres'),
  titularityTypes: z.array(z.string()).min(1, 'Debe seleccionar al menos un tipo de titularidad'),
});

type OwnerFormData = z.infer<typeof ownerSchema>;

// ============================================
// PROPS
// ============================================

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  owner?: EquipmentOwnerListItem | null;
}

// ============================================
// COMPONENT
// ============================================

export function _EquipmentOwnerFormModal({ open, onOpenChange, owner }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isEditing = !!owner;

  const form = useForm<OwnerFormData>({
    resolver: zodResolver(ownerSchema),
    defaultValues: {
      name: '',
      cuit: '',
      titularityTypes: [],
    },
  });

  // Reset form cuando cambia owner o se abre el modal
  useEffect(() => {
    if (open) {
      form.reset({
        name: owner?.name ?? '',
        cuit: owner?.cuit ?? '',
        titularityTypes: owner?.titularityTypes.map((t) => t.titularityType) ?? [],
      });
    }
  }, [open, owner, form]);

  const createMutation = useMutation({
    mutationFn: createEquipmentOwner,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-owners'] });
      toast.success('Titular creado');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al crear titular');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: OwnerFormData) =>
      updateEquipmentOwner(owner!.id, {
        name: data.name,
        cuit: data.cuit,
        titularityTypes: data.titularityTypes as VehicleTitularityType[],
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-owners'] });
      toast.success('Titular actualizado');
      onOpenChange(false);
      router.refresh();
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Error al actualizar titular');
    },
  });

  const onSubmit = (data: OwnerFormData) => {
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate({
        name: data.name,
        cuit: data.cuit,
        titularityTypes: data.titularityTypes as VehicleTitularityType[],
      });
    }
  };

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]" data-testid="owner-form-modal">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle>{isEditing ? 'Editar Titular' : 'Nuevo Titular'}</DialogTitle>
              <DialogDescription>
                {isEditing
                  ? 'Modifica los datos del titular'
                  : 'Ingresa los datos del nuevo titular de equipos'}
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              {/* Nombre */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razon Social *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="Nombre o razon social del titular"
                        data-testid="owner-name-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CUIT */}
              <FormField
                control={form.control}
                name="cuit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CUIT *</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="XX-XXXXXXXX-X"
                        data-testid="owner-cuit-input"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tipos de Titularidad */}
              <FormField
                control={form.control}
                name="titularityTypes"
                render={() => (
                  <FormItem>
                    <FormLabel>Tipos de Titularidad *</FormLabel>
                    <FormDescription>
                      Selecciona los tipos de titularidad que ofrece este titular
                    </FormDescription>
                    <div className="space-y-2 mt-2">
                      {availableTitularityTypes.map((type) => (
                        <FormField
                          key={type}
                          control={form.control}
                          name="titularityTypes"
                          render={({ field }) => (
                            <FormItem className="flex items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(type)}
                                  onCheckedChange={(checked) => {
                                    const current = field.value || [];
                                    if (checked) {
                                      field.onChange([...current, type]);
                                    } else {
                                      field.onChange(current.filter((t) => t !== type));
                                    }
                                  }}
                                  data-testid={`owner-type-${type}`}
                                />
                              </FormControl>
                              <FormLabel className="font-normal cursor-pointer">
                                {vehicleTitularityTypeLabels[type]}
                              </FormLabel>
                            </FormItem>
                          )}
                        />
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                disabled={isPending}
                data-testid="owner-cancel-button"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isPending} data-testid="owner-submit-button">
                {isPending ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
