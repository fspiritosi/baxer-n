import { z } from 'zod';
import { SupplierTaxCondition, SupplierStatus } from '@/generated/prisma/enums';


export const createSupplierSchema = z.object({
  businessName: z.string().min(1, 'La razón social es requerida').max(200),
  tradeName: z.string().max(200).optional(),
  taxId: z
    .string()
    .min(1, 'El CUIT/CUIL es requerido')
    .regex(/^\d{2}-?\d{8}-?\d{1}$/, 'Formato de CUIT inválido (XX-XXXXXXXX-X)'),
  taxCondition: z.nativeEnum(SupplierTaxCondition),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  phone: z.string().max(50).optional(),
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  address: z.string().max(200).optional(),
  city: z.string().max(100).optional(),
  state: z.string().max(100).optional(),
  zipCode: z.string().max(20).optional(),
  country: z.string().max(100).optional(),
  paymentTermDays: z.coerce.number().int().min(0).max(365).optional(),
  creditLimit: z.coerce.number().min(0).optional(),
  contactName: z.string().max(100).optional(),
  contactPhone: z.string().max(50).optional(),
  contactEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  notes: z.string().max(1000).optional(),
});

export const updateSupplierSchema = createSupplierSchema.partial().extend({
  status: z.nativeEnum(SupplierStatus).optional(),
});

export type CreateSupplierFormData = z.infer<typeof createSupplierSchema>;
export type UpdateSupplierFormData = z.infer<typeof updateSupplierSchema>;
