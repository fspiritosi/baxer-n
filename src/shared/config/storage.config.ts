/**
 * Configuración centralizada de Storage
 *
 * Soporta dos proveedores:
 * - "s3": MinIO (desarrollo) o Cloudflare R2 (producción)
 * - "local": Sistema de archivos local (legacy, no recomendado)
 *
 * La misma API S3 funciona para MinIO y R2, solo cambian las credenciales.
 */

// ============================================
// TIPOS
// ============================================

export type StorageProvider = 's3' | 'local';

export interface S3Config {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean; // true para MinIO, false para R2
  publicUrl?: string; // URL pública para archivos (opcional)
}

export interface LocalConfig {
  basePath: string;
  publicUrl: string;
}

export interface StorageConfig {
  provider: StorageProvider;
  s3: S3Config;
  local: LocalConfig;
  // Configuración de archivos
  maxFileSize: number; // en bytes
  allowedMimeTypes: string[];
  // URLs de presigned
  presignedUrlExpiry: number; // en segundos
}

// ============================================
// MIME TYPES PERMITIDOS
// ============================================

export const ALLOWED_MIME_TYPES = [
  // Imágenes
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  // Documentos
  'application/pdf',
  // Opcional: otros formatos
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];

export const ALLOWED_EXTENSIONS = [
  'jpg',
  'jpeg',
  'png',
  'webp',
  'gif',
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
];

// ============================================
// CONFIGURACIÓN
// ============================================

function getStorageConfig(): StorageConfig {
  const provider = (process.env.STORAGE_PROVIDER || 'local') as StorageProvider;

  return {
    provider,

    s3: {
      endpoint: process.env.S3_ENDPOINT || 'http://localhost:9000',
      region: process.env.S3_REGION || 'us-east-1',
      bucket: process.env.S3_BUCKET || 'documents',
      accessKeyId: process.env.S3_ACCESS_KEY || 'minioadmin',
      secretAccessKey: process.env.S3_SECRET_KEY || 'minioadmin123',
      forcePathStyle: process.env.S3_FORCE_PATH_STYLE === 'true',
      publicUrl: process.env.S3_PUBLIC_URL || undefined,
    },

    local: {
      basePath: process.env.STORAGE_LOCAL_PATH || './storage/uploads',
      publicUrl: '/api/storage',
    },

    // Límites de archivos
    maxFileSize: 10 * 1024 * 1024, // 10MB
    allowedMimeTypes: ALLOWED_MIME_TYPES,

    // Presigned URLs expiran en 1 hora
    presignedUrlExpiry: 3600,
  };
}

// Singleton de configuración
export const storageConfig = getStorageConfig();

// ============================================
// HELPERS
// ============================================

/**
 * Verifica si el provider es S3 (MinIO o R2)
 */
export function isS3Provider(): boolean {
  return storageConfig.provider === 's3';
}

/**
 * Obtiene la extensión de un archivo
 */
export function getFileExtension(filename: string): string {
  return filename.split('.').pop()?.toLowerCase() || '';
}

/**
 * Obtiene el content-type basado en la extensión
 */
export function getContentType(filename: string): string {
  const ext = getFileExtension(filename);
  const types: Record<string, string> = {
    jpg: 'image/jpeg',
    jpeg: 'image/jpeg',
    png: 'image/png',
    webp: 'image/webp',
    gif: 'image/gif',
    pdf: 'application/pdf',
    doc: 'application/msword',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    xls: 'application/vnd.ms-excel',
    xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  };
  return types[ext] || 'application/octet-stream';
}

/**
 * Valida si un archivo es permitido
 */
export function validateFile(
  file: { size: number; type: string; name: string },
  options?: { maxSize?: number; allowedTypes?: string[] }
): { valid: boolean; error?: string } {
  const maxSize = options?.maxSize || storageConfig.maxFileSize;
  const allowedTypes = options?.allowedTypes || storageConfig.allowedMimeTypes;

  // Validar tamaño
  if (file.size > maxSize) {
    const maxMB = Math.round(maxSize / 1024 / 1024);
    return {
      valid: false,
      error: `El archivo excede el tamaño máximo de ${maxMB}MB`,
    };
  }

  // Validar tipo MIME
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de archivo no permitido: ${file.type}`,
    };
  }

  // Validar extensión
  const ext = getFileExtension(file.name);
  if (!ALLOWED_EXTENSIONS.includes(ext)) {
    return {
      valid: false,
      error: `Extensión de archivo no permitida: .${ext}`,
    };
  }

  return { valid: true };
}

/**
 * Genera un nombre de archivo único
 */
export function generateUniqueFilename(originalFilename: string): string {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 8);
  const ext = getFileExtension(originalFilename);
  const baseName = originalFilename
    .replace(/\.[^/.]+$/, '') // Remover extensión
    .replace(/[^a-zA-Z0-9]/g, '-') // Reemplazar caracteres especiales
    .replace(/-+/g, '-') // Colapsar guiones múltiples
    .substring(0, 50) // Limitar longitud
    .toLowerCase();

  return `${baseName}-${timestamp}-${random}.${ext}`;
}

/**
 * Genera un slug seguro para paths de storage
 * Remueve acentos, ñ, caracteres especiales, barras, etc.
 * Solo permite: a-z, 0-9, guiones
 */
export function slugify(text: string): string {
  if (!text) return '';

  return (
    text
      .toLowerCase()
      .trim()
      // Normalizar caracteres unicode (separar acentos de letras)
      .normalize('NFD')
      // Remover acentos y diacríticos
      .replace(/[\u0300-\u036f]/g, '')
      // Reemplazar ñ por n
      .replace(/ñ/g, 'n')
      // Reemplazar caracteres especiales, espacios, barras, etc. por guión
      .replace(/[^a-z0-9]/g, '-')
      // Colapsar guiones múltiples en uno solo
      .replace(/-+/g, '-')
      // Remover guiones al inicio y final
      .replace(/^-|-$/g, '')
      // Limitar longitud para evitar paths muy largos
      .substring(0, 100)
  );
}

// ============================================
// GENERADORES DE PATHS PARA DOCUMENTOS
// ============================================

/**
 * Genera path para documento de empleado
 * Formato: {company}/{tipo-documento}/{empleado-dni}/{filename}
 * Ejemplo: acme-sa/licencia-de-conducir/juan-perez-12345678/2024-01-15-licencia.pdf
 */
export function buildEmployeeDocumentPath(params: {
  companyName: string;
  documentTypeName: string;
  employeeFullName: string;
  employeeDocumentNumber: string;
  filename: string;
}): string {
  const { companyName, documentTypeName, employeeFullName, employeeDocumentNumber, filename } =
    params;

  const companySlug = slugify(companyName);
  const documentTypeSlug = slugify(documentTypeName);
  const employeeSlug = slugify(`${employeeFullName}-${employeeDocumentNumber}`);
  const safeFilename = sanitizeFilename(filename);

  return `${companySlug}/${documentTypeSlug}/${employeeSlug}/${safeFilename}`;
}

/**
 * Genera path para documento de equipo/vehículo
 * Formato: {company}/{tipo-documento}/{vehiculo-dominio}/{filename}
 * Ejemplo: acme-sa/vtv/scania-abc123/2024-01-15-vtv.pdf
 */
export function buildEquipmentDocumentPath(params: {
  companyName: string;
  documentTypeName: string;
  vehicleDescription: string;
  licensePlate: string;
  filename: string;
}): string {
  const { companyName, documentTypeName, vehicleDescription, licensePlate, filename } = params;

  const companySlug = slugify(companyName);
  const documentTypeSlug = slugify(documentTypeName);
  const vehicleSlug = slugify(`${vehicleDescription}-${licensePlate}`);
  const safeFilename = sanitizeFilename(filename);

  return `${companySlug}/${documentTypeSlug}/${vehicleSlug}/${safeFilename}`;
}

/**
 * Genera path para documento de empresa
 * Formato: {company}/empresa/{tipo-documento}/{filename}
 * Ejemplo: acme-sa/empresa/habilitacion-cnrt/2024-01-15-habilitacion.pdf
 */
export function buildCompanyDocumentPath(params: {
  companyName: string;
  documentTypeName: string;
  filename: string;
}): string {
  const { companyName, documentTypeName, filename } = params;

  const companySlug = slugify(companyName);
  const documentTypeSlug = slugify(documentTypeName);
  const safeFilename = sanitizeFilename(filename);

  return `${companySlug}/empresa/${documentTypeSlug}/${safeFilename}`;
}

/**
 * Sanitiza un nombre de archivo para que sea seguro en storage
 * Mantiene la extensión original
 */
export function sanitizeFilename(filename: string): string {
  if (!filename) return `file-${Date.now()}`;

  const ext = getFileExtension(filename);
  const baseName = filename
    .replace(/\.[^/.]+$/, '') // Remover extensión
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remover acentos
    .replace(/ñ/g, 'n')
    .replace(/[^a-z0-9]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 50);

  // Agregar timestamp para unicidad
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 6);

  return `${baseName}-${timestamp}-${random}.${ext}`;
}

/**
 * Genera un nombre de archivo con fecha legible
 * Ejemplo: 2024-01-15-licencia-conducir.pdf
 */
export function buildDocumentFilename(documentTypeName: string, originalFilename: string): string {
  const ext = getFileExtension(originalFilename);
  const date = new Date().toISOString().split('T')[0]; // 2024-01-15
  const typeSlug = slugify(documentTypeName).substring(0, 30);
  const random = Math.random().toString(36).substring(2, 6);

  return `${date}-${typeSlug}-${random}.${ext}`;
}
