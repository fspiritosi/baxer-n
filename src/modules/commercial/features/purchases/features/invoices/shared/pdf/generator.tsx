/**
 * Generador de PDFs de facturas de compra
 */

import { renderToBuffer } from '@react-pdf/renderer';
import { PurchaseInvoiceTemplate } from './PurchaseInvoiceTemplate';
import type { PurchaseInvoicePDFData } from './types';
import { logger } from '@/shared/lib/logger';

export async function generatePurchaseInvoicePDF(data: PurchaseInvoicePDFData): Promise<Buffer> {
  try {
    const buffer = await renderToBuffer(<PurchaseInvoiceTemplate data={data} />);
    return buffer;
  } catch (error) {
    logger.error('Error generando PDF de factura de compra', { data: { error } });
    throw new Error('Error al generar el PDF de la factura de compra');
  }
}

export function getPurchaseInvoiceFileName(data: PurchaseInvoicePDFData): string {
  const type = data.invoice.voucherType
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '');
  const number = data.invoice.fullNumber.replace('-', '_');
  const date = new Date().toISOString().split('T')[0];

  return `${type}_${number}_${date}.pdf`;
}
