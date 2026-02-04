/**
 * Sistema de Permisos RBAC
 *
 * Este módulo proporciona un sistema completo de control de acceso basado en roles (RBAC)
 * para la aplicación.
 *
 * ## Uso en Server Actions
 *
 * ```typescript
 * import { checkPermission } from '@/shared/lib/permissions';
 *
 * export async function createEmployee(data: CreateEmployeeInput) {
 *   // Verificar permiso y redirigir si no tiene acceso
 *   await checkPermission('employees', 'create', { redirect: true });
 *
 *   // ... lógica de creación
 * }
 * ```
 *
 * ## Uso en Server Components
 *
 * ```typescript
 * import { PermissionGuard } from '@/shared/components/common/PermissionGuard';
 *
 * export function EmployeesPage() {
 *   return (
 *     <PermissionGuard module="employees" action="view">
 *       <EmployeesList />
 *     </PermissionGuard>
 *   );
 * }
 * ```
 *
 * ## Uso en Client Components
 *
 * ```typescript
 * import { usePermissions } from '@/shared/hooks/usePermissions';
 *
 * export function EmployeeActions() {
 *   const { hasPermission, isOwner } = usePermissions();
 *
 *   return (
 *     <>
 *       {hasPermission('employees', 'create') && (
 *         <Button>Crear Empleado</Button>
 *       )}
 *     </>
 *   );
 * }
 * ```
 */

// Constantes
export {
  MODULES,
  ACTIONS,
  MODULE_LABELS,
  ACTION_LABELS,
  MODULE_GROUPS,
  SYSTEM_ROLES,
  AUDIT_ACTIONS,
  type Module,
  type Action,
  type AuditAction,
} from './constants';

// Tipos
export type {
  Permission,
  PermissionMap,
  UserPermissions,
  RoleWithPermissions,
  AuditLogEntry,
  CheckPermissionOptions,
  CheckPermissionResult,
} from './types';

// Server Actions - Verificación de permisos
export {
  checkPermission,
  checkAnyPermission,
  checkAllPermissions,
  checkIsOwner,
  checkIsSystemRole,
} from './checkPermission.server';

// Server Actions - Obtención de permisos
export {
  getCurrentUserPermissions,
  getCompanyRoles,
  getRoleById,
  getSystemActions,
} from './getPermissions.server';

// Server Actions - Permisos por módulo (con cache)
export {
  getModulePermissions,
  getMultipleModulePermissions,
  type ModulePermissions,
} from './getModulePermissions.server';

// Server Actions - Auditoría
export { createAuditLog, getAuditLogs } from './audit.server';
