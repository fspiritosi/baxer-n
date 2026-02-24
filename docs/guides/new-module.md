# Guia: Crear un Modulo Nuevo

Paso a paso para agregar un nuevo modulo de negocio al proyecto.

---

## 1. Crear Estructura de Carpetas

```
src/modules/{nombre-modulo}/
├── features/
│   ├── list/
│   │   ├── {Modulo}List.tsx         # Server Component
│   │   ├── actions.server.ts        # Server Actions
│   │   ├── columns.tsx              # Columnas de DataTable
│   │   ├── components/
│   │   │   └── _{Modulo}Table.tsx   # Client Component
│   │   └── index.ts                 # export { default } from './{Modulo}List'
│   │
│   ├── detail/
│   │   ├── {Modulo}Detail.tsx
│   │   ├── actions.server.ts
│   │   └── components/
│   │
│   └── create/
│       ├── actions.server.ts
│       └── components/
│           └── _{Modulo}Form.tsx
│
├── shared/
│   ├── types.ts
│   └── validators.ts
│
└── index.ts
```

## 2. Definir Modelo en Prisma

Editar `prisma/schema.prisma`:

```prisma
model MiEntidad {
  id        String   @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  name      String
  isActive  Boolean  @default(true) @map("is_active")
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  companyId String  @map("company_id") @db.Uuid
  company   Company @relation(fields: [companyId], references: [id])

  @@map("mi_entidades")
}
```

Luego:
```bash
npm run db:generate
npm run db:push      # o db:migrate para produccion
```

## 3. Crear Server Actions

`features/list/actions.server.ts`:

```typescript
'use server';

import { prisma } from '@/shared/lib/prisma';
import { getActiveCompanyId } from '@/shared/lib/company';
import { logger } from '@/shared/lib/logger';

export async function getItemsPaginated(searchParams: DataTableSearchParams) {
  const companyId = await getActiveCompanyId();
  if (!companyId) return { data: [], total: 0 };

  const state = parseSearchParams(searchParams);
  const { skip, take, orderBy } = stateToPrismaParams(state);
  const where = {
    companyId,
    isActive: true,
    ...buildSearchWhere(state.search, ['name']),
  };

  const [data, total] = await Promise.all([
    prisma.miEntidad.findMany({ where, skip, take, orderBy }),
    prisma.miEntidad.count({ where }),
  ]);

  return { data, total };
}
```

## 4. Crear Server Component (Lista)

`features/list/{Modulo}List.tsx`:

```typescript
import { getItemsPaginated } from './actions.server';
import { checkPermission } from '@/shared/lib/permissions';
import { _ItemsTable } from './components/_ItemsTable';

export default async function ItemsList() {
  await checkPermission('mi-modulo', 'view', { redirect: true });
  const items = await getItemsPaginated({});

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Mi Modulo</h1>
        <p className="text-muted-foreground">Descripcion del modulo</p>
      </div>
      <_ItemsTable initialData={items} />
    </div>
  );
}
```

## 5. Crear Client Component (Tabla)

`features/list/components/_ItemsTable.tsx`:

```typescript
'use client';

import { DataTable } from '@/shared/components/common/DataTable';
import { columns } from '../columns';

export function _ItemsTable({ initialData }) {
  return (
    <DataTable
      columns={columns}
      data={initialData.data}
      totalRows={initialData.total}
      // ... paginacion, busqueda
    />
  );
}
```

## 6. Agregar Rutas en `app/`

```
src/app/(core)/dashboard/{ruta}/
└── page.tsx
```

```typescript
import ItemsList from '@/modules/{modulo}/features/list';

export default function ItemsPage() {
  return <ItemsList />;
}
```

## 7. Registrar en el Sidebar

Editar `src/shared/components/layout/_AppSidebar.tsx` y agregar el item al menu correspondiente.

## 8. Registrar Permisos

Editar `src/shared/lib/permissions/constants.ts`:

```typescript
export const MODULES = {
  // ...existentes
  'mi-modulo': 'mi-modulo',
};

export const MODULE_LABELS: Record<Module, string> = {
  // ...existentes
  'mi-modulo': 'Mi Modulo',
};
```

Agregar al grupo correspondiente en `MODULE_GROUPS`.

## 9. Crear Tests E2E

`cypress/e2e/{modulo}/{modulo}.cy.ts`:

```typescript
import { setupClerkTestingToken } from '@clerk/testing/cypress';

describe('Mi Modulo', () => {
  beforeEach(() => {
    setupClerkTestingToken();
    cy.visit('/');
    cy.window().should((win) => {
      expect(win).to.have.property('Clerk');
      expect(win.Clerk.loaded).to.eq(true);
    });
    cy.clerkSignIn({
      strategy: 'email_code',
      identifier: Cypress.env('test_user'),
    });
  });

  it('should display the page', () => {
    cy.visit('/dashboard/{ruta}');
    cy.contains('h1', 'Mi Modulo').should('be.visible');
  });

  it('should display the table', () => {
    cy.visit('/dashboard/{ruta}');
    cy.get('[data-testid="data-table"]').should('be.visible');
  });
});
```

## 10. Checklist Final

- [ ] Modelo Prisma con `companyId` y `isActive`
- [ ] Server actions con `getActiveCompanyId()`
- [ ] Server Component principal
- [ ] Client Component con DataTable (columnas con `meta.title`)
- [ ] Ruta en `app/` (solo `page.tsx`)
- [ ] Permiso registrado en `constants.ts`
- [ ] Item en sidebar
- [ ] Tests E2E creados
- [ ] `npm run check-types` pasa
- [ ] `npm run lint` pasa
