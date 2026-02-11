import { z } from 'zod';
import { invoiceFormSchema, createInvoiceSchema, invoiceLineSchema } from './validators';

// Tipos inferidos desde Zod
export type InvoiceFormData = z.infer<typeof invoiceFormSchema>;
export type CreateInvoiceInput = z.infer<typeof createInvoiceSchema>;
export type InvoiceLineInput = z.infer<typeof invoiceLineSchema>;

// Tipo para cálculos de línea
export interface InvoiceLineCalculation {
  quantity: number;
  unitPrice: number;
  vatRate: number;
  subtotal: number;
  vatAmount: number;
  total: number;
}

// Tipo para totales de factura
export interface InvoiceTotals {
  subtotal: number;
  vatAmount: number;
  otherTaxes: number;
  total: number;
}
