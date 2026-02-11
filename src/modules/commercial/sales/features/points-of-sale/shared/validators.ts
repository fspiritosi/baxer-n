import { z } from 'zod';

// Schema para formulario React Hook Form (entrada)
export const pointOfSaleFormSchema = z.object({
  number: z
    .string()
    .min(1, 'El número es requerido')
    .regex(/^\d+$/, 'Debe ser un número válido'),
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
  isActive: z.boolean(),
  afipEnabled: z.boolean(),
});

// Schema para validación en server con transformación
export const createPointOfSaleSchema = z.object({
  number: z
    .string()
    .min(1, 'El número es requerido')
    .regex(/^\d+$/, 'Debe ser un número')
    .transform(Number)
    .pipe(
      z
        .number()
        .int()
        .min(1, 'El número debe ser mayor a 0')
        .max(9999, 'El número no puede exceder 9999')
    ),
  name: z.string().min(1, 'El nombre es requerido').max(100, 'El nombre es muy largo'),
  isActive: z.boolean().default(true),
  afipEnabled: z.boolean().default(false),
});
