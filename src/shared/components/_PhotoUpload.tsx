'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Camera, Trash2, Loader2, User } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { uploadEmployeePhoto, deleteEmployeePhoto } from '@/shared/actions/storage';

interface PhotoUploadProps {
  currentPhotoUrl?: string | null;
  currentPhotoKey?: string | null;
  onPhotoChange: (key: string | null, url: string | null) => void;
  className?: string;
}

export function _PhotoUpload({
  currentPhotoUrl,
  currentPhotoKey,
  onPhotoChange,
  className = '',
}: PhotoUploadProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(currentPhotoUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  // Track si el usuario ha modificado la foto para no sobrescribir con props
  const hasUserModified = useRef(false);

  // Sincronizar previewUrl cuando currentPhotoUrl cambia desde fuera
  // (por ejemplo, al cargar datos del servidor en modo edición)
  // Solo actualizar si el usuario no ha modificado la foto manualmente
  useEffect(() => {
    if (!hasUserModified.current) {
      setPreviewUrl(currentPhotoUrl || null);
    }
  }, [currentPhotoUrl]);

  const handleFileSelect = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;

      // Validación del lado del cliente
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Tipo de archivo no permitido. Use JPG, PNG o WebP.');
        return;
      }

      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('El archivo es demasiado grande. Máximo 5MB.');
        return;
      }

      // Mostrar preview inmediato
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);

      setIsUploading(true);

      try {
        // Si hay foto anterior, eliminarla primero
        if (currentPhotoKey) {
          await deleteEmployeePhoto(currentPhotoKey);
        }

        // Subir nueva foto
        const formData = new FormData();
        formData.append('file', file);

        const result = await uploadEmployeePhoto(formData);

        if (result.success && result.key && result.url) {
          hasUserModified.current = true;
          setPreviewUrl(result.url);
          onPhotoChange(result.key, result.url);
          toast.success('Foto actualizada correctamente');
        } else {
          // Revertir preview
          setPreviewUrl(currentPhotoUrl || null);
          toast.error(result.error || 'Error al subir la foto');
        }
      } catch {
        setPreviewUrl(currentPhotoUrl || null);
        toast.error('Error al subir la foto');
      } finally {
        setIsUploading(false);
        // Limpiar input para permitir seleccionar el mismo archivo
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    },
    [currentPhotoKey, currentPhotoUrl, onPhotoChange]
  );

  const handleDelete = useCallback(async () => {
    if (!currentPhotoKey) return;

    setIsDeleting(true);

    try {
      const result = await deleteEmployeePhoto(currentPhotoKey);

      if (result.success) {
        hasUserModified.current = true;
        setPreviewUrl(null);
        onPhotoChange(null, null);
        toast.success('Foto eliminada correctamente');
      } else {
        toast.error(result.error || 'Error al eliminar la foto');
      }
    } catch {
      toast.error('Error al eliminar la foto');
    } finally {
      setIsDeleting(false);
    }
  }, [currentPhotoKey, onPhotoChange]);

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const isLoading = isUploading || isDeleting;

  return (
    <div className={`flex flex-col items-center gap-3 ${className}`}>
      {/* Foto o placeholder */}
      <div className="relative h-32 w-32 overflow-hidden rounded-full border-2 border-muted bg-muted">
        {previewUrl ? (
          // Usamos img nativo en lugar de next/image para evitar problemas
          // con URLs de MinIO/S3 y porque las fotos de perfil son pequeñas
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={previewUrl}
            alt="Foto de empleado"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <User className="h-16 w-16 text-muted-foreground" />
          </div>
        )}

        {/* Overlay de carga */}
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
      </div>

      {/* Botones de acción */}
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={triggerFileSelect}
          disabled={isLoading}
        >
          <Camera className="mr-2 h-4 w-4" />
          {previewUrl ? 'Cambiar' : 'Subir'}
        </Button>

        {previewUrl && currentPhotoKey && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={isLoading}
            className="text-destructive hover:bg-destructive hover:text-destructive-foreground"
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Eliminar
          </Button>
        )}
      </div>

      {/* Input oculto */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Texto de ayuda */}
      <p className="text-center text-xs text-muted-foreground">
        JPG, PNG o WebP. Máximo 5MB.
      </p>
    </div>
  );
}
