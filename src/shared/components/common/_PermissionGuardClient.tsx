'use client';

import type { ReactNode } from 'react';

import { usePermissions } from '@/shared/hooks/usePermissions';
import type { Module, Action } from '@/shared/lib/permissions';

interface PermissionGuardClientProps {
  /**
   * Módulo a verificar (e.g., 'employees', 'commercial.clients')
   */
  module: Module;
  /**
   * Acción a verificar (e.g., 'view', 'create', 'update', 'delete')
   */
  action: Action;
  /**
   * Contenido a mostrar si tiene permiso
   */
  children: ReactNode;
  /**
   * Contenido a mostrar si NO tiene permiso (opcional)
   * Si no se proporciona, no se renderiza nada
   */
  fallback?: ReactNode;
  /**
   * Contenido a mostrar mientras se cargan los permisos (opcional)
   */
  loading?: ReactNode;
}

/**
 * Client Component que protege contenido basado en permisos.
 * Usa el hook usePermissions internamente.
 *
 * @example
 * ```tsx
 * // En un componente cliente
 * <_PermissionGuardClient module="employees" action="create">
 *   <Button onClick={handleCreate}>Crear Empleado</Button>
 * </_PermissionGuardClient>
 *
 * // Con loading y fallback
 * <_PermissionGuardClient
 *   module="employees"
 *   action="delete"
 *   loading={<Skeleton className="h-10 w-24" />}
 *   fallback={<p className="text-muted-foreground">Sin permiso</p>}
 * >
 *   <Button variant="destructive">Eliminar</Button>
 * </_PermissionGuardClient>
 * ```
 */
export function _PermissionGuardClient({
  module,
  action,
  children,
  fallback = null,
  loading = null,
}: PermissionGuardClientProps) {
  const { hasPermission, isLoading } = usePermissions();

  if (isLoading) {
    return <>{loading}</>;
  }

  if (!hasPermission(module, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
