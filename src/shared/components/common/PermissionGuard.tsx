import type { ReactNode } from 'react';

import { checkPermission } from '@/shared/lib/permissions';
import type { Module, Action } from '@/shared/lib/permissions';

interface PermissionGuardProps {
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
   * Si es true, redirige al dashboard cuando no tiene permiso
   * Útil para proteger páginas completas
   */
  redirect?: boolean;
  /**
   * URL a la que redirigir (por defecto: /dashboard)
   */
  redirectTo?: string;
}

/**
 * Server Component que protege contenido basado en permisos.
 *
 * @example
 * ```tsx
 * // Solo mostrar botón si tiene permiso de crear
 * <PermissionGuard module="employees" action="create">
 *   <Button>Crear Empleado</Button>
 * </PermissionGuard>
 *
 * // Proteger página completa con redirección
 * <PermissionGuard module="employees" action="view" redirect>
 *   <EmployeesPage />
 * </PermissionGuard>
 *
 * // Con fallback para mostrar mensaje si no tiene permiso
 * <PermissionGuard
 *   module="employees"
 *   action="delete"
 *   fallback={<p className="text-muted-foreground">No tienes permiso</p>}
 * >
 *   <Button variant="destructive">Eliminar</Button>
 * </PermissionGuard>
 * ```
 */
export async function PermissionGuard({
  module,
  action,
  children,
  fallback = null,
  redirect: shouldRedirect = false,
  redirectTo = '/dashboard',
}: PermissionGuardProps) {
  const result = await checkPermission(module, action, {
    redirect: shouldRedirect,
    redirectTo,
  });

  if (!result.allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
