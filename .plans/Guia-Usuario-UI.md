# Plan: Guía de Usuario en la UI

## Contexto

Se necesita documentación para el usuario final dentro de la aplicación. Una guía paso a paso de utilización por módulo con interrelación entre módulos. El sidebar ya tiene una entrada "Ayuda" deshabilitada en `/dashboard/help` con icono `HelpCircle`. Se usará JSX puro (sin markdown libraries) y el componente `UrlTabs` existente para navegación por secciones.

---

## Estructura de Archivos

```
src/modules/help/
├── features/
│   └── guide/
│       ├── HelpGuide.tsx              # Server Component principal
│       ├── components/
│       │   ├── _HelpGuideTabs.tsx     # Client Component con UrlTabs
│       │   ├── _GettingStarted.tsx    # Primeros pasos
│       │   ├── _DashboardGuide.tsx    # Dashboard
│       │   ├── _EmployeesGuide.tsx    # Empleados
│       │   ├── _EquipmentGuide.tsx    # Equipamiento
│       │   ├── _DocumentsGuide.tsx    # Documentos
│       │   ├── _CommercialGuide.tsx   # Comercial (CRM, Productos, Ventas, Compras)
│       │   ├── _TreasuryGuide.tsx     # Tesorería
│       │   ├── _AccountingGuide.tsx   # Contabilidad
│       │   └── _CompanyGuide.tsx      # Empresa (config, usuarios, roles, catálogos)
│       └── index.ts
└── index.ts

src/app/(core)/dashboard/help/
└── page.tsx
```

---

## Implementación

### Fase 1: Estructura base (5 archivos)

1. **`src/modules/help/index.ts`** — Barrel export
2. **`src/modules/help/features/guide/index.ts`** — Barrel export
3. **`src/modules/help/features/guide/HelpGuide.tsx`** — Server Component principal (sin checkPermission, accesible para todos). Renderiza título "Guía de Usuario" + `_HelpGuideTabs`
4. **`src/modules/help/features/guide/components/_HelpGuideTabs.tsx`** — Client Component con `UrlTabs` de `@/shared/components/ui/url-tabs`. Define los 9 tabs y renderiza el componente de guía correspondiente
5. **`src/app/(core)/dashboard/help/page.tsx`** — Ruta que importa `HelpGuide`
6. **`_AppSidebar.tsx` línea 407** — Cambiar `disabled: true` → `disabled: false` en entrada "Ayuda"

### Fase 2: Guías de contenido (9 componentes)

Cada componente sigue un patrón consistente usando `Card`, `Alert`, íconos Lucide, y secciones numeradas paso a paso.

| Tab value | Componente | Contenido principal |
|-----------|-----------|-------------------|
| `inicio` | `_GettingStarted.tsx` | Setup inicial: crear empresa, configurar datos fiscales, crear usuarios y asignar roles, cargar catálogos base |
| `dashboard` | `_DashboardGuide.tsx` | KPIs disponibles, gráficos de tendencia, filtro de período (mes/año), alertas automáticas |
| `empleados` | `_EmployeesGuide.tsx` | Alta de empleados, campos obligatorios, cambio de estados, carga de documentos personales |
| `equipamiento` | `_EquipmentGuide.tsx` | Alta de vehículos/equipos, estados, documentación, código QR público |
| `documentos` | `_DocumentsGuide.tsx` | Crear tipos de documento, asignar condiciones, flujo de revisión (pendiente→aprobado/rechazado) |
| `comercial` | `_CommercialGuide.tsx` | CRM (clientes/proveedores), Productos (categorías, precios, barcode), Facturas de venta, Facturas de compra, Notas de crédito/débito |
| `tesoreria` | `_TreasuryGuide.tsx` | Cuentas bancarias, registrar movimientos, recibos de cobro, órdenes de pago, conciliación bancaria |
| `contabilidad` | `_AccountingGuide.tsx` | Plan de cuentas, asientos manuales, configurar integración comercial, reportes, cierre de ejercicio |
| `empresa` | `_CompanyGuide.tsx` | Gestión de usuarios, crear roles con permisos, catálogos (15 tipos), auditoría de permisos |

### Fase 3: Interrelación entre módulos

Al final de cada guía, sección "Relación con otros módulos" con `Alert` y links internos a otros tabs:

**Ejemplos clave:**
- **Comercial → Contabilidad**: "Al confirmar facturas se generan asientos contables automáticamente"
- **Comercial → Tesorería**: "Los cobros de facturas se registran como recibos en Tesorería"
- **Comercial → Almacenes**: "Al confirmar una factura de compra, el stock se actualiza automáticamente"
- **Documentos → Empleados/Equipos**: "Los tipos de documento se asignan a empleados y equipos"
- **Empresa → Todo**: "Los catálogos configurados aquí se usan en todo el sistema"
- **Contabilidad → Comercial**: "La integración contable requiere mapear cuentas en Configuración"

---

## Archivos a Modificar

| Archivo | Cambio |
|---------|--------|
| `src/shared/components/layout/_AppSidebar.tsx:407` | `disabled: false` en "Ayuda" |

## Archivos a Crear (15 total)

1. `src/modules/help/index.ts`
2. `src/modules/help/features/guide/index.ts`
3. `src/modules/help/features/guide/HelpGuide.tsx`
4. `src/modules/help/features/guide/components/_HelpGuideTabs.tsx`
5. `src/modules/help/features/guide/components/_GettingStarted.tsx`
6. `src/modules/help/features/guide/components/_DashboardGuide.tsx`
7. `src/modules/help/features/guide/components/_EmployeesGuide.tsx`
8. `src/modules/help/features/guide/components/_EquipmentGuide.tsx`
9. `src/modules/help/features/guide/components/_DocumentsGuide.tsx`
10. `src/modules/help/features/guide/components/_CommercialGuide.tsx`
11. `src/modules/help/features/guide/components/_TreasuryGuide.tsx`
12. `src/modules/help/features/guide/components/_AccountingGuide.tsx`
13. `src/modules/help/features/guide/components/_CompanyGuide.tsx`
14. `src/app/(core)/dashboard/help/page.tsx`

## Componentes existentes a reutilizar

- `UrlTabs` — `@/shared/components/ui/url-tabs` — navegación por tabs con URL sync
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` — contenedores
- `Alert`, `AlertDescription` — notas de interrelación
- `Badge` — etiquetas de estado/tipo
- `Separator` — división visual entre secciones
- Lucide Icons — iconografía consistente

---

## Verificación

1. `npm run check-types` pasa
2. `npm run lint` pasa
3. Navegar a `/dashboard/help` muestra la guía con todos los tabs
4. El link "Ayuda" en sidebar funciona (no está deshabilitado)
5. Los tabs navegan correctamente con URL sync (`?tab=comercial`, etc.)
6. La sección "Relación con otros módulos" tiene links funcionales entre tabs
7. Responsive: funciona en mobile y desktop
