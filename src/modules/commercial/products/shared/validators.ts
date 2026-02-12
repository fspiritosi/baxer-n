import { z } from 'zod';
import { ProductType, ProductStatus } from '@/generated/prisma/enums';

// ============================================
// Helpers
// ============================================

/**
 * Helper para transformar strings vacíos a undefined (para campos opcionales)
 */
const emptyStringToUndefined = z
  .string()
  .optional()
  .transform((val) => (val === '' ? undefined : val));

/**
 * Helper para convertir strings a números (para inputs numéricos)
 */
const numberField = z.union([z.string(), z.number()]).pipe(z.coerce.number());

// ============================================
// Category Validators
// ============================================

export const createCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  description: emptyStringToUndefined.pipe(z.string().max(500).optional()),
  parentId: emptyStringToUndefined.pipe(z.string().uuid().optional()),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryFormData = z.infer<typeof createCategorySchema>;
export type UpdateCategoryFormData = z.infer<typeof updateCategorySchema>;

// ============================================
// Product Validators
// ============================================

export const createProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  description: emptyStringToUndefined.pipe(z.string().max(1000).optional()),
  type: z.nativeEnum(ProductType),
  categoryId: emptyStringToUndefined.pipe(z.string().uuid().optional()),
  unitOfMeasure: emptyStringToUndefined.pipe(z.string().max(20).optional()),
  costPrice: numberField.pipe(z.number().min(0, 'El precio de costo debe ser mayor o igual a 0')),
  salePrice: numberField.pipe(z.number().min(0, 'El precio de venta debe ser mayor o igual a 0')),
  vatRate: numberField.pipe(z.number().min(0).max(100)).optional(),
  trackStock: z.boolean().optional(),
  minStock: numberField.pipe(z.number().min(0)).optional().or(z.literal('')),
  maxStock: numberField.pipe(z.number().min(0)).optional().or(z.literal('')),
  barcode: emptyStringToUndefined.pipe(z.string().max(50).optional()),
  internalCode: emptyStringToUndefined.pipe(z.string().max(50).optional()),
  brand: emptyStringToUndefined.pipe(z.string().max(100).optional()),
  model: emptyStringToUndefined.pipe(z.string().max(100).optional()),
});

export const updateProductSchema = createProductSchema.partial().extend({
  status: z.nativeEnum(ProductStatus).optional(),
});

export type CreateProductFormData = z.infer<typeof createProductSchema>;
export type UpdateProductFormData = z.infer<typeof updateProductSchema>;

// ============================================
// Price List Validators
// ============================================

export const createPriceListSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  description: z.string().max(500).optional(),
  isDefault: z.boolean().optional(),
  isActive: z.boolean().optional(),
});

export const updatePriceListSchema = createPriceListSchema.partial();

export const createPriceListItemSchema = z.object({
  productId: z.string().uuid('Debe seleccionar un producto'),
  price: numberField.pipe(z.number().min(0, 'El precio debe ser mayor o igual a 0')),
});

export const updatePriceListItemSchema = z.object({
  price: numberField.pipe(z.number().min(0, 'El precio debe ser mayor o igual a 0')),
});

export type CreatePriceListFormData = z.infer<typeof createPriceListSchema>;
export type UpdatePriceListFormData = z.infer<typeof updatePriceListSchema>;
export type CreatePriceListItemFormData = z.infer<typeof createPriceListItemSchema>;
export type UpdatePriceListItemFormData = z.infer<typeof updatePriceListItemSchema>;
