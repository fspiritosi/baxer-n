/**
 * Tipos del sistema de permisos RBAC
 */

import type { Action, Module } from './constants';

// ============================================
// TIPOS DE PERMISOS
// ============================================

/**
 * Permiso individual (módulo + acción)
 */
export interface Permission {
  module: Module;
  action: Action;
}

/**
 * Mapa de permisos por módulo
 * { "employees": { view: true, create: true, update: false, delete: false } }
 */
export type PermissionMap = Record<string, Record<string, boolean>>;

/**
 * Permisos de un usuario (combinación de rol + overrides individuales)
 */
export interface UserPermissions {
  /** ID del miembro */
  memberId: string;
  /** ID del rol actual */
  roleId: string | null;
  /** Slug del rol actual */
  roleSlug: string | null;
  /** Nombre del rol actual */
  roleName: string | null;
  /** Si es owner de la empresa */
  isOwner: boolean;
  /** Mapa de permisos efectivos */
  permissions: PermissionMap;
}

// ============================================
// TIPOS DE ROLES
// ============================================

/**
 * Rol con sus permisos
 */
export interface RoleWithPermissions {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  color: string | null;
  isSystem: boolean;
  isDefault: boolean;
  permissions: PermissionMap;
}

// ============================================
// TIPOS DE AUDITORÍA
// ============================================

/**
 * Entrada del log de auditoría
 */
export interface AuditLogEntry {
  id: string;
  companyId: string;
  performedBy: string;
  performedByName?: string;
  action: string;
  targetType: string;
  targetId: string;
  targetName: string | null;
  module: string | null;
  details: Record<string, unknown> | null;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  createdAt: Date;
}

// ============================================
// OPCIONES DE FUNCIONES
// ============================================

/**
 * Opciones para checkPermission
 */
export interface CheckPermissionOptions {
  /** Si debe redirigir en caso de acceso denegado (default: false) */
  redirect?: boolean;
  /** URL a la que redirigir (default: /dashboard) */
  redirectTo?: string;
}

/**
 * Resultado de verificación de permiso
 */
export interface CheckPermissionResult {
  /** Si tiene permiso */
  allowed: boolean;
  /** Mensaje de error si no tiene permiso */
  message?: string;
}
