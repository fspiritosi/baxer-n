'use client';

import { useCallback, useState } from 'react';
import { FileText, Upload, X, AlertCircle } from 'lucide-react';

import { cn } from '@/shared/lib/utils';
import { Button } from '@/shared/components/ui/button';
import {
  validateFile,
  getFileExtension,
  ALLOWED_EXTENSIONS,
} from '@/shared/config/storage.config';

// ============================================
// TIPOS
// ============================================

export interface FileDropzoneProps {
  /** Callback cuando se selecciona un archivo válido */
  onFileSelect: (file: File) => void;
  /** Callback cuando se remueve el archivo */
  onFileRemove?: () => void;
  /** Archivo actualmente seleccionado */
  selectedFile?: File | null;
  /** Tipos MIME permitidos (default: todos los permitidos) */
  allowedTypes?: string[];
  /** Tamaño máximo en bytes (default: 10MB) */
  maxSize?: number;
  /** Texto de ayuda personalizado */
  helpText?: string;
  /** Si está deshabilitado */
  disabled?: boolean;
  /** Clase CSS adicional */
  className?: string;
  /** ID para testing */
  'data-testid'?: string;
}

// ============================================
// FORMATTERS
// ============================================

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function getFileIcon(filename: string): React.ReactNode {
  const ext = getFileExtension(filename);
  // Por ahora solo FileText, se puede expandir con íconos específicos
  return <FileText className="h-8 w-8 text-primary" />;
}

// ============================================
// COMPONENT
// ============================================

export function _FileDropzone({
  onFileSelect,
  onFileRemove,
  selectedFile,
  allowedTypes,
  maxSize,
  helpText,
  disabled = false,
  className,
  'data-testid': testId = 'file-dropzone',
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(
    (file: File) => {
      setError(null);

      // Validar archivo
      const validation = validateFile(
        { size: file.size, type: file.type, name: file.name },
        { maxSize, allowedTypes }
      );

      if (!validation.valid) {
        setError(validation.error || 'Archivo no válido');
        return;
      }

      onFileSelect(file);
    },
    [onFileSelect, maxSize, allowedTypes]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      if (disabled) return;

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
    },
    [handleFile, disabled]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      e.stopPropagation();
      if (!disabled) {
        setIsDragging(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        handleFile(files[0]);
      }
      // Reset input para permitir seleccionar el mismo archivo
      e.target.value = '';
    },
    [handleFile]
  );

  const handleRemove = useCallback(() => {
    setError(null);
    onFileRemove?.();
  }, [onFileRemove]);

  // Generar accept string para input
  const acceptString = ALLOWED_EXTENSIONS.map((ext) => `.${ext}`).join(',');

  // Si hay archivo seleccionado, mostrar preview
  if (selectedFile) {
    return (
      <div
        className={cn(
          'rounded-lg border bg-muted/30 p-4',
          className
        )}
        data-testid={testId}
      >
        <div className="flex items-center gap-4">
          {getFileIcon(selectedFile.name)}
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{selectedFile.name}</p>
            <p className="text-sm text-muted-foreground">
              {formatFileSize(selectedFile.size)}
            </p>
          </div>
          {!disabled && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleRemove}
              data-testid={`${testId}-remove`}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'relative rounded-lg border-2 border-dashed p-6 text-center transition-colors',
          isDragging && 'border-primary bg-primary/5',
          error && 'border-destructive',
          disabled && 'opacity-50 cursor-not-allowed',
          !disabled && !error && !isDragging && 'hover:border-primary/50 cursor-pointer'
        )}
        data-testid={testId}
      >
        <input
          type="file"
          accept={acceptString}
          onChange={handleInputChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
          data-testid={`${testId}-input`}
        />

        <Upload
          className={cn(
            'mx-auto h-8 w-8',
            error ? 'text-destructive' : 'text-muted-foreground'
          )}
        />

        <p className="mt-2 text-sm font-medium">
          {isDragging ? 'Suelta el archivo aquí' : 'Arrastra un archivo o haz clic para seleccionar'}
        </p>

        <p className="mt-1 text-xs text-muted-foreground">
          {helpText || 'PDF, JPG, PNG o WebP (máx. 10MB)'}
        </p>
      </div>

      {error && (
        <div className="mt-2 flex items-center gap-2 text-sm text-destructive">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}
    </div>
  );
}
