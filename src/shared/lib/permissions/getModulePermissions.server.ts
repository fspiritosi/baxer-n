'use server';

import { cache } from 'react';

import { getCurrentUserPermissions } from './getPermissions.server';

/**
 * Cache de permisos del usuario por request
 *
 * Usa React cache() para deduplicar llamadas dentro del mismo request.
 * Cada nuevo request obtiene datos frescos de la BD.
 */
const getCachedUserPermissions = cache(getCurrentUserPermissions);

/**
 * Permisos CRUD para un módulo
 */
export interface ModulePermissions {
  canView: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
}

/**
 * Obtiene todos los permisos CRUD de un módulo en una sola llamada.
 *
 * Usa cache() internamente para evitar múltiples queries a la BD
 * cuando varios componentes verifican permisos en el mismo request.
 *
 * @param module - Módulo a verificar (ej: "employees", "company.cost-centers")
 *
 * @example
 * // En un Server Component
 * const permissions = await getModulePermissions('employees');
 * // permissions = { canView: true, canCreate: true, canUpdate: false, canDelete: false }
 *
 * @example
 * // Uso con Promise.all
 * const [data, permissions] = await Promise.all([
 *   getEmployeesPaginated(searchParams),
 *   getModulePermissions('employees'),
 * ]);
 */
export async function getModulePermissions(module: string): Promise<ModulePermissions> {
  const noPermissions: ModulePermissions = {
    canView: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
  };

  const userPermissions = await getCachedUserPermissions();

  if (!userPermissions) return noPermissions;

  // Owners y roles de sistema tienen todos los permisos
  if (
    userPermissions.isOwner ||
    userPermissions.roleSlug === 'owner' ||
    userPermissions.roleSlug === 'developer'
  ) {
    return {
      canView: true,
      canCreate: true,
      canUpdate: true,
      canDelete: true,
    };
  }

  // Verificar permisos específicos del módulo
  const modulePerms = userPermissions.permissions[module];

  return {
    canView: modulePerms?.view === true,
    canCreate: modulePerms?.create === true,
    canUpdate: modulePerms?.update === true,
    canDelete: modulePerms?.delete === true,
  };
}

/**
 * Obtiene permisos de múltiples módulos en una sola llamada.
 *
 * Útil cuando un componente necesita verificar permisos de varios módulos.
 *
 * @example
 * const permissions = await getMultipleModulePermissions(['employees', 'documents']);
 * // permissions = {
 * //   employees: { canView: true, canCreate: true, ... },
 * //   documents: { canView: true, canCreate: false, ... }
 * // }
 */
export async function getMultipleModulePermissions(
  modules: string[]
): Promise<Record<string, ModulePermissions>> {
  const result: Record<string, ModulePermissions> = {};

  // Como usamos cache(), esto solo hace 1 query a la BD
  const userPermissions = await getCachedUserPermissions();

  const noPermissions: ModulePermissions = {
    canView: false,
    canCreate: false,
    canUpdate: false,
    canDelete: false,
  };

  const fullPermissions: ModulePermissions = {
    canView: true,
    canCreate: true,
    canUpdate: true,
    canDelete: true,
  };

  for (const module of modules) {
    if (!userPermissions) {
      result[module] = noPermissions;
      continue;
    }

    // Owners y roles de sistema tienen todos los permisos
    if (
      userPermissions.isOwner ||
      userPermissions.roleSlug === 'owner' ||
      userPermissions.roleSlug === 'developer'
    ) {
      result[module] = fullPermissions;
      continue;
    }

    // Verificar permisos específicos del módulo
    const modulePerms = userPermissions.permissions[module];
    result[module] = {
      canView: modulePerms?.view === true,
      canCreate: modulePerms?.create === true,
      canUpdate: modulePerms?.update === true,
      canDelete: modulePerms?.delete === true,
    };
  }

  return result;
}
