'use client';

import { useQuery } from '@tanstack/react-query';
import { useCallback } from 'react';

import { getCurrentUserPermissions } from '@/shared/lib/permissions';
import type { Module, Action, UserPermissions } from '@/shared/lib/permissions';

interface RoleInfo {
  id: string | null;
  slug: string | null;
  name: string | null;
}

interface UsePermissionsReturn {
  /**
   * Permisos del usuario actual
   */
  permissions: UserPermissions | null;
  /**
   * Si está cargando los permisos
   */
  isLoading: boolean;
  /**
   * Si hubo un error al cargar los permisos
   */
  isError: boolean;
  /**
   * Verifica si el usuario tiene un permiso específico
   */
  hasPermission: (module: Module, action: Action) => boolean;
  /**
   * Verifica si el usuario tiene CUALQUIERA de los permisos especificados
   */
  hasAnyPermission: (permissions: Array<{ module: Module; action: Action }>) => boolean;
  /**
   * Verifica si el usuario tiene TODOS los permisos especificados
   */
  hasAllPermissions: (permissions: Array<{ module: Module; action: Action }>) => boolean;
  /**
   * Verifica si el usuario es owner de la empresa
   */
  isOwner: boolean;
  /**
   * Verifica si el usuario tiene un rol de sistema específico
   */
  isSystemRole: (roleSlug: string) => boolean;
  /**
   * Información del rol actual del usuario
   */
  role: RoleInfo | null;
}

/**
 * Hook para verificar permisos del usuario actual en Client Components.
 *
 * @example
 * ```tsx
 * function MyComponent() {
 *   const { hasPermission, isOwner, isLoading } = usePermissions();
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   return (
 *     <div>
 *       {hasPermission('employees', 'create') && (
 *         <Button>Crear Empleado</Button>
 *       )}
 *       {isOwner && (
 *         <Button variant="destructive">Eliminar Empresa</Button>
 *       )}
 *     </div>
 *   );
 * }
 * ```
 */
export function usePermissions(): UsePermissionsReturn {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['user-permissions'],
    queryFn: getCurrentUserPermissions,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos (antes cacheTime)
    refetchOnWindowFocus: false,
  });

  const hasPermission = useCallback(
    (module: Module, action: Action): boolean => {
      if (!data) return false;

      // Owner tiene todos los permisos
      if (data.isOwner) return true;

      // Verificar en el mapa de permisos
      // El mapa tiene la estructura: { [module]: { [action]: boolean } }
      const modulePerms = data.permissions[module];
      if (!modulePerms) return false;

      return modulePerms[action] === true;
    },
    [data]
  );

  const hasAnyPermission = useCallback(
    (permissions: Array<{ module: Module; action: Action }>): boolean => {
      return permissions.some(({ module, action }) => hasPermission(module, action));
    },
    [hasPermission]
  );

  const hasAllPermissions = useCallback(
    (permissions: Array<{ module: Module; action: Action }>): boolean => {
      return permissions.every(({ module, action }) => hasPermission(module, action));
    },
    [hasPermission]
  );

  const isSystemRole = useCallback(
    (roleSlug: string): boolean => {
      if (!data?.roleSlug) return false;
      // Los roles de sistema tienen slugs específicos: 'owner', 'developer', 'admin'
      return data.roleSlug === roleSlug;
    },
    [data]
  );

  const role: RoleInfo | null = data
    ? {
        id: data.roleId,
        slug: data.roleSlug,
        name: data.roleName,
      }
    : null;

  return {
    permissions: data ?? null,
    isLoading,
    isError,
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    isOwner: data?.isOwner ?? false,
    isSystemRole,
    role,
  };
}
