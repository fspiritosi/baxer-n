import { z } from 'zod';

export const createCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  description: z.string().max(500).optional(),
  parentId: z.string().uuid().optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>;
