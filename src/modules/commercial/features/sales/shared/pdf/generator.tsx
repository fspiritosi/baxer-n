/**
 * Generador de PDFs de facturas
 */

import { renderToBuffer } from '@react-pdf/renderer';
import { InvoiceTemplate } from './InvoiceTemplate';
import type { InvoicePDFData } from './types';

/**
 * Genera un PDF de factura y lo retorna como Buffer
 */
export async function generateInvoicePDF(data: InvoicePDFData): Promise<Buffer> {
  try {
    const buffer = await renderToBuffer(<InvoiceTemplate data={data} />);
    return buffer;
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw new Error('Error al generar el PDF de la factura');
  }
}

/**
 * Genera el nombre de archivo para el PDF
 */
export function getInvoiceFileName(data: InvoicePDFData): string {
  const type = data.invoice.voucherType
    .replace(/\s+/g, '_')
    .replace(/[^a-zA-Z0-9_]/g, '');
  const number = data.invoice.fullNumber.replace('-', '_');
  const date = new Date().toISOString().split('T')[0];

  return `${type}_${number}_${date}.pdf`;
}
