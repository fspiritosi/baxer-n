# Sistema de Roles y Permisos (RBAC) - Propuesta Completa

> **Fecha:** Enero 2026
> **Proyecto:** NewProject
> **Stack:** Next.js 16 + Clerk + Prisma 7 + PostgreSQL
> **Versión:** 2.0 (Revisada)

---

## Tabla de Contenidos

1. [Resumen Ejecutivo](#1-resumen-ejecutivo)
2. [Análisis del Estado Actual](#2-análisis-del-estado-actual)
3. [Clerk vs Sistema Propio - Comparativa](#3-clerk-vs-sistema-propio---comparativa)
4. [Arquitectura Propuesta](#4-arquitectura-propuesta)
5. [Schema de Base de Datos (Simplificado)](#5-schema-de-base-de-datos-simplificado)
6. [Estructura de Archivos](#6-estructura-de-archivos)
7. [Definición de Módulos y Acciones](#7-definición-de-módulos-y-acciones)
8. [Implementación del Core](#8-implementación-del-core)
9. [Middleware de Protección](#9-middleware-de-protección)
10. [Componentes de UI](#10-componentes-de-ui)
11. [Hook para Client Components](#11-hook-para-client-components)
12. [Uso en Server Actions](#12-uso-en-server-actions)
13. [Sidebar Dinámico](#13-sidebar-dinámico)
14. [Sistema de Auditoría](#14-sistema-de-auditoría)
15. [Seed de Datos](#15-seed-de-datos)
16. [UI de Gestión de Roles](#16-ui-de-gestión-de-roles)
17. [Roles por Defecto](#17-roles-por-defecto)
18. [Plan de Implementación](#18-plan-de-implementación)
19. [Consideraciones de Seguridad](#19-consideraciones-de-seguridad)
20. [Extensiones Futuras](#20-extensiones-futuras)

---

## 1. Resumen Ejecutivo

### Objetivo

Implementar un sistema RBAC (Role-Based Access Control) granular que permita:

- **Proteger rutas** en middleware según permisos
- **Ocultar componentes** de UI (botones, secciones) según permisos
- **Validar server actions** antes de ejecutar operaciones
- **Gestionar roles** con UI completa para crear, editar y asignar
- **Override individual** de permisos por miembro
- **Auditar cambios** de permisos para compliance

### Decisión Arquitectónica

**Sistema Híbrido: Clerk (Auth) + Prisma (Permisos)**

| Componente | Tecnología | Responsabilidad |
|------------|------------|-----------------|
| Autenticación | Clerk | Login, sesión, userId |
| Autorización | Prisma | Roles, permisos, verificación |

### ¿Por qué no usar Clerk Organizations completo?

Ver sección [3. Clerk vs Sistema Propio](#3-clerk-vs-sistema-propio---comparativa) para el análisis detallado.

---

## 2. Análisis del Estado Actual

### 2.1 Lo que YA EXISTE en Prisma

El schema de Prisma ya tiene una estructura para permisos que será **simplificada**:

```prisma
// Roles por empresa
model CompanyRole {
  id          String   @id
  name        String   // "Administrador", "Usuario"
  slug        String?
  description String?
  color       String?  // Para UI
  isDefault   Boolean  @default(false) // Rol para nuevos miembros
  isSystem    Boolean  @default(false) // owner/admin, no eliminables
  companyId   String   @db.Uuid
  permissions CompanyRolePermission[]
  members     CompanyMember[]
}

// CompanyMember tiene roleId
model CompanyMember {
  id        String       @id
  userId    String       // Clerk user ID
  isOwner   Boolean      @default(false)
  roleId    String?      @db.Uuid
  role      CompanyRole?
  permissions CompanyMemberPermission[]
}
```

### 2.2 Lo que FALTA implementar

| Componente | Estado | Descripción |
|------------|--------|-------------|
| Schema simplificado | ❌ Pendiente | Eliminar `Route`, usar module directo |
| `getPermissions()` | ❌ No existe | Obtener permisos del usuario |
| `checkPermission()` | ❌ No existe | Verificar permiso específico |
| `PermissionGuard` | ❌ No existe | Server Component wrapper para UI |
| `_PermissionGuardClient` | ❌ No existe | Client Component wrapper para UI |
| `usePermissions()` | ❌ No existe | Hook para Client Components |
| Seed de Actions | ❌ No existe | Poblar BD con acciones |
| UI de gestión | ❌ No existe | CRUD de roles y asignación |
| Audit Log | ❌ No existe | Registro de cambios de permisos |

### 2.3 Módulos que necesitan protección

```
src/app/(core)/dashboard/
├── page.tsx                          → dashboard (view)
├── employees/
│   ├── page.tsx                      → employees (view)
│   ├── new/page.tsx                  → employees (create)
│   └── [id]/
│       ├── page.tsx                  → employees (view)
│       └── edit/page.tsx             → employees (update)
├── equipment/
│   ├── page.tsx                      → equipment (view)
│   ├── new/page.tsx                  → equipment (create)
│   └── [id]/
│       ├── page.tsx                  → equipment (view)
│       └── edit/page.tsx             → equipment (update)
├── documents/page.tsx                → documents (view)
├── companies/
│   ├── page.tsx                      → companies (view)
│   ├── new/page.tsx                  → companies (create)
│   └── [id]/
│       ├── page.tsx                  → companies (view)
│       └── edit/page.tsx             → companies (update)
└── company/
    ├── cost-centers/                 → company.cost-centers
    ├── contract-types/               → company.contract-types
    ├── job-positions/                → company.job-positions
    ├── unions/                       → company.unions
    ├── collective-agreements/        → company.collective-agreements
    ├── job-categories/               → company.job-categories
    ├── vehicle-brands/               → company.vehicle-brands
    ├── vehicle-types/                → company.vehicle-types
    ├── sectors/                      → company.sectors
    ├── type-operatives/              → company.type-operatives
    ├── contractors/                  → company.contractors
    └── documents/                    → company.documents
```

---

## 3. Clerk vs Sistema Propio - Comparativa

### 3.1 Opciones Evaluadas

| Opción | Descripción |
|--------|-------------|
| **A) Clerk Organizations** | Usar el sistema RBAC completo de Clerk |
| **B) Sistema Híbrido** | Clerk (auth) + Prisma (permisos) |

### 3.2 Clerk Organizations - Análisis

**Ventajas:**
- Integración nativa con Clerk
- Componente `<Protect>` listo para usar
- Función `has()` en auth y hooks
- UI de gestión en Clerk Dashboard

**Limitaciones:**
- **Máximo 10 roles** por instancia (contactar soporte para más)
- **Permisos del sistema NO se incluyen en session claims** - hay que crear permisos custom
- Formato fijo: `org:feature:action`
- Menos granular (no soporta rutas específicas)
- Los datos de roles viven en Clerk, no en tu BD
- **Ya tienes Company/CompanyMember** en Prisma (migrar sería complejo)

**Formato de permisos en Clerk:**
```typescript
// Clerk usa formato: org:feature:action
has({ permission: 'org:invoices:create' })
has({ role: 'org:admin' })
```

### 3.3 Sistema Híbrido (Recomendado) - Análisis

**Ventajas:**
- **Sin límite de roles** por empresa
- **Permisos ultra-granulares**: módulo + acción
- **Override individual** por miembro (ya en schema)
- **Datos en tu BD** - control total, backups, migraciones
- **Auditoría completa** - puedes logear todo
- **Schema simplificado** - sin tabla Route intermedia

**Desventajas:**
- Más código a mantener
- No hay UI de Clerk Dashboard para roles

### 3.4 Decisión

**Sistema Híbrido (Opción B)** por las siguientes razones:

1. El schema de Prisma ya está diseñado para permisos
2. Ya tienes `Company` y `CompanyMember` - no usa Organizations de Clerk
3. Necesitas más de 10 roles (cada empresa puede tener sus propios roles)
4. Quieres permisos a nivel de módulo específico
5. El override individual por miembro ya está modelado

### 3.5 Integración con Clerk

Clerk seguirá siendo responsable de:
- **Autenticación** (login, logout, sesión)
- **userId** en `auth()`
- **Middleware base** para rutas públicas/privadas
- **Componentes** de UI (`<SignIn>`, `<UserButton>`)

Prisma será responsable de:
- **Autorización** (qué puede hacer el usuario)
- **Roles** y sus permisos
- **Verificación** de acceso

---

## 4. Arquitectura Propuesta

### 4.1 Diagrama General

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           FLUJO DE AUTORIZACIÓN                          │
└─────────────────────────────────────────────────────────────────────────┘

    Usuario                     Clerk                      Prisma
       │                          │                          │
       │ 1. Request               │                          │
       ├─────────────────────────►│                          │
       │                          │                          │
       │ 2. Verificar sesión      │                          │
       │◄─────────────────────────┤                          │
       │    (userId)              │                          │
       │                          │                          │
       │ 3. Obtener permisos      │                          │
       ├──────────────────────────┼─────────────────────────►│
       │                          │     (userId, companyId)  │
       │                          │                          │
       │ 4. Retornar permisos     │                          │
       │◄─────────────────────────┼──────────────────────────┤
       │    (Map<Module, Set<Action>>)                       │
       │                          │                          │
       │ 5. Verificar acceso      │                          │
       │    (checkPermission)     │                          │
       │                          │                          │
       │ 6. Renderizar/Ejecutar   │                          │
       │                          │                          │

┌─────────────────────────────────────────────────────────────────────────┐
│                           CAPAS DE PROTECCIÓN                            │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐ │
│  │  Middleware  │  │ Permission   │  │   check      │  │    use      │ │
│  │   (Clerk)    │  │ Guard (UI)   │  │  Permission  │  │ Permissions │ │
│  │              │  │ Server+Client│  │  (Actions)   │  │   (Hook)    │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬──────┘ │
│         │                 │                 │                 │        │
│         │    Solo Auth    │                 │                 │        │
│         │                 └────────┬────────┴─────────────────┘        │
│         │                          │                                    │
│         │           ┌──────────────▼──────────────┐                    │
│         │           │    getPermissions()         │                    │
│         │           │    (Prisma + Cache + Tags)  │                    │
│         │           └──────────────┬──────────────┘                    │
│         │                          │                                    │
│         └──────────────────────────┼────────────────────────────────── │
│                                    │                                    │
│                     ┌──────────────▼──────────────┐                    │
│                     │         PRISMA              │                    │
│                     │  CompanyMember → Role →     │                    │
│                     │  RolePermissions + Overrides│                    │
│                     └─────────────────────────────┘                    │
│                                                                         │
└─────────────────────────────────────────────────────────────────────────┘
```

### 4.2 Flujo de Verificación

```
1. Request llega al servidor
         │
         ▼
2. Middleware (Clerk) verifica autenticación
         │
         ├─► No autenticado? → Redirect a /sign-in
         │
         ▼
3. Layout/Page obtiene permisos
         │
         ├─► getPermissions() con cache + tags
         │
         ▼
4. Verificación según contexto:
         │
         ├─► Página: PageGuard o redirect
         ├─► Server Component: PermissionGuard
         ├─► Client Component: _PermissionGuardClient o usePermissions()
         ├─► Server Action: checkPermission()
         │
         ▼
5. Acceso permitido o denegado
         │
         ├─► Denegado? → Log en audit + error/redirect
         │
         ▼
6. Ejecutar acción
```

---

## 5. Schema de Base de Datos (Simplificado)

### 5.1 Cambios respecto al schema actual

**ANTES (complejo con Route):**
```
CompanyRole → CompanyRolePermission → Route + Action
```

**DESPUÉS (simplificado):**
```
CompanyRole → CompanyRolePermission (module + action directos)
```

**Ventajas del schema simplificado:**
- Una sola fuente de verdad: `MODULES` en constants.ts
- Queries más simples (sin JOINs a Route)
- Seed más simple (solo Actions)
- `getPermissions()` más rápido

### 5.2 Schema Prisma Actualizado

```prisma
// ============================================
// SISTEMA DE ROLES Y PERMISOS (SIMPLIFICADO)
// ============================================

// Acciones disponibles (CRUD + especiales)
model Action {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String   @unique // "Ver", "Crear", "Editar", "Eliminar"
  slug        String   @unique // "view", "create", "update", "delete"
  description String?
  createdAt   DateTime @default(now()) @map("created_at")

  // Relaciones
  rolePermissions   CompanyRolePermission[]
  memberPermissions CompanyMemberPermission[]

  @@map("actions")
}

// Roles por empresa
model CompanyRole {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name        String   // "Administrador", "Usuario"
  slug        String?
  description String?
  color       String?  // Para UI (hex color)
  isDefault   Boolean  @default(false) @map("is_default") // Rol para nuevos miembros
  isSystem    Boolean  @default(false) @map("is_system") // owner/admin, no eliminables
  createdAt   DateTime @default(now()) @map("created_at")
  updatedAt   DateTime @updatedAt @map("updated_at")

  // Relaciones
  companyId String  @map("company_id") @db.Uuid
  company   Company @relation(fields: [companyId], references: [id], onDelete: Cascade)

  permissions CompanyRolePermission[]
  members     CompanyMember[]
  invitations CompanyInvitation[]

  @@unique([companyId, slug])
  @@map("company_roles")
}

// Permisos de cada rol (SIMPLIFICADO: module + action directos)
model CompanyRolePermission {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  module    String   // "employees", "company.unions", "settings.permissions"
  createdAt DateTime @default(now()) @map("created_at")

  // Relaciones
  roleId   String      @map("role_id") @db.Uuid
  role     CompanyRole @relation(fields: [roleId], references: [id], onDelete: Cascade)
  actionId String      @map("action_id") @db.Uuid
  action   Action      @relation(fields: [actionId], references: [id], onDelete: Cascade)

  @@unique([roleId, module, actionId])
  @@map("company_role_permissions")
}

// Override de permisos individuales por miembro
model CompanyMemberPermission {
  id         String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  module     String   // "employees", "company.unions"
  isGranted  Boolean  @default(true) @map("is_granted") // true=concede, false=revoca
  assignedBy String?  @map("assigned_by") // Clerk user ID
  createdAt  DateTime @default(now()) @map("created_at")

  // Relaciones
  memberId String        @map("member_id") @db.Uuid
  member   CompanyMember @relation(fields: [memberId], references: [id], onDelete: Cascade)
  actionId String        @map("action_id") @db.Uuid
  action   Action        @relation(fields: [actionId], references: [id], onDelete: Cascade)

  @@unique([memberId, module, actionId])
  @@map("company_member_permissions")
}

// ============================================
// AUDITORÍA DE PERMISOS
// ============================================

model PermissionAuditLog {
  id          String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId   String   @map("company_id") @db.Uuid
  performedBy String   @map("performed_by") // Clerk userId que hizo el cambio
  action      String   // "role_created", "role_updated", "role_deleted",
                       // "permission_granted", "permission_revoked",
                       // "member_role_changed", "member_permission_override"
  targetType  String   @map("target_type") // "role", "member", "permission"
  targetId    String   @map("target_id") @db.Uuid
  targetName  String?  @map("target_name") // Nombre del rol/usuario para referencia
  module      String?  // Módulo afectado (si aplica)
  details     Json?    // Detalles adicionales del cambio
  oldValue    Json?    @map("old_value") // Estado anterior
  newValue    Json?    @map("new_value") // Estado nuevo
  ipAddress   String?  @map("ip_address")
  userAgent   String?  @map("user_agent")
  createdAt   DateTime @default(now()) @map("created_at")

  @@index([companyId, createdAt])
  @@index([performedBy])
  @@index([targetType, targetId])
  @@map("permission_audit_logs")
}
```

### 5.3 Migración del Schema Existente

Si ya tienes datos en el schema actual con `Route`, ejecutar migración:

```sql
-- 1. Crear nueva columna module en CompanyRolePermission
ALTER TABLE company_role_permissions ADD COLUMN module VARCHAR(100);

-- 2. Migrar datos: copiar module desde Route
UPDATE company_role_permissions crp
SET module = r.module
FROM routes r
WHERE crp.route_id = r.id;

-- 3. Hacer module NOT NULL
ALTER TABLE company_role_permissions ALTER COLUMN module SET NOT NULL;

-- 4. Crear nuevo unique constraint
ALTER TABLE company_role_permissions
DROP CONSTRAINT IF EXISTS company_role_permissions_role_id_route_id_action_id_key;

ALTER TABLE company_role_permissions
ADD CONSTRAINT company_role_permissions_role_id_module_action_id_key
UNIQUE (role_id, module, action_id);

-- 5. Eliminar columna route_id
ALTER TABLE company_role_permissions DROP COLUMN route_id;

-- 6. Repetir para CompanyMemberPermission
-- ... similar proceso

-- 7. (Opcional) Eliminar tabla Route si ya no se usa
-- DROP TABLE routes;
```

---

## 6. Estructura de Archivos

```
src/
├── shared/
│   ├── lib/
│   │   └── permissions/                    # Core del sistema
│   │       ├── index.ts                    # Exports públicos
│   │       ├── constants.ts                # Módulos, acciones
│   │       ├── types.ts                    # Tipos TypeScript
│   │       ├── getPermissions.server.ts    # Obtener permisos (server)
│   │       ├── checkPermission.server.ts   # Verificar permiso (server)
│   │       ├── cache.ts                    # Cache con tags
│   │       └── audit.server.ts             # Funciones de auditoría
│   │
│   ├── components/
│   │   └── common/
│   │       ├── PermissionGuard.tsx         # Server Component wrapper
│   │       ├── _PermissionGuardClient.tsx  # Client Component wrapper
│   │       └── PageGuard.tsx               # Wrapper para páginas
│   │
│   └── hooks/
│       └── usePermissions.ts               # Hook para client components
│
├── modules/
│   └── permissions/                        # Módulo de gestión
│       ├── features/
│       │   ├── roles/                      # CRUD de roles
│       │   │   ├── RolesList.tsx
│       │   │   ├── RoleDetail.tsx
│       │   │   ├── RoleCreate.tsx
│       │   │   ├── RoleEdit.tsx
│       │   │   ├── actions.server.ts
│       │   │   └── components/
│       │   │       ├── _RolesTable.tsx
│       │   │       ├── _RoleForm.tsx
│       │   │       └── _PermissionsMatrix.tsx
│       │   │
│       │   ├── members/                    # Asignación a miembros
│       │   │   ├── MemberPermissions.tsx
│       │   │   └── actions.server.ts
│       │   │
│       │   └── audit/                      # Vista de auditoría
│       │       ├── AuditLogList.tsx
│       │       ├── actions.server.ts
│       │       └── components/
│       │           └── _AuditLogTable.tsx
│       │
│       ├── types.ts
│       └── index.ts
│
├── app/
│   ├── (core)/dashboard/
│   │   └── settings/
│   │       └── permissions/                # UI de gestión
│   │           ├── page.tsx                # Lista de roles
│   │           ├── new/page.tsx            # Crear rol
│   │           ├── [id]/
│   │           │   ├── page.tsx            # Detalle de rol
│   │           │   └── edit/page.tsx       # Editar rol
│   │           └── audit/
│   │               └── page.tsx            # Log de auditoría
│   │
│   └── api/
│       └── permissions/
│           └── route.ts                    # API para hook client
│
├── middleware.ts                           # Protección de rutas (Clerk)
│
└── prisma/
    └── seed/
        └── permissions.ts                  # Seed de acciones
```

---

## 7. Definición de Módulos y Acciones

### 7.1 Constantes del Sistema

```typescript
// shared/lib/permissions/constants.ts

/**
 * Módulos del sistema
 * Cada módulo corresponde a una sección de la aplicación
 *
 * IMPORTANTE: Esta es la ÚNICA fuente de verdad para módulos.
 * El schema de Prisma usa estos valores como strings.
 */
export const MODULES = {
  // Principal
  DASHBOARD: 'dashboard',
  EMPLOYEES: 'employees',
  EQUIPMENT: 'equipment',
  DOCUMENTS: 'documents',
  COMPANIES: 'companies',

  // Configuración de empresa
  COMPANY_COST_CENTERS: 'company.cost-centers',
  COMPANY_CONTRACT_TYPES: 'company.contract-types',
  COMPANY_JOB_POSITIONS: 'company.job-positions',
  COMPANY_UNIONS: 'company.unions',
  COMPANY_COLLECTIVE_AGREEMENTS: 'company.collective-agreements',
  COMPANY_JOB_CATEGORIES: 'company.job-categories',
  COMPANY_VEHICLE_BRANDS: 'company.vehicle-brands',
  COMPANY_VEHICLE_TYPES: 'company.vehicle-types',
  COMPANY_SECTORS: 'company.sectors',
  COMPANY_TYPE_OPERATIVES: 'company.type-operatives',
  COMPANY_CONTRACTORS: 'company.contractors',
  COMPANY_DOCUMENTS: 'company.documents',

  // Administración
  SETTINGS_PERMISSIONS: 'settings.permissions',
  SETTINGS_MEMBERS: 'settings.members',
  SETTINGS_AUDIT: 'settings.audit',
} as const;

/**
 * Acciones disponibles
 */
export const ACTIONS = {
  VIEW: 'view',       // Ver/listar
  CREATE: 'create',   // Crear nuevo
  UPDATE: 'update',   // Editar existente
  DELETE: 'delete',   // Eliminar
  EXPORT: 'export',   // Exportar datos
  APPROVE: 'approve', // Aprobar documentos
} as const;

/**
 * Nombres legibles para UI
 */
export const MODULE_LABELS: Record<string, string> = {
  [MODULES.DASHBOARD]: 'Dashboard',
  [MODULES.EMPLOYEES]: 'Empleados',
  [MODULES.EQUIPMENT]: 'Equipos',
  [MODULES.DOCUMENTS]: 'Documentos',
  [MODULES.COMPANIES]: 'Empresas',
  [MODULES.COMPANY_COST_CENTERS]: 'Centros de Costo',
  [MODULES.COMPANY_CONTRACT_TYPES]: 'Tipos de Contrato',
  [MODULES.COMPANY_JOB_POSITIONS]: 'Puestos de Trabajo',
  [MODULES.COMPANY_UNIONS]: 'Sindicatos',
  [MODULES.COMPANY_COLLECTIVE_AGREEMENTS]: 'Convenios Colectivos',
  [MODULES.COMPANY_JOB_CATEGORIES]: 'Categorías Laborales',
  [MODULES.COMPANY_VEHICLE_BRANDS]: 'Marcas de Vehículos',
  [MODULES.COMPANY_VEHICLE_TYPES]: 'Tipos de Equipo',
  [MODULES.COMPANY_SECTORS]: 'Sectores',
  [MODULES.COMPANY_TYPE_OPERATIVES]: 'Tipos Operativos',
  [MODULES.COMPANY_CONTRACTORS]: 'Contratistas',
  [MODULES.COMPANY_DOCUMENTS]: 'Tipos de Documento',
  [MODULES.SETTINGS_PERMISSIONS]: 'Roles y Permisos',
  [MODULES.SETTINGS_MEMBERS]: 'Miembros',
  [MODULES.SETTINGS_AUDIT]: 'Auditoría',
};

export const ACTION_LABELS: Record<string, string> = {
  [ACTIONS.VIEW]: 'Ver',
  [ACTIONS.CREATE]: 'Crear',
  [ACTIONS.UPDATE]: 'Editar',
  [ACTIONS.DELETE]: 'Eliminar',
  [ACTIONS.EXPORT]: 'Exportar',
  [ACTIONS.APPROVE]: 'Aprobar',
};

/**
 * Grupos de módulos para organizar la UI de la matriz de permisos
 */
export const MODULE_GROUPS = {
  PRINCIPAL: {
    label: 'Principal',
    modules: [
      MODULES.DASHBOARD,
      MODULES.EMPLOYEES,
      MODULES.EQUIPMENT,
      MODULES.DOCUMENTS,
      MODULES.COMPANIES,
    ],
  },
  CONFIGURACION: {
    label: 'Configuración de Empresa',
    modules: [
      MODULES.COMPANY_COST_CENTERS,
      MODULES.COMPANY_CONTRACT_TYPES,
      MODULES.COMPANY_JOB_POSITIONS,
      MODULES.COMPANY_UNIONS,
      MODULES.COMPANY_COLLECTIVE_AGREEMENTS,
      MODULES.COMPANY_JOB_CATEGORIES,
      MODULES.COMPANY_VEHICLE_BRANDS,
      MODULES.COMPANY_VEHICLE_TYPES,
      MODULES.COMPANY_SECTORS,
      MODULES.COMPANY_TYPE_OPERATIVES,
      MODULES.COMPANY_CONTRACTORS,
      MODULES.COMPANY_DOCUMENTS,
    ],
  },
  ADMINISTRACION: {
    label: 'Administración',
    modules: [
      MODULES.SETTINGS_PERMISSIONS,
      MODULES.SETTINGS_MEMBERS,
      MODULES.SETTINGS_AUDIT,
    ],
  },
} as const;

/**
 * Mapeo de rutas a módulos y acciones
 * Usado para determinar qué permiso verificar según la URL
 */
export const ROUTE_TO_PERMISSION: Record<string, { module: string; action: string }> = {
  // Dashboard
  '/dashboard': { module: MODULES.DASHBOARD, action: ACTIONS.VIEW },

  // Empleados
  '/dashboard/employees': { module: MODULES.EMPLOYEES, action: ACTIONS.VIEW },
  '/dashboard/employees/new': { module: MODULES.EMPLOYEES, action: ACTIONS.CREATE },
  '/dashboard/employees/[id]': { module: MODULES.EMPLOYEES, action: ACTIONS.VIEW },
  '/dashboard/employees/[id]/edit': { module: MODULES.EMPLOYEES, action: ACTIONS.UPDATE },

  // Equipos
  '/dashboard/equipment': { module: MODULES.EQUIPMENT, action: ACTIONS.VIEW },
  '/dashboard/equipment/new': { module: MODULES.EQUIPMENT, action: ACTIONS.CREATE },
  '/dashboard/equipment/[id]': { module: MODULES.EQUIPMENT, action: ACTIONS.VIEW },
  '/dashboard/equipment/[id]/edit': { module: MODULES.EQUIPMENT, action: ACTIONS.UPDATE },

  // Documentos
  '/dashboard/documents': { module: MODULES.DOCUMENTS, action: ACTIONS.VIEW },

  // Empresas
  '/dashboard/companies': { module: MODULES.COMPANIES, action: ACTIONS.VIEW },
  '/dashboard/companies/new': { module: MODULES.COMPANIES, action: ACTIONS.CREATE },
  '/dashboard/companies/[id]': { module: MODULES.COMPANIES, action: ACTIONS.VIEW },
  '/dashboard/companies/[id]/edit': { module: MODULES.COMPANIES, action: ACTIONS.UPDATE },

  // Configuración - Centros de Costo
  '/dashboard/company/cost-centers': { module: MODULES.COMPANY_COST_CENTERS, action: ACTIONS.VIEW },
  '/dashboard/company/cost-centers/new': { module: MODULES.COMPANY_COST_CENTERS, action: ACTIONS.CREATE },
  '/dashboard/company/cost-centers/[id]/edit': { module: MODULES.COMPANY_COST_CENTERS, action: ACTIONS.UPDATE },

  // Configuración - Tipos de Contrato
  '/dashboard/company/contract-types': { module: MODULES.COMPANY_CONTRACT_TYPES, action: ACTIONS.VIEW },
  '/dashboard/company/contract-types/new': { module: MODULES.COMPANY_CONTRACT_TYPES, action: ACTIONS.CREATE },
  '/dashboard/company/contract-types/[id]/edit': { module: MODULES.COMPANY_CONTRACT_TYPES, action: ACTIONS.UPDATE },

  // Configuración - Puestos de Trabajo
  '/dashboard/company/job-positions': { module: MODULES.COMPANY_JOB_POSITIONS, action: ACTIONS.VIEW },
  '/dashboard/company/job-positions/new': { module: MODULES.COMPANY_JOB_POSITIONS, action: ACTIONS.CREATE },
  '/dashboard/company/job-positions/[id]/edit': { module: MODULES.COMPANY_JOB_POSITIONS, action: ACTIONS.UPDATE },

  // Configuración - Sindicatos
  '/dashboard/company/unions': { module: MODULES.COMPANY_UNIONS, action: ACTIONS.VIEW },
  '/dashboard/company/unions/new': { module: MODULES.COMPANY_UNIONS, action: ACTIONS.CREATE },
  '/dashboard/company/unions/[id]/edit': { module: MODULES.COMPANY_UNIONS, action: ACTIONS.UPDATE },

  // Configuración - Convenios Colectivos
  '/dashboard/company/collective-agreements': { module: MODULES.COMPANY_COLLECTIVE_AGREEMENTS, action: ACTIONS.VIEW },
  '/dashboard/company/collective-agreements/new': { module: MODULES.COMPANY_COLLECTIVE_AGREEMENTS, action: ACTIONS.CREATE },
  '/dashboard/company/collective-agreements/[id]/edit': { module: MODULES.COMPANY_COLLECTIVE_AGREEMENTS, action: ACTIONS.UPDATE },

  // Configuración - Categorías Laborales
  '/dashboard/company/job-categories': { module: MODULES.COMPANY_JOB_CATEGORIES, action: ACTIONS.VIEW },
  '/dashboard/company/job-categories/new': { module: MODULES.COMPANY_JOB_CATEGORIES, action: ACTIONS.CREATE },
  '/dashboard/company/job-categories/[id]/edit': { module: MODULES.COMPANY_JOB_CATEGORIES, action: ACTIONS.UPDATE },

  // Configuración - Marcas de Vehículos
  '/dashboard/company/vehicle-brands': { module: MODULES.COMPANY_VEHICLE_BRANDS, action: ACTIONS.VIEW },
  '/dashboard/company/vehicle-brands/new': { module: MODULES.COMPANY_VEHICLE_BRANDS, action: ACTIONS.CREATE },
  '/dashboard/company/vehicle-brands/[id]/edit': { module: MODULES.COMPANY_VEHICLE_BRANDS, action: ACTIONS.UPDATE },

  // Configuración - Tipos de Equipo
  '/dashboard/company/vehicle-types': { module: MODULES.COMPANY_VEHICLE_TYPES, action: ACTIONS.VIEW },
  '/dashboard/company/vehicle-types/new': { module: MODULES.COMPANY_VEHICLE_TYPES, action: ACTIONS.CREATE },
  '/dashboard/company/vehicle-types/[id]/edit': { module: MODULES.COMPANY_VEHICLE_TYPES, action: ACTIONS.UPDATE },

  // Configuración - Sectores
  '/dashboard/company/sectors': { module: MODULES.COMPANY_SECTORS, action: ACTIONS.VIEW },
  '/dashboard/company/sectors/new': { module: MODULES.COMPANY_SECTORS, action: ACTIONS.CREATE },
  '/dashboard/company/sectors/[id]/edit': { module: MODULES.COMPANY_SECTORS, action: ACTIONS.UPDATE },

  // Configuración - Tipos Operativos
  '/dashboard/company/type-operatives': { module: MODULES.COMPANY_TYPE_OPERATIVES, action: ACTIONS.VIEW },
  '/dashboard/company/type-operatives/new': { module: MODULES.COMPANY_TYPE_OPERATIVES, action: ACTIONS.CREATE },
  '/dashboard/company/type-operatives/[id]/edit': { module: MODULES.COMPANY_TYPE_OPERATIVES, action: ACTIONS.UPDATE },

  // Configuración - Contratistas
  '/dashboard/company/contractors': { module: MODULES.COMPANY_CONTRACTORS, action: ACTIONS.VIEW },
  '/dashboard/company/contractors/new': { module: MODULES.COMPANY_CONTRACTORS, action: ACTIONS.CREATE },
  '/dashboard/company/contractors/[id]/edit': { module: MODULES.COMPANY_CONTRACTORS, action: ACTIONS.UPDATE },

  // Configuración - Tipos de Documento
  '/dashboard/company/documents': { module: MODULES.COMPANY_DOCUMENTS, action: ACTIONS.VIEW },

  // Administración - Roles y Permisos
  '/dashboard/settings/permissions': { module: MODULES.SETTINGS_PERMISSIONS, action: ACTIONS.VIEW },
  '/dashboard/settings/permissions/new': { module: MODULES.SETTINGS_PERMISSIONS, action: ACTIONS.CREATE },
  '/dashboard/settings/permissions/[id]': { module: MODULES.SETTINGS_PERMISSIONS, action: ACTIONS.VIEW },
  '/dashboard/settings/permissions/[id]/edit': { module: MODULES.SETTINGS_PERMISSIONS, action: ACTIONS.UPDATE },

  // Administración - Miembros
  '/dashboard/settings/members': { module: MODULES.SETTINGS_MEMBERS, action: ACTIONS.VIEW },

  // Administración - Auditoría
  '/dashboard/settings/permissions/audit': { module: MODULES.SETTINGS_AUDIT, action: ACTIONS.VIEW },
};
```

### 7.2 Tipos TypeScript

```typescript
// shared/lib/permissions/types.ts

import type { ACTIONS, MODULES } from './constants';

export type Module = (typeof MODULES)[keyof typeof MODULES];
export type Action = (typeof ACTIONS)[keyof typeof ACTIONS];

/**
 * Permisos del usuario actual
 */
export interface UserPermissions {
  /** Mapa de permisos: module -> Set de acciones permitidas */
  permissions: Map<Module, Set<Action>>;

  /** Si es propietario de la empresa (tiene todos los permisos) */
  isOwner: boolean;

  /** ID del rol asignado */
  roleId: string | null;

  /** Nombre del rol para mostrar en UI */
  roleName: string | null;

  /** Módulos con al menos VIEW (para sidebar) */
  visibleModules: Module[];

  /** Tags para invalidación de cache */
  cacheTags: string[];
}

/**
 * Versión serializable para API/Client
 */
export interface SerializedPermissions {
  permissions: Record<string, string[]>; // module -> actions[]
  isOwner: boolean;
  roleId: string | null;
  roleName: string | null;
  visibleModules: string[];
}

/**
 * Para la matriz de permisos en UI
 */
export interface PermissionMatrixRow {
  module: Module;
  moduleName: string;
  actions: {
    action: Action;
    actionName: string;
    granted: boolean;
  }[];
}

/**
 * Grupo de módulos para UI
 */
export interface ModuleGroup {
  label: string;
  rows: PermissionMatrixRow[];
}

/**
 * Rol con permisos expandidos para edición
 */
export interface RoleWithPermissions {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  color: string | null;
  isDefault: boolean;
  isSystem: boolean;
  memberCount: number;
  groups: ModuleGroup[];
}

/**
 * Entrada de log de auditoría
 */
export interface AuditLogEntry {
  id: string;
  companyId: string;
  performedBy: string;
  performedByName?: string; // Resuelto desde Clerk
  action: AuditAction;
  targetType: 'role' | 'member' | 'permission';
  targetId: string;
  targetName: string | null;
  module: string | null;
  details: Record<string, unknown> | null;
  oldValue: Record<string, unknown> | null;
  newValue: Record<string, unknown> | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}

export type AuditAction =
  | 'role_created'
  | 'role_updated'
  | 'role_deleted'
  | 'permission_granted'
  | 'permission_revoked'
  | 'member_role_changed'
  | 'member_permission_override';
```

---

## 8. Implementación del Core

### 8.1 Cache de Permisos con Tags

```typescript
// shared/lib/permissions/cache.ts

import type { UserPermissions } from './types';

interface CacheEntry {
  data: UserPermissions;
  expires: number;
  tags: Set<string>;
}

/**
 * Cache de permisos con soporte para invalidación por tags.
 *
 * Tags utilizados:
 * - `company:{companyId}` - Todos los permisos de una empresa
 * - `role:{roleId}` - Todos los usuarios con este rol
 * - `user:{userId}` - Permisos de un usuario específico
 */
class PermissionsCache {
  private cache = new Map<string, CacheEntry>();
  private tagIndex = new Map<string, Set<string>>(); // tag -> Set<cacheKey>
  private ttl = 5 * 60 * 1000; // 5 minutos

  /**
   * Obtiene permisos del cache
   */
  get(key: string): UserPermissions | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expires) {
      this.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Guarda permisos en cache con tags
   */
  set(key: string, data: UserPermissions, tags: string[]): void {
    // Limpiar entrada anterior si existe
    this.delete(key);

    const tagSet = new Set(tags);

    this.cache.set(key, {
      data,
      expires: Date.now() + this.ttl,
      tags: tagSet,
    });

    // Actualizar índice de tags
    for (const tag of tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag)!.add(key);
    }
  }

  /**
   * Elimina una entrada específica
   */
  delete(key: string): void {
    const entry = this.cache.get(key);
    if (!entry) return;

    // Remover de índices de tags
    for (const tag of entry.tags) {
      const tagKeys = this.tagIndex.get(tag);
      if (tagKeys) {
        tagKeys.delete(key);
        if (tagKeys.size === 0) {
          this.tagIndex.delete(tag);
        }
      }
    }

    this.cache.delete(key);
  }

  /**
   * Invalida todas las entradas con un tag específico.
   *
   * Ejemplos:
   * - invalidateByTag(`company:${companyId}`) - Todos los usuarios de la empresa
   * - invalidateByTag(`role:${roleId}`) - Todos los usuarios con ese rol
   * - invalidateByTag(`user:${userId}`) - Un usuario específico
   */
  invalidateByTag(tag: string): number {
    const keys = this.tagIndex.get(tag);
    if (!keys) return 0;

    const count = keys.size;
    for (const key of keys) {
      this.delete(key);
    }

    return count;
  }

  /**
   * Invalida múltiples tags
   */
  invalidateByTags(tags: string[]): number {
    let count = 0;
    for (const tag of tags) {
      count += this.invalidateByTag(tag);
    }
    return count;
  }

  /**
   * Limpia todo el cache
   */
  clear(): void {
    this.cache.clear();
    this.tagIndex.clear();
  }

  /**
   * Estadísticas del cache (para debugging)
   */
  stats(): { entries: number; tags: number } {
    return {
      entries: this.cache.size,
      tags: this.tagIndex.size,
    };
  }
}

export const permissionsCache = new PermissionsCache();
```

### 8.2 Obtener Permisos

```typescript
// shared/lib/permissions/getPermissions.server.ts
'use server';

import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/shared/lib/prisma';
import { logger } from '@/shared/lib/logger';
import { getActiveCompanyId } from '@/shared/lib/company';
import type { UserPermissions, Module, Action } from './types';
import { MODULES, ACTIONS } from './constants';
import { permissionsCache } from './cache';

/**
 * Obtiene TODOS los permisos del usuario actual para la empresa activa.
 *
 * Lógica de resolución:
 * 1. Si es owner → todos los permisos
 * 2. Permisos del rol asignado
 * 3. + Overrides individuales (grant/revoke)
 *
 * Usa cache con tags para invalidación eficiente.
 */
export async function getPermissions(): Promise<UserPermissions | null> {
  const { userId } = await auth();
  if (!userId) return null;

  const companyId = await getActiveCompanyId();
  if (!companyId) return null;

  const cacheKey = `${userId}:${companyId}`;

  // 1. Verificar cache
  const cached = permissionsCache.get(cacheKey);
  if (cached) return cached;

  try {
    // 2. Obtener membresía con rol y permisos
    const membership = await prisma.companyMember.findUnique({
      where: {
        companyId_userId: { companyId, userId },
      },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                action: { select: { slug: true } },
              },
            },
          },
        },
        permissions: {
          include: {
            action: { select: { slug: true } },
          },
        },
      },
    });

    if (!membership || !membership.isActive) return null;

    // Preparar tags para cache
    const cacheTags = [
      `company:${companyId}`,
      `user:${userId}`,
    ];

    if (membership.roleId) {
      cacheTags.push(`role:${membership.roleId}`);
    }

    // 3. Si es owner, tiene TODOS los permisos
    if (membership.isOwner) {
      const allPermissions = buildOwnerPermissions(cacheTags);
      permissionsCache.set(cacheKey, allPermissions, cacheTags);
      return allPermissions;
    }

    // 4. Construir mapa de permisos del rol
    const permissionsMap = new Map<Module, Set<Action>>();

    // Agregar permisos del rol
    if (membership.role) {
      for (const perm of membership.role.permissions) {
        const module = perm.module as Module;
        const action = perm.action.slug as Action;

        if (!permissionsMap.has(module)) {
          permissionsMap.set(module, new Set());
        }
        permissionsMap.get(module)!.add(action);
      }
    }

    // 5. Aplicar overrides individuales
    for (const override of membership.permissions) {
      const module = override.module as Module;
      const action = override.action.slug as Action;

      if (!permissionsMap.has(module)) {
        permissionsMap.set(module, new Set());
      }

      if (override.isGranted) {
        // Grant: agregar permiso
        permissionsMap.get(module)!.add(action);
      } else {
        // Revoke: quitar permiso
        permissionsMap.get(module)!.delete(action);
      }
    }

    // 6. Calcular módulos visibles (tienen VIEW)
    const visibleModules: Module[] = [];
    for (const [module, actions] of permissionsMap.entries()) {
      if (actions.has(ACTIONS.VIEW as Action)) {
        visibleModules.push(module);
      }
    }

    const result: UserPermissions = {
      permissions: permissionsMap,
      isOwner: false,
      roleId: membership.roleId,
      roleName: membership.role?.name ?? null,
      visibleModules,
      cacheTags,
    };

    permissionsCache.set(cacheKey, result, cacheTags);
    return result;

  } catch (error) {
    logger.error('Error al obtener permisos', { data: { error, userId, companyId } });
    return null;
  }
}

/**
 * Construye permisos de owner (todos)
 */
function buildOwnerPermissions(cacheTags: string[]): UserPermissions {
  const allModules = Object.values(MODULES) as Module[];
  const allActions = Object.values(ACTIONS) as Action[];

  const permissionsMap = new Map<Module, Set<Action>>();

  for (const module of allModules) {
    permissionsMap.set(module, new Set(allActions));
  }

  return {
    permissions: permissionsMap,
    isOwner: true,
    roleId: null,
    roleName: 'Propietario',
    visibleModules: allModules,
    cacheTags,
  };
}

/**
 * Serializa permisos para enviar al cliente
 */
export function serializePermissions(permissions: UserPermissions): import('./types').SerializedPermissions {
  return {
    permissions: Object.fromEntries(
      Array.from(permissions.permissions.entries()).map(([key, value]) => [
        key,
        Array.from(value),
      ])
    ),
    isOwner: permissions.isOwner,
    roleId: permissions.roleId,
    roleName: permissions.roleName,
    visibleModules: permissions.visibleModules,
  };
}
```

### 8.3 Verificar Permiso

```typescript
// shared/lib/permissions/checkPermission.server.ts
'use server';

import { getPermissions } from './getPermissions.server';
import type { Module, Action } from './types';
import { logger } from '@/shared/lib/logger';

/**
 * Verifica si el usuario tiene un permiso específico.
 *
 * @throws Error si no tiene permiso (usar en server actions)
 *
 * @example
 * export async function createEmployee(data: Input) {
 *   await checkPermission(MODULES.EMPLOYEES, ACTIONS.CREATE);
 *   // ... resto de la lógica
 * }
 */
export async function checkPermission(
  module: Module,
  action: Action
): Promise<void> {
  const permissions = await getPermissions();

  if (!permissions) {
    logger.warn('Acceso denegado: usuario no autenticado o sin empresa', {
      data: { module, action },
    });
    throw new Error('No autorizado');
  }

  const modulePerms = permissions.permissions.get(module);
  const hasPermission = modulePerms?.has(action) ?? false;

  if (!hasPermission) {
    logger.warn('Acceso denegado: permiso insuficiente', {
      data: { module, action, role: permissions.roleName },
    });
    throw new Error('No tienes permiso para realizar esta acción');
  }
}

/**
 * Versión que retorna boolean (no lanza error)
 *
 * @example
 * const canCreate = await hasPermission(MODULES.EMPLOYEES, ACTIONS.CREATE);
 * if (canCreate) { ... }
 */
export async function hasPermission(
  module: Module,
  action: Action
): Promise<boolean> {
  const permissions = await getPermissions();
  if (!permissions) return false;

  const modulePerms = permissions.permissions.get(module);
  return modulePerms?.has(action) ?? false;
}

/**
 * Verifica si tiene ALGUNO de los permisos (OR)
 */
export async function hasAnyPermission(
  checks: Array<{ module: Module; action: Action }>
): Promise<boolean> {
  const permissions = await getPermissions();
  if (!permissions) return false;

  return checks.some(({ module, action }) => {
    const modulePerms = permissions.permissions.get(module);
    return modulePerms?.has(action) ?? false;
  });
}

/**
 * Verifica si tiene TODOS los permisos (AND)
 */
export async function hasAllPermissions(
  checks: Array<{ module: Module; action: Action }>
): Promise<boolean> {
  const permissions = await getPermissions();
  if (!permissions) return false;

  return checks.every(({ module, action }) => {
    const modulePerms = permissions.permissions.get(module);
    return modulePerms?.has(action) ?? false;
  });
}

/**
 * Obtiene los módulos visibles para el sidebar
 */
export async function getVisibleModules(): Promise<Module[]> {
  const permissions = await getPermissions();
  if (!permissions) return [];

  return permissions.visibleModules;
}
```

### 8.4 Sistema de Auditoría

```typescript
// shared/lib/permissions/audit.server.ts
'use server';

import { auth, currentUser } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { prisma } from '@/shared/lib/prisma';
import { logger } from '@/shared/lib/logger';
import { getActiveCompanyId } from '@/shared/lib/company';
import type { AuditAction } from './types';

interface AuditLogInput {
  action: AuditAction;
  targetType: 'role' | 'member' | 'permission';
  targetId: string;
  targetName?: string;
  module?: string;
  details?: Record<string, unknown>;
  oldValue?: Record<string, unknown>;
  newValue?: Record<string, unknown>;
}

/**
 * Registra una entrada en el log de auditoría de permisos.
 *
 * @example
 * await logPermissionChange({
 *   action: 'role_created',
 *   targetType: 'role',
 *   targetId: role.id,
 *   targetName: role.name,
 *   newValue: { name: role.name, permissions: [...] },
 * });
 */
export async function logPermissionChange(input: AuditLogInput): Promise<void> {
  try {
    const { userId } = await auth();
    if (!userId) {
      logger.warn('Intento de audit log sin usuario autenticado');
      return;
    }

    const companyId = await getActiveCompanyId();
    if (!companyId) {
      logger.warn('Intento de audit log sin empresa activa');
      return;
    }

    // Obtener headers para IP y User-Agent
    const headersList = await headers();
    const ipAddress = headersList.get('x-forwarded-for')?.split(',')[0]
      || headersList.get('x-real-ip')
      || null;
    const userAgent = headersList.get('user-agent') || null;

    await prisma.permissionAuditLog.create({
      data: {
        companyId,
        performedBy: userId,
        action: input.action,
        targetType: input.targetType,
        targetId: input.targetId,
        targetName: input.targetName ?? null,
        module: input.module ?? null,
        details: input.details ?? null,
        oldValue: input.oldValue ?? null,
        newValue: input.newValue ?? null,
        ipAddress,
        userAgent,
      },
    });

    logger.info('Audit log registrado', {
      data: { action: input.action, targetType: input.targetType, targetId: input.targetId },
    });
  } catch (error) {
    // No fallar silenciosamente, pero tampoco bloquear la operación principal
    logger.error('Error al registrar audit log', { data: { error, input } });
  }
}

/**
 * Obtiene el historial de auditoría con paginación
 */
export async function getAuditLog(options: {
  page?: number;
  limit?: number;
  targetType?: 'role' | 'member' | 'permission';
  action?: AuditAction;
}) {
  const { page = 1, limit = 50, targetType, action } = options;

  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  const where = {
    companyId,
    ...(targetType && { targetType }),
    ...(action && { action }),
  };

  const [logs, total] = await Promise.all([
    prisma.permissionAuditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.permissionAuditLog.count({ where }),
  ]);

  return {
    logs,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  };
}
```

### 8.5 Exports Públicos

```typescript
// shared/lib/permissions/index.ts

// Funciones server
export { getPermissions, serializePermissions } from './getPermissions.server';
export {
  checkPermission,
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  getVisibleModules,
} from './checkPermission.server';
export { logPermissionChange, getAuditLog } from './audit.server';

// Constantes
export {
  MODULES,
  ACTIONS,
  MODULE_LABELS,
  ACTION_LABELS,
  MODULE_GROUPS,
  ROUTE_TO_PERMISSION,
} from './constants';

// Tipos
export type {
  Module,
  Action,
  UserPermissions,
  SerializedPermissions,
  PermissionMatrixRow,
  ModuleGroup,
  RoleWithPermissions,
  AuditLogEntry,
  AuditAction,
} from './types';

// Cache (para invalidación manual)
export { permissionsCache } from './cache';
```

---

## 9. Middleware de Protección

```typescript
// middleware.ts
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Rutas públicas (no requieren autenticación)
const isPublicRoute = createRouteMatcher([
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/api/webhooks(.*)',
  '/', // Landing page
]);

// Rutas de API (manejadas por sus propios handlers)
const isApiRoute = createRouteMatcher(['/api(.*)']);

export default clerkMiddleware(async (auth, req: NextRequest) => {
  // 1. Rutas públicas: permitir sin autenticación
  if (isPublicRoute(req)) {
    return NextResponse.next();
  }

  // 2. Verificar autenticación con Clerk
  const { userId } = await auth();

  if (!userId) {
    // Redirigir a login
    const signInUrl = new URL('/sign-in', req.url);
    signInUrl.searchParams.set('redirect_url', req.nextUrl.pathname);
    return NextResponse.redirect(signInUrl);
  }

  // 3. Rutas de API: dejar que los handlers verifiquen permisos
  if (isApiRoute(req)) {
    return NextResponse.next();
  }

  // 4. NOTA: La verificación de permisos específicos se hace en:
  //    - Pages: usando PageGuard o hasPermission()
  //    - Server Actions: usando checkPermission()
  //
  //    NO se puede hacer en middleware porque:
  //    - Edge runtime no soporta Prisma directamente
  //    - Requeriría llamada a API adicional (latencia)

  return NextResponse.next();
});

export const config = {
  matcher: [
    // Match all routes except static files
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always match API routes
    '/(api|trpc)(.*)',
  ],
};
```

---

## 10. Componentes de UI

### 10.1 PermissionGuard (Server Component)

```typescript
// shared/components/common/PermissionGuard.tsx
import { hasPermission, hasAnyPermission } from '@/shared/lib/permissions';
import type { Module, Action } from '@/shared/lib/permissions';

interface PermissionGuardProps {
  /** Módulo a verificar */
  module: Module;
  /** Acción a verificar */
  action: Action;
  /** Contenido a mostrar si tiene permiso */
  children: React.ReactNode;
  /** Contenido alternativo si no tiene permiso (opcional) */
  fallback?: React.ReactNode;
}

/**
 * Server Component que oculta contenido basado en permisos.
 *
 * @example
 * // Ocultar botón de crear
 * <PermissionGuard module={MODULES.EMPLOYEES} action={ACTIONS.CREATE}>
 *   <Button>Nuevo Empleado</Button>
 * </PermissionGuard>
 *
 * @example
 * // Con fallback
 * <PermissionGuard
 *   module={MODULES.EMPLOYEES}
 *   action={ACTIONS.DELETE}
 *   fallback={<span className="text-muted">Sin permiso</span>}
 * >
 *   <DeleteButton />
 * </PermissionGuard>
 */
export async function PermissionGuard({
  module,
  action,
  children,
  fallback = null,
}: PermissionGuardProps) {
  const allowed = await hasPermission(module, action);

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Variante para múltiples permisos (cualquiera)
interface PermissionGuardAnyProps {
  checks: Array<{ module: Module; action: Action }>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export async function PermissionGuardAny({
  checks,
  children,
  fallback = null,
}: PermissionGuardAnyProps) {
  const allowed = await hasAnyPermission(checks);

  if (!allowed) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

### 10.2 _PermissionGuardClient (Client Component)

```typescript
// shared/components/common/_PermissionGuardClient.tsx
'use client';

import { usePermissions } from '@/shared/hooks/usePermissions';
import type { Module, Action } from '@/shared/lib/permissions';
import { Skeleton } from '@/shared/components/ui/skeleton';

interface PermissionGuardClientProps {
  /** Módulo a verificar */
  module: Module;
  /** Acción a verificar */
  action: Action;
  /** Contenido a mostrar si tiene permiso */
  children: React.ReactNode;
  /** Contenido alternativo si no tiene permiso (opcional) */
  fallback?: React.ReactNode;
  /** Mostrar skeleton mientras carga (default: false) */
  showLoading?: boolean;
  /** Componente de loading personalizado */
  loadingComponent?: React.ReactNode;
}

/**
 * Client Component que oculta contenido basado en permisos.
 * Usa usePermissions hook internamente.
 *
 * @example
 * // En un Client Component
 * <_PermissionGuardClient module={MODULES.EMPLOYEES} action={ACTIONS.DELETE}>
 *   <DeleteButton onClick={handleDelete} />
 * </_PermissionGuardClient>
 *
 * @example
 * // Con loading state
 * <_PermissionGuardClient
 *   module={MODULES.EMPLOYEES}
 *   action={ACTIONS.CREATE}
 *   showLoading
 * >
 *   <CreateButton />
 * </_PermissionGuardClient>
 */
export function _PermissionGuardClient({
  module,
  action,
  children,
  fallback = null,
  showLoading = false,
  loadingComponent,
}: PermissionGuardClientProps) {
  const { can, isLoading } = usePermissions();

  if (isLoading) {
    if (showLoading) {
      return loadingComponent ?? <Skeleton className="h-9 w-24" />;
    }
    return null;
  }

  if (!can(module, action)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}

// Variante para múltiples permisos (cualquiera)
interface PermissionGuardClientAnyProps {
  checks: Array<{ module: Module; action: Action }>;
  children: React.ReactNode;
  fallback?: React.ReactNode;
  showLoading?: boolean;
  loadingComponent?: React.ReactNode;
}

export function _PermissionGuardClientAny({
  checks,
  children,
  fallback = null,
  showLoading = false,
  loadingComponent,
}: PermissionGuardClientAnyProps) {
  const { canAny, isLoading } = usePermissions();

  if (isLoading) {
    if (showLoading) {
      return loadingComponent ?? <Skeleton className="h-9 w-24" />;
    }
    return null;
  }

  if (!canAny(checks)) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
}
```

### 10.3 PageGuard (Server Component)

```typescript
// shared/components/common/PageGuard.tsx
import { redirect } from 'next/navigation';
import { hasPermission } from '@/shared/lib/permissions';
import type { Module, Action } from '@/shared/lib/permissions';

interface PageGuardProps {
  /** Módulo a verificar */
  module: Module;
  /** Acción a verificar */
  action: Action;
  /** Contenido de la página */
  children: React.ReactNode;
  /** URL de redirección si no tiene permiso */
  redirectTo?: string;
}

/**
 * Server Component que protege una página completa.
 * Redirige si el usuario no tiene permiso.
 *
 * @example
 * // app/(core)/dashboard/employees/page.tsx
 * export default async function Page({ searchParams }) {
 *   return (
 *     <PageGuard module={MODULES.EMPLOYEES} action={ACTIONS.VIEW}>
 *       <EmployeesList searchParams={searchParams} />
 *     </PageGuard>
 *   );
 * }
 */
export async function PageGuard({
  module,
  action,
  children,
  redirectTo = '/dashboard?error=no_permission',
}: PageGuardProps) {
  const allowed = await hasPermission(module, action);

  if (!allowed) {
    redirect(redirectTo);
  }

  return <>{children}</>;
}
```

---

## 11. Hook para Client Components

### 11.1 API Route

```typescript
// app/api/permissions/route.ts
import { NextResponse } from 'next/server';
import { getPermissions, serializePermissions } from '@/shared/lib/permissions';

export async function GET() {
  const permissions = await getPermissions();

  if (!permissions) {
    return NextResponse.json(
      { error: 'No autorizado' },
      { status: 401 }
    );
  }

  const serialized = serializePermissions(permissions);

  return NextResponse.json(serialized, {
    headers: {
      // Cache por 5 minutos en el cliente
      'Cache-Control': 'private, max-age=300',
    },
  });
}
```

### 11.2 Hook usePermissions

```typescript
// shared/hooks/usePermissions.ts
'use client';

import { useQuery } from '@tanstack/react-query';
import type { Module, Action, SerializedPermissions } from '@/shared/lib/permissions';

async function fetchPermissions(): Promise<SerializedPermissions> {
  const response = await fetch('/api/permissions');
  if (!response.ok) {
    throw new Error('Failed to fetch permissions');
  }
  return response.json();
}

/**
 * Hook para verificar permisos en Client Components.
 * Usa React Query para cache automático.
 *
 * @example
 * function MyClientComponent() {
 *   const { can, isLoading } = usePermissions();
 *
 *   if (isLoading) return <Skeleton />;
 *
 *   return (
 *     <div>
 *       {can(MODULES.EMPLOYEES, ACTIONS.CREATE) && (
 *         <Button>Nuevo Empleado</Button>
 *       )}
 *     </div>
 *   );
 * }
 */
export function usePermissions() {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['permissions'],
    queryFn: fetchPermissions,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000,   // 10 minutos (antes: cacheTime)
    retry: 1,
  });

  /**
   * Verifica si tiene un permiso específico
   */
  const can = (module: Module, action: Action): boolean => {
    if (!data) return false;
    const modulePerms = data.permissions[module];
    return modulePerms?.includes(action) ?? false;
  };

  /**
   * Verifica si tiene ALGUNO de los permisos (OR)
   */
  const canAny = (checks: Array<{ module: Module; action: Action }>): boolean => {
    return checks.some(({ module, action }) => can(module, action));
  };

  /**
   * Verifica si tiene TODOS los permisos (AND)
   */
  const canAll = (checks: Array<{ module: Module; action: Action }>): boolean => {
    return checks.every(({ module, action }) => can(module, action));
  };

  /**
   * Verifica si un módulo es visible (tiene VIEW)
   */
  const isModuleVisible = (module: Module): boolean => {
    return data?.visibleModules.includes(module) ?? false;
  };

  /**
   * Refresca los permisos (útil después de cambios)
   */
  const refresh = () => refetch();

  return {
    /** Loading state */
    isLoading,
    /** Error si falló la carga */
    error,
    /** Si es propietario de la empresa */
    isOwner: data?.isOwner ?? false,
    /** Nombre del rol */
    roleName: data?.roleName ?? null,
    /** ID del rol */
    roleId: data?.roleId ?? null,
    /** Módulos visibles */
    visibleModules: data?.visibleModules ?? [],
    /** Verificar permiso específico */
    can,
    /** Verificar si tiene alguno (OR) */
    canAny,
    /** Verificar si tiene todos (AND) */
    canAll,
    /** Verificar si módulo es visible */
    isModuleVisible,
    /** Refrescar permisos */
    refresh,
  };
}
```

---

## 12. Uso en Server Actions

### 12.1 Patrón de Uso

```typescript
// modules/employees/features/create/actions.server.ts
'use server';

import {
  checkPermission,
  MODULES,
  ACTIONS,
  logPermissionChange,
} from '@/shared/lib/permissions';
import { getActiveCompanyId } from '@/shared/lib/company';
import { prisma } from '@/shared/lib/prisma';
import { logger } from '@/shared/lib/logger';

export async function createEmployee(input: CreateEmployeeInput) {
  // 1. Verificar permiso ANTES de cualquier operación
  await checkPermission(MODULES.EMPLOYEES, ACTIONS.CREATE);

  // 2. Obtener contexto
  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  // 3. Ejecutar operación
  try {
    const employee = await prisma.employee.create({
      data: { ...input, companyId },
      select: { id: true },
    });

    logger.info('Empleado creado', { data: { id: employee.id } });
    return employee;
  } catch (error) {
    logger.error('Error al crear empleado', { data: { error } });
    throw new Error('Error al crear empleado');
  }
}

export async function deleteEmployee(id: string) {
  // Verificar permiso de eliminación
  await checkPermission(MODULES.EMPLOYEES, ACTIONS.DELETE);

  // ... resto de la lógica
}

export async function updateEmployee(id: string, input: UpdateEmployeeInput) {
  // Verificar permiso de edición
  await checkPermission(MODULES.EMPLOYEES, ACTIONS.UPDATE);

  // ... resto de la lógica
}
```

### 12.2 Actions con Invalidación de Cache

```typescript
// modules/permissions/features/roles/actions.server.ts
'use server';

import {
  checkPermission,
  MODULES,
  ACTIONS,
  logPermissionChange,
  permissionsCache,
} from '@/shared/lib/permissions';
import { getActiveCompanyId } from '@/shared/lib/company';
import { prisma } from '@/shared/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateRole(roleId: string, input: UpdateRoleInput) {
  await checkPermission(MODULES.SETTINGS_PERMISSIONS, ACTIONS.UPDATE);

  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  // Obtener estado anterior para audit log
  const oldRole = await prisma.companyRole.findUnique({
    where: { id: roleId },
    include: { permissions: true },
  });

  // Actualizar rol
  const role = await prisma.companyRole.update({
    where: { id: roleId },
    data: {
      name: input.name,
      description: input.description,
      color: input.color,
    },
  });

  // Actualizar permisos si se proporcionaron
  if (input.permissions) {
    // Eliminar permisos existentes
    await prisma.companyRolePermission.deleteMany({
      where: { roleId },
    });

    // Crear nuevos permisos
    const actions = await prisma.action.findMany();
    const actionMap = new Map(actions.map(a => [a.slug, a.id]));

    const permissionData = [];
    for (const [module, moduleActions] of Object.entries(input.permissions)) {
      for (const action of moduleActions) {
        const actionId = actionMap.get(action);
        if (actionId) {
          permissionData.push({
            roleId,
            module,
            actionId,
          });
        }
      }
    }

    await prisma.companyRolePermission.createMany({
      data: permissionData,
    });
  }

  // Invalidar cache de TODOS los usuarios con este rol
  permissionsCache.invalidateByTag(`role:${roleId}`);

  // Registrar en audit log
  await logPermissionChange({
    action: 'role_updated',
    targetType: 'role',
    targetId: roleId,
    targetName: role.name,
    oldValue: {
      name: oldRole?.name,
      permissions: oldRole?.permissions.map(p => ({ module: p.module, action: p.actionId })),
    },
    newValue: {
      name: role.name,
      permissions: input.permissions,
    },
  });

  revalidatePath('/dashboard/settings/permissions');

  return role;
}

export async function changeUserRole(memberId: string, newRoleId: string | null) {
  await checkPermission(MODULES.SETTINGS_MEMBERS, ACTIONS.UPDATE);

  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  // Obtener estado anterior
  const oldMember = await prisma.companyMember.findUnique({
    where: { id: memberId },
    include: { role: { select: { id: true, name: true } } },
  });

  // Actualizar rol del miembro
  const member = await prisma.companyMember.update({
    where: { id: memberId },
    data: { roleId: newRoleId },
    include: { role: { select: { id: true, name: true } } },
  });

  // Invalidar cache del usuario
  permissionsCache.invalidateByTag(`user:${member.userId}`);

  // Registrar en audit log
  await logPermissionChange({
    action: 'member_role_changed',
    targetType: 'member',
    targetId: memberId,
    oldValue: { roleId: oldMember?.roleId, roleName: oldMember?.role?.name },
    newValue: { roleId: newRoleId, roleName: member.role?.name },
  });

  revalidatePath('/dashboard/settings/members');

  return member;
}
```

---

## 13. Sidebar Dinámico

### 13.1 Sidebar con Filtrado de Permisos

```typescript
// shared/components/layout/_AppSidebar.tsx
import { getVisibleModules, MODULES, MODULE_LABELS } from '@/shared/lib/permissions';
import type { Module } from '@/shared/lib/permissions';
import {
  LayoutDashboard,
  Users,
  Truck,
  FileText,
  Building2,
  Settings,
  type LucideIcon,
} from 'lucide-react';

// Definición de navegación con módulo asociado
interface NavItemConfig {
  title: string;
  href: string;
  icon: LucideIcon;
  module?: Module; // Si no tiene module, siempre visible
}

const navMain: NavItemConfig[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard,
    module: MODULES.DASHBOARD,
  },
  {
    title: 'Empleados',
    href: '/dashboard/employees',
    icon: Users,
    module: MODULES.EMPLOYEES,
  },
  {
    title: 'Equipos',
    href: '/dashboard/equipment',
    icon: Truck,
    module: MODULES.EQUIPMENT,
  },
  {
    title: 'Documentos',
    href: '/dashboard/documents',
    icon: FileText,
    module: MODULES.DOCUMENTS,
  },
  {
    title: 'Empresas',
    href: '/dashboard/companies',
    icon: Building2,
    module: MODULES.COMPANIES,
  },
];

// Sub-navegación de configuración
const navConfig: NavItemConfig[] = [
  { title: 'Centros de Costo', href: '/dashboard/company/cost-centers', icon: Building2, module: MODULES.COMPANY_COST_CENTERS },
  { title: 'Tipos de Contrato', href: '/dashboard/company/contract-types', icon: FileText, module: MODULES.COMPANY_CONTRACT_TYPES },
  { title: 'Puestos de Trabajo', href: '/dashboard/company/job-positions', icon: Users, module: MODULES.COMPANY_JOB_POSITIONS },
  { title: 'Sindicatos', href: '/dashboard/company/unions', icon: Users, module: MODULES.COMPANY_UNIONS },
  // ... más items
];

// Sub-navegación de administración
const navAdmin: NavItemConfig[] = [
  { title: 'Roles y Permisos', href: '/dashboard/settings/permissions', icon: Settings, module: MODULES.SETTINGS_PERMISSIONS },
  { title: 'Miembros', href: '/dashboard/settings/members', icon: Users, module: MODULES.SETTINGS_MEMBERS },
  { title: 'Auditoría', href: '/dashboard/settings/permissions/audit', icon: FileText, module: MODULES.SETTINGS_AUDIT },
];

export async function AppSidebar({ companies, activeCompany }: Props) {
  // Obtener módulos visibles pre-calculados
  const visibleModules = await getVisibleModules();
  const visibleSet = new Set(visibleModules);

  // Función helper para filtrar items
  const filterByPermission = (items: NavItemConfig[]) =>
    items.filter(item => !item.module || visibleSet.has(item.module));

  const filteredMain = filterByPermission(navMain);
  const filteredConfig = filterByPermission(navConfig);
  const filteredAdmin = filterByPermission(navAdmin);

  return (
    <Sidebar>
      <SidebarContent>
        {/* Navegación principal */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarMenu>
            {filteredMain.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton asChild>
                  <Link href={item.href}>
                    <item.icon className="size-4" />
                    <span>{item.title}</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>

        {/* Configuración - Solo si tiene algún permiso */}
        {filteredConfig.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Configuración</SidebarGroupLabel>
            <SidebarMenu>
              {filteredConfig.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}

        {/* Administración - Solo si tiene algún permiso */}
        {filteredAdmin.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Administración</SidebarGroupLabel>
            <SidebarMenu>
              {filteredAdmin.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild>
                    <Link href={item.href}>
                      <item.icon className="size-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        )}
      </SidebarContent>
    </Sidebar>
  );
}
```

---

## 14. Sistema de Auditoría

### 14.1 Vista de Auditoría

```typescript
// modules/permissions/features/audit/AuditLogList.tsx
import { getAuditLog, MODULES, ACTIONS } from '@/shared/lib/permissions';
import { PageGuard } from '@/shared/components/common/PageGuard';
import { _AuditLogTable } from './components/_AuditLogTable';

interface Props {
  searchParams: Promise<{
    page?: string;
    targetType?: string;
    action?: string;
  }>;
}

export async function AuditLogList({ searchParams }: Props) {
  const params = await searchParams;

  const { logs, pagination } = await getAuditLog({
    page: params.page ? parseInt(params.page) : 1,
    targetType: params.targetType as 'role' | 'member' | 'permission' | undefined,
    action: params.action as import('@/shared/lib/permissions').AuditAction | undefined,
  });

  return (
    <PageGuard module={MODULES.SETTINGS_AUDIT} action={ACTIONS.VIEW}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Auditoría de Permisos</h1>
          <p className="text-muted-foreground">
            Historial de cambios en roles y permisos
          </p>
        </div>

        <_AuditLogTable
          logs={logs}
          pagination={pagination}
        />
      </div>
    </PageGuard>
  );
}
```

### 14.2 Tabla de Auditoría

```typescript
// modules/permissions/features/audit/components/_AuditLogTable.tsx
'use client';

import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Badge } from '@/shared/components/ui/badge';
import type { AuditLogEntry, AuditAction } from '@/shared/lib/permissions';

const actionLabels: Record<AuditAction, string> = {
  role_created: 'Rol creado',
  role_updated: 'Rol actualizado',
  role_deleted: 'Rol eliminado',
  permission_granted: 'Permiso otorgado',
  permission_revoked: 'Permiso revocado',
  member_role_changed: 'Rol de miembro cambiado',
  member_permission_override: 'Override de permiso',
};

const actionColors: Record<AuditAction, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  role_created: 'default',
  role_updated: 'secondary',
  role_deleted: 'destructive',
  permission_granted: 'default',
  permission_revoked: 'destructive',
  member_role_changed: 'secondary',
  member_permission_override: 'outline',
};

interface Props {
  logs: AuditLogEntry[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export function _AuditLogTable({ logs, pagination }: Props) {
  return (
    <div className="space-y-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fecha</TableHead>
            <TableHead>Acción</TableHead>
            <TableHead>Objetivo</TableHead>
            <TableHead>Realizado por</TableHead>
            <TableHead>Detalles</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {logs.map((log) => (
            <TableRow key={log.id}>
              <TableCell className="text-muted-foreground">
                {formatDistanceToNow(new Date(log.createdAt), {
                  addSuffix: true,
                  locale: es,
                })}
              </TableCell>
              <TableCell>
                <Badge variant={actionColors[log.action]}>
                  {actionLabels[log.action]}
                </Badge>
              </TableCell>
              <TableCell>
                <span className="font-medium">{log.targetName || log.targetId}</span>
                {log.module && (
                  <span className="text-muted-foreground text-sm ml-2">
                    ({log.module})
                  </span>
                )}
              </TableCell>
              <TableCell>
                {log.performedByName || log.performedBy}
              </TableCell>
              <TableCell className="max-w-xs truncate">
                {log.details && JSON.stringify(log.details)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {/* Paginación */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Mostrando {logs.length} de {pagination.total} registros
        </p>
        {/* Componente de paginación aquí */}
      </div>
    </div>
  );
}
```

---

## 15. Seed de Datos

### 15.1 Script de Seed (Simplificado)

```typescript
// prisma/seed/permissions.ts
import { PrismaClient } from '@/generated/prisma/client';

const prisma = new PrismaClient();

// Acciones CRUD estándar + especiales
const ACTIONS = [
  { name: 'Ver', slug: 'view', description: 'Ver y listar registros' },
  { name: 'Crear', slug: 'create', description: 'Crear nuevos registros' },
  { name: 'Editar', slug: 'update', description: 'Modificar registros existentes' },
  { name: 'Eliminar', slug: 'delete', description: 'Eliminar registros' },
  { name: 'Exportar', slug: 'export', description: 'Exportar datos a archivos' },
  { name: 'Aprobar', slug: 'approve', description: 'Aprobar documentos o solicitudes' },
];

async function seedPermissions() {
  console.log('🔐 Iniciando seed de permisos...\n');

  // Crear/actualizar acciones
  console.log('📝 Creando acciones...');
  for (const action of ACTIONS) {
    await prisma.action.upsert({
      where: { slug: action.slug },
      update: { name: action.name, description: action.description },
      create: action,
    });
  }
  console.log(`   ✅ ${ACTIONS.length} acciones creadas/actualizadas\n`);

  console.log('🎉 Seed de permisos completado!\n');
  console.log('ℹ️  NOTA: Los módulos se definen en shared/lib/permissions/constants.ts');
  console.log('   No se necesita tabla Route - el schema está simplificado.\n');
}

// Ejecutar
seedPermissions()
  .catch((error) => {
    console.error('❌ Error en seed:', error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

### 15.2 Agregar al package.json

```json
{
  "scripts": {
    "db:seed:permissions": "npx tsx prisma/seed/permissions.ts"
  }
}
```

---

## 16. UI de Gestión de Roles

### 16.1 Matriz de Permisos

```typescript
// modules/permissions/features/roles/components/_PermissionsMatrix.tsx
'use client';

import { useState } from 'react';
import { Checkbox } from '@/shared/components/ui/checkbox';
import { ChevronDown, ChevronRight } from 'lucide-react';
import {
  MODULE_LABELS,
  ACTION_LABELS,
  MODULE_GROUPS,
  ACTIONS
} from '@/shared/lib/permissions';
import type { ModuleGroup, Module, Action } from '@/shared/lib/permissions';

interface Props {
  /** Grupos de módulos con permisos */
  groups: ModuleGroup[];
  /** Callback cuando cambia un permiso */
  onChange: (module: Module, action: Action, granted: boolean) => void;
  /** Deshabilitar edición */
  disabled?: boolean;
}

/**
 * Matriz visual de permisos organizada por grupos.
 * Permite marcar/desmarcar permisos con checkboxes.
 */
export function _PermissionsMatrix({ groups, onChange, disabled }: Props) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(
    new Set(Object.keys(MODULE_GROUPS))
  );

  // Acciones a mostrar como columnas
  const actionColumns: Action[] = [
    ACTIONS.VIEW,
    ACTIONS.CREATE,
    ACTIONS.UPDATE,
    ACTIONS.DELETE,
  ];

  const toggleGroup = (groupLabel: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(groupLabel)) {
        next.delete(groupLabel);
      } else {
        next.add(groupLabel);
      }
      return next;
    });
  };

  return (
    <div className="rounded-md border overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            <th className="text-left p-3 font-medium w-64">Módulo</th>
            {actionColumns.map((action) => (
              <th key={action} className="text-center p-3 font-medium w-24">
                {ACTION_LABELS[action]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {groups.map((group) => (
            <>
              {/* Header del grupo (colapsable) */}
              <tr
                key={`group-${group.label}`}
                className="bg-muted/30 cursor-pointer hover:bg-muted/50"
                onClick={() => toggleGroup(group.label)}
              >
                <td colSpan={actionColumns.length + 1} className="p-3">
                  <div className="flex items-center gap-2 font-semibold">
                    {expandedGroups.has(group.label) ? (
                      <ChevronDown className="size-4" />
                    ) : (
                      <ChevronRight className="size-4" />
                    )}
                    {group.label}
                    <span className="text-muted-foreground font-normal text-sm">
                      ({group.rows.length} módulos)
                    </span>
                  </div>
                </td>
              </tr>

              {/* Filas del grupo */}
              {expandedGroups.has(group.label) &&
                group.rows.map((row, index) => (
                  <tr
                    key={row.module}
                    className={index % 2 === 0 ? 'bg-background' : 'bg-muted/10'}
                  >
                    <td className="p-3 pl-8">
                      {row.moduleName}
                    </td>
                    {row.actions.map((actionData) => (
                      <td key={actionData.action} className="text-center p-3">
                        <Checkbox
                          checked={actionData.granted}
                          disabled={disabled}
                          onCheckedChange={(checked) =>
                            onChange(row.module, actionData.action, !!checked)
                          }
                        />
                      </td>
                    ))}
                  </tr>
                ))}
            </>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

### 16.2 Formulario de Rol

```typescript
// modules/permissions/features/roles/components/_RoleForm.tsx
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';

import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { Textarea } from '@/shared/components/ui/textarea';
import { Switch } from '@/shared/components/ui/switch';
import { Label } from '@/shared/components/ui/label';
import { _PermissionsMatrix } from './_PermissionsMatrix';
import type { ModuleGroup, Module, Action } from '@/shared/lib/permissions';
import { createRole, updateRole } from '../actions.server';

const roleSchema = z.object({
  name: z.string().min(2, 'Nombre requerido'),
  description: z.string().optional(),
  color: z.string().optional(),
  isDefault: z.boolean().default(false),
});

type RoleFormData = z.infer<typeof roleSchema>;

interface Props {
  /** ID del rol si es edición */
  roleId?: string;
  /** Datos iniciales del rol */
  initialData?: RoleFormData;
  /** Grupos de módulos con permisos iniciales */
  groups: ModuleGroup[];
  /** Es un rol de sistema (no editable) */
  isSystem?: boolean;
}

export function _RoleForm({ roleId, initialData, groups, isSystem }: Props) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const form = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: initialData ?? {
      name: '',
      description: '',
      color: '#3b82f6',
      isDefault: false,
    },
  });

  // Estado local para la matriz de permisos
  const [permissions, setPermissions] = useState<Record<string, Set<string>>>(() => {
    const initial: Record<string, Set<string>> = {};
    groups.forEach(group => {
      group.rows.forEach(row => {
        initial[row.module] = new Set(
          row.actions.filter(a => a.granted).map(a => a.action)
        );
      });
    });
    return initial;
  });

  const mutation = useMutation({
    mutationFn: async (data: RoleFormData) => {
      // Convertir Sets a arrays para enviar
      const permissionsArray: Record<string, string[]> = {};
      Object.entries(permissions).forEach(([module, actions]) => {
        if (actions.size > 0) {
          permissionsArray[module] = Array.from(actions);
        }
      });

      if (roleId) {
        return updateRole(roleId, { ...data, permissions: permissionsArray });
      } else {
        return createRole({ ...data, permissions: permissionsArray });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['permissions'] });
      toast.success(roleId ? 'Rol actualizado' : 'Rol creado');
      router.push('/dashboard/settings/permissions');
    },
    onError: (error) => {
      toast.error(error.message || 'Error al guardar rol');
    },
  });

  const handlePermissionChange = (module: Module, action: Action, granted: boolean) => {
    setPermissions(prev => {
      const next = { ...prev };
      if (!next[module]) next[module] = new Set();

      if (granted) {
        next[module] = new Set([...next[module], action]);
      } else {
        next[module] = new Set([...next[module]].filter(a => a !== action));
      }

      return next;
    });
  };

  // Actualizar grupos con estado local de permisos
  const updatedGroups = groups.map(group => ({
    ...group,
    rows: group.rows.map(row => ({
      ...row,
      actions: row.actions.map(a => ({
        ...a,
        granted: permissions[row.module]?.has(a.action) ?? false,
      })),
    })),
  }));

  return (
    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-8">
      {/* Datos básicos del rol */}
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del Rol *</Label>
          <Input
            id="name"
            {...form.register('name')}
            placeholder="Ej: Supervisor"
            disabled={isSystem}
          />
          {form.formState.errors.name && (
            <p className="text-sm text-destructive">
              {form.formState.errors.name.message}
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="color">Color</Label>
          <div className="flex gap-2">
            <Input
              id="color"
              {...form.register('color')}
              type="color"
              className="w-16 h-9 p-1"
            />
            <Input
              value={form.watch('color') || '#3b82f6'}
              onChange={(e) => form.setValue('color', e.target.value)}
              placeholder="#3b82f6"
              className="flex-1"
            />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          {...form.register('description')}
          placeholder="Descripción del rol..."
          rows={3}
        />
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="isDefault"
          checked={form.watch('isDefault')}
          onCheckedChange={(checked) => form.setValue('isDefault', checked)}
          disabled={isSystem}
        />
        <Label htmlFor="isDefault" className="cursor-pointer">
          Rol por defecto para nuevos miembros
        </Label>
      </div>

      {/* Matriz de permisos */}
      <div className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold">Permisos</h3>
          <p className="text-sm text-muted-foreground">
            Selecciona los permisos que tendrá este rol en cada módulo
          </p>
        </div>

        <_PermissionsMatrix
          groups={updatedGroups}
          onChange={handlePermissionChange}
          disabled={isSystem}
        />
      </div>

      {/* Acciones */}
      <div className="flex gap-4">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.back()}
        >
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={mutation.isPending || isSystem}
        >
          {mutation.isPending ? 'Guardando...' : roleId ? 'Actualizar Rol' : 'Crear Rol'}
        </Button>
      </div>

      {isSystem && (
        <p className="text-sm text-muted-foreground">
          Este es un rol de sistema y no puede ser modificado.
        </p>
      )}
    </form>
  );
}
```

---

## 17. Roles por Defecto

### 17.1 Roles Sugeridos

| Rol | Slug | Descripción | Permisos |
|-----|------|-------------|----------|
| **Propietario** | `owner` | Dueño de la empresa | Todos (automático por `isOwner`) |
| **Administrador** | `admin` | Gestión completa | Todos excepto settings.permissions |
| **Supervisor** | `supervisor` | Gestión operativa | Empleados, Equipos, Docs (CRUD) |
| **RRHH** | `rrhh` | Recursos Humanos | Empleados (CRUD), config RRHH |
| **Operador** | `operator` | Solo lectura | Todo en VIEW |
| **Auditor** | `auditor` | Visualización + export | VIEW + EXPORT |

### 17.2 Crear Roles por Defecto

```typescript
// Función para crear roles por defecto en una empresa nueva
async function createDefaultRolesForCompany(companyId: string) {
  const actions = await prisma.action.findMany();
  const actionMap = new Map(actions.map(a => [a.slug, a.id]));

  const allModules = Object.values(MODULES);
  const viewActionId = actionMap.get('view')!;
  const crudActionIds = ['view', 'create', 'update', 'delete'].map(s => actionMap.get(s)!);

  // Rol: Administrador (todos los permisos excepto settings.permissions)
  const adminRole = await prisma.companyRole.create({
    data: {
      companyId,
      name: 'Administrador',
      slug: 'admin',
      description: 'Acceso completo a todas las funciones',
      color: '#3b82f6',
      isSystem: true,
    },
  });

  const adminPermissions = [];
  for (const module of allModules) {
    if (module === MODULES.SETTINGS_PERMISSIONS) continue; // Excepto gestión de permisos
    for (const actionId of crudActionIds) {
      adminPermissions.push({
        roleId: adminRole.id,
        module,
        actionId,
      });
    }
  }
  await prisma.companyRolePermission.createMany({ data: adminPermissions });

  // Rol: Operador (solo view, rol por defecto)
  const operatorRole = await prisma.companyRole.create({
    data: {
      companyId,
      name: 'Operador',
      slug: 'operator',
      description: 'Acceso de solo lectura',
      color: '#22c55e',
      isDefault: true,
    },
  });

  const operatorPermissions = allModules
    .filter(m => m !== MODULES.SETTINGS_PERMISSIONS && m !== MODULES.SETTINGS_AUDIT)
    .map(module => ({
      roleId: operatorRole.id,
      module,
      actionId: viewActionId,
    }));
  await prisma.companyRolePermission.createMany({ data: operatorPermissions });

  return { adminRole, operatorRole };
}
```

---

## 18. Plan de Implementación

### Fase 1: Core y Schema (Semana 1)

| Tarea | Prioridad | Estimación |
|-------|-----------|------------|
| Migrar schema (simplificar, quitar Route si aplica) | Alta | 2h |
| Crear tabla `PermissionAuditLog` | Alta | 30m |
| Crear `shared/lib/permissions/constants.ts` | Alta | 1h |
| Crear `shared/lib/permissions/types.ts` | Alta | 1h |
| Crear `shared/lib/permissions/cache.ts` con tags | Alta | 1h |
| Crear `shared/lib/permissions/getPermissions.server.ts` | Alta | 2h |
| Crear `shared/lib/permissions/checkPermission.server.ts` | Alta | 1h |
| Crear `shared/lib/permissions/audit.server.ts` | Alta | 1h |
| Crear `shared/lib/permissions/index.ts` | Alta | 30m |
| Ejecutar seed de Actions | Alta | 30m |

### Fase 2: Guards y Hooks (Semana 1-2)

| Tarea | Prioridad | Estimación |
|-------|-----------|------------|
| Crear `PermissionGuard.tsx` (Server) | Alta | 1h |
| Crear `_PermissionGuardClient.tsx` (Client) | Alta | 1h |
| Crear `PageGuard.tsx` | Alta | 1h |
| Crear `app/api/permissions/route.ts` | Alta | 30m |
| Crear `usePermissions.ts` hook | Alta | 1h |

### Fase 3: Integración (Semana 2)

| Tarea | Prioridad | Estimación |
|-------|-----------|------------|
| Actualizar `_AppSidebar.tsx` con filtrado | Alta | 2h |
| Agregar `PermissionGuard` a botones de acción | Media | 3h |
| Agregar `checkPermission` a Server Actions | Alta | 4h |
| Agregar `PageGuard` a páginas protegidas | Media | 2h |
| Agregar `logPermissionChange` a actions de roles | Media | 1h |

### Fase 4: UI de Gestión (Semana 3)

| Tarea | Prioridad | Estimación |
|-------|-----------|------------|
| Crear módulo `permissions/` estructura | Media | 1h |
| Implementar `_PermissionsMatrix` | Media | 3h |
| Implementar lista de roles | Media | 2h |
| Implementar `_RoleForm` (crear/editar) | Media | 4h |
| Implementar asignación de roles a miembros | Media | 3h |
| Implementar vista de auditoría | Media | 2h |

### Fase 5: Testing y Pulido (Semana 4)

| Tarea | Prioridad | Estimación |
|-------|-----------|------------|
| Tests de integración con Cypress | Media | 4h |
| Crear roles por defecto | Media | 2h |
| Documentación final | Baja | 2h |
| Review y ajustes | Alta | 4h |

---

## 19. Consideraciones de Seguridad

### 19.1 Principios

1. **Server-Side First**: Toda verificación crítica se hace en el servidor
2. **Defense in Depth**: Múltiples capas (middleware, page, action)
3. **Deny by Default**: Sin permiso = denegado
4. **Audit Trail**: Logear todos los cambios de permisos y accesos denegados

### 19.2 Checklist de Seguridad

- [ ] Todas las Server Actions verifican permisos con `checkPermission()`
- [ ] Páginas sensibles usan `PageGuard` o verificación manual
- [ ] UI oculta elementos pero NO es la única protección
- [ ] Cache de permisos se invalida correctamente al cambiar roles (tags)
- [ ] Logs de accesos denegados para auditoría
- [ ] Todos los cambios de permisos se registran en `PermissionAuditLog`
- [ ] Owners siempre tienen todos los permisos
- [ ] Roles de sistema (`isSystem: true`) no se pueden eliminar ni modificar
- [ ] API de permisos protegida con autenticación

### 19.3 Vulnerabilidades Conocidas de Next.js

> **CVE-2025-29927** (CVSS 9.1): Bypass de middleware manipulando header `x-middleware-subrequest`. Afecta Next.js 11.1.4 - 15.2.2.

**Mitigación**:
- Mantener Next.js actualizado (16.1.3 ya está parcheado)
- No depender SOLO del middleware para autorización
- Verificar permisos también en Server Actions (ya implementado)

---

## 20. Extensiones Futuras

Las siguientes funcionalidades están planificadas para futuras versiones pero **no se implementarán ahora**:

### 20.1 Permisos a Nivel de Campo (Field-Level)

Para casos donde se necesite ocultar campos sensibles específicos:

```typescript
// Ejemplo conceptual
export const FIELD_PERMISSIONS = {
  'employees.salary': 'employees.view_salary',
  'employees.cuil': 'employees.view_pii',
} as const;

// Uso
<PermissionGuard module="employees" action="view_salary">
  <InfoField label="Salario" value={employee.salary} />
</PermissionGuard>
```

**Caso de uso**: Un Supervisor puede ver empleados pero no sus salarios.

### 20.2 Permisos a Nivel de Recurso (Resource-Level)

Para control granular basado en atributos del recurso:

```typescript
// Ejemplo conceptual
interface ResourcePermission {
  module: Module;
  action: Action;
  condition?: {
    field: string;      // "sectorId"
    operator: 'eq' | 'in' | 'neq';
    value: string | string[];
  };
}

// Ejemplo: "puede ver SOLO empleados de su sector"
{
  module: 'employees',
  action: 'view',
  condition: {
    field: 'sectorId',
    operator: 'eq',
    value: '${user.sectorId}', // Placeholder dinámico
  }
}
```

**Caso de uso**: Multi-tenant avanzado donde usuarios solo ven datos de su área.

### 20.3 Permisos Temporales

Permisos con fecha de expiración:

```typescript
interface TemporaryPermission {
  permission: CompanyMemberPermission;
  expiresAt: Date;
  reason: string;
}
```

**Caso de uso**: Acceso temporal para auditores externos.

---

## Referencias

- [Clerk: Roles and Permissions](https://clerk.com/docs/guides/organizations/control-access/roles-and-permissions)
- [Clerk: Check Access](https://clerk.com/docs/guides/organizations/control-access/check-access)
- [Clerk: Basic RBAC with Metadata](https://clerk.com/docs/guides/secure/basic-rbac)
- [Clerk Blog: RBAC with Organizations](https://clerk.com/blog/role-based-access-control-with-clerk-orgs)
- [Next.js RBAC Implementation](https://clerk.com/blog/nextjs-role-based-access-control)

---

## Conclusión

Esta propuesta implementa un sistema RBAC completo y granular que:

1. **Aprovecha Clerk** para autenticación sin duplicar funcionalidad
2. **Usa schema simplificado** (sin tabla Route innecesaria)
3. **Es más flexible** que Clerk Organizations (sin límite de roles, permisos granulares)
4. **Tiene múltiples capas** de protección (middleware, page, action, UI)
5. **Soporta Server y Client Components** con guards apropiados
6. **Incluye auditoría completa** de cambios de permisos
7. **Cache inteligente** con invalidación por tags
8. **Es extensible** para futuras necesidades (field-level, resource-level)

El sistema híbrido (Clerk + Prisma) es la mejor opción dado que:
- Ya tienes `Company` y `CompanyMember` en Prisma
- Clerk Organizations tiene límite de 10 roles
- Necesitas permisos a nivel de módulo específico
- El schema de permisos ya está diseñado

**Próximo paso recomendado**: Comenzar con Fase 1 (Core y Schema) para tener la base funcional.
