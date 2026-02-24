/**
 * Generador de PDFs de Remitos de Recepción
 */

import { renderToBuffer } from '@react-pdf/renderer';
import { ReceivingNoteTemplate } from './ReceivingNoteTemplate';
import type { ReceivingNotePDFData } from './types';

/**
 * Genera un PDF de remito de recepción y lo retorna como Buffer
 */
export async function generateReceivingNotePDF(data: ReceivingNotePDFData): Promise<Buffer> {
  try {
    const buffer = await renderToBuffer(<ReceivingNoteTemplate data={data} />);
    return buffer;
  } catch (error) {
    throw new Error('Error al generar el PDF del remito de recepción');
  }
}

/**
 * Genera el nombre de archivo para el PDF
 */
export function getReceivingNoteFileName(data: ReceivingNotePDFData): string {
  const number = data.receivingNote.fullNumber.replace('-', '_');
  const date = new Date().toISOString().split('T')[0];

  return `Remito_Recepcion_${number}_${date}.pdf`;
}
