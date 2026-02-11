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
import { Textarea } from '@/shared/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import {
  createCategorySchema,
  type CreateCategoryFormData,
} from '../../shared/validators';
import { createCategory, updateCategory, getParentCategories } from '../../list/actions.server';
import type { ProductCategory } from '../../shared/types';
import { useQuery } from '@tanstack/react-query';

interface CategoryFormProps {
  defaultValues?: Partial<CreateCategoryFormData>;
  categoryId?: string;
  onSubmit?: (data: CreateCategoryFormData) => Promise<void>;
}

export function CategoryForm({
  defaultValues,
  categoryId,
  onSubmit,
}: CategoryFormProps) {
  const router = useRouter();
  const isEditing = Boolean(categoryId);

  const { data: categories = [] } = useQuery({
    queryKey: ['parent-categories'],
    queryFn: () => getParentCategories(),
  });

  const form = useForm<CreateCategoryFormData>({
    resolver: zodResolver(createCategorySchema),
    defaultValues: defaultValues || {
      name: '',
      description: '',
      parentId: undefined,
    },
  });

  const handleSubmit = async (data: CreateCategoryFormData) => {
    try {
      if (onSubmit) {
        await onSubmit(data);
      } else {
        await createCategory(data);
      }

      toast.success(
        isEditing
          ? 'Categoría actualizada correctamente'
          : 'Categoría creada correctamente'
      );

      router.push('/dashboard/commercial/categories');
      router.refresh();
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : 'Error al guardar la categoría'
      );
    }
  };

  // Filter out current category and its descendants from parent options
  const availableParents = categoryId
    ? categories.filter(cat => cat.id !== categoryId)
    : categories;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl>
                <Input placeholder="Electrónica, Ropa, etc." {...field} />
              </FormControl>
              <FormDescription>
                Nombre de la categoría (máx. 100 caracteres)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descripción (opcional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descripción de la categoría..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Breve descripción de la categoría (máx. 500 caracteres)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Parent Category */}
        <FormField
          control={form.control}
          name="parentId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoría Padre (opcional)</FormLabel>
              <Select
                onValueChange={field.onChange}
                value={field.value || undefined}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sin categoría padre (raíz)" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {availableParents.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormDescription>
                Selecciona una categoría padre para crear una subcategoría
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

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
