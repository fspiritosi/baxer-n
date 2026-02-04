'use server';

import {
  uploadFile,
  deleteFile,
  getPresignedDownloadUrl,
  generateUniqueFilename,
} from '@/shared/lib/storage';
import { logger } from '@/shared/lib/logger';

// ============================================
// TIPOS
// ============================================

export interface UploadResponse {
  success: boolean;
  key?: string;
  url?: string;
  error?: string;
}

// ============================================
// SERVER ACTIONS
// ============================================

/**
 * Sube una imagen de perfil de empleado
 */
export async function uploadEmployeePhoto(formData: FormData): Promise<UploadResponse> {
  try {
    const file = formData.get('file') as File;
    if (!file) {
      return { success: false, error: 'No se proporcionó archivo' };
    }

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return { success: false, error: 'Tipo de archivo no permitido. Use JPG, PNG o WebP.' };
    }

    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return { success: false, error: 'El archivo es demasiado grande. Máximo 5MB.' };
    }

    // Convertir File a Buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generar nombre único
    const filename = generateUniqueFilename(file.name);

    // Subir archivo
    const result = await uploadFile(buffer, filename, {
      folder: 'employees/photos',
      contentType: file.type,
    });

    logger.info('Foto de empleado subida', { data: { key: result.key } });

    return { success: true, key: result.key, url: result.url };
  } catch (error) {
    logger.error('Error al subir foto de empleado', { data: { error } });
    return { success: false, error: 'Error al subir la imagen' };
  }
}

/**
 * Elimina una foto de empleado
 */
export async function deleteEmployeePhoto(key: string): Promise<UploadResponse> {
  try {
    if (!key) {
      return { success: false, error: 'No se proporcionó la clave del archivo' };
    }

    await deleteFile(key);

    logger.info('Foto de empleado eliminada', { data: { key } });

    return { success: true };
  } catch (error) {
    logger.error('Error al eliminar foto de empleado', { data: { error, key } });
    return { success: false, error: 'Error al eliminar la imagen' };
  }
}

/**
 * Obtiene la URL de una foto de empleado
 */
export async function getEmployeePhotoUrl(key: string): Promise<string | null> {
  try {
    if (!key) return null;
    return await getPresignedDownloadUrl(key);
  } catch (error) {
    logger.error('Error al obtener URL de foto', { data: { error, key } });
    return null;
  }
}
