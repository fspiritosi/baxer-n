/**
 * Configuración de la instancia para uso en el código de la aplicación
 *
 * Este archivo exporta la configuración centralizada para ser usada
 * en componentes, layouts, y cualquier parte del código que necesite
 * información de branding o configuración de la instancia.
 *
 * IMPORTANTE: No editar este archivo directamente.
 * Editar instance.config.ts en la raíz del proyecto.
 */

import { instanceConfig, type InstanceConfig } from '../../../instance.config';

// Re-exportar la configuración
export { instanceConfig, type InstanceConfig };

/**
 * Helpers para acceso rápido a valores comunes
 */

/** Nombre completo de la aplicación */
export const APP_NAME = instanceConfig.name;

/** Abreviatura para el logo */
export const APP_SHORT_NAME = instanceConfig.shortName;

/** Descripción de la aplicación */
export const APP_DESCRIPTION = instanceConfig.description;

/** ID único de la instancia */
export const INSTANCE_ID = instanceConfig.id;

/**
 * Configuración de metadata para Next.js
 * Usar en layout.tsx
 */
export const appMetadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: APP_NAME,
  },
  description: APP_DESCRIPTION,
};

/**
 * URLs base según el entorno
 */
export function getAppUrl(): string {
  // En el servidor, usar variable de entorno
  if (typeof window === 'undefined') {
    return process.env.NEXT_PUBLIC_APP_URL || `http://localhost:${instanceConfig.ports.app}`;
  }
  // En el cliente, usar window.location o variable de entorno
  return process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
}

/**
 * URLs de servicios según la configuración
 */
export const serviceUrls = {
  /** URL de MinIO API */
  get minioApi() {
    return `http://localhost:${instanceConfig.ports.minioApi}`;
  },
  /** URL de MinIO Console */
  get minioConsole() {
    return `http://localhost:${instanceConfig.ports.minioConsole}`;
  },
};
