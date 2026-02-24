# Plan: Ordenes de Compra (OC)

## Contexto

Una Orden de Compra (OC) es un documento comercial formal mediante el cual la empresa solicita a un proveedor la entrega de bienes/servicios. Es el inicio del circuito de compras: **OC → Remito → Factura Proveedor → Registro Contable → Pago**. Las OC aprobadas se reflejan como egresos proyectados en el cashflow.

> **Nota**: Los Remitos se implementarán como feature separada. La OC tendrá una sección placeholder para documentos vinculados.

---

## Fases de Implementacion

| Fase | Descripcion | Dependencia |
|------|-------------|-------------|
| 1 | Schema Prisma | — |
| 2 | Permisos y Rutas | Fase 1 |
| 3 | Validators y Tipos | Fase 1 |
| 4 | Server Actions | Fases 1, 3 |
| 5 | UI Lista | Fases 2, 4 |
| 6 | UI Crear/Editar | Fases 4, 5 |
| 7 | UI Detalle | Fases 4, 6 |
| 8 | Integracion Cashflow | Fases 4, 7 |
| 9 | Generacion PDF | Fases 4, 7 |
| 10 | Tests E2E y Docs | Todas |

---

## FASE 1 — Schema Prisma

**Archivo**: `prisma/schema.prisma`

### Nuevo Enum

```prisma
enum PurchaseOrderStatus {
  DRAFT                  // Borrador
  PENDING_APPROVAL       // Pendiente de aprobacion
  APPROVED               // Aprobada
  PARTIALLY_RECEIVED     // Recibida parcialmente (futuro: remitos)
  COMPLETED              // Completada
  CANCELLED              // Cancelada
  @@map("purchase_order_status")
}
```

### Nuevo Modelo: PurchaseOrder

```prisma
model PurchaseOrder {
  id                    String                @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  companyId             String                @map("company_id") @db.Uuid
  supplierId            String                @map("supplier_id") @db.Uuid
  number                Int                   // Secuencial por empresa
  fullNumber            String                @map("full_number")  // OC-00001
  issueDate             DateTime              @map("issue_date") @db.Date
  expectedDeliveryDate  DateTime?             @map("expected_delivery_date") @db.Date
  paymentConditions     String?               @map("payment_conditions") @db.Text
  deliveryAddress       String?               @map("delivery_address")
  deliveryNotes         String?               @map("delivery_notes") @db.Text
  subtotal              Decimal               @default(0) @db.Decimal(12, 2)
  vatAmount             Decimal               @default(0) @map("vat_amount") @db.Decimal(12, 2)
  total                 Decimal               @default(0) @db.Decimal(12, 2)
  notes                 String?               @db.Text
  status                PurchaseOrderStatus   @default(DRAFT)
  approvedBy            String?               @map("approved_by")
  approvedAt            DateTime?             @map("approved_at")
  company               Company               @relation(fields: [companyId], references: [id])
  supplier              Supplier              @relation(fields: [supplierId], references: [id])
  lines                 PurchaseOrderLine[]
  projectionLinks       ProjectionDocumentLink[]
  createdBy             String                @map("created_by")
  createdAt             DateTime              @default(now()) @map("created_at")
  updatedAt             DateTime              @updatedAt @map("updated_at")
  @@unique([companyId, number])
  @@index([companyId, status])
  @@map("purchase_orders")
}
```

### Nuevo Modelo: PurchaseOrderLine

```prisma
model PurchaseOrderLine {
  id          String          @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  orderId     String          @map("order_id") @db.Uuid
  productId   String?         @map("product_id") @db.Uuid
  description String
  quantity    Decimal         @db.Decimal(12, 3)
  unitCost    Decimal         @map("unit_cost") @db.Decimal(12, 2)
  vatRate     Decimal         @map("vat_rate") @db.Decimal(5, 2)
  vatAmount   Decimal         @map("vat_amount") @db.Decimal(12, 2)
  subtotal    Decimal         @db.Decimal(12, 2)
  total       Decimal         @db.Decimal(12, 2)
  receivedQty Decimal         @default(0) @map("received_qty") @db.Decimal(12, 3) // Futuro: remitos
  order       PurchaseOrder   @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product     Product?        @relation(fields: [productId], references: [id])
  @@map("purchase_order_lines")
}
```

### Relaciones en modelos existentes

- `Company`: agregar `purchaseOrders PurchaseOrder[]`
- `Supplier`: agregar `purchaseOrders PurchaseOrder[]`
- `Product`: agregar `purchaseOrderLines PurchaseOrderLine[]`
- `ProjectionDocumentLink`: agregar `purchaseOrderId String? @map("purchase_order_id") @db.Uuid` + relacion + indice

### Migracion

```bash
npm run db:push && npm run db:generate
```

---

## FASE 2 — Permisos y Rutas

### Archivos a modificar

**`src/shared/lib/permissions/constants.ts`**
- Agregar `'commercial.purchase-orders'` a `MODULES`
- Agregar label en `MODULE_LABELS`
- Agregar a `MODULE_GROUPS.comercial.modules`
- Agregar accion `approve` a `ACTIONS` y `ACTION_LABELS`

**`src/shared/components/layout/_AppSidebar.tsx`**
- En seccion "Compras", agregar despues de "Facturas de Compra":
  ```typescript
  { title: 'Ordenes de Compra', href: '/dashboard/commercial/purchase-orders', module: 'commercial.purchase-orders' }
  ```

### Archivos a crear (rutas)

| Ruta | Archivo |
|------|---------|
| Lista | `src/app/(core)/dashboard/commercial/purchase-orders/page.tsx` |
| Crear | `src/app/(core)/dashboard/commercial/purchase-orders/new/page.tsx` |
| Detalle | `src/app/(core)/dashboard/commercial/purchase-orders/[id]/page.tsx` |

Cada page.tsx importa de `modules/commercial/features/purchases/features/purchase-orders/`.

---

## FASE 3 — Validators y Tipos

**Archivo**: `src/modules/commercial/features/purchases/features/purchase-orders/shared/validators.ts`

- `PURCHASE_ORDER_STATUS_LABELS: Record<PurchaseOrderStatus, string>`
- `PURCHASE_ORDER_STATUS_VARIANTS` (para Badge)
- `purchaseOrderLineSchema` (description, quantity, unitCost, vatRate, productId opcional)
- `purchaseOrderFormSchema` (supplierId, issueDate, expectedDeliveryDate?, paymentConditions?, deliveryAddress?, deliveryNotes?, notes?, lines[])
- Tipos: `PurchaseOrderFormInput`, `PurchaseOrderLineInput`

**Patron de referencia**: `src/modules/commercial/features/purchases/features/invoices/shared/validators.ts`

---

## FASE 4 — Server Actions

**Archivo**: `src/modules/commercial/features/purchases/features/purchase-orders/list/actions.server.ts`

| Accion | Descripcion |
|--------|-------------|
| `getPurchaseOrdersPaginated(searchParams)` | Lista paginada con DataTable helpers |
| `getPurchaseOrderById(id)` | Detalle completo con supplier, lines, products |
| `createPurchaseOrder(input)` | Crear con numeracion secuencial `OC-XXXXX` |
| `updatePurchaseOrder(id, input)` | Solo si DRAFT, reemplaza lineas en transaccion |
| `submitForApproval(id)` | DRAFT → PENDING_APPROVAL |
| `approvePurchaseOrder(id)` | PENDING_APPROVAL → APPROVED (registra approvedBy/At) |
| `rejectPurchaseOrder(id)` | PENDING_APPROVAL → DRAFT |
| `cancelPurchaseOrder(id)` | DRAFT/PENDING_APPROVAL/APPROVED → CANCELLED |
| `deletePurchaseOrder(id)` | Solo si DRAFT |

**Numeracion** (patron de Expenses):
```typescript
const lastOrder = await prisma.purchaseOrder.findFirst({ where: { companyId }, orderBy: { number: 'desc' }, select: { number: true } });
const nextNumber = (lastOrder?.number ?? 0) + 1;
const fullNumber = `OC-${String(nextNumber).padStart(5, '0')}`;
```

**Funciones auxiliares**: Reusar `getSuppliersForSelect()` y `getProductsForSelect()` del modulo de facturas de compra (mismo parent module `purchases/features/`).

**Patron de referencia**: `src/modules/commercial/features/purchases/features/invoices/list/actions.server.ts`

---

## FASE 5 — UI Lista

### Archivos a crear

```
src/modules/commercial/features/purchases/features/purchase-orders/
  list/
    PurchaseOrdersList.tsx          # Server Component
    columns.tsx                     # Definicion de columnas
    components/_PurchaseOrdersTable.tsx  # Client Component
    index.ts
```

**Columnas**: fullNumber, supplier (nombre + CUIT), issueDate, expectedDeliveryDate, total, status (Badge), actions (dropdown)

**Acciones en dropdown**:
- Ver detalle (siempre)
- Editar (DRAFT)
- Enviar a aprobacion (DRAFT)
- Aprobar (PENDING_APPROVAL, requiere permiso `approve`)
- Cancelar (DRAFT/PENDING_APPROVAL/APPROVED)
- Eliminar (DRAFT)

**Patron de referencia**: `src/modules/commercial/features/purchases/features/invoices/list/`

---

## FASE 6 — UI Crear/Editar

### Archivos a crear

```
src/modules/commercial/features/purchases/features/purchase-orders/
  create/
    CreatePurchaseOrder.tsx          # Server Component
    components/_PurchaseOrderForm.tsx # Client Component
    index.ts
```

**Secciones del formulario**:
1. **Datos basicos**: Proveedor (select), Fecha emision, Fecha entrega esperada
2. **Lineas de productos**: useFieldArray — producto (select + crear inline), descripcion, cantidad, costo unitario, alicuota IVA. Calculo en vivo de subtotal/IVA/total por linea
3. **Condiciones**: Condiciones de pago (textarea), Direccion de entrega, Notas de entrega
4. **Observaciones**: Campo de notas
5. **Totales**: Subtotal, IVA, Total (calculados)
6. **Acciones**: Guardar como borrador / Guardar y enviar a aprobacion

**Modo edit**: El form acepta `mode: 'create' | 'edit'` y `defaultValues`. Solo disponible si status es DRAFT.

**Patron de referencia**: `src/modules/commercial/features/purchases/features/invoices/create/components/_PurchaseInvoiceForm.tsx`

---

## FASE 7 — UI Detalle

### Archivos a crear

```
src/modules/commercial/features/purchases/features/purchase-orders/
  detail/
    PurchaseOrderDetail.tsx          # Server Component
    components/_PurchaseOrderActions.tsx  # Client Component (botones de accion)
    index.ts
```

**Layout**:
- Header: boton volver, titulo (OC-XXXXX), badge de estado, botones de accion segun estado
- Cards:
  - **Datos Generales**: Proveedor, fecha emision, fecha entrega
  - **Condiciones**: Pago, direccion entrega, notas entrega
  - **Lineas**: Tabla con producto, descripcion, cantidad, costo, IVA, total
  - **Totales**: Subtotal, IVA, Total
  - **Documentos Vinculados** (placeholder): "No hay remitos vinculados" / "No hay facturas vinculadas"
  - **Observaciones**

**Acciones segun estado**:
- DRAFT: Editar, Enviar a aprobacion, Eliminar
- PENDING_APPROVAL: Aprobar, Rechazar
- APPROVED: Descargar PDF, Cancelar

**Patron de referencia**: `src/modules/commercial/features/purchases/features/invoices/detail/PurchaseInvoiceDetail.tsx`

---

## FASE 8 — Integracion Cashflow

**Archivo**: `src/modules/commercial/features/treasury/features/cashflow/actions.server.ts`

- Agregar query de OC aprobadas (`status: 'APPROVED'`, `expectedDeliveryDate` en rango)
- Agregar `purchaseOrders: number` a `CashflowRow.details`
- En buckets, sumar OC aprobadas como outflows usando `expectedDeliveryDate` como fecha de referencia
- Actualizar calculo de outflows totales

**Archivo**: `src/modules/commercial/features/treasury/features/cashflow/CashflowDashboard.tsx`
- Mostrar fila "Ordenes de Compra" en detalle de cashflow

---

## FASE 9 — Generacion PDF

### Archivos a crear

```
src/modules/commercial/features/purchases/features/purchase-orders/
  shared/pdf/
    types.ts              # PurchaseOrderPDFData
    styles.ts             # Estilos react-pdf
    PurchaseOrderTemplate.tsx  # Template react-pdf
    generator.tsx         # renderToBuffer
    data-mapper.ts        # DB data → PDF data
    index.ts              # Server action de descarga
```

**Template**: Header con "ORDEN DE COMPRA", datos empresa, datos proveedor, condiciones de pago/entrega, tabla de lineas, totales, observaciones.

**Patron de referencia**: Buscar templates PDF existentes en el proyecto (facturas de venta).

---

## FASE 10 — Tests E2E y Documentacion

**Archivo**: `cypress/e2e/commercial/purchase-orders.cy.ts`

Tests:
- Navegar a lista de OC
- Crear nueva OC con lineas
- Ver detalle de OC
- Enviar a aprobacion y aprobar
- Cancelar OC borrador
- Eliminar OC borrador

**Archivo**: `cypress/support/db.ts` — agregar `cleanupPurchaseOrders`

**Archivo**: `docs/modules/purchase-orders.md` — documentacion del modulo

**Archivo**: `docs/architecture/data-model.md` — actualizar con PurchaseOrder y PurchaseOrderLine

---

## Estructura de Archivos Completa

### Nuevos

```
src/modules/commercial/features/purchases/features/purchase-orders/
  index.ts
  shared/
    validators.ts
    index.ts
    pdf/
      types.ts
      styles.ts
      PurchaseOrderTemplate.tsx
      generator.tsx
      data-mapper.ts
      index.ts
  list/
    PurchaseOrdersList.tsx
    actions.server.ts
    columns.tsx
    components/_PurchaseOrdersTable.tsx
    index.ts
  create/
    CreatePurchaseOrder.tsx
    components/_PurchaseOrderForm.tsx
    index.ts
  detail/
    PurchaseOrderDetail.tsx
    components/_PurchaseOrderActions.tsx
    index.ts

src/app/(core)/dashboard/commercial/purchase-orders/
  page.tsx
  new/page.tsx
  [id]/page.tsx

cypress/e2e/commercial/purchase-orders.cy.ts
docs/modules/purchase-orders.md
```

### Modificados

```
prisma/schema.prisma                                    # Enum + modelos + relaciones
src/shared/lib/permissions/constants.ts                 # Modulo + accion approve
src/shared/components/layout/_AppSidebar.tsx             # Entrada sidebar
src/modules/commercial/features/treasury/features/cashflow/actions.server.ts  # OC en cashflow
cypress/support/db.ts                                   # Cleanup function
docs/architecture/data-model.md                         # Actualizar modelo de datos
```

---

## Verificacion

1. `npm run db:push && npm run db:generate && npm run check-types`
2. Crear OC borrador → verificar numeracion secuencial
3. Enviar a aprobacion → verificar cambio de estado
4. Aprobar → verificar que aparece en cashflow
5. Descargar PDF → verificar formato
6. Cancelar → verificar que no aparece en cashflow
7. Tests E2E: `npm run cy:run -- --spec "cypress/e2e/commercial/purchase-orders.cy.ts"`
