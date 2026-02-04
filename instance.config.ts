/**
 * ============================================
 * CONFIGURACIÓN DE INSTANCIA
 * ============================================
 *
 * Este archivo es la ÚNICA fuente de verdad para configurar una nueva instancia del proyecto.
 *
 * Al clonar el proyecto para un nuevo cliente:
 * 1. Edita los valores de este archivo
 * 2. Ejecuta: npm run setup:instance
 * 3. El script actualizará automáticamente .env, docker-compose.yml, package.json, etc.
 *
 * IMPORTANTE: No edites manualmente los archivos generados (.env, docker-compose.yml)
 * ya que serán sobrescritos por el script de setup.
 */

export interface InstanceConfig {
  /**
   * Identificador único de la instancia (usado en docker, BD, package.json)
   * Debe ser lowercase, sin espacios, solo letras, números y guiones
   * Ejemplo: "acme-corp", "empresa-demo", "cliente-abc"
   */
  id: string;

  /**
   * Nombre completo de la aplicación (mostrado en UI)
   * Ejemplo: "ACME Corporation", "Mi Empresa", "Sistema HR"
   */
  name: string;

  /**
   * Abreviatura para el logo (2-3 caracteres)
   * Ejemplo: "AC", "ME", "HR"
   */
  shortName: string;

  /**
   * Descripción de la aplicación (para metadata SEO)
   */
  description: string;

  /**
   * Puertos para los servicios
   * IMPORTANTE: Si corres múltiples instancias en la misma máquina,
   * cada una debe tener puertos diferentes
   */
  ports: {
    /** Puerto de la aplicación Next.js (default: 3000) */
    app: number;
    /** Puerto de PostgreSQL (default: 5432) */
    database: number;
    /** Puerto de MinIO API S3 (default: 9000) */
    minioApi: number;
    /** Puerto de MinIO Console Web (default: 9001) */
    minioConsole: number;
  };

  /**
   * Configuración de base de datos
   * NOTA: El password se configura en .env por seguridad
   */
  database: {
    /** Nombre de la base de datos */
    name: string;
    /** Usuario de PostgreSQL */
    user: string;
  };

  /**
   * Configuración de storage S3/MinIO
   * NOTA: Las credenciales se configuran en .env por seguridad
   */
  storage: {
    /** Nombre del bucket S3 */
    bucket: string;
    /** Región S3 (para MinIO local usar "us-east-1") */
    region: string;
  };
}

/**
 * ============================================
 * CONFIGURACIÓN ACTUAL DE LA INSTANCIA
 * ============================================
 *
 * 👇 EDITA ESTOS VALORES PARA TU NUEVA INSTANCIA 👇
 */
export const instanceConfig: InstanceConfig = {
  // Identificador único (lowercase, sin espacios)
  id: 'nahuel-boxer',

  // Branding
  name: 'Nahuel Boxer',
  shortName: 'NB',
  description: 'Sistema de gestión de repuestos - Nahuel Boxer S.A.',

  // Puertos (cambiar si corres múltiples instancias)
  ports: {
    app: 3001,
    database: 5533,
    minioApi: 9002,
    minioConsole: 9003,
  },

  // Base de datos
  database: {
    name: 'nahuel-boxer-db',
    user: 'postgres',
  },

  // Storage
  storage: {
    bucket: 'nahuel-boxer-docs',
    region: 'us-east-1',
  },
};

export default instanceConfig;
