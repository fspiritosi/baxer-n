# Autenticacion y Permisos

## Autenticacion (Clerk)

### Middleware

Archivo: `src/proxy.ts`

```typescript
const isPublicRoute = createRouteMatcher([
  '/',           // Landing
  '/sign-in(.*)',  // Login
  '/sign-up(.*)',  // Registro
  '/eq/(.*)'       // QR publico de equipos
]);
```

Todas las rutas no publicas requieren autenticacion via `auth.protect()`.

### Providers

Archivo: `src/providers/SessionProvider.tsx`

Envuelve la app con `ClerkProvider` configurado con localizacion `esES` (espanol).

### Uso en Server Actions

```typescript
import { auth } from '@clerk/nextjs/server';

export async function myAction() {
  const { userId } = await auth();
  if (!userId) throw new Error('No autenticado');
  // ...
}
```

En la practica, se usa `getActiveCompanyId()` que internamente llama a `auth()`:

```typescript
import { getActiveCompanyId } from '@/shared/lib/company';

export async function getItems() {
  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');
  return prisma.item.findMany({ where: { companyId } });
}
```

---

## Sistema RBAC (Permisos)

Directorio: `src/shared/lib/permissions/`

### Arquitectura

```
CompanyMember
  ├── role → CompanyRole
  │            └── permissions → CompanyRolePermission[] (module + action)
  │
  └── permissions → CompanyMemberPermission[] (overrides individuales)
                      └── isGranted: true/false (otorga o revoca)
```

### Jerarquia de Resolucion

1. **Owner flag** (`CompanyMember.isOwner = true`) → acceso total, sin verificaciones
2. **Roles sistema** (slug `owner` o `developer`) → acceso total
3. **Permisos de rol** (`CompanyRolePermission`) → permisos base
4. **Overrides individuales** (`CompanyMemberPermission`) → pueden otorgar (`isGranted: true`) o revocar (`isGranted: false`) permisos especificos

### Modulos Registrados

Archivo: `src/shared/lib/permissions/constants.ts`

50+ modulos organizados en grupos:

| Grupo | Modulos |
|-------|---------|
| Principal | `dashboard`, `employees`, `equipment`, `documents`, `accounting` |
| Comercial | `commercial`, `commercial.clients`, `commercial.leads`, `commercial.contacts`, `commercial.quotes`, `commercial.suppliers`, `commercial.categories`, `commercial.products`, `commercial.price-lists`, `commercial.warehouses`, `commercial.stock`, `commercial.movements`, `commercial.points-of-sale`, `commercial.invoices`, `commercial.purchases`, `commercial.treasury.cash-registers`, `commercial.treasury.bank-accounts`, `commercial.treasury.receipts`, `commercial.treasury.payment-orders`, `commercial.expenses` |
| Config General | `company.general.users`, `company.general.roles`, `company.general.audit`, `company.documents` |
| Config RRHH | `company.cost-centers`, `company.contract-types`, `company.job-positions`, `company.job-categories`, `company.unions`, `company.collective-agreements` |
| Config Equipos | `company.vehicle-brands`, `company.vehicle-types`, `company.equipment-owners`, `company.sectors`, `company.type-operatives`, `company.contractors` |
| Config Documentos | `company.document-types` |
| Contabilidad | `accounting.accounts`, `accounting.entries`, `accounting.reports`, `accounting.settings`, `accounting.fiscal-year-close`, `accounting.recurring-entries` |

### Acciones

4 acciones por modulo: `view`, `create`, `update`, `delete`

### Roles del Sistema

| Slug | Nombre | Comportamiento |
|------|--------|----------------|
| `owner` | Propietario | Acceso total (bypass completo) |
| `developer` | Desarrollador | Acceso total (bypass completo) |
| `admin` | Administrador | Rol default, permisos configurables |

### Funciones Principales

#### Server-side

```typescript
// Verificar un permiso (redirige si no tiene acceso)
import { checkPermission } from '@/shared/lib/permissions';
await checkPermission('employees', 'create', { redirect: true });

// Verificar cualquiera de varios permisos (OR)
await checkAnyPermission([
  { module: 'commercial.invoices', action: 'view' },
  { module: 'commercial.purchases', action: 'view' },
]);

// Verificar todos los permisos (AND)
await checkAllPermissions([...]);

// Obtener permisos de un modulo (usa React cache())
import { getModulePermissions } from '@/shared/lib/permissions';
const { canView, canCreate, canUpdate, canDelete } = await getModulePermissions('commercial.invoices');

// Batch: multiples modulos en 1 query
const perms = await getMultipleModulePermissions([
  'commercial.invoices',
  'commercial.purchases',
]);

// Obtener todos los permisos del usuario
import { getCurrentUserPermissions } from '@/shared/lib/permissions';
const { isOwner, permissions } = await getCurrentUserPermissions();
```

`getModulePermissions()` usa `React.cache()` para deduplicar queries dentro del mismo request. Es seguro llamarlo desde multiples Server Components en paralelo.

#### Client-side

```typescript
import { usePermissions } from '@/shared/hooks/usePermissions';

function MyComponent() {
  const { hasPermission, isOwner } = usePermissions();

  if (!hasPermission('commercial.invoices', 'create')) {
    return null;
  }
  // ...
}
```

### Componentes de Guarda

#### Server Component

```typescript
import { PermissionGuard } from '@/shared/components/common';

<PermissionGuard module="employees" action="create">
  <CreateEmployeeButton />
</PermissionGuard>
```

#### Client Component

```typescript
import { PermissionGuardClient } from '@/shared/components/common';

<PermissionGuardClient module="employees" action="create">
  <CreateEmployeeButton />
</PermissionGuardClient>
```

### Auditoria

Archivo: `src/shared/lib/permissions/audit.server.ts`

Acciones auditadas automaticamente:
- Creacion/edicion/eliminacion de roles
- Cambio de permisos de rol
- Invitacion de miembros
- Cambio de rol de miembro
- Activacion/desactivacion de miembro
- Otorgamiento/revocacion de permisos individuales

```typescript
import { createAuditLog } from '@/shared/lib/permissions';

await createAuditLog({
  companyId,
  action: 'role_created',
  performedBy: userId,
  targetId: roleId,
  details: { roleName: 'Vendedor' },
});
```

Consulta de logs:

```typescript
const { logs, total } = await getAuditLogs({
  companyId,
  page: 1,
  perPage: 20,
  search: 'vendedor',
});
```
