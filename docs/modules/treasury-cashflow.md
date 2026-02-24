# Tesorería - Flujo de Caja

## Descripción
Dashboard de proyección financiera que agrega datos de múltiples fuentes para visualizar el cashflow futuro de la empresa.

## Fuentes de Datos

### Ingresos Esperados
1. **Facturas de Venta pendientes** (CONFIRMED/PARTIAL_PAID) → por dueDate
2. **Cheques de terceros** en cartera/depositados → por dueDate
3. **Proyecciones manuales** tipo INCOME (solo PENDING/PARTIAL, monto efectivo) → por date

### Egresos Esperados
4. **Facturas de Compra pendientes** (CONFIRMED/PARTIAL_PAID) → por dueDate
5. **Gastos pendientes** (CONFIRMED/PARTIAL_PAID) → por dueDate
6. **Cheques propios** entregados → por dueDate
7. **Proyecciones manuales** tipo EXPENSE (solo PENDING/PARTIAL, monto efectivo) → por date

### Saldo Inicial
- Suma de `BankAccount.balance` (cuentas activas)
- Saldo de sesiones de caja abiertas (`expectedBalance`)

### Proyecciones y Vinculación con Documentos
Las proyecciones manuales pueden vincularse a documentos reales (facturas, gastos) cuando se concretan:
- **PENDING** → sin vincular, se incluye monto completo en cashflow
- **PARTIAL** → parcialmente vinculada, se incluye `amount - confirmedAmount` en cashflow
- **CONFIRMED** → totalmente vinculada, se excluye del cashflow (el documento real ya aparece)

Esto evita duplicación de montos en el dashboard.

## Granularidades
| Granularidad | Rango | Buckets |
|-------------|-------|---------|
| Diario | 30 días | 30 |
| Semanal | 13 semanas | 13 |
| Mensual | 12 meses | 12 |

## Estructura de Archivos
```
src/modules/commercial/features/treasury/features/cashflow/
├── index.ts
├── actions.server.ts              # Lógica de agregación
├── CashflowDashboard.tsx          # Server Component principal
└── components/
    ├── _CashflowSummaryCards.tsx   # 4 KPI cards
    ├── _CashflowChart.tsx         # Recharts (Barras + Área)
    ├── _CashflowTable.tsx         # Tabla expandible por fuente
    └── _GranularitySelector.tsx   # Tabs Diario/Semanal/Mensual
```

## Proyecciones Manuales
```
src/modules/commercial/features/treasury/features/cashflow-projections/
├── index.ts
├── actions.server.ts              # CRUD + vinculación + totales
└── list/
    ├── index.ts
    ├── CashflowProjectionsList.tsx # Server Component con KPIs
    ├── columns.tsx
    └── components/
        ├── _ProjectionsTable.tsx
        ├── _CreateProjectionModal.tsx
        ├── _EditProjectionModal.tsx
        ├── _LinkDocumentModal.tsx      # Vincular documento desde proyección
        └── _ProjectionLinksSection.tsx  # Ver/desvincular documentos
```

### Categorías de Proyección
- SALES, PURCHASES, SALARIES, TAXES, RENT, SERVICES, OTHER

### Estados de Proyección
- `PENDING` — Sin vincular a documentos
- `PARTIAL` — Parcialmente vinculada (confirmedAmount < amount)
- `CONFIRMED` — Totalmente vinculada (confirmedAmount >= amount)

## Vinculación con Documentos

### Modelo ProjectionDocumentLink
Tabla junction que conecta proyecciones con documentos comerciales:
- `projectionId` → CashflowProjection
- `salesInvoiceId` → SalesInvoice (para proyecciones INCOME)
- `purchaseInvoiceId` → PurchaseInvoice (para proyecciones EXPENSE)
- `expenseId` → Expense (para proyecciones EXPENSE)
- `amount` → Monto que cubre este enlace (permite vinculación parcial)

### Flujo de Vinculación
1. **Desde Proyecciones**: Tabla → Dropdown → "Vincular documento" → busca documentos compatibles
2. **Desde Documentos**: Detalle factura/gasto → "Vincular a Proyección" → busca proyecciones PENDING/PARTIAL
3. Al vincular, se actualiza `confirmedAmount` y `status` de la proyección
4. Se puede desvincular desde la sección "Ver documentos vinculados"

### Componente Compartido
```
src/modules/commercial/shared/components/_LinkToProjectionModal.tsx
```
Modal reutilizable para vincular desde cualquier documento (venta, compra, gasto).

## Server Actions (Cashflow)
| Acción | Descripción |
|--------|-------------|
| getCashflowData(granularity) | Agrega 7 fuentes + saldos actuales (excluye proyecciones CONFIRMED) |

## Server Actions (Proyecciones)
| Acción | Descripción |
|--------|-------------|
| getProjectionsPaginated | Lista paginada con status y confirmedAmount |
| getProjectionsTotals | Totales income/expense/net |
| createProjection | Crear proyección |
| updateProjection | Editar proyección |
| deleteProjection | Eliminar proyección |
| getProjectionsInRange | Para cashflow dashboard |
| linkDocumentToProjection | Vincular documento a proyección |
| unlinkDocumentFromProjection | Desvincular documento |
| getProjectionLinks | Obtener vínculos de una proyección |
| searchDocumentsForLinking | Buscar documentos compatibles |
| searchProjectionsForLinking | Buscar proyecciones desde un documento |

## Permisos
- `commercial.treasury.cashflow` — Dashboard de flujo de caja
- `commercial.treasury.projections` — CRUD de proyecciones

## Rutas
- `/dashboard/commercial/treasury/cashflow` — Dashboard principal
- `/dashboard/commercial/treasury/projections` — Gestión de proyecciones
