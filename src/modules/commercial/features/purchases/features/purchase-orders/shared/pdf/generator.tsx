/**
 * Generador de PDFs de Órdenes de Compra
 */

import { renderToBuffer } from '@react-pdf/renderer';
import { PurchaseOrderTemplate } from './PurchaseOrderTemplate';
import type { PurchaseOrderPDFData } from './types';

/**
 * Genera un PDF de orden de compra y lo retorna como Buffer
 */
export async function generatePurchaseOrderPDF(data: PurchaseOrderPDFData): Promise<Buffer> {
  try {
    const buffer = await renderToBuffer(<PurchaseOrderTemplate data={data} />);
    return buffer;
  } catch (error) {
    throw new Error('Error al generar el PDF de la orden de compra');
  }
}

/**
 * Genera el nombre de archivo para el PDF
 */
export function getPurchaseOrderFileName(data: PurchaseOrderPDFData): string {
  const number = data.purchaseOrder.fullNumber.replace('-', '_');
  const date = new Date().toISOString().split('T')[0];

  return `Orden_Compra_${number}_${date}.pdf`;
}
