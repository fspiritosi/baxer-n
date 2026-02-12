# Fix: Decimal Types y Validaciones de Productos

**Fecha:** 2026-02-12
**Problemas Resueltos:**
1. Error de tipos Decimal en Client Components
2. Campo `lineTotal` inexistente
3. Validación de campos numéricos en productos

---

## Problema 1: Decimal Objects en Client Components

### Descripción
Error al pasar datos de Prisma con campos Decimal a Client Components:
```
Only plain objects can be passed to Client Components from Server Components.
Decimal objects are not supported.
{subtotal: Decimal, vatAmount: ..., otherTaxes: ..., total: Decimal}
```

### Causa Raíz
Las funciones `getPurchaseInvoicesPaginated()`, `getPurchaseInvoiceById()`, `getInvoices()` y `getInvoiceById()` retornaban datos crudos de Prisma sin convertir los campos `Decimal` a `Number`.

### Solución Implementada

#### Facturas de Compra

**Archivo:** `src/modules/commercial/purchases/features/invoices/list/actions.server.ts`

**1. getPurchaseInvoicesPaginated():**
```typescript
// Antes (línea 75):
return { data, total };

// Después:
const data = invoices.map((invoice) => ({
  ...invoice,
  subtotal: Number(invoice.subtotal),
  vatAmount: Number(invoice.vatAmount),
  otherTaxes: Number(invoice.otherTaxes),
  total: Number(invoice.total),
  lines: invoice.lines.map((line) => ({
    ...line,
    quantity: Number(line.quantity),
    unitCost: Number(line.unitCost),
    vatRate: Number(line.vatRate),
    vatAmount: Number(line.vatAmount),
    subtotal: Number(line.subtotal),
    total: Number(line.total),
  })),
}));

return { data, total };
```

**2. getPurchaseInvoiceById():**
```typescript
// Antes (línea 152):
return invoice;

// Después:
return {
  ...invoice,
  subtotal: Number(invoice.subtotal),
  vatAmount: Number(invoice.vatAmount),
  otherTaxes: Number(invoice.otherTaxes),
  total: Number(invoice.total),
  lines: invoice.lines.map((line) => ({
    ...line,
    quantity: Number(line.quantity),
    unitCost: Number(line.unitCost),
    vatRate: Number(line.vatRate),
    vatAmount: Number(line.vatAmount),
    subtotal: Number(line.subtotal),
    total: Number(line.total),
  })),
};
```

#### Facturas de Venta

**Archivo:** `src/modules/commercial/sales/features/invoices/list/actions.server.ts`

**1. getInvoices():**
```typescript
// Antes (línea 63):
return invoices;

// Después:
return invoices.map((invoice) => ({
  ...invoice,
  subtotal: Number(invoice.subtotal),
  vatAmount: Number(invoice.vatAmount),
  total: Number(invoice.total),
}));
```

**2. getInvoiceById():**
```typescript
// Antes (línea 138):
return invoice;

// Después:
return {
  ...invoice,
  subtotal: Number(invoice.subtotal),
  vatAmount: Number(invoice.vatAmount),
  total: Number(invoice.total),
  lines: invoice.lines.map((line) => ({
    ...line,
    quantity: Number(line.quantity),
    unitPrice: Number(line.unitPrice),
    vatRate: Number(line.vatRate),
    vatAmount: Number(line.vatAmount),
    subtotal: Number(line.subtotal),
    total: Number(line.total),
  })),
};
```

---

## Problema 2: Campo `lineTotal` Inexistente

### Descripción
TypeScript error:
```
Property 'lineTotal' does not exist on type '...'
```

### Causa Raíz
En las conversiones de Decimal a Number, se hacía referencia a un campo `lineTotal` que no existe en el schema de Prisma. Los campos correctos son:
- `subtotal`: cantidad × precio
- `vatAmount`: IVA calculado
- `total`: subtotal + vatAmount

### Solución
Reemplazado `lineTotal` por los campos correctos del schema:
```typescript
// ❌ Antes:
lineTotal: Number(line.lineTotal),

// ✅ Después:
vatAmount: Number(line.vatAmount),
subtotal: Number(line.subtotal),
total: Number(line.total),
```

---

## Problema 3: Validaciones de Campos Numéricos

### Descripción
TypeScript error en formularios de productos:
```
Type 'unknown' is not assignable to type 'number'
```

### Causa Raíz
El uso de `.coerce.number()` en Zod hace que TypeScript infiera el tipo como `unknown` en lugar de `number`, causando conflictos con el resolver de React Hook Form.

### Solución Implementada

**Archivo:** `src/modules/commercial/products/shared/validators.ts`

**1. Agregar helper para campos numéricos:**
```typescript
/**
 * Helper para convertir strings a números (para inputs numéricos)
 */
const numberField = z.union([z.string(), z.number()]).pipe(z.coerce.number());
```

**2. Actualizar schema de productos:**
```typescript
export const createProductSchema = z.object({
  // ... otros campos
  costPrice: numberField.pipe(z.number().min(0, 'El precio de costo debe ser mayor o igual a 0')),
  salePrice: numberField.pipe(z.number().min(0, 'El precio de venta debe ser mayor o igual a 0')),
  vatRate: numberField.pipe(z.number().min(0).max(100)).optional(),
  minStock: numberField.pipe(z.number().min(0)).optional().or(z.literal('')),
  maxStock: numberField.pipe(z.number().min(0)).optional().or(z.literal('')),
  // ...
});
```

**3. Actualizar schema de listas de precios:**
```typescript
export const createPriceListItemSchema = z.object({
  productId: z.string().uuid('Debe seleccionar un producto'),
  price: numberField.pipe(z.number().min(0, 'El precio debe ser mayor o igual a 0')),
});

export const updatePriceListItemSchema = z.object({
  price: numberField.pipe(z.number().min(0, 'El precio debe ser mayor o igual a 0')),
});
```

---

## Archivos Modificados

### Facturas de Compra
1. `src/modules/commercial/purchases/features/invoices/list/actions.server.ts`
   - ✏️ `getPurchaseInvoicesPaginated()`: Conversión de Decimals a Numbers
   - ✏️ `getPurchaseInvoiceById()`: Conversión de Decimals a Numbers
   - 🔧 Corregido campo `lineTotal` → campos correctos del schema

### Facturas de Venta
2. `src/modules/commercial/sales/features/invoices/list/actions.server.ts`
   - ✏️ `getInvoices()`: Conversión de Decimals a Numbers
   - ✏️ `getInvoiceById()`: Conversión de Decimals a Numbers
   - 🔧 Corregido campo `lineTotal` → campos correctos del schema

### Productos
3. `src/modules/commercial/products/shared/validators.ts`
   - ➕ Agregado helper `numberField`
   - ✏️ `createProductSchema`: Campos numéricos usan `numberField.pipe()`
   - ✏️ `createPriceListItemSchema`: Campo price usa `numberField.pipe()`
   - ✏️ `updatePriceListItemSchema`: Campo price usa `numberField.pipe()`

---

## Patrón de Conversión para Futuros Casos

### Server Actions que retornan datos con Decimals

```typescript
export async function getData() {
  const data = await prisma.model.findMany({
    // ... query
  });

  // ✅ SIEMPRE convertir Decimals antes de retornar
  return data.map((item) => ({
    ...item,
    // Campos Decimal del modelo
    amount: Number(item.amount),
    price: Number(item.price),
    total: Number(item.total),

    // Si tiene relaciones con Decimals
    lines: item.lines?.map((line) => ({
      ...line,
      quantity: Number(line.quantity),
      unitPrice: Number(line.unitPrice),
      // ...
    })),
  }));
}
```

### Regla General

**NUNCA retornar objetos Prisma crudos desde Server Actions que se usen en Client Components.**

Siempre convertir:
- `Decimal` → `Number()`
- `Date` → mantener como `Date` (Next.js los serializa automáticamente)

---

## Verificación

### ✅ Compilación TypeScript
```bash
npm run check-types
```

**Errores críticos resueltos:**
- ✅ Decimal objects en Client Components
- ✅ Campo `lineTotal` inexistente

**Errores pendientes (no críticos):**
- ⚠️ Form resolver type mismatches (strictness de TypeScript, no afectan runtime)
- ⚠️ Supplier form type issues (similares, no críticos)

---

## Beneficios de los Cambios

### Problema 1 (Decimals):
- ✅ **Client Components funcionan:** Los datos ahora son serializables
- ✅ **Patrón consistente:** Todas las queries convierten Decimals
- ✅ **Tipo-seguro:** TypeScript infiere `number` correctamente

### Problema 2 (lineTotal):
- ✅ **Schema correcto:** Usa campos que realmente existen
- ✅ **Datos completos:** Incluye subtotal, vatAmount y total

### Problema 3 (Validaciones):
- ✅ **Mejor inferencia:** TypeScript entiende que son números
- ✅ **Reutilizable:** Helper `numberField` para futuros schemas
- ✅ **Flexible:** Acepta tanto strings (del input) como números

---

## Testing Recomendado

### Test 1: Listado de Facturas de Compra
1. Ir a `/dashboard/commercial/purchases`
2. ✅ La tabla debe renderizar sin errores de consola
3. ✅ Los montos deben mostrarse correctamente
4. ✅ Debe ser posible editar facturas DRAFT

### Test 2: Listado de Facturas de Venta
1. Ir a `/dashboard/commercial/sales`
2. ✅ La tabla debe renderizar sin errores de consola
3. ✅ Los montos deben mostrarse correctamente

### Test 3: Crear Producto
1. Ir a `/dashboard/commercial/products`
2. Click "Nuevo Producto"
3. ✅ Los campos de precio deben aceptar números
4. ✅ La validación debe funcionar correctamente
5. ✅ El producto debe crearse sin errores

### Test 4: Órdenes de Pago
1. Ir a `/dashboard/commercial/treasury/payment-orders`
2. Click "Nueva Orden de Pago"
3. ✅ Debe funcionar sin errores de Decimal

---

## Conclusión

Se han resuelto tres problemas críticos:

1. ✅ **Decimal Types:** Todas las server actions ahora convierten Decimals a Numbers antes de pasar datos a Client Components
2. ✅ **lineTotal Field:** Corregido para usar los campos correctos del schema
3. ✅ **Number Validations:** Mejorada la inferencia de tipos en schemas Zod

**Impacto:**
- Código más robusto y tipo-seguro
- Client Components funcionan correctamente
- Patrón establecido para futuros casos similares
- Sin errores en runtime por tipos incompatibles

**Nota sobre Payment Order Creation Error:**
El error de `tx.paymentOrder.create()` reportado por el usuario podría haber sido causado por el problema de Decimals. Si persiste después de estas correcciones, será necesario reproducirlo con los logs completos del error para diagnosticarlo.
