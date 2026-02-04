'use client';

import {
  ExternalLink,
  File,
  FileImage,
  FileSpreadsheet,
  FileText,
} from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { Card, CardContent } from '@/shared/components/ui/card';

interface Props {
  url: string | null;
  fileName: string | null;
  mimeType: string | null;
}

/**
 * Componente para mobile que muestra info del documento
 * y un botón para abrirlo en una nueva pestaña (usa el visor nativo del dispositivo)
 */
export function _MobilePreviewButton({ url, fileName, mimeType }: Props) {
  const isPdf = mimeType?.includes('pdf');
  const isImage = mimeType?.startsWith('image/');
  const isSpreadsheet =
    mimeType?.includes('spreadsheet') ||
    mimeType?.includes('excel') ||
    fileName?.endsWith('.xlsx') ||
    fileName?.endsWith('.xls');

  const getIcon = () => {
    if (isPdf) return <FileText className="h-10 w-10 text-red-500" />;
    if (isImage) return <FileImage className="h-10 w-10 text-blue-500" />;
    if (isSpreadsheet) return <FileSpreadsheet className="h-10 w-10 text-green-600" />;
    return <File className="h-10 w-10 text-muted-foreground" />;
  };

  const getTypeLabel = () => {
    if (isPdf) return 'Documento PDF';
    if (isImage) return 'Imagen';
    if (isSpreadsheet) return 'Hoja de cálculo';
    return 'Documento';
  };

  const handleOpenDocument = () => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  if (!url) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col items-center justify-center text-center">
            <File className="h-10 w-10 text-muted-foreground/50" />
            <p className="mt-3 text-sm text-muted-foreground">
              No hay archivo disponible
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-center gap-4">
          {/* Icono del tipo de archivo */}
          <div className="flex-shrink-0">{getIcon()}</div>

          {/* Info del archivo */}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{fileName || 'Documento'}</p>
            <p className="text-xs text-muted-foreground">{getTypeLabel()}</p>
          </div>

          {/* Botón para abrir */}
          <Button size="sm" onClick={handleOpenDocument}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Abrir
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
