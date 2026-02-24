# Estandares de Codigo

---

## TypeScript

### Tipos desde Prisma/Zod, NUNCA manuales

```typescript
// Desde Prisma (enums)
import { Gender, VoucherType } from '@/generated/prisma/enums';

// Desde Prisma (tipos inferidos de queries)
type GetItemsResult = Awaited<ReturnType<typeof getItems>>;
type Item = GetItemsResult[number];

// Desde Zod (formularios)
type FormData = z.infer<typeof mySchema>;

// NUNCA crear enums o tipos manuales si Prisma/Zod los tiene
```

### Sin `:any`

```typescript
// CORRECTO - Inferir tipos
const data = await getItems(); // tipo inferido automaticamente

// INCORRECTO
const data: any = await getItems();
```

---

## Componentes

### Server Components por Defecto

Todos los componentes son Server Components a menos que necesiten interactividad del browser.

```
EmployeesList.tsx      ← Server Component (default)
_EmployeesTable.tsx    ← Client Component (prefijo _)
```

### Prefijo `_` para Client Components

Todo archivo con `'use client'` debe tener `_` al inicio del nombre.

### Maximo 200 Lineas

Si un componente supera 200 lineas, extraer logica a subcomponentes o hooks.

---

## Server Actions

### Ubicacion por Feature

```
modules/{modulo}/features/{feature}/actions.server.ts
```

Cada feature tiene su propio `actions.server.ts`. Acciones compartidas van en `shared/actions/`.

### Patron Estandar

```typescript
'use server';

import { prisma } from '@/shared/lib/prisma';
import { getActiveCompanyId } from '@/shared/lib/company';
import { logger } from '@/shared/lib/logger';

export async function getItems() {
  const companyId = await getActiveCompanyId();
  if (!companyId) throw new Error('No hay empresa activa');

  return prisma.item.findMany({
    where: { companyId },
    select: { id: true, name: true },  // Solo campos necesarios
    orderBy: { name: 'asc' },
  });
}
```

---

## Logger

**NUNCA** usar `console.*`. Siempre usar el logger:

```typescript
import { logger, Logger } from '@/shared/lib/logger';

// Global
logger.info('mensaje');
logger.error('error', { data: { error } });

// Con scope
const log = new Logger('MiComponente');
log.info('mensaje');
```

Se controla con `NEXT_PUBLIC_SHOW_LOGS=true/false`.

---

## Fechas

**SIEMPRE** `moment.js`. **NUNCA** `date-fns`:

```typescript
import moment from 'moment';

moment(date).format('DD/MM/YYYY');       // Fecha corta
moment(date).format('DD/MM/YYYY HH:mm'); // Fecha y hora
moment(date).format('YYYY-MM-DD');       // ISO
moment().diff(startDate, 'days');        // Diferencia
moment().add(7, 'days');                 // Sumar
moment(dateA).isBefore(dateB);           // Comparar
```

Funciones de formateo reutilizables en `shared/utils/formatters.ts`.

---

## Data Fetching

**SIEMPRE** React Query. **NUNCA** `useEffect` + `useState`:

```typescript
// CORRECTO
const { data, isLoading } = useQuery({
  queryKey: ['items'],
  queryFn: getItems,
});

// INCORRECTO
const [data, setData] = useState([]);
useEffect(() => { getData().then(setData); }, []);
```

Mutaciones con invalidacion:
```typescript
const mutation = useMutation({
  mutationFn: createItem,
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['items'] });
  },
});
```

---

## Modulos Independientes

Los modulos **NO** importan de otros modulos:

```typescript
// PROHIBIDO
import { utils } from '@/modules/commercial/shared/utils';

// CORRECTO
import { utils } from '@/shared/utils';
```

Si algo se necesita en multiples modulos, va en `shared/`.

---

## Base de Datos

### Queries Eficientes

```typescript
// CORRECTO - Include en una query
const data = await prisma.employee.findMany({
  include: { department: true },
});

// INCORRECTO - N+1
for (const emp of employees) {
  const dept = await prisma.department.findUnique({ ... });
}
```

### Usar `select` para Optimizar

```typescript
const users = await prisma.user.findMany({
  select: { id: true, name: true, email: true },
});
```

### Siempre `getActiveCompanyId()`

Todas las queries de server actions deben filtrar por `companyId`.

### Transacciones para Multiples Operaciones

```typescript
await prisma.$transaction(async (tx) => {
  const user = await tx.user.create({ ... });
  const profile = await tx.profile.create({ ... });
});
```

---

## `app/` = Solo Rutas

La carpeta `app/` solo puede contener: `page.tsx`, `layout.tsx`, `loading.tsx`, `error.tsx`, `not-found.tsx` y subcarpetas de rutas.

**Prohibido:** carpetas `components/`, logica de negocio, utilidades.

Toda la logica va en `modules/` o `shared/`.
