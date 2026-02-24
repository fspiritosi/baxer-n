# Remitos de Recepcion (RR)

## Descripcion
Gestion de remitos de recepcion de materiales/productos. Los remitos documentan la recepcion fisica, actualizan stock del almacen e integran con ordenes de compra y facturas de compra.

## Modelo de Datos

### ReceivingNote
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | String (uuid) | Identificador unico |
| companyId | String (uuid) | Empresa (tenant) |
| supplierId | String (uuid) | Proveedor |
| warehouseId | String (uuid) | Almacen destino |
| number | Int | Secuencial por empresa |
| fullNumber | String | Formato RR-XXXXX |
| purchaseOrderId | String? (uuid) | OC vinculada (opcional) |
| purchaseInvoiceId | String? (uuid) | FC vinculada (opcional) |
| receptionDate | DateTime (Date) | Fecha de recepcion |
| notes | String? | Observaciones |
| status | ReceivingNoteStatus | DRAFT, CONFIRMED, CANCELLED |
| createdBy | String | Usuario que creo |
| createdAt | DateTime | Fecha de creacion |
| updatedAt | DateTime | Fecha de actualizacion |

### ReceivingNoteLine
| Campo | Tipo | Descripcion |
|-------|------|-------------|
| id | String (uuid) | Identificador unico |
| receivingNoteId | String (uuid) | Remito padre |
| productId | String (uuid) | Producto |
| description | String | Descripcion |
| quantity | Decimal(12,3) | Cantidad recibida |
| purchaseOrderLineId | String? (uuid) | Linea de OC vinculada |
| notes | String? | Observaciones de linea |

### Relaciones
- ReceivingNote N→1 Supplier (proveedor)
- ReceivingNote N→1 Warehouse (almacen destino)
- ReceivingNote N→1 Company (empresa/tenant)
- ReceivingNote N→1 PurchaseOrder (OC vinculada, opcional)
- ReceivingNote N→1 PurchaseInvoice (FC vinculada, opcional)
- ReceivingNote 1←N ReceivingNoteLine (lineas de detalle)
- ReceivingNoteLine N→1 Product (producto)
- ReceivingNoteLine N→1 PurchaseOrderLine (linea de OC, opcional)

**Restriccion:** No puede vincularse a OC y FC simultaneamente.

## Enum: ReceivingNoteStatus

```
DRAFT → CONFIRMED → CANCELLED
```

| Estado | Descripcion |
|--------|-------------|
| `DRAFT` | Borrador, editable |
| `CONFIRMED` | Confirmado (stock actualizado) |
| `CANCELLED` | Anulado (stock revertido) |

### Transiciones Validas
| Desde | Hacia | Accion |
|-------|-------|--------|
| DRAFT | CONFIRMED | confirmReceivingNote |
| CONFIRMED | CANCELLED | cancelReceivingNote |

### Flujo de Confirmacion
1. Valida que el remito tenga al menos una linea
2. Crea movimientos de stock (tipo `PURCHASE`, referenceType `receiving_note`)
3. Actualiza/crea `WarehouseStock` para cada producto con trackStock
4. Incrementa `receivedQty` en `PurchaseOrderLine` si aplica
5. Auto-transiciona la OC vinculada: APPROVED → PARTIALLY_RECEIVED → COMPLETED

### Flujo de Cancelacion
1. Verifica stock disponible suficiente para revertir cada linea
2. Crea movimientos de stock reversos (tipo `ADJUSTMENT`, cantidad negativa, referenceType `receiving_note_cancellation`)
3. Decrementa stock del almacen
4. Decrementa `receivedQty` en `PurchaseOrderLine` si aplica
5. Re-evalua estado de la OC vinculada

## Numeracion
Secuencial por empresa con formato `RR-XXXXX` (ej: RR-00001, RR-00002).
Se calcula automaticamente al crear el remito tomando el maximo numero existente + 1.

## Integracion con Stock

- **Confirmar:** `StockMovement` tipo `PURCHASE`, `referenceType: 'receiving_note'`
- **Cancelar:** `StockMovement` tipo `ADJUSTMENT` con cantidad negativa, `referenceType: 'receiving_note_cancellation'`

## Integracion con Facturas de Compra

- Si una FC tiene remitos confirmados, al confirmar la FC NO se mueven stock (backward compatible)
- FCs sin remitos siguen moviendo stock normalmente

## Server Actions

Ubicacion: `src/modules/commercial/features/purchases/features/receiving-notes/list/actions.server.ts`

### Queries

| Accion | Descripcion |
|--------|-------------|
| getReceivingNotesPaginated | Lista paginada con busqueda (fullNumber, notes) |
| getReceivingNoteById | Detalle completo con lineas, proveedor, almacen, OC, FC |
| getWarehousesForSelect | Almacenes activos para select |
| getSuppliersForSelect | Proveedores activos para select |
| getApprovedPurchaseOrdersForSupplier | OCs aprobadas/parcialmente recibidas del proveedor |
| getPurchaseOrderLinesForReceiving | Lineas de OC con cantidad pendiente (solo productos con trackStock) |
| getConfirmedPurchaseInvoicesForSupplier | FCs confirmadas del proveedor con lineas de productos trackStock |
| getProductsForSelect | Productos activos con trackStock para remitos sueltos |

### Mutations

| Accion | Descripcion |
|--------|-------------|
| createReceivingNote | Crear remito en estado DRAFT con lineas |
| updateReceivingNote | Editar remito (solo en DRAFT): elimina y recrea lineas |
| deleteReceivingNote | Eliminar remito (solo en DRAFT) |
| confirmReceivingNote | DRAFT → CONFIRMED: crea stock, actualiza OC |
| cancelReceivingNote | CONFIRMED → CANCELLED: revierte stock, re-evalua OC |

### Tipos Inferidos

| Tipo | Descripcion |
|------|-------------|
| `ReceivingNoteListItem` | Elemento del listado paginado |
| `ReceivingNoteDetail` | Detalle completo del remito |
| `SupplierSelectItem` | Proveedor para select |
| `WarehouseSelectItem` | Almacen para select |

## Permisos

Modulo: `commercial.receiving-notes`

| Accion | Descripcion |
|--------|-------------|
| read | Ver listado y detalle de remitos |
| create | Crear nuevos remitos |
| update | Editar remitos en borrador |
| delete | Eliminar remitos en borrador |

## Generacion de PDF

Ruta API: `/api/receiving-notes/:id/pdf`

Genera un PDF con:
- Datos de la empresa y proveedor
- Numero y fecha de recepcion
- Almacen destino
- Tabla de productos con cantidades
- OC o FC vinculada (si aplica)
- Observaciones
- Estado actual del remito

## Estructura de Archivos

```
src/modules/commercial/features/purchases/features/receiving-notes/
├── index.ts
├── list/
│   ├── ReceivingNotesList.tsx         # Server Component principal
│   ├── actions.server.ts              # Server Actions
│   ├── columns.tsx                    # Columnas DataTable
│   ├── components/
│   │   └── _ReceivingNotesTable.tsx   # Client Component (tabla)
│   └── index.ts
├── create/
│   ├── CreateReceivingNote.tsx         # Server Component creacion
│   ├── components/
│   │   └── _ReceivingNoteForm.tsx      # Formulario (React Hook Form + Zod)
│   └── index.ts
├── detail/
│   ├── ReceivingNoteDetail.tsx         # Server Component detalle
│   ├── components/
│   │   └── _ReceivingNoteActions.tsx   # Acciones (confirmar, cancelar, etc.)
│   └── index.ts
├── edit/
│   ├── EditReceivingNote.tsx           # Server Component edicion
│   └── index.ts
└── shared/
    ├── validators.ts                  # Schemas Zod de validacion
    ├── index.ts
    └── pdf/                           # Generacion de PDF
        ├── types.ts
        ├── styles.ts
        ├── ReceivingNoteTemplate.tsx
        ├── generator.tsx
        ├── data-mapper.ts
        └── index.ts
```

## Rutas UI

| Ruta | Descripcion |
|------|-------------|
| `/dashboard/commercial/receiving-notes` | Listado de remitos |
| `/dashboard/commercial/receiving-notes/new` | Crear nuevo remito |
| `/dashboard/commercial/receiving-notes/[id]` | Detalle de remito |
| `/dashboard/commercial/receiving-notes/[id]/edit` | Editar remito |
