/**
 * Generador de PDFs de Recibos de Cobro
 */

import { renderToBuffer } from '@react-pdf/renderer';
import { ReceiptTemplate } from './ReceiptTemplate';
import type { ReceiptPDFData } from './types';

/**
 * Genera un PDF de recibo de cobro y lo retorna como Buffer
 */
export async function generateReceiptPDF(data: ReceiptPDFData): Promise<Buffer> {
  try {
    const buffer = await renderToBuffer(<ReceiptTemplate data={data} />);
    return buffer;
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw new Error('Error al generar el PDF del recibo de cobro');
  }
}

/**
 * Genera el nombre de archivo para el PDF
 */
export function getReceiptFileName(data: ReceiptPDFData): string {
  const number = data.receipt.fullNumber.replace('-', '_');
  const date = new Date().toISOString().split('T')[0];

  return `Recibo_Cobro_${number}_${date}.pdf`;
}
