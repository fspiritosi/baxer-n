/**
 * Exporta funciones y tipos para generación de PDFs de Recibos de Cobro
 */

export { generateReceiptPDF, getReceiptFileName } from './generator';
export { mapReceiptDataForPDF } from './data-mapper';
export type { ReceiptPDFData } from './types';
