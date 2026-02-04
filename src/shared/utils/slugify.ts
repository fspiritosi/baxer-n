/**
 * Utilidades para crear slugs seguros para paths de storage
 * Convierte nombres a formato URL-safe sin caracteres especiales
 */

/**
 * Remueve acentos y caracteres especiales de un string
 * @example removeAccents("José Pérez Ñoño") // "Jose Perez Nono"
 */
export function removeAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/ñ/g, 'n')
    .replace(/Ñ/g, 'N');
}

/**
 * Convierte un string a slug (URL-safe)
 * - Remueve acentos
 * - Convierte a minúsculas
 * - Reemplaza espacios y caracteres especiales con guiones
 * - Elimina guiones duplicados y al inicio/final
 *
 * @example
 * slugify("Juan Pérez Ñoño") // "juan-perez-nono"
 * slugify("Licencia de Conducir") // "licencia-de-conducir"
 * slugify("F931 - Formulario") // "f931-formulario"
 * slugify("Empresa Demo S.A.") // "empresa-demo-sa"
 */
export function slugify(str: string): string {
  return removeAccents(str)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '') // Eliminar caracteres especiales
    .replace(/\s+/g, '-') // Espacios a guiones
    .replace(/-+/g, '-') // Guiones duplicados
    .replace(/^-|-$/g, ''); // Guiones al inicio/final
}

/**
 * Genera un slug para empleado basado en nombre y documento
 * Formato: nombre-apellido-documento
 *
 * @example
 * generateEmployeeSlug("Juan", "Pérez", "25.123.456") // "juan-perez-25123456"
 * generateEmployeeSlug("María", "González", "28456789") // "maria-gonzalez-28456789"
 */
export function generateEmployeeSlug(
  firstName: string,
  lastName: string,
  documentNumber: string
): string {
  const namePart = slugify(`${firstName} ${lastName}`);
  const docPart = documentNumber.replace(/[^0-9]/g, '');
  return `${namePart}-${docPart}`;
}

/**
 * Genera un slug para vehículo basado en dominio o número interno
 *
 * @example
 * generateVehicleSlug("AB123CD", "001") // "ab123cd"
 * generateVehicleSlug(null, "001") // "interno-001"
 * generateVehicleSlug("AB-123-CD", null) // "ab123cd"
 */
export function generateVehicleSlug(
  domain: string | null | undefined,
  internNumber: string | null | undefined
): string {
  if (domain) {
    // Remover guiones y espacios del dominio
    return domain.toLowerCase().replace(/[^a-z0-9]/g, '');
  }
  if (internNumber) {
    return `interno-${slugify(internNumber)}`;
  }
  return `vehicle-${Date.now()}`;
}

/**
 * Genera un slug para empresa basado en nombre
 *
 * @example
 * generateCompanySlug("Empresa Demo S.A.") // "empresa-demo-sa"
 * generateCompanySlug("YPF Argentina") // "ypf-argentina"
 */
export function generateCompanySlug(companyName: string): string {
  return slugify(companyName);
}
