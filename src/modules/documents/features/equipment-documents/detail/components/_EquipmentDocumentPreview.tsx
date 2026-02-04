'use client';

import { FileText, ImageIcon, FileSpreadsheet, File } from 'lucide-react';

interface Props {
  url: string | null;
  fileName: string | null;
  mimeType: string | null;
}

/**
 * Componente para mostrar preview de documentos de equipo
 * Soporta PDFs, imágenes y muestra placeholder para otros tipos
 */
export function _EquipmentDocumentPreview({ url, fileName, mimeType }: Props) {
  if (!url) {
    return (
      <div className="flex h-full min-h-[500px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30">
        <FileText className="h-16 w-16 text-muted-foreground/50" />
        <p className="mt-4 text-sm text-muted-foreground">No hay archivo disponible</p>
      </div>
    );
  }

  const isPdf = mimeType?.includes('pdf');
  const isImage = mimeType?.startsWith('image/');
  const isSpreadsheet =
    mimeType?.includes('spreadsheet') ||
    mimeType?.includes('excel') ||
    fileName?.endsWith('.xlsx') ||
    fileName?.endsWith('.xls');
  const isWord =
    mimeType?.includes('word') ||
    mimeType?.includes('document') ||
    fileName?.endsWith('.docx') ||
    fileName?.endsWith('.doc');

  // PDF - Mostrar en iframe
  if (isPdf) {
    return (
      <div className="h-full min-h-[600px] w-full overflow-hidden rounded-lg border bg-background">
        <iframe
          src={`${url}#toolbar=1&navpanes=0&scrollbar=1`}
          className="h-full w-full"
          title={fileName || 'Documento PDF'}
        />
      </div>
    );
  }

  // Imágenes - Mostrar directamente
  if (isImage) {
    return (
      <div className="flex h-full min-h-[500px] items-center justify-center rounded-lg border bg-muted/10 p-4">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={fileName || 'Imagen del documento'}
          className="max-h-full max-w-full object-contain rounded-lg shadow-lg"
        />
      </div>
    );
  }

  // Otros tipos - Mostrar placeholder con icono
  const getIcon = () => {
    if (isSpreadsheet) return <FileSpreadsheet className="h-20 w-20 text-green-600" />;
    if (isWord) return <FileText className="h-20 w-20 text-blue-600" />;
    return <File className="h-20 w-20 text-muted-foreground" />;
  };

  const getTypeLabel = () => {
    if (isSpreadsheet) return 'Archivo Excel';
    if (isWord) return 'Documento Word';
    return 'Archivo';
  };

  return (
    <div className="flex h-full min-h-[500px] flex-col items-center justify-center rounded-lg border-2 border-dashed bg-muted/30">
      {getIcon()}
      <p className="mt-4 text-lg font-medium">{getTypeLabel()}</p>
      <p className="mt-1 max-w-xs truncate text-sm text-muted-foreground">{fileName}</p>
      <p className="mt-4 text-xs text-muted-foreground">
        Este tipo de archivo no puede mostrarse como vista previa.
      </p>
      <p className="text-xs text-muted-foreground">Usa el botón de descarga para ver el archivo.</p>
    </div>
  );
}
