import { z } from 'zod';
import { RecurringFrequency } from '@/generated/prisma/enums';

export const recurringEntryLineSchema = z.object({
  accountId: z.string().uuid('Debe seleccionar una cuenta'),
  description: z.string().optional(),
  debit: z.coerce.number().min(0, 'Debe ser positivo'),
  credit: z.coerce.number().min(0, 'Debe ser positivo'),
});

export const recurringEntrySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().min(1, 'La descripción es requerida'),
  frequency: z.nativeEnum(RecurringFrequency),
  startDate: z.coerce.date(),
  endDate: z.coerce.date().optional().nullable(),
  lines: z.array(recurringEntryLineSchema)
    .min(2, 'Mínimo 2 líneas')
    .refine(
      (lines) => {
        const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0);
        const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0);
        return Math.abs(totalDebit - totalCredit) < 0.01;
      },
      { message: 'El asiento debe estar balanceado (Debe = Haber)' }
    )
    .refine(
      (lines) => lines.every(l => (l.debit > 0 && l.credit === 0) || (l.credit > 0 && l.debit === 0)),
      { message: 'Cada línea debe tener solo Debe o solo Haber' }
    ),
});

export type RecurringEntryFormValues = z.infer<typeof recurringEntrySchema>;
