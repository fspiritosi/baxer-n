/**
 * Exporta funciones y tipos para generación de PDFs de Remitos de Recepción
 */

export { generateReceivingNotePDF, getReceivingNoteFileName } from './generator';
export { mapReceivingNoteDataForPDF } from './data-mapper';
export type { ReceivingNotePDFData } from './types';
