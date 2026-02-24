# Plan: Cashflow - Cheques, Proyecciones y Flujo de Caja

## Contexto

La empresa necesita una herramienta de **proyección financiera (cashflow)** para anticipar su posición de caja. Ya existen gastos futuros, órdenes de pago y recibos con fechas futuras, pero faltan dos piezas clave:
1. **Gestión de Cheques** con cartera completa y ciclo de vida
2. **Proyecciones manuales** de ventas y compras

Con estos datos + facturas pendientes + gastos pendientes, se construye el **Dashboard de Flujo de Caja** con vistas diaria/semanal/mensual.

---

## Fases de Implementación

| Fase | Descripción | Dependencia |
|------|-------------|-------------|
| 1 | Schema Prisma (modelos + enums) | — |
| 2 | Módulo de Cheques (CRUD + ciclo de vida) | Fase 1 |
| 3 | Proyecciones Manuales (CRUD) | Fase 1 |
| 4 | Dashboard Flujo de Caja (agregación + charts) | Fases 2 y 3 |

---

## FASE 1 — Schema Prisma

**Archivo**: `prisma/schema.prisma`

### 1.1 Nuevos Enums

```prisma
enum CheckType {
  OWN           // Cheque propio (emitido)
  THIRD_PARTY   // Cheque de tercero (recibido)
  @@map("check_type")
}

enum CheckStatus {
  PORTFOLIO     // En cartera (terceros recibidos)
  DEPOSITED     // Depositado en banco
  CLEARED       // Acreditado
  REJECTED      // Rechazado
  ENDORSED      // Endosado a tercero
  DELIVERED     // Entregado (propio emitido)
  CASHED        // Cobrado (propio debitado)
  VOIDED        // Anulado
  @@map("check_status")
}

enum ProjectionType {
  INCOME
  EXPENSE
  @@map("projection_type")
}

enum ProjectionCategory {
  SALES
  PURCHASES
  SALARIES
  TAXES
  RENT
  SERVICES
  OTHER
  @@map("projection_category")
}
```

### 1.2 Modelo Check

```prisma
model Check {
  id                    String       @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId             String       @map("company_id") @db.Uuid
  type                  CheckType
  status                CheckStatus  @default(PORTFOLIO)

  // Datos del cheque
  checkNumber           String       @map("check_number")
  bankName              String       @map("bank_name")
  branch                String?
  accountNumber         String?      @map("account_number")
  amount                Decimal      @db.Decimal(15, 2)
  issueDate             DateTime     @map("issue_date")
  dueDate               DateTime     @map("due_date")

  // Librador y beneficiario
  drawerName            String       @map("drawer_name")
  drawerTaxId           String?      @map("drawer_tax_id")
  payeeName             String?      @map("payee_name")

  // Relaciones con terceros
  customerId            String?      @map("customer_id") @db.Uuid
  supplierId            String?      @map("supplier_id") @db.Uuid

  // Relaciones con documentos de tesorería
  receiptPaymentId      String?      @map("receipt_payment_id") @db.Uuid
  paymentOrderPaymentId String?      @map("payment_order_payment_id") @db.Uuid

  // Relación con banco (al depositar)
  bankAccountId         String?      @map("bank_account_id") @db.Uuid
  bankMovementId        String?      @map("bank_movement_id") @db.Uuid

  // Endoso
  endorsedToName        String?      @map("endorsed_to_name")
  endorsedToTaxId       String?      @map("endorsed_to_tax_id")
  endorsedAt            DateTime?    @map("endorsed_at")

  // Rechazo
  rejectedAt            DateTime?    @map("rejected_at")
  rejectionReason       String?      @map("rejection_reason")

  // Depósito y acreditación
  depositedAt           DateTime?    @map("deposited_at")
  clearedAt             DateTime?    @map("cleared_at")

  notes                 String?      @db.Text

  // Relations
  company               Company      @relation(fields: [companyId], references: [id])
  customer              Contractor?  @relation(fields: [customerId], references: [id])
  supplier              Supplier?    @relation(fields: [supplierId], references: [id])
  bankAccount           BankAccount? @relation(fields: [bankAccountId], references: [id])
  bankMovement          BankMovement? @relation(fields: [bankMovementId], references: [id])
  receiptPayment        ReceiptPayment? @relation(fields: [receiptPaymentId], references: [id])
  paymentOrderPayment   PaymentOrderPayment? @relation(fields: [paymentOrderPaymentId], references: [id])

  createdBy             String       @map("created_by")
  createdAt             DateTime     @default(now()) @map("created_at")
  updatedAt             DateTime     @updatedAt @map("updated_at")

  @@index([companyId, type, status])
  @@index([companyId, dueDate])
  @@map("checks")
}
```

### 1.3 Modelo CashflowProjection

```prisma
model CashflowProjection {
  id          String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId   String              @map("company_id") @db.Uuid
  type        ProjectionType
  category    ProjectionCategory
  description String
  amount      Decimal             @db.Decimal(15, 2)
  date        DateTime            @db.Date
  isRecurring Boolean             @default(false) @map("is_recurring")
  notes       String?             @db.Text

  company     Company             @relation(fields: [companyId], references: [id])
  createdBy   String              @map("created_by")
  createdAt   DateTime            @default(now()) @map("created_at")
  updatedAt   DateTime            @updatedAt @map("updated_at")

  @@index([companyId, date])
  @@map("cashflow_projections")
}
```

### 1.4 Relaciones inversas a agregar en modelos existentes

- `Company`: `checks Check[]`, `cashflowProjections CashflowProjection[]`
- `BankAccount`: `checks Check[]`
- `BankMovement`: `check Check?`
- `Contractor`: `checks Check[]`
- `Supplier`: `checks Check[]`
- `ReceiptPayment`: `check Check?`
- `PaymentOrderPayment`: `check Check?`

### 1.5 Comandos

```bash
npm run db:migrate -- --name add_checks_and_cashflow_projections
npm run db:generate
```

---

## FASE 2 — Módulo de Cheques

### 2.1 Estructura de archivos

```
src/modules/commercial/features/treasury/features/checks/
├── index.ts
├── actions.server.ts
└── list/
    ├── index.ts
    ├── ChecksList.tsx                    # Server Component
    ├── columns.tsx                       # Columnas DataTable
    └── components/
        ├── _ChecksTable.tsx              # Client - tabla + modales
        ├── _CreateCheckModal.tsx         # Client - crear cheque manual
        ├── _CheckDetailModal.tsx         # Client - ver detalle
        ├── _DepositCheckModal.tsx        # Client - depositar en banco
        └── _EndorseCheckModal.tsx        # Client - endosar

src/app/(core)/dashboard/commercial/treasury/checks/
└── page.tsx
```

### 2.2 Validators y Labels

**Archivo**: `src/modules/commercial/features/treasury/shared/validators.ts` (agregar)

- `createCheckSchema` — checkNumber, bankName, branch?, amount, issueDate, dueDate, drawerName, drawerTaxId?, type, customerId?, supplierId?, notes?
- `depositCheckSchema` — checkId, bankAccountId, depositDate
- `endorseCheckSchema` — checkId, endorsedToName, endorsedToTaxId?, supplierId?, endorsedDate
- Labels: `CHECK_TYPE_LABELS`, `CHECK_STATUS_LABELS`, `CHECK_STATUS_BADGES`

### 2.3 Types

**Archivo**: `src/modules/commercial/features/treasury/shared/types.ts` (agregar)

- `CheckListItem` — datos para tabla
- `CheckWithDetails` — datos completos para modal de detalle

### 2.4 Server Actions

**Archivo**: `src/modules/commercial/features/treasury/features/checks/actions.server.ts`

| Acción | Descripción |
|--------|-------------|
| `getChecksPaginated(searchParams)` | Lista paginada con búsqueda |
| `getCheckById(id)` | Detalle completo |
| `createCheck(data)` | Crear cheque manual (tercero → PORTFOLIO, propio → DELIVERED) |
| `depositCheck(data)` | PORTFOLIO → DEPOSITED. Crea BankMovement tipo CHECK |
| `clearCheck(checkId)` | DEPOSITED → CLEARED. Actualiza balance banco |
| `rejectCheck(checkId, reason)` | DEPOSITED → REJECTED. Revierte movimiento bancario |
| `endorseCheck(data)` | PORTFOLIO → ENDORSED. Registra endosatario |
| `voidCheck(checkId)` | Cualquier estado pre-clearing → VOIDED |
| `deleteCheck(checkId)` | Solo PORTFOLIO/DELIVERED sin operaciones |

**Máquina de estados:**
```
Terceros:  PORTFOLIO → DEPOSITED → CLEARED
                     → ENDORSED
                     → VOIDED
           DEPOSITED → REJECTED

Propios:   DELIVERED → CASHED
                     → VOIDED
```

### 2.5 Integración con Recibos y Órdenes de Pago

**Archivo a modificar**: `src/modules/commercial/features/treasury/features/receipts/actions.server.ts`
- En `confirmReceipt()`, cuando un payment tiene `paymentMethod: CHECK`, crear registro `Check` tipo `THIRD_PARTY` con status `PORTFOLIO`, vinculado via `receiptPaymentId`

**Archivo a modificar**: `src/modules/commercial/features/treasury/features/payment-orders/actions.server.ts`
- En `confirmPaymentOrder()`, cuando un payment tiene `paymentMethod: CHECK`, crear registro `Check` tipo `OWN` con status `DELIVERED`, vinculado via `paymentOrderPaymentId`

### 2.6 Permisos y Sidebar

- Permiso: `'commercial.treasury.checks'` en `src/shared/lib/permissions/constants.ts`
- Sidebar: agregar en sección Tesorería de `src/shared/components/layout/_AppSidebar.tsx`

---

## FASE 3 — Proyecciones Manuales

### 3.1 Estructura de archivos

```
src/modules/commercial/features/treasury/features/cashflow-projections/
├── index.ts
├── actions.server.ts
└── list/
    ├── index.ts
    ├── CashflowProjectionsList.tsx       # Server Component
    ├── columns.tsx
    └── components/
        ├── _ProjectionsTable.tsx          # Client - tabla + modales
        ├── _CreateProjectionModal.tsx     # Client - crear
        └── _EditProjectionModal.tsx       # Client - editar

src/app/(core)/dashboard/commercial/treasury/projections/
└── page.tsx
```

### 3.2 Validators y Labels

**Archivo**: `src/modules/commercial/features/treasury/shared/validators.ts` (agregar)

- `createProjectionSchema` — type (INCOME/EXPENSE), category (SALES/PURCHASES/SALARIES/TAXES/RENT/SERVICES/OTHER), description, amount, date, isRecurring, notes?
- Labels: `PROJECTION_TYPE_LABELS`, `PROJECTION_CATEGORY_LABELS`

### 3.3 Server Actions

**Archivo**: `src/modules/commercial/features/treasury/features/cashflow-projections/actions.server.ts`

| Acción | Descripción |
|--------|-------------|
| `getProjectionsPaginated(searchParams)` | Lista paginada |
| `createProjection(data)` | Crear proyección |
| `updateProjection(id, data)` | Editar proyección |
| `deleteProjection(id)` | Eliminar |
| `getProjectionsInRange(start, end)` | Para cashflow dashboard |

### 3.4 Permisos y Sidebar

- Permiso: `'commercial.treasury.projections'`
- Sidebar: `{ title: 'Proyecciones', href: '/dashboard/commercial/treasury/projections' }`

---

## FASE 4 — Dashboard de Flujo de Caja

### 4.1 Estructura de archivos

```
src/modules/commercial/features/treasury/features/cashflow/
├── index.ts
├── actions.server.ts                      # Lógica de agregación
├── CashflowDashboard.tsx                  # Server Component principal
└── components/
    ├── _CashflowChart.tsx                 # Client - AreaChart (Recharts)
    ├── _CashflowTable.tsx                 # Client - Tabla de períodos
    ├── _GranularitySelector.tsx           # Client - Selector diario/semanal/mensual
    └── _CashflowSummaryCards.tsx          # Client - Cards resumen

src/app/(core)/dashboard/commercial/treasury/cashflow/
└── page.tsx
```

### 4.2 Fuentes de datos para agregación

**Ingresos esperados:**
1. Facturas de venta pendientes (`SalesInvoice` CONFIRMED/PARTIAL_PAID) → por `dueDate`
2. Cheques de terceros en cartera (`Check` THIRD_PARTY + PORTFOLIO) → por `dueDate`
3. Proyecciones manuales tipo INCOME → por `date`

**Egresos esperados:**
4. Facturas de compra pendientes (`PurchaseInvoice` CONFIRMED/PARTIAL_PAID) → por `dueDate`
5. Gastos pendientes (`Expense` CONFIRMED/PARTIAL_PAID) → por `dueDate`
6. Cheques propios entregados (`Check` OWN + DELIVERED) → por `dueDate`
7. Proyecciones manuales tipo EXPENSE → por `date`

**Saldo inicial:**
- Suma de `BankAccount.balance` (activas)
- Saldo de cajas (sesión abierta `expectedBalance`)

### 4.3 Server Action principal

```typescript
type Granularity = 'daily' | 'weekly' | 'monthly';

interface CashflowRow {
  period: string;           // "2026-02-20" | "2026-W08" | "2026-02"
  periodLabel: string;      // "20/02" | "Sem 8" | "Feb 26"
  inflows: number;
  outflows: number;
  net: number;
  projectedBalance: number; // saldo acumulado
  details: {
    salesInvoices: number;
    purchaseInvoices: number;
    expenses: number;
    checksIn: number;
    checksOut: number;
    projectionsIn: number;
    projectionsOut: number;
  };
}

interface CashflowSummary {
  currentBalance: number;
  totalProjectedInflows: number;
  totalProjectedOutflows: number;
  endingProjectedBalance: number;
  checksInPortfolio: { count: number; total: number };
  overdueReceivables: { count: number; total: number };
  overduePayables: { count: number; total: number };
}
```

**Algoritmo:**
1. Rango según granularidad: diario (30 días), semanal (13 semanas), mensual (12 meses)
2. Consultar 7 fuentes en paralelo con `Promise.all()`
3. Calcular saldo actual (bancos + cajas)
4. Generar buckets temporales con `moment.js`
5. Asignar cada item a su bucket por `dueDate`/`date`
6. Items sin `dueDate` → bucket 1 (vencidos/inmediatos)
7. Calcular saldo proyectado acumulativo

### 4.4 Componentes UI

- **`_CashflowSummaryCards`** — 4 cards: Saldo Actual | Ingresos Proyectados | Egresos Proyectados | Saldo Final
- **`_CashflowChart`** — Recharts AreaChart: Ingresos (verde), Egresos (rojo), Saldo (azul línea). Patrón: `src/modules/dashboard/components/_SalesTrendChart.tsx`
- **`_CashflowTable`** — Tabla simple expandible con desglose por fuente
- **`_GranularitySelector`** — Toggle Diario|Semanal|Mensual via searchParams URL

### 4.5 Permisos y Sidebar

- Permiso: `'commercial.treasury.cashflow'`
- Sidebar: `{ title: 'Flujo de Caja', href: '/dashboard/commercial/treasury/cashflow' }` — **primer item** de Tesorería

---

## Resumen de archivos

| Fase | Nuevos | Modificados |
|------|--------|-------------|
| 1 | — | `prisma/schema.prisma` |
| 2 | ~12 en `checks/` + 1 page | `receipts/actions.server.ts`, `payment-orders/actions.server.ts`, `shared/validators.ts`, `shared/types.ts`, `permissions/constants.ts`, `_AppSidebar.tsx` |
| 3 | ~8 en `cashflow-projections/` + 1 page | `shared/validators.ts`, `permissions/constants.ts`, `_AppSidebar.tsx` |
| 4 | ~7 en `cashflow/` + 1 page | `permissions/constants.ts`, `_AppSidebar.tsx` |

---

## Verificación por fase

**Fase 1**: `npm run db:migrate` + `npm run db:generate` + `npm run check-types`

**Fase 2**: CRUD cheques + depositar/acreditar/rechazar/endosar + integración con recibos y OPs + `check-types`

**Fase 3**: CRUD proyecciones + `check-types`

**Fase 4**: Dashboard con selector de granularidad + chart + tabla + datos reales agregados + `check-types`

**Tests E2E** (cada fase): `cypress/e2e/commercial/treasury/checks.cy.ts`, `cashflow-projections.cy.ts`, `cashflow.cy.ts`

**Docs**: `docs/modules/treasury-checks.md`, `docs/modules/treasury-cashflow.md`
