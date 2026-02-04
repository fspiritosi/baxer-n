'use client';

import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

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
import { Button } from '@/shared/components/ui/button';
import { Switch } from '@/shared/components/ui/switch';
import { ScrollArea } from '@/shared/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

import { _PermissionsMatrix } from './_PermissionsMatrix';
import {
  createRole,
  updateRole,
  type RoleListItem,
  type SystemAction,
  type PermissionsConfig,
} from '../actions.server';

const roleSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional(),
  color: z.string().optional(),
  isDefault: z.boolean(),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: RoleListItem | null;
  systemActions: SystemAction[];
  permissionsConfig: PermissionsConfig;
  onSuccess: () => void;
}

export function _RoleFormModal({
  open,
  onOpenChange,
  role,
  systemActions,
  permissionsConfig,
  onSuccess,
}: Props) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<
    Array<{ module: string; actionId: string }>
  >([]);

  const isEditing = !!role;
  const isSystemRole = role?.isSystem ?? false;

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: {
      name: '',
      description: '',
      color: '#6366f1',
      isDefault: false,
    },
  });

  // Inicializar permisos del rol existente
  useEffect(() => {
    if (role) {
      form.reset({
        name: role.name,
        description: role.description ?? '',
        color: role.color ?? '#6366f1',
        isDefault: role.isDefault,
      });

      // Mapear permisos existentes
      const permissions = role.permissions.map((p) => ({
        module: p.module,
        actionId: p.action.id,
      }));
      setSelectedPermissions(permissions);
    } else {
      form.reset({
        name: '',
        description: '',
        color: '#6366f1',
        isDefault: false,
      });
      setSelectedPermissions([]);
    }
  }, [role, form]);

  const handlePermissionChange = (module: string, actionId: string, checked: boolean) => {
    setSelectedPermissions((prev) => {
      if (checked) {
        return [...prev, { module, actionId }];
      }
      return prev.filter((p) => !(p.module === module && p.actionId === actionId));
    });
  };

  const handleSubmit = async (data: RoleFormData) => {
    setIsSubmitting(true);
    try {
      if (isEditing && role) {
        await updateRole(role.id, {
          ...data,
          permissions: selectedPermissions,
        });
        toast.success('Rol actualizado');
      } else {
        await createRole({
          ...data,
          permissions: selectedPermissions,
        });
        toast.success('Rol creado');
      }
      onOpenChange(false);
      onSuccess();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al guardar rol');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Colores predefinidos
  const presetColors = [
    '#ef4444', // red
    '#f97316', // orange
    '#f59e0b', // amber
    '#84cc16', // lime
    '#22c55e', // green
    '#14b8a6', // teal
    '#06b6d4', // cyan
    '#3b82f6', // blue
    '#6366f1', // indigo
    '#8b5cf6', // violet
    '#a855f7', // purple
    '#ec4899', // pink
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-5xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle>
            {isEditing
              ? isSystemRole
                ? `Ver Rol: ${role.name}`
                : `Editar Rol: ${role.name}`
              : 'Nuevo Rol'}
          </DialogTitle>
          <DialogDescription>
            {isSystemRole
              ? 'Los roles de sistema no se pueden modificar, pero puedes ver sus permisos.'
              : 'Configura el nombre y los permisos del rol.'}
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="info" className="flex-1">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="info">Información</TabsTrigger>
            <TabsTrigger value="permissions">Permisos</TabsTrigger>
          </TabsList>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)}>
              <TabsContent value="info" className="space-y-4 mt-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Administrador, Operador, etc."
                          disabled={isSystemRole}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe las responsabilidades de este rol..."
                          disabled={isSystemRole}
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Color</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-8 w-8 rounded border"
                            style={{ backgroundColor: field.value }}
                          />
                          <div className="flex gap-1 flex-wrap">
                            {presetColors.map((color) => (
                              <button
                                key={color}
                                type="button"
                                disabled={isSystemRole}
                                className="h-6 w-6 rounded border hover:scale-110 transition-transform disabled:opacity-50"
                                style={{ backgroundColor: color }}
                                onClick={() => field.onChange(color)}
                              />
                            ))}
                          </div>
                        </div>
                      </FormControl>
                      <FormDescription>
                        Color para identificar el rol en la interfaz
                      </FormDescription>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isDefault"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                      <div className="space-y-0.5">
                        <FormLabel>Rol por defecto</FormLabel>
                        <FormDescription>
                          Se asignará automáticamente a los nuevos usuarios invitados
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                          disabled={isSystemRole}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </TabsContent>

              <TabsContent value="permissions" className="mt-4">
                <ScrollArea className="h-[400px] pr-4">
                  <_PermissionsMatrix
                    systemActions={systemActions}
                    permissionsConfig={permissionsConfig}
                    selectedPermissions={selectedPermissions}
                    onPermissionChange={handlePermissionChange}
                    disabled={isSystemRole}
                  />
                </ScrollArea>
              </TabsContent>

              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                >
                  {isSystemRole ? 'Cerrar' : 'Cancelar'}
                </Button>
                {!isSystemRole && (
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    {isEditing ? 'Guardar' : 'Crear Rol'}
                  </Button>
                )}
              </DialogFooter>
            </form>
          </Form>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
