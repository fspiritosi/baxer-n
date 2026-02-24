# Ordenes de Compra (OC)

## Descripcion
Gestion de ordenes de compra a proveedores con flujo de aprobacion, seguimiento de recepcion y proyeccion de egresos en cashflow.

## Modelo de Datos

### PurchaseOrder
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | String (cuid) | Identificador unico |
| number | String | Numero secuencial OC-XXXXX por empresa |
| status | PurchaseOrderStatus | Estado actual de la orden |
| supplierId | String | Proveedor asociado |
| companyId | String | Empresa (tenant) |
| issueDate | DateTime | Fecha de emision |
| expectedDeliveryDate | DateTime? | Fecha estimada de entrega (usada para cashflow) |
| notes | String? | Observaciones generales |
| subtotal | Decimal | Subtotal sin impuestos |
| taxAmount | Decimal | Monto total de impuestos |
| total | Decimal | Total de la orden |
| createdById | String | Usuario que creo la orden |
| approvedById | String? | Usuario que aprobo la orden |
| approvedAt | DateTime? | Fecha de aprobacion |
| rejectionReason | String? | Motivo de rechazo (si aplica) |
| createdAt | DateTime | Fecha de creacion |
| updatedAt | DateTime | Fecha de actualizacion |

### PurchaseOrderLine
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | String (cuid) | Identificador unico |
| purchaseOrderId | String | Orden de compra padre |
| productId | String | Producto asociado |
| quantity | Decimal | Cantidad solicitada |
| receivedQuantity | Decimal | Cantidad recibida hasta ahora |
| unitPrice | Decimal | Precio unitario |
| taxRate | Decimal | Porcentaje de impuesto |
| taxAmount | Decimal | Monto de impuesto de la linea |
| total | Decimal | Total de la linea |

### Relaciones
- PurchaseOrder N→1 Supplier (proveedor)
- PurchaseOrder N→1 Company (empresa/tenant)
- PurchaseOrder 1←N PurchaseOrderLine (lineas de detalle)
- PurchaseOrderLine N→1 Product (producto)

## Enum: PurchaseOrderStatus

```
DRAFT → PENDING_APPROVAL → APPROVED → PARTIALLY_RECEIVED → COMPLETED
                         ↘ CANCELLED
         PENDING_APPROVAL → CANCELLED (rechazo)
```

| Estado | Descripcion |
|--------|-------------|
| `DRAFT` | Borrador, editable libremente |
| `PENDING_APPROVAL` | Enviada para aprobacion |
| `APPROVED` | Aprobada, pendiente de recepcion |
| `PARTIALLY_RECEIVED` | Recepcion parcial de productos |
| `COMPLETED` | Todos los productos recibidos |
| `CANCELLED` | Cancelada (desde cualquier estado excepto COMPLETED) |

### Transiciones Validas
| Desde | Hacia | Accion |
|-------|-------|--------|
| DRAFT | PENDING_APPROVAL | submitForApproval |
| PENDING_APPROVAL | APPROVED | approvePurchaseOrder |
| PENDING_APPROVAL | CANCELLED | rejectPurchaseOrder |
| APPROVED | PARTIALLY_RECEIVED | Automatico al recibir parcialmente |
| APPROVED | COMPLETED | Automatico al recibir todo |
| PARTIALLY_RECEIVED | COMPLETED | Automatico al completar recepcion |
| DRAFT, PENDING_APPROVAL, APPROVED | CANCELLED | cancelPurchaseOrder |

## Numeracion
Secuencial por empresa con formato `OC-XXXXX` (ej: OC-00001, OC-00002).
Se calcula automaticamente al crear la orden tomando el maximo numero existente + 1.

## Server Actions

Ubicacion: `src/modules/commercial/features/purchases/features/purchase-orders/list/actions.server.ts`

| Accion | Descripcion |
|--------|-------------|
| getPurchaseOrdersPaginated | Lista paginada con busqueda, filtros por estado y proveedor |
| getPurchaseOrderById | Detalle completo con lineas, proveedor y productos |
| createPurchaseOrder | Crear OC en estado DRAFT |
| updatePurchaseOrder | Editar OC (solo en DRAFT) |
| submitForApproval | DRAFT → PENDING_APPROVAL |
| approvePurchaseOrder | PENDING_APPROVAL → APPROVED (registra approvedById y approvedAt) |
| rejectPurchaseOrder | PENDING_APPROVAL → CANCELLED (registra rejectionReason) |
| cancelPurchaseOrder | Cancela la orden (no permitido en COMPLETED) |
| deletePurchaseOrder | Elimina la orden (solo en DRAFT) |

## Permisos

Modulo: `commercial.purchase-orders`

| Accion | Descripcion |
|--------|-------------|
| read | Ver listado y detalle de ordenes |
| create | Crear nuevas ordenes |
| update | Editar ordenes en borrador |
| delete | Eliminar ordenes en borrador |
| approve | Aprobar o rechazar ordenes pendientes |

## Cuotas / Entregas (Installments)

Las ordenes de compra pueden dividirse en multiples cuotas para servicios recurrentes o pagos parciales.

### Modelo: PurchaseOrderInstallment

| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | String (uuid) | Identificador unico |
| companyId | String | Empresa (tenant) |
| orderId | String | Orden de compra padre |
| number | Int | Secuencial: 1, 2, 3... |
| dueDate | DateTime (Date) | Fecha de vencimiento |
| amount | Decimal(12,2) | Monto de la cuota |
| status | PurchaseOrderInstallmentStatus | Estado actual |
| purchaseInvoiceId | String? | Factura de compra vinculada |
| notes | String? | Observaciones |

### Enum: PurchaseOrderInstallmentStatus

| Estado | Descripcion |
|--------|-------------|
| `PENDING` | Sin facturar |
| `INVOICED` | Factura de compra vinculada |
| `PAID` | Pagada |

### Flujo de Cuotas

1. **Creacion**: Al crear/editar una OC, activar "Dividir en cuotas"
2. **Generacion automatica**: Especificar cantidad, fecha inicio y frecuencia (semanal/quincenal/mensual)
3. **Edicion**: Los montos son editables por cuota, se valida que la suma = total de la OC
4. **Vinculacion**: Desde el detalle de la OC aprobada, vincular una factura de compra a cada cuota
5. **Desvinculacion**: Se puede desvincular una factura para volver al estado PENDING

### Server Actions de Cuotas

| Accion | Descripcion |
|--------|-------------|
| linkInvoiceToInstallment | Vincula factura de compra a una cuota PENDING |
| unlinkInvoiceFromInstallment | Desvincula factura de una cuota INVOICED |
| getUnlinkedPurchaseInvoicesForSupplier | Busca facturas no vinculadas del proveedor |

## Integracion con Cashflow

Las ordenes aprobadas aparecen como **egresos proyectados** en el dashboard de flujo de caja:

### OC sin cuotas (backward compatible)
- Se usa `expectedDeliveryDate` como fecha de proyeccion
- El monto proyectado es el `total` de la orden
- Al completarse (COMPLETED), se excluye del cashflow

### OC con cuotas (distribuido)
- Cada cuota PENDING aparece individualmente en el cashflow usando su `dueDate`
- El monto proyectado es el `amount` de cada cuota
- Las cuotas INVOICED se excluyen del cashflow (la factura ya cuenta como egreso real)

## Generacion de PDF

Ruta API: `/api/purchase-orders/:id/pdf`

Genera un PDF con:
- Datos de la empresa y proveedor
- Numero y fecha de la orden
- Tabla de productos con cantidades y precios
- Totales (subtotal, impuestos, total)
- Seccion de cuotas/entregas (si tiene installments)
- Estado actual de la orden

## Estructura de Archivos

```
src/modules/commercial/features/purchases/features/purchase-orders/
├── index.ts
├── list/
│   ├── index.ts
│   ├── PurchaseOrdersList.tsx         # Server Component principal
│   ├── actions.server.ts              # Server Actions
│   ├── columns.tsx                    # Columnas DataTable
│   └── components/
│       └── _PurchaseOrdersTable.tsx   # Client Component (tabla)
├── detail/
│   ├── index.ts
│   ├── PurchaseOrderDetail.tsx        # Server Component detalle
│   └── components/
│       ├── _PurchaseOrderActions.tsx   # Acciones (aprobar, cancelar, etc.)
│       ├── _InstallmentsTable.tsx     # Tabla de cuotas con acciones
│       └── _LinkInvoiceDialog.tsx     # Dialog para vincular factura a cuota
├── create/
│   ├── index.ts
│   ├── CreatePurchaseOrder.tsx         # Server Component creacion
│   └── components/
│       ├── _PurchaseOrderForm.tsx      # Formulario (React Hook Form + Zod)
│       └── _InstallmentManager.tsx     # Gestor de cuotas en formulario
└── shared/
    ├── validators.ts                  # Schemas Zod de validacion
    └── pdf/                           # Generacion de PDF
        ├── types.ts
        ├── styles.ts
        ├── PurchaseOrderTemplate.tsx
        ├── generator.tsx
        ├── data-mapper.ts
        └── index.ts
```

## Rutas UI

| Ruta | Descripcion |
|------|-------------|
| `/dashboard/commercial/purchases/purchase-orders` | Listado de ordenes de compra |
| `/dashboard/commercial/purchases/purchase-orders/new` | Crear nueva orden |
| `/dashboard/commercial/purchases/purchase-orders/[id]` | Detalle de orden |
