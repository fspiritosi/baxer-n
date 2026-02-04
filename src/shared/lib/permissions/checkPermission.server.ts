'use server';

import { redirect } from 'next/navigation';

import { logger } from '@/shared/lib/logger';

import type { Action, Module } from './constants';
import type { CheckPermissionOptions, CheckPermissionResult } from './types';
import { getCurrentUserPermissions } from './getPermissions.server';

const log = logger;

/**
 * Verifica si el usuario actual tiene un permiso específico
 *
 * @param module - Módulo a verificar (ej: "employees", "company.cost-centers")
 * @param action - Acción a verificar (ej: "view", "create", "update", "delete")
 * @param options - Opciones de verificación
 *
 * @example
 * // En un Server Action
 * export async function createEmployee(data: CreateEmployeeInput) {
 *   await checkPermission('employees', 'create', { redirect: true });
 *   // ... resto de la lógica
 * }
 *
 * @example
 * // Verificación manual
 * const result = await checkPermission('employees', 'delete');
 * if (!result.allowed) {
 *   throw new Error(result.message);
 * }
 */
export async function checkPermission(
  module: Module | string,
  action: Action | string,
  options: CheckPermissionOptions = {}
): Promise<CheckPermissionResult> {
  const { redirect: shouldRedirect = false, redirectTo = '/dashboard' } = options;

  try {
    const userPermissions = await getCurrentUserPermissions();

    // Si no hay usuario autenticado o no es miembro activo
    if (!userPermissions) {
      const result: CheckPermissionResult = {
        allowed: false,
        message: 'No tienes acceso a esta empresa',
      };

      if (shouldRedirect) {
        redirect(redirectTo);
      }

      return result;
    }

    // Los owners tienen TODOS los permisos
    if (userPermissions.isOwner) {
      return { allowed: true };
    }

    // Roles de sistema (owner, developer) tienen todos los permisos
    if (userPermissions.roleSlug === 'owner' || userPermissions.roleSlug === 'developer') {
      return { allowed: true };
    }

    // Verificar permiso específico
    const modulePermissions = userPermissions.permissions[module];
    const hasPermission = modulePermissions?.[action] === true;

    if (!hasPermission) {
      const result: CheckPermissionResult = {
        allowed: false,
        message: 'No tienes permiso para realizar esta acción',
      };

      if (shouldRedirect) {
        redirect(redirectTo);
      }

      return result;
    }

    return { allowed: true };
  } catch (error) {
    // Si es un redirect, re-lanzar
    if (error instanceof Error && error.message.includes('NEXT_REDIRECT')) {
      throw error;
    }

    log.error('Error checking permission', { data: { error, module, action } });

    const result: CheckPermissionResult = {
      allowed: false,
      message: 'Error al verificar permisos',
    };

    if (shouldRedirect) {
      redirect(redirectTo);
    }

    return result;
  }
}

/**
 * Verifica si el usuario actual tiene alguno de los permisos especificados
 *
 * @example
 * const canManage = await checkAnyPermission([
 *   { module: 'employees', action: 'update' },
 *   { module: 'employees', action: 'delete' },
 * ]);
 */
export async function checkAnyPermission(
  permissions: Array<{ module: Module | string; action: Action | string }>
): Promise<boolean> {
  const userPermissions = await getCurrentUserPermissions();

  if (!userPermissions) return false;

  // Owners y developers tienen todos los permisos
  if (
    userPermissions.isOwner ||
    userPermissions.roleSlug === 'owner' ||
    userPermissions.roleSlug === 'developer'
  ) {
    return true;
  }

  return permissions.some(({ module, action }) => {
    return userPermissions.permissions[module]?.[action] === true;
  });
}

/**
 * Verifica si el usuario actual tiene todos los permisos especificados
 *
 * @example
 * const canFullyManage = await checkAllPermissions([
 *   { module: 'employees', action: 'create' },
 *   { module: 'employees', action: 'update' },
 *   { module: 'employees', action: 'delete' },
 * ]);
 */
export async function checkAllPermissions(
  permissions: Array<{ module: Module | string; action: Action | string }>
): Promise<boolean> {
  const userPermissions = await getCurrentUserPermissions();

  if (!userPermissions) return false;

  // Owners y developers tienen todos los permisos
  if (
    userPermissions.isOwner ||
    userPermissions.roleSlug === 'owner' ||
    userPermissions.roleSlug === 'developer'
  ) {
    return true;
  }

  return permissions.every(({ module, action }) => {
    return userPermissions.permissions[module]?.[action] === true;
  });
}

/**
 * Verifica si el usuario actual es owner de la empresa
 */
export async function checkIsOwner(): Promise<boolean> {
  const userPermissions = await getCurrentUserPermissions();
  return userPermissions?.isOwner === true;
}

/**
 * Verifica si el usuario actual tiene un rol de sistema (owner o developer)
 */
export async function checkIsSystemRole(): Promise<boolean> {
  const userPermissions = await getCurrentUserPermissions();

  if (!userPermissions) return false;

  return (
    userPermissions.isOwner ||
    userPermissions.roleSlug === 'owner' ||
    userPermissions.roleSlug === 'developer'
  );
}
