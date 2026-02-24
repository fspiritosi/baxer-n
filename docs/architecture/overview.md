# Arquitectura General del Sistema

## Tech Stack

| Capa | Tecnologia | Version |
|------|-----------|---------|
| Framework | Next.js (App Router, Server Components) | 16.1.3 |
| UI Library | React | 19.2.3 |
| Lenguaje | TypeScript | 5+ |
| Base de Datos | PostgreSQL | 16 |
| ORM | Prisma (adapter @prisma/adapter-pg) | 7.2.0 |
| Autenticacion | Clerk (@clerk/nextjs) | ^6.36.8 |
| Estado Global | Zustand | ^5.0.10 |
| Estado Atomico | Jotai | ^2.16.2 |
| Estado Servidor | TanStack Query (React Query) | v5 |
| UI Components | shadcn/ui + Radix UI | - |
| Estilos | Tailwind CSS | v4 |
| Iconos | Lucide Icons | - |
| Formularios | React Hook Form + Zod | ^7.71.1 / ^4.3.6 |
| Fechas | moment.js | ^2.30.1 |
| Notificaciones | Sonner | ^2.0.7 |
| Email | Resend + React Email | ^6.9.1 |
| PDF | @react-pdf/renderer | ^4.3.2 |
| Excel | ExcelJS | ^4.4.0 |
| Graficos | Recharts | ^2.15.4 |
| Tablas | TanStack Table | v8 |
| Drag & Drop | @dnd-kit | - |
| Testing E2E | Cypress | ^14.4.0 |

---

## Diagrama de Capas

```
┌─────────────────────────────────────────────────────┐
│                    src/app/                          │
│         Paginas delgadas (routing only)              │
│    Solo page.tsx, layout.tsx, loading.tsx, error.tsx  │
└───────────────────────┬─────────────────────────────┘
                        │ importa de
                        ▼
┌─────────────────────────────────────────────────────┐
│                  src/modules/                        │
│           Logica de negocio por dominio              │
│   features/ → Server Actions + Componentes          │
│   Cada modulo es independiente (no cross-imports)    │
└───────────────────────┬─────────────────────────────┘
                        │ usa
                        ▼
┌─────────────────────────────────────────────────────┐
│                  src/shared/                         │
│           Codigo compartido entre modulos            │
│   components/ │ hooks/ │ actions/ │ lib/ │ utils/    │
└───────────────────────┬─────────────────────────────┘
                        │ accede via
                        ▼
┌─────────────────────────────────────────────────────┐
│              Prisma ORM + PostgreSQL                 │
│         prisma/schema.prisma → DB queries            │
└─────────────────────────────────────────────────────┘
```

**Regla fundamental:** Los modulos NO importan de otros modulos. Si necesitan compartir logica, esta va en `shared/`.

---

## Flujo de un Request Tipico

### Server Component (lectura de datos)

```
1. Usuario navega a /dashboard/commercial/products
2. Next.js renderiza page.tsx (Server Component)
3. page.tsx importa ProductsList de modules/commercial/features/products/features/list/
4. ProductsList llama a getProducts() (server action en actions.server.ts)
5. getProducts() llama getActiveCompanyId() para obtener el tenant
6. Prisma ejecuta query filtrada por companyId
7. Se retorna JSX con datos al cliente
8. Componentes client (_ProductsTable.tsx) manejan interactividad
```

### Mutacion (escritura de datos)

```
1. Usuario llena formulario en Client Component
2. React Hook Form + Zod validan los datos
3. Se llama server action (ej: createProduct())
4. Server action: getActiveCompanyId() → validacion → prisma.create()
5. Si exito: revalidatePath() o retorno de datos
6. Cliente: React Query invalida cache → refetch
7. Sonner muestra toast de confirmacion
```

---

## Multi-tenancy

El sistema soporta multiples empresas por usuario. La empresa activa se determina via:

```
src/shared/lib/company.ts
├── getActiveCompanyId()    → Solo el ID (para server actions)
├── getActiveCompany()      → Objeto completo (para UI)
├── setActiveCompany(id)    → Cambiar empresa activa
└── getUserPreferences()    → Preferencias del usuario
```

**Flujo de resolucion:**
1. Busca `UserPreference.activeCompanyId` del usuario
2. Valida que el membership siga activo
3. Si no hay o no es valido, usa la primera empresa disponible
4. Auto-guarda la preferencia

Todas las queries de server actions usan `getActiveCompanyId()` como filtro base.

---

## Provider Stack

Los providers envuelven la app en `src/providers/index.tsx`:

```
<SessionProvider>          ← Clerk (autenticacion)
  <ThemeProvider>          ← next-themes (claro/oscuro)
    <QueryProvider>        ← TanStack Query (cache de datos)
      {children}
      <Toaster />          ← Sonner (notificaciones)
    </QueryProvider>
  </ThemeProvider>
</SessionProvider>
```

---

## API Routes

| Ruta | Metodo | Descripcion |
|------|--------|-------------|
| `/api/active-company` | GET | Retorna `{ companyId }` de la empresa activa |
| `/api/storage/[...path]` | GET | Sirve archivos del storage local (solo provider `local`) |
| `/api/invoices/[id]/pdf` | GET | Genera PDF de factura de venta |
| `/api/payment-orders/[id]/pdf` | GET | Genera PDF de orden de pago |
| `/api/receipts/[id]/pdf` | GET | Genera PDF de recibo de cobro |

Las rutas de PDF requieren autenticacion via Clerk.

---

## Middleware

El middleware de autenticacion esta en `src/proxy.ts`:

```typescript
const isPublicRoute = createRouteMatcher([
  '/',
  '/sign-in(.*)',
  '/sign-up(.*)',
  '/eq/(.*)'        // QR publico de equipos
]);
```

- **Rutas publicas:** Landing, sign-in, sign-up, QR de equipos
- **Rutas protegidas:** Todo lo demas (dashboard, API routes)
- Usa `clerkMiddleware` con `auth.protect()` para rutas no publicas
