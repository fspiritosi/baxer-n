import { z } from 'zod';

// Schema para ajuste de stock (entrada/salida manual)
export const stockAdjustmentSchema = z.object({
  warehouseId: z.string().uuid('Almacén inválido'),
  productId: z.string().uuid('Producto inválido'),
  quantity: z
    .string()
    .min(1, 'La cantidad es requerida')
    .regex(/^-?\d+(\.\d{1,3})?$/, 'Cantidad inválida (máximo 3 decimales)')
    .refine((val) => parseFloat(val) !== 0, 'La cantidad no puede ser 0'),
  reason: z.enum(['ENTRY', 'EXIT', 'LOSS'], {
    message: 'Debe seleccionar un motivo',
  }),
  notes: z.string().min(1, 'Las notas son requeridas'),
  date: z.date({ message: 'La fecha es requerida' }),
});

// Schema para transferencia entre almacenes
export const stockTransferSchema = z.object({
  sourceWarehouseId: z.string().uuid('Almacén de origen inválido'),
  destinationWarehouseId: z.string().uuid('Almacén de destino inválido'),
  productId: z.string().uuid('Producto inválido'),
  quantity: z
    .string()
    .min(1, 'La cantidad es requerida')
    .regex(/^\d+(\.\d{1,3})?$/, 'Cantidad inválida (máximo 3 decimales)')
    .refine((val) => parseFloat(val) > 0, 'La cantidad debe ser positiva'),
  notes: z.string().optional(),
  date: z.date({ message: 'La fecha es requerida' }),
}).refine((data) => data.sourceWarehouseId !== data.destinationWarehouseId, {
  message: 'El almacén de origen y destino deben ser diferentes',
  path: ['destinationWarehouseId'],
});

// Labels para motivos de ajuste
export const ADJUSTMENT_REASON_LABELS = {
  ENTRY: 'Entrada (Inventario inicial, Devolución, etc.)',
  EXIT: 'Salida (Consumo interno, Muestra, etc.)',
  LOSS: 'Pérdida/Merma (Rotura, Vencimiento, etc.)',
} as const;
