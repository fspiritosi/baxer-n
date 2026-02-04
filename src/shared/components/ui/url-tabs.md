# UrlTabs

Componente de tabs con navegación por URL integrada. Permite que los componentes padres sean **Server Components** mientras mantiene la interactividad de cambio de tabs.

## Problema que resuelve

El patrón tradicional fuerza a todo el árbol a ser client-side:

```tsx
// ❌ Antes: Todo es client, sin streaming
'use client';

function MyTabs({ data1, data2, data3 }) {
  const router = useRouter();
  const params = useSearchParams();

  const handleTabChange = (tab) => {
    router.push(`?tab=${tab}`);
  };

  return (
    <Tabs onValueChange={handleTabChange}>
      {/* Todo lo demás también es client... */}
    </Tabs>
  );
}
```

Con `UrlTabs`, el Server Component puede pasar children que hacen su propio fetch:

```tsx
// ✅ Después: Server Component con streaming por tab
export async function MyPage({ searchParams }) {
  const currentTab = searchParams.tab || 'first';

  return (
    <UrlTabs value={currentTab} paramName="tab">
      <UrlTabsList>
        <UrlTabsTrigger value="first">First</UrlTabsTrigger>
        <UrlTabsTrigger value="second">Second</UrlTabsTrigger>
      </UrlTabsList>

      <UrlTabsContent value="first">
        <Suspense fallback={<Skeleton />}>
          <FirstTabServer />  {/* Server Component! */}
        </Suspense>
      </UrlTabsContent>

      <UrlTabsContent value="second">
        <Suspense fallback={<Skeleton />}>
          <SecondTabServer /> {/* Server Component! */}
        </Suspense>
      </UrlTabsContent>
    </UrlTabs>
  );
}

// Cada tab hace su propio fetch
async function FirstTabServer() {
  const data = await getFirstTabData(); // Solo carga cuando es visible
  return <FirstTabContent data={data} />;
}
```

---

## Instalación

El componente ya está incluido en `@/shared/components/ui/url-tabs`.

```tsx
import {
  UrlTabs,
  UrlTabsList,
  UrlTabsTrigger,
  UrlTabsContent
} from '@/shared/components/ui/url-tabs';
```

---

## Props

### UrlTabs

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `value` | `string` | - | Tab activo (controlado) |
| `defaultValue` | `string` | - | Tab inicial (no controlado) |
| `paramName` | `string` | `"tab"` | Nombre del parámetro en la URL |
| `preserveParams` | `string[]` | `[]` | Params a mantener al cambiar tab |
| `resetParams` | `string[]` | `["page"]` | Params a eliminar al cambiar tab |
| `baseUrl` | `string` | URL actual | Base URL para navegación |
| `replace` | `boolean` | `false` | Usar `router.replace` en vez de `push` |
| `onTabChange` | `(value: string) => void` | - | Callback al cambiar tab |
| `disableUrlNavigation` | `boolean` | `false` | Desactiva navegación URL |

---

## Ejemplos

### Básico

```tsx
export async function ProductsPage({ searchParams }) {
  const tab = searchParams.tab || 'all';

  return (
    <UrlTabs value={tab}>
      <UrlTabsList>
        <UrlTabsTrigger value="all">Todos</UrlTabsTrigger>
        <UrlTabsTrigger value="active">Activos</UrlTabsTrigger>
        <UrlTabsTrigger value="archived">Archivados</UrlTabsTrigger>
      </UrlTabsList>

      <UrlTabsContent value="all">
        <Suspense fallback={<ProductsSkeleton />}>
          <AllProducts />
        </Suspense>
      </UrlTabsContent>

      <UrlTabsContent value="active">
        <Suspense fallback={<ProductsSkeleton />}>
          <ActiveProducts />
        </Suspense>
      </UrlTabsContent>

      <UrlTabsContent value="archived">
        <Suspense fallback={<ProductsSkeleton />}>
          <ArchivedProducts />
        </Suspense>
      </UrlTabsContent>
    </UrlTabs>
  );
}
```

**URL resultante:** `?tab=active`

---

### Con subtabs (tabs anidados)

```tsx
export async function DocumentsPage({ searchParams }) {
  const tab = searchParams.tab || 'employees';
  const subtab = searchParams.subtab || 'permanent';

  return (
    <UrlTabs value={tab} paramName="tab" resetParams={['subtab', 'page']}>
      <UrlTabsList>
        <UrlTabsTrigger value="employees">Empleados</UrlTabsTrigger>
        <UrlTabsTrigger value="equipment">Equipos</UrlTabsTrigger>
      </UrlTabsList>

      <UrlTabsContent value="employees">
        {/* Subtabs con su propio paramName */}
        <UrlTabs value={subtab} paramName="subtab" preserveParams={['tab']}>
          <UrlTabsList>
            <UrlTabsTrigger value="permanent">Permanentes</UrlTabsTrigger>
            <UrlTabsTrigger value="monthly">Mensuales</UrlTabsTrigger>
          </UrlTabsList>

          <UrlTabsContent value="permanent">
            <Suspense fallback={<Skeleton />}>
              <PermanentDocs />
            </Suspense>
          </UrlTabsContent>

          <UrlTabsContent value="monthly">
            <Suspense fallback={<Skeleton />}>
              <MonthlyDocs />
            </Suspense>
          </UrlTabsContent>
        </UrlTabs>
      </UrlTabsContent>
    </UrlTabs>
  );
}
```

**URL resultante:** `?tab=employees&subtab=monthly`

---

### Preservando filtros

```tsx
<UrlTabs
  value={tab}
  paramName="tab"
  preserveParams={['search', 'filter']}  // Mantiene estos al cambiar tab
  resetParams={['page']}                  // Resetea paginación
>
```

**Comportamiento:**
- Antes: `?tab=all&search=test&filter=active&page=3`
- Después de cambiar tab: `?tab=archived&search=test&filter=active`

---

### Con baseUrl explícito

```tsx
<UrlTabs
  value={tab}
  paramName="tab"
  baseUrl="/dashboard/documents"
>
```

Útil cuando quieres asegurar la URL base independientemente de dónde se renderice.

---

### Sin historial (replace)

```tsx
<UrlTabs
  value={tab}
  replace={true}  // No agrega entrada al historial del navegador
>
```

---

### Modo local (sin URL)

```tsx
<UrlTabs
  defaultValue="first"
  disableUrlNavigation={true}  // Funciona como Tabs normal
>
```

---

## Patrón recomendado: Server Components por tab

```tsx
// page.tsx (Server Component)
export default async function MyPage({ searchParams }) {
  const tab = searchParams.tab || 'overview';

  return (
    <div>
      <h1>Mi Página</h1>

      <UrlTabs value={tab}>
        <UrlTabsList>
          <UrlTabsTrigger value="overview">Vista General</UrlTabsTrigger>
          <UrlTabsTrigger value="details">Detalles</UrlTabsTrigger>
          <UrlTabsTrigger value="settings">Configuración</UrlTabsTrigger>
        </UrlTabsList>

        <UrlTabsContent value="overview">
          <Suspense fallback={<OverviewSkeleton />}>
            <OverviewTab />
          </Suspense>
        </UrlTabsContent>

        <UrlTabsContent value="details">
          <Suspense fallback={<DetailsSkeleton />}>
            <DetailsTab searchParams={searchParams} />
          </Suspense>
        </UrlTabsContent>

        <UrlTabsContent value="settings">
          <Suspense fallback={<SettingsSkeleton />}>
            <SettingsTab />
          </Suspense>
        </UrlTabsContent>
      </UrlTabs>
    </div>
  );
}

// OverviewTab.tsx (Server Component - fetch independiente)
async function OverviewTab() {
  const [stats, recentActivity] = await Promise.all([
    getStats(),
    getRecentActivity(),
  ]);

  return (
    <div>
      <StatsCards stats={stats} />
      <ActivityList activity={recentActivity} />
    </div>
  );
}

// DetailsTab.tsx (Server Component - fetch independiente)
async function DetailsTab({ searchParams }) {
  const data = await getDetails(searchParams);

  return <DetailsTable data={data} />;
}
```

---

## Beneficios

| Aspecto | Tabs tradicional | UrlTabs |
|---------|-----------------|---------|
| URL sincronizada | Manual | Automático |
| Server Components | No (todo client) | Sí (children) |
| Streaming/Suspense | No | Sí |
| Código duplicado | Alto | Bajo |
| Queries por página | Todas siempre | Solo tab activo |
| Compartir URL | Manual | Automático |
| Historial navegador | Manual | Automático |

---

## Migración desde Tabs

```diff
- import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/shared/components/ui/tabs';
+ import { UrlTabs, UrlTabsList, UrlTabsTrigger, UrlTabsContent } from '@/shared/components/ui/url-tabs';

- const [tab, setTab] = useState('first');
+ // Leer de searchParams en Server Component
+ const tab = searchParams.tab || 'first';

- <Tabs value={tab} onValueChange={setTab}>
+ <UrlTabs value={tab} paramName="tab">

-   <TabsList>
-     <TabsTrigger value="first">First</TabsTrigger>
+   <UrlTabsList>
+     <UrlTabsTrigger value="first">First</UrlTabsTrigger>

-   <TabsContent value="first">
+   <UrlTabsContent value="first">
+     <Suspense fallback={<Skeleton />}>
        <Content />
+     </Suspense>
```
