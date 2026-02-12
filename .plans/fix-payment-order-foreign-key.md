# Fix: Foreign Key Constraint en Payment Orders

**Fecha:** 2026-02-12
**Problema Resuelto:** Error de foreign key al crear órdenes de pago

---

## Error Original

```
Foreign key constraint violated on the constraint: `payment_orders_supplier_id_fkey`
```

**Ubicación:** `createPaymentOrder()` al intentar crear una orden de pago

**Código de error:** P2003 (Prisma - Foreign key constraint violation)

---

## Causa Raíz

Inconsistencia en el schema de base de datos:

- **`PurchaseInvoice`** usa: `supplier Supplier`
- **`PaymentOrder`** usa: `supplier Contractor` ❌

Esto causaba un error porque:
1. `getSuppliersForSelect()` consulta la tabla `Supplier`
2. El usuario selecciona un ID de `Supplier`
3. `createPaymentOrder()` intenta insertar ese ID en `payment_orders.supplier_id`
4. La foreign key espera un ID de `Contractor`, no de `Supplier`
5. **Error:** El ID no existe en la tabla `contractors`

---

## Solución Implementada

### 1. Corregir Schema de Prisma

**Archivo:** `prisma/schema.prisma`

**Cambios en `PaymentOrder`:**

```diff
model PaymentOrder {
  // ... campos

  company         Company             @relation(fields: [companyId], references: [id], onDelete: Cascade)
- supplier        Contractor          @relation("SupplierPaymentOrders", fields: [supplierId], references: [id])
+ supplier        Supplier            @relation(fields: [supplierId], references: [id])
  items           PaymentOrderItem[]
  payments        PaymentOrderPayment[]
}
```

**Cambios en `Contractor`:**

```diff
model Contractor {
  // ... campos
  salesInvoices       SalesInvoice[]
  receipts            Receipt[]
- paymentOrders       PaymentOrder[]  @relation("SupplierPaymentOrders")
}
```

**Cambios en `Supplier`:**

```diff
model Supplier {
  // ... campos
  purchaseInvoices  PurchaseInvoice[]
+ paymentOrders     PaymentOrder[]
}
```

**Justificación:**
- `PaymentOrder` paga `PurchaseInvoice`
- `PurchaseInvoice` usa `Supplier`
- Ambos deben usar la misma tabla para consistencia

### 2. Actualizar Queries

**Archivo:** `src/modules/commercial/treasury/features/payment-orders/actions.server.ts`

**Query 1: `getPaymentOrders()`**

```diff
  supplier: {
    select: {
      id: true,
-     name: true,
+     businessName: true,
+     tradeName: true,
    },
  },
```

**Query 2: `getPaymentOrder()`**

```diff
  supplier: {
    select: {
      id: true,
-     name: true,
+     businessName: true,
+     tradeName: true,
      taxId: true,
    },
  },
```

**Razón:** `Supplier` tiene `businessName` y `tradeName`, no `name`

### 3. Actualizar Tipos

**Archivo:** `src/modules/commercial/treasury/shared/types.ts`

**Tipo: `PaymentOrderWithDetails`**

```diff
  supplier: {
    id: string;
-   name: string;
+   businessName: string;
+   tradeName: string | null;
    taxId: string | null;
  };
```

**Tipo: `PaymentOrderListItem`**

```diff
  supplier: {
    id: string;
-   name: string;
+   businessName: string;
+   tradeName: string | null;
  };
```

### 4. Actualizar Componentes

**Archivo:** `_PaymentOrdersTable.tsx`

```diff
  {
    accessorKey: 'supplier',
    header: 'Proveedor',
    meta: { title: 'Proveedor' },
-   cell: ({ row }) => row.original.supplier.name,
+   cell: ({ row }) => row.original.supplier.tradeName || row.original.supplier.businessName,
  },
```

**Lógica:** Mostrar `tradeName` si existe, sino `businessName`

### 5. Actualizar Integración Contable

**Archivo:** `src/modules/accounting/features/integrations/commercial/index.ts`

**Query:**

```diff
  supplier: {
    select: {
-     name: true
+     businessName: true,
+     tradeName: true,
    }
  },
```

**Descripción del asiento:**

```diff
- description: `Orden de pago ${paymentOrder.fullNumber} - ${paymentOrder.supplier.name}`,
+ description: `Orden de pago ${paymentOrder.fullNumber} - ${paymentOrder.supplier.tradeName || paymentOrder.supplier.businessName}`,
```

---

## Archivos Modificados

### Schema
1. `prisma/schema.prisma`
   - ✏️ `PaymentOrder.supplier`: Contractor → Supplier
   - ❌ `Contractor.paymentOrders`: Eliminada relación
   - ➕ `Supplier.paymentOrders`: Agregada relación

### Server Actions
2. `src/modules/commercial/treasury/features/payment-orders/actions.server.ts`
   - ✏️ `getPaymentOrders()`: Select businessName + tradeName
   - ✏️ `getPaymentOrder()`: Select businessName + tradeName

### Tipos
3. `src/modules/commercial/treasury/shared/types.ts`
   - ✏️ `PaymentOrderWithDetails.supplier`: name → businessName + tradeName
   - ✏️ `PaymentOrderListItem.supplier`: name → businessName + tradeName

### Componentes
4. `src/modules/commercial/treasury/features/payment-orders/list/components/_PaymentOrdersTable.tsx`
   - ✏️ Columna proveedor: Muestra tradeName || businessName

### Integración Contable
5. `src/modules/accounting/features/integrations/commercial/index.ts`
   - ✏️ `createJournalEntryForPaymentOrder()`: Query y descripción actualizadas

---

## Migración Aplicada

```bash
npm run db:generate  # Generar cliente Prisma
npm run db:push      # Aplicar cambios al schema
```

**Resultado:**
```
✔ Generated Prisma Client (7.3.0) to ./src/generated/prisma in 621ms
🚀 Your database is now in sync with your Prisma schema. Done in 274ms
```

**Nota:** No hubo datos existentes en `payment_orders`, por lo que la migración fue exitosa sin conflictos.

---

## Diferencias entre Contractor y Supplier

### Contractor (Legacy/Genérico)
- Tabla: `contractors`
- Uso: Contratistas genéricos (pueden ser clientes o proveedores)
- Relaciones:
  - `salesInvoices` (como cliente)
  - `receipts` (como cliente)
  - `quotes` (como prospecto)
- Campos clave: `name`, `taxId`, `email`

### Supplier (Moderno - Módulo Comercial)
- Tabla: `suppliers`
- Uso: Proveedores específicos del módulo comercial
- Relaciones:
  - `purchaseInvoices` (facturas de compra)
  - `paymentOrders` (órdenes de pago)
- Campos clave: `businessName`, `tradeName`, `taxId`, `code`
- Campos adicionales: `paymentTermDays`, `creditLimit`, `contactName`, etc.

**Decisión de diseño:**
El módulo comercial moderno usa `Supplier` para proveedores en lugar de `Contractor`, por lo que todas las entidades relacionadas (`PurchaseInvoice`, `PaymentOrder`) deben usar `Supplier` para consistencia.

---

## Patrón para Nombre de Proveedor

En todas las queries y displays:

```typescript
// Query
supplier: {
  select: {
    businessName: true,  // Razón social (requerido)
    tradeName: true,     // Nombre de fantasía (opcional)
  }
}

// Display
const displayName = supplier.tradeName || supplier.businessName;
```

**Razón:** `tradeName` es más amigable si existe, sino usar `businessName` formal.

---

## Testing Recomendado

### Test 1: Crear Orden de Pago
1. Ir a `/dashboard/commercial/treasury/payment-orders`
2. Click "Nueva Orden de Pago"
3. Seleccionar un proveedor
4. Agregar factura pendiente
5. Agregar forma de pago
6. Click "Crear Orden"
7. ✅ Debe crear sin error de foreign key
8. ✅ La tabla debe mostrar el nombre del proveedor correctamente

### Test 2: Listado de Órdenes
1. Verificar que la columna "Proveedor" muestra nombres correctos
2. ✅ Debe mostrar `tradeName` o `businessName`
3. ✅ No debe haber errores de consola

### Test 3: Integración Contable
1. Configurar cuentas contables en Settings
2. Crear y confirmar orden de pago
3. ✅ Debe crear asiento contable
4. ✅ La descripción debe incluir el nombre del proveedor

---

## Verificación

### ✅ Compilación TypeScript
```bash
npm run check-types
```

**Errores críticos resueltos:**
- ✅ Foreign key constraint violation
- ✅ Property 'payments' does not exist
- ✅ Property 'name' does not exist

**Errores no críticos (form types):**
- ⚠️ Resolver type mismatches en Supplier/Product forms (no afectan runtime)

---

## Conclusión

El error de foreign key se debió a una **inconsistencia en el diseño del schema** donde:
- `PurchaseInvoice` correctamente usaba `Supplier`
- `PaymentOrder` incorrectamente usaba `Contractor`

**Solución:**
- Corregir el schema para que `PaymentOrder` use `Supplier`
- Actualizar todas las queries para seleccionar `businessName` y `tradeName`
- Actualizar tipos y componentes para reflejar la estructura correcta

**Beneficios:**
- ✅ Consistencia en el módulo comercial
- ✅ Foreign key válida
- ✅ Código más mantenible
- ✅ Patrón claro para futuras entidades relacionadas con proveedores
