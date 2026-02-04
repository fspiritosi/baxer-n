/**
 * Utilidades para generar paths legibles de documentos en storage
 * Los paths usan nombres legibles en lugar de UUIDs para facilitar la revisión manual
 */

import moment from 'moment';
import { slugify } from './slugify';

export interface BaseDocumentPathParams {
  companySlug: string;
  documentTypeSlug: string;
  fileName: string;
  period?: string; // "2024-01" para documentos mensuales
}

export interface EmployeeDocumentPathParams extends BaseDocumentPathParams {
  employeeSlug: string;
}

export interface EquipmentDocumentPathParams extends BaseDocumentPathParams {
  vehicleSlug: string;
}

/**
 * Sanitiza el nombre del archivo para uso en paths
 * Mantiene la extensión original
 */
function sanitizeFileName(fileName: string): {
  name: string;
  extension: string;
} {
  const lastDotIndex = fileName.lastIndexOf('.');
  const hasExtension = lastDotIndex > 0;

  const name = hasExtension ? fileName.substring(0, lastDotIndex) : fileName;
  const extension = hasExtension
    ? fileName.substring(lastDotIndex + 1).toLowerCase()
    : 'pdf';

  return {
    name: slugify(name),
    extension,
  };
}

/**
 * Genera path para documento de empleado
 *
 * Formato: {company}/empleados/{employee}/documentos/{docType}/{date}-{filename}.{ext}
 * Con periodo: {company}/empleados/{employee}/documentos/{docType}/{period}/{date}-{filename}.{ext}
 *
 * @example
 * // Sin periodo:
 * // "empresa-demo-sa/empleados/juan-perez-25123456/documentos/licencia-de-conducir/2024-01-15-licencia.pdf"
 *
 * // Con periodo (documentos mensuales):
 * // "empresa-demo-sa/empleados/juan-perez-25123456/documentos/recibo-sueldo/2024-01/2024-01-15-recibo-enero.pdf"
 */
export function generateEmployeeDocumentPath(
  params: EmployeeDocumentPathParams
): string {
  const { companySlug, employeeSlug, documentTypeSlug, fileName, period } =
    params;
  const date = moment().format('YYYY-MM-DD');
  const { name, extension } = sanitizeFileName(fileName);

  const basePath = `${companySlug}/empleados/${employeeSlug}/documentos/${documentTypeSlug}`;

  if (period) {
    return `${basePath}/${period}/${date}-${name}.${extension}`;
  }

  return `${basePath}/${date}-${name}.${extension}`;
}

/**
 * Genera path para documento de equipo/vehículo
 *
 * Formato: {company}/equipos/{vehicle}/documentos/{docType}/{date}-{filename}.{ext}
 *
 * @example
 * // "empresa-demo-sa/equipos/ab123cd/documentos/vtv/2024-01-15-vtv-2024.pdf"
 * // "empresa-demo-sa/equipos/interno-001/documentos/seguro/2024-01-15-poliza.pdf"
 */
export function generateEquipmentDocumentPath(
  params: EquipmentDocumentPathParams
): string {
  const { companySlug, vehicleSlug, documentTypeSlug, fileName, period } =
    params;
  const date = moment().format('YYYY-MM-DD');
  const { name, extension } = sanitizeFileName(fileName);

  const basePath = `${companySlug}/equipos/${vehicleSlug}/documentos/${documentTypeSlug}`;

  if (period) {
    return `${basePath}/${period}/${date}-${name}.${extension}`;
  }

  return `${basePath}/${date}-${name}.${extension}`;
}

/**
 * Genera path para documento de empresa
 *
 * Formato: {company}/empresa/documentos/{docType}/{date}-{filename}.{ext}
 * Con periodo: {company}/empresa/documentos/{docType}/{period}/{date}-{filename}.{ext}
 *
 * @example
 * // Sin periodo:
 * // "empresa-demo-sa/empresa/documentos/constancia-afip/2024-01-15-constancia.pdf"
 *
 * // Con periodo (documentos mensuales como F931):
 * // "empresa-demo-sa/empresa/documentos/f931/2024-01/2024-01-15-f931-enero.pdf"
 */
export function generateCompanyDocumentPath(
  params: BaseDocumentPathParams
): string {
  const { companySlug, documentTypeSlug, fileName, period } = params;
  const date = moment().format('YYYY-MM-DD');
  const { name, extension } = sanitizeFileName(fileName);

  const basePath = `${companySlug}/empresa/documentos/${documentTypeSlug}`;

  if (period) {
    return `${basePath}/${period}/${date}-${name}.${extension}`;
  }

  return `${basePath}/${date}-${name}.${extension}`;
}
