'use server';

import { getCurrentUserPermissions, MODULES } from '@/shared/lib/permissions';

/**
 * Mapa de permisos del sidebar
 * Key: módulo, Value: tiene permiso view
 */
export type SidebarPermissions = Record<string, boolean>;

/**
 * Obtiene los permisos de vista para todos los módulos del sidebar.
 *
 * - Owners y roles de sistema (owner, developer) tienen todos los permisos
 * - Usuarios normales solo ven items donde tienen permiso 'view'
 */
export async function getSidebarPermissions(): Promise<SidebarPermissions> {
  const userPermissions = await getCurrentUserPermissions();

  // Si no hay usuario o no es miembro activo, sin acceso
  if (!userPermissions) {
    return {};
  }

  // Owners y roles de sistema tienen TODOS los permisos
  if (
    userPermissions.isOwner ||
    userPermissions.roleSlug === 'owner' ||
    userPermissions.roleSlug === 'developer'
  ) {
    const allPermissions: SidebarPermissions = {};
    for (const mod of Object.values(MODULES)) {
      allPermissions[mod] = true;
    }
    return allPermissions;
  }

  // Construir mapa de permisos (solo acción 'view')
  const permissions: SidebarPermissions = {};
  for (const mod of Object.values(MODULES)) {
    permissions[mod] = userPermissions.permissions[mod]?.view === true;
  }

  return permissions;
}
