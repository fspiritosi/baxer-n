/**
 * Generador de PDFs de Órdenes de Pago
 */

import { renderToBuffer } from '@react-pdf/renderer';
import { PaymentOrderTemplate } from './PaymentOrderTemplate';
import type { PaymentOrderPDFData } from './types';

/**
 * Genera un PDF de orden de pago y lo retorna como Buffer
 */
export async function generatePaymentOrderPDF(data: PaymentOrderPDFData): Promise<Buffer> {
  try {
    const buffer = await renderToBuffer(<PaymentOrderTemplate data={data} />);
    return buffer;
  } catch (error) {
    console.error('Error generando PDF:', error);
    throw new Error('Error al generar el PDF de la orden de pago');
  }
}

/**
 * Genera el nombre de archivo para el PDF
 */
export function getPaymentOrderFileName(data: PaymentOrderPDFData): string {
  const number = data.paymentOrder.fullNumber.replace('-', '_');
  const date = new Date().toISOString().split('T')[0];

  return `Orden_Pago_${number}_${date}.pdf`;
}
