'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
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
import { Textarea } from '@/shared/components/ui/textarea';

import { openCashSession } from '../../../sessions/actions.server';
import { openSessionSchema, type OpenSessionFormData } from '../../../../shared/validators';
import type { CashRegisterWithActiveSession } from '../../../../shared/types';

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  cashRegister: CashRegisterWithActiveSession;
  onSuccess: () => void;
}

export function _OpenSessionModal({ open, onOpenChange, cashRegister, onSuccess }: Props) {
  const form = useForm<OpenSessionFormData>({
    resolver: zodResolver(openSessionSchema),
    defaultValues: {
      cashRegisterId: cashRegister.id,
      openingBalance: '0.00',
      openingNotes: '',
    },
  });

  // Resetear form cuando cambia el modal
  useEffect(() => {
    if (open) {
      form.reset({
        cashRegisterId: cashRegister.id,
        openingBalance: '0.00',
        openingNotes: '',
      });
    }
  }, [open, cashRegister.id, form]);

  const onSubmit = async (data: OpenSessionFormData) => {
    try {
      await openCashSession(data);
      toast.success('Sesión abierta correctamente');
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al abrir sesión');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Abrir Sesión de Caja</DialogTitle>
          <DialogDescription>
            Abriendo sesión para {cashRegister.name} ({cashRegister.code})
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="openingBalance"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Saldo Inicial *</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">$</span>
                      <Input
                        type="text"
                        placeholder="0.00"
                        {...field}
                        value={field.value || ''}
                        className="pl-7"
                        onChange={(e) => {
                          // Solo permitir números y punto decimal
                          const value = e.target.value.replace(/[^0-9.]/g, '');
                          // Asegurar máximo 2 decimales
                          const parts = value.split('.');
                          if (parts.length > 2) return;
                          if (parts[1] && parts[1].length > 2) return;
                          field.onChange(value);
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormDescription>Monto en efectivo con el que inicia la sesión</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="openingNotes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas de Apertura</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Observaciones sobre la apertura (opcional)"
                      {...field}
                      value={field.value || ''}
                      rows={3}
                    />
                  </FormControl>
                  <FormDescription>Observaciones o comentarios sobre la apertura</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Abriendo...' : 'Abrir Sesión'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
