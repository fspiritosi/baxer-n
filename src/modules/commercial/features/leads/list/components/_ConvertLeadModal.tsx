'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { z } from 'zod';
import { ArrowRight, Building2 } from 'lucide-react';

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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { convertLeadToClient, type LeadListItem } from '../actions.server';

const formSchema = z.object({
  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: LeadListItem | null;
  onSuccess: () => void;
}

export function _ConvertLeadModal({ open, onOpenChange, lead, onSuccess }: Props) {
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: lead?.address || '',
      phone: lead?.phone || '',
      email: lead?.email || '',
    },
  });

  const onSubmit = async (data: FormData) => {
    if (!lead) return;

    try {
      await convertLeadToClient(lead.id, {
        address: data.address || undefined,
        phone: data.phone || undefined,
        email: data.email || undefined,
      });

      toast.success('Lead convertido a cliente exitosamente');
      onSuccess();
      onOpenChange(false);
      form.reset();
    } catch (error) {
      toast.error('Error al convertir el lead');
    }
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Convertir Lead a Cliente</DialogTitle>
          <DialogDescription>
            El lead será convertido a cliente. Puedes completar o modificar los datos antes de convertir.
          </DialogDescription>
        </DialogHeader>

        {/* Resumen del lead */}
        <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Building2 className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <p className="font-medium">{lead.name}</p>
            {lead.taxId && <p className="text-sm text-muted-foreground">CUIT: {lead.taxId}</p>}
          </div>
          <ArrowRight className="h-5 w-5 text-muted-foreground" />
          <div className="text-sm font-medium text-primary">Cliente</div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="email@empresa.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Teléfono</FormLabel>
                  <FormControl>
                    <Input placeholder="+54 XXX XXX-XXXX" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Dirección</FormLabel>
                  <FormControl>
                    <Input placeholder="Dirección completa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Convirtiendo...' : 'Convertir a Cliente'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
