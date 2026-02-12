import { z } from 'zod';
import { WarehouseType, StockMovementType } from '@/generated/prisma/enums';

// ============================================
// Warehouse Validators
// ============================================

export const createWarehouseSchema = z.object({
  code: z.string().min(1, 'El código es requerido').max(20),
  name: z.string().min(1, 'El nombre es requerido').max(100),
  type: z.nativeEnum(WarehouseType).optional(),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  isActive: z.boolean().optional(),
});

export const updateWarehouseSchema = createWarehouseSchema.partial();

export type CreateWarehouseFormData = z.infer<typeof createWarehouseSchema>;
export type UpdateWarehouseFormData = z.infer<typeof updateWarehouseSchema>;

// ============================================
// Stock Movement Validators
// ============================================

export const createStockMovementSchema = z.object({
  warehouseId: z.string().uuid('Debe seleccionar un almacén'),
  productId: z.string().uuid('Debe seleccionar un producto'),
  type: z.nativeEnum(StockMovementType),
  quantity: z.coerce
    .number()
    .positive('La cantidad debe ser mayor a 0'),
  referenceType: z.string().max(50).optional(),
  referenceId: z.string().uuid().optional(),
  notes: z.string().max(500).optional(),
  date: z.coerce.date().optional(),
});

export type CreateStockMovementFormData = z.infer<typeof createStockMovementSchema>;

// ============================================
// Stock Adjustment Validators
// ============================================

export const stockAdjustmentSchema = z.object({
  warehouseId: z.string().uuid('Debe seleccionar un almacén'),
  productId: z.string().uuid('Debe seleccionar un producto'),
  newQuantity: z.coerce
    .number()
    .min(0, 'La cantidad debe ser mayor o igual a 0'),
  notes: z.string().max(500).optional(),
});

export type StockAdjustmentFormData = z.infer<typeof stockAdjustmentSchema>;

// ============================================
// Stock Transfer Validators
// ============================================

export const stockTransferSchema = z.object({
  fromWarehouseId: z.string().uuid('Debe seleccionar almacén origen'),
  toWarehouseId: z.string().uuid('Debe seleccionar almacén destino'),
  productId: z.string().uuid('Debe seleccionar un producto'),
  quantity: z.coerce
    .number()
    .positive('La cantidad debe ser mayor a 0'),
  notes: z.string().max(500).optional(),
}).refine(
  (data) => data.fromWarehouseId !== data.toWarehouseId,
  {
    message: 'El almacén origen y destino no pueden ser el mismo',
    path: ['toWarehouseId'],
  }
);

export type StockTransferFormData = z.infer<typeof stockTransferSchema>;
