'use client';

import { Button } from '@/shared/components/ui/button';
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Switch } from '@/shared/components/ui/switch';
import { zodResolver } from '@hookform/resolvers/zod';
import { WarehouseType } from '@/generated/prisma/enums';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  createWarehouseSchema,
  type CreateWarehouseFormData,
} from '../../../shared/validators';
import { createWarehouse } from '../../list/actions.server';
import { WAREHOUSE_TYPE_LABELS } from '../../../shared/types';

interface WarehouseFormProps {
  defaultValues?: Partial<CreateWarehouseFormData>;
  warehouseId?: string;
  onSubmit?: (data: CreateWarehouseFormData) => Promise<void>;
}

export function WarehouseForm({
  defaultValues,
  warehouseId,
  onSubmit,
}: WarehouseFormProps) {
  const router = useRouter();
  const isEditing = Boolean(warehouseId);

  const form = useForm<CreateWarehouseFormData>({
    resolver: zodResolver(createWarehouseSchema),
    defaultValues: defaultValues || {
      code: '',
      name: '',
      type: WarehouseType.MAIN,
      address: '',
      city: '',
      state: '',
      isActive: true,
    },
  });

  const handleSubmit = async (data: CreateWarehouseFormData) => {
    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        await createWarehouse(data);
      }

      toast.success(
        isEditing
          ? 'Almacén actualizado correctamente'
          : 'Almacén creado correctamente'
      );

      router.push('/dashboard/commercial/warehouses');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al guardar el almacén'
      );
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          {/* Código */}
          <FormField
            control={form.control}
            name="code"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input
                    placeholder="ALM-01"
                    {...field}
                    disabled={isEditing}
                  />
                </FormControl>
                <FormDescription>
                  {isEditing
                    ? 'El código no puede modificarse'
                    : 'Código único del almacén (máx. 20 caracteres)'}
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Nombre */}
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Almacén Principal" {...field} />
                </FormControl>
                <FormDescription>
                  Nombre descriptivo del almacén (máx. 100 caracteres)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Tipo */}
          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona un tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {Object.entries(WAREHOUSE_TYPE_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormDescription>
                  Tipo de almacén según su función
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Estado Activo */}
          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                <div className="space-y-0.5">
                  <FormLabel className="text-base">Activo</FormLabel>
                  <FormDescription>
                    El almacén está disponible para operaciones
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        {/* Ubicación */}
        <div className="space-y-4">
          <h3 className="text-lg font-medium">Ubicación (opcional)</h3>
          <div className="grid gap-6 md:grid-cols-3">
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="md:col-span-3">
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Calle y número"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="city"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ciudad</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Ciudad"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="state"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Provincia/Estado</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Provincia"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? 'Guardando...'
              : isEditing
                ? 'Actualizar'
                : 'Crear'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
