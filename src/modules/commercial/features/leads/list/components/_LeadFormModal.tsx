'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery } from '@tanstack/react-query';
import { UserPlus, Users } from 'lucide-react';
import { useEffect, useState } from 'react';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Separator } from '@/shared/components/ui/separator';
import { Textarea } from '@/shared/components/ui/textarea';
import { ToggleGroup, ToggleGroupItem } from '@/shared/components/ui/toggle-group';
import {
  createLead,
  getAvailableContactsForLead,
  updateLead,
  type LeadListItem,
} from '../actions.server';

const formSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  taxId: z.string().optional(),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().optional(),
  address: z.string().optional(),
  notes: z.string().optional(),
  // Contacto - selector o inline
  contactId: z.string().optional(),
  // Contacto inline
  contactFirstName: z.string().optional(),
  contactLastName: z.string().optional(),
  contactEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  contactPhone: z.string().optional(),
  contactPosition: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: LeadListItem | null;
  onSuccess: () => void;
}

export function _LeadFormModal({ open, onOpenChange, lead, onSuccess }: Props) {
  const isEditing = !!lead;
  const currentContactId = lead?.contact?.id;

  // Estado para controlar si se selecciona contacto existente o se crea nuevo
  const [contactMode, setContactMode] = useState<'none' | 'existing' | 'new'>('none');

  // Query para obtener contactos disponibles (incluye el contacto actual si existe)
  const { data: availableContacts = [] } = useQuery({
    queryKey: ['availableContactsForLead', currentContactId],
    queryFn: () => getAvailableContactsForLead(currentContactId),
    enabled: open,
  });

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      taxId: '',
      email: '',
      phone: '',
      address: '',
      notes: '',
      contactId: '',
      contactFirstName: '',
      contactLastName: '',
      contactEmail: '',
      contactPhone: '',
      contactPosition: '',
    },
  });

  // Reset form cuando cambia el lead o se abre el modal
  useEffect(() => {
    if (open) {
      const hasContact = !!lead?.contact;
      form.reset({
        name: lead?.name || '',
        taxId: lead?.taxId || '',
        email: lead?.email || '',
        phone: lead?.phone || '',
        address: lead?.address || '',
        notes: lead?.notes || '',
        // Si tiene contacto existente, seteamos su ID
        contactId: hasContact ? lead!.contact!.id : '',
        contactFirstName: lead?.contact?.firstName || '',
        contactLastName: lead?.contact?.lastName || '',
        contactEmail: lead?.contact?.email || '',
        contactPhone: lead?.contact?.phone || '',
        contactPosition: lead?.contact?.position || '',
      });
      // Si tiene contacto, el modo es 'existing' para mostrarlo en el select
      setContactMode(hasContact ? 'existing' : 'none');
    }
  }, [open, lead, form]);

  const handleOpenChange = (isOpen: boolean) => {
    onOpenChange(isOpen);
  };

  const onSubmit = async (data: FormData) => {
    try {
      const baseInput = {
        name: data.name,
        taxId: data.taxId || undefined,
        email: data.email || undefined,
        phone: data.phone || undefined,
        address: data.address || undefined,
        notes: data.notes || undefined,
      };

      let input;

      if (contactMode === 'existing' && data.contactId) {
        // Vincular contacto existente
        input = { ...baseInput, contactId: data.contactId };
      } else if (contactMode === 'new' && data.contactFirstName && data.contactLastName) {
        // Crear contacto nuevo inline
        input = {
          ...baseInput,
          contact: {
            firstName: data.contactFirstName,
            lastName: data.contactLastName,
            email: data.contactEmail || undefined,
            phone: data.contactPhone || undefined,
            position: data.contactPosition || undefined,
          },
        };
      } else {
        // Sin contacto
        input = baseInput;
      }

      if (isEditing) {
        await updateLead(lead.id, input);
        toast.success('Lead actualizado exitosamente');
      } else {
        await createLead(input);
        toast.success('Lead creado exitosamente');
      }

      onSuccess();
      handleOpenChange(false);
    } catch {
      toast.error(isEditing ? 'Error al actualizar el lead' : 'Error al crear el lead');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Lead' : 'Nuevo Lead'}</DialogTitle>
          <DialogDescription>
            {isEditing
              ? 'Modifica los datos del lead'
              : 'Completa los datos para registrar un nuevo lead'}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Datos de la empresa */}
            <div className="space-y-4">
              <h4 className="text-sm font-medium">Datos de la empresa</h4>

              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razón Social *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre de la empresa" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="taxId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>CUIT</FormLabel>
                      <FormControl>
                        <Input placeholder="XX-XXXXXXXX-X" {...field} />
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
              </div>

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

              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notas</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Notas adicionales sobre el lead..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator />

            {/* Contacto principal */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Contacto principal</h4>
              </div>

              {/* Toggle para elegir modo de contacto */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">
                  ¿Cómo deseas asignar el contacto?
                </Label>
                <ToggleGroup
                  type="single"
                  value={contactMode}
                  onValueChange={(value) => {
                    if (value) setContactMode(value as 'none' | 'existing' | 'new');
                  }}
                  className="justify-start"
                >
                  <ToggleGroupItem value="none" aria-label="Sin contacto" className="gap-1.5">
                    Sin contacto
                  </ToggleGroupItem>
                  {availableContacts.length > 0 && (
                    <ToggleGroupItem
                      value="existing"
                      aria-label="Seleccionar existente"
                      className="gap-1.5"
                    >
                      <Users className="h-4 w-4" />
                      Existente
                    </ToggleGroupItem>
                  )}
                  <ToggleGroupItem value="new" aria-label="Crear nuevo" className="gap-1.5">
                    <UserPlus className="h-4 w-4" />
                    Nuevo
                  </ToggleGroupItem>
                </ToggleGroup>
              </div>

              {/* Selector de contacto existente */}
              {contactMode === 'existing' && (
                <FormField
                  control={form.control}
                  name="contactId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Seleccionar contacto</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-auto min-h-10 py-2">
                            <SelectValue placeholder="Selecciona un contacto disponible" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {availableContacts.map((contact) => (
                            <SelectItem key={contact.id} value={contact.id}>
                              <div className="flex flex-col py-0.5">
                                <span className="font-medium">
                                  {contact.firstName} {contact.lastName}
                                </span>
                                {contact.email && (
                                  <span className="text-xs text-muted-foreground">
                                    {contact.email}
                                  </span>
                                )}
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Campos para crear nuevo contacto */}
              {contactMode === 'new' && (
                <>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="contactFirstName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nombre</FormLabel>
                          <FormControl>
                            <Input placeholder="Juan" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactLastName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Apellido</FormLabel>
                          <FormControl>
                            <Input placeholder="Pérez" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormField
                      control={form.control}
                      name="contactEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email del contacto</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="contacto@empresa.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="contactPhone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Teléfono del contacto</FormLabel>
                          <FormControl>
                            <Input placeholder="+54 XXX XXX-XXXX" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={form.control}
                    name="contactPosition"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cargo</FormLabel>
                        <FormControl>
                          <Input placeholder="Gerente de Compras" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </>
              )}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting
                  ? 'Guardando...'
                  : isEditing
                    ? 'Guardar cambios'
                    : 'Crear lead'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
