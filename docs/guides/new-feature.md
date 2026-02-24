# Guia: Agregar una Feature a un Modulo Existente

Paso a paso para agregar funcionalidad (list, detail, create, edit) a un modulo que ya existe.

---

## 1. Crear Carpeta de Feature

Dentro del modulo correspondiente:

```
src/modules/{modulo}/features/{nueva-feature}/
├── actions.server.ts
├── {Feature}.tsx           # Server Component principal
├── components/
│   └── _{Feature}Form.tsx  # Client Component (si necesita interactividad)
├── validators.ts           # Schema Zod (si tiene formulario)
└── index.ts                # Barrel export
```

## 2. Definir Schema Zod (si aplica)

`validators.ts`:

```typescript
import { z } from 'zod';

export const myFeatureSchema = z.object({
  name: z.string().min(2, 'Minimo 2 caracteres'),
  description: z.string().optional(),
  // Usar enums de Prisma
  status: z.nativeEnum(MyStatus).default('ACTIVE'),
});

export type MyFeatureInput = z.infer<typeof myFeatureSchema>;
```

## 3. Crear Server Actions

`actions.server.ts`:

```typescript
'use server';

import { prisma } from '@/shared/lib/prisma';
import { getActiveCompanyId } from '@/shared/lib/company';
import { logger } from '@/shared/lib/logger';
import { revalidatePath } from 'next/cache';

export async function createItem(input: MyFeatureInput) {
  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  try {
    const item = await prisma.myModel.create({
      data: { ...input, companyId },
    });
    revalidatePath('/dashboard/{ruta}');
    return { success: true, data: item };
  } catch (error) {
    logger.error('Error creating item', { data: { error } });
    return { success: false, error: 'Error al crear' };
  }
}
```

## 4. Crear Server Component

`{Feature}.tsx`:

```typescript
import { checkPermission } from '@/shared/lib/permissions';
import { getData } from './actions.server';
import { _FeatureContent } from './components/_FeatureContent';

export default async function MyFeature() {
  await checkPermission('mi-modulo', 'view', { redirect: true });
  const data = await getData();

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Mi Feature</h1>
      <_FeatureContent data={data} />
    </div>
  );
}
```

## 5. Crear Client Component

`components/_FeatureContent.tsx`:

```typescript
'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/shared/components/ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/shared/components/ui/form';
import { Input } from '@/shared/components/ui/input';
import { myFeatureSchema, type MyFeatureInput } from '../validators';
import { createItem } from '../actions.server';

export function _FeatureContent() {
  const form = useForm<MyFeatureInput>({
    resolver: zodResolver(myFeatureSchema),
    defaultValues: { name: '' },
  });

  const handleSubmit = async (data: MyFeatureInput) => {
    const result = await createItem(data);
    if (result.success) {
      toast.success('Creado correctamente');
    } else {
      toast.error(result.error);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)}>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nombre</FormLabel>
              <FormControl><Input {...field} /></FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Guardar</Button>
      </form>
    </Form>
  );
}
```

## 6. Agregar Ruta

`src/app/(core)/dashboard/{ruta}/{nueva-ruta}/page.tsx`:

```typescript
import MyFeature from '@/modules/{modulo}/features/{nueva-feature}';

export default function Page() {
  return <MyFeature />;
}
```

## 7. Actualizar Tests E2E

Agregar tests al spec existente del modulo o crear uno nuevo:

```typescript
it('should display the new feature', () => {
  cy.visit('/dashboard/{ruta}/{nueva-ruta}');
  cy.contains('Mi Feature').should('be.visible');
});
```

## 8. Checklist

- [ ] Schema Zod para validacion
- [ ] Server actions con `getActiveCompanyId()`
- [ ] Permiso verificado con `checkPermission()`
- [ ] Server Component principal
- [ ] Client Component con prefijo `_`
- [ ] Ruta en `app/` (solo `page.tsx`)
- [ ] Logger en lugar de console.*
- [ ] moment.js para fechas
- [ ] React Query si hay fetch client-side
- [ ] Tests E2E actualizados
- [ ] `npm run check-types` pasa

---

## Tipos Comunes de Feature

### Lista (list)

```
actions.server.ts  → getPaginated, delete, export
{Modulo}List.tsx   → Server Component con DataTable
columns.tsx        → Definicion de columnas
_Table.tsx         → Client Component wrapper
```

### Detalle (detail)

```
actions.server.ts  → getById con relaciones
{Modulo}Detail.tsx → Server Component con tabs
_DetailTabs.tsx    → Client Component con interactividad
```

### Crear (create)

```
actions.server.ts  → create + datos auxiliares (selects)
_Form.tsx          → Client Component con React Hook Form + Zod
validators.ts      → Schema de validacion
```

### Editar (edit)

```
actions.server.ts  → getForEdit + update
_EditForm.tsx      → Client Component pre-populado
```
