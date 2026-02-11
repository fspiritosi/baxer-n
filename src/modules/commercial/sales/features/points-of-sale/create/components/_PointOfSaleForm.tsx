'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
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
import { Switch } from '@/shared/components/ui/switch';
import { createPointOfSale, updatePointOfSale } from '../../list/actions.server';
import { pointOfSaleFormSchema } from '../../shared/validators';
import { z } from 'zod';

type FormInput = z.infer<typeof pointOfSaleFormSchema>;

interface PointOfSaleFormProps {
  pointOfSale?: {
    id: string;
    number: number;
    name: string;
    isActive: boolean;
    afipEnabled: boolean;
  };
}

export function PointOfSaleForm({ pointOfSale }: PointOfSaleFormProps) {
  const router = useRouter();
  const isEditing = Boolean(pointOfSale);

  const form = useForm<FormInput>({
    resolver: zodResolver(pointOfSaleFormSchema),
    defaultValues: {
      number: pointOfSale?.number.toString() || '',
      name: pointOfSale?.name || '',
      isActive: pointOfSale?.isActive ?? true,
      afipEnabled: pointOfSale?.afipEnabled ?? false,
    },
  });

  const onSubmit = async (data: FormInput) => {
    try {
      if (isEditing && pointOfSale) {
        await updatePointOfSale(pointOfSale.id, data);
        toast.success('Punto de venta actualizado correctamente');
      } else {
        await createPointOfSale(data);
        toast.success('Punto de venta creado correctamente');
      }
      router.push('/dashboard/commercial/points-of-sale');
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Ocurrió un error');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <FormField
            control={form.control}
            name="number"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Número de Punto de Venta</FormLabel>
                <FormControl>
                  <Input
                    placeholder="0001"
                    {...field}
                    disabled={isEditing}
                    className="font-mono"
                  />
                </FormControl>
                <FormDescription>
                  Número asignado por AFIP (ej: 0001, 0002). No se puede modificar una vez creado.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre</FormLabel>
                <FormControl>
                  <Input placeholder="Sucursal Centro" {...field} />
                </FormControl>
                <FormDescription>
                  Nombre descriptivo del punto de venta (ej: Sucursal Centro, Mostrador 1).
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4 rounded-lg border p-4">
          <h3 className="text-sm font-medium">Configuración</h3>

          <FormField
            control={form.control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Punto de Venta Activo</FormLabel>
                  <FormDescription>
                    Solo los puntos de venta activos pueden emitir facturas
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="afipEnabled"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                <div className="space-y-0.5">
                  <FormLabel>Habilitado en AFIP</FormLabel>
                  <FormDescription>
                    Indica si el punto de venta está habilitado para facturación electrónica AFIP
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/dashboard/commercial/points-of-sale')}
          >
            Cancelar
          </Button>
          <Button type="submit" disabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting
              ? isEditing
                ? 'Actualizando...'
                : 'Creando...'
              : isEditing
                ? 'Actualizar Punto de Venta'
                : 'Crear Punto de Venta'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
