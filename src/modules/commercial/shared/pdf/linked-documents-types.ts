/**
 * Tipos compartidos para secciones de documentos vinculados en PDFs
 */

export interface LinkedDocumentRecord {
  label: string;
  date?: string;
  amount?: string;
  status?: string;
}

export interface LinkedDocumentSection {
  title: string;
  columns: string[];
  records: LinkedDocumentRecord[];
}

export interface LinkedDocumentsData {
  sections: LinkedDocumentSection[];
}
