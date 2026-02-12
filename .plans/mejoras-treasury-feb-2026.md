# Mejoras en Módulos de Tesorería - Feb 2026

**Fecha:** 2026-02-12
**Módulos afectados:** Órdenes de Pago y Recibos de Cobro

---

## Mejoras Implementadas

### 1. ✅ Clientes en Recibos de Cobro

**Problema:** El select de clientes estaba vacío (TODO con `setCustomers([])`)

**Solución:**
- Importado `getContractorsForSelect()` desde módulo de contractors
- Reemplazado `useEffect + useState` por `useQuery`
- Actualizado el Select para usar `customersData`

**Archivos modificados:**
- `src/modules/commercial/treasury/features/receipts/list/components/_CreateReceiptModal.tsx`

```typescript
// Antes
const [customers, setCustomers] = useState<Array<{ id: string; name: string }>>([]);
useEffect(() => {
  if (open) {
    // TODO: Implementar getCustomers() real
    setCustomers([]);
  }
}, [open]);

// Después
const { data: customersData = [] } = useQuery({
  queryKey: ['contractors'],
  queryFn: getContractorsForSelect,
  enabled: open,
});
```

---

### 2. ✅ Botón "Total" para Tomar Monto Pendiente Completo

**Mejora:** Agregado botón "Total" al lado del input de monto para tomar automáticamente el total pendiente de la factura.

**Ubicaciones:**
- Órdenes de Pago: Al agregar facturas de compra pendientes
- Recibos de Cobro: Al agregar facturas de venta pendientes

**Implementación:**

```typescript
<div className="flex gap-1">
  <FormControl>
    <Input type="number" step="0.01" placeholder="0.00" {...field} />
  </FormControl>
  <Button
    type="button"
    variant="outline"
    size="sm"
    className="px-2 text-xs"
    onClick={() => {
      if (invoice) {
        form.setValue(`items.${index}.amount`, invoice.pendingAmount.toFixed(2));
      }
    }}
    title="Usar monto pendiente completo"
  >
    Total
  </Button>
</div>
```

**Beneficios:**
- UX mejorada: Un click para tomar el total pendiente
- Evita errores de tipeo en montos
- Proceso más rápido

**Archivos modificados:**
- `src/modules/commercial/treasury/features/payment-orders/list/components/_CreatePaymentOrderModal.tsx`
- `src/modules/commercial/treasury/features/receipts/list/components/_CreateReceiptModal.tsx`

---

### 3. ✅ Actualización de Tabla Después de Crear

**Problema:** La tabla no se actualizaba automáticamente después de crear una orden de pago o recibo.

**Causa:** Aunque se llamaba `refetch()`, el cache de React Query no se invalidaba correctamente.

**Solución:** Agregado `queryClient.invalidateQueries()` para forzar la recarga de datos.

**Implementación:**

```typescript
// Importar useQueryClient
import { useQuery, useQueryClient } from '@tanstack/react-query';

// Declarar en el componente
const queryClient = useQueryClient();

// En onSubmit, después de crear
queryClient.invalidateQueries({ queryKey: ['paymentOrders'] });
queryClient.invalidateQueries({ queryKey: ['pendingPurchaseInvoices'] });

// Para recibos
queryClient.invalidateQueries({ queryKey: ['receipts'] });
queryClient.invalidateQueries({ queryKey: ['pendingInvoices'] });
```

**Por qué funciona:**
- `refetch()` solo recarga el query actual
- `invalidateQueries()` marca el cache como stale y fuerza recarga en todos los componentes que usan ese query
- También invalida las facturas pendientes para que se actualicen al agregar más facturas

**Archivos modificados:**
- `src/modules/commercial/treasury/features/payment-orders/list/components/_CreatePaymentOrderModal.tsx`
- `src/modules/commercial/treasury/features/receipts/list/components/_CreateReceiptModal.tsx`

---

## Pendientes

### 📋 1. Selector de Fecha Estandarizado

**Tarea:** Revisar todos los selectores de fecha en módulos comercial, contabilidad y almacenes para usar el selector nativo `<Input type="date">`.

**Referencia:** El formulario de empleados (`/dashboard/employees/new`) usa:
```typescript
<Input
  type="date"
  {...register('birthDate')}
/>
```

**Estado:**
- ✅ Facturas de Compra: Ya usa Input type="date"
- ✅ Facturas de Venta: Ya usa Input type="date"
- ✅ Órdenes de Pago: Ya usa Input type="date"
- ✅ Recibos de Cobro: Ya usa Input type="date"
- ⏳ **Pendiente revisar:**
  - Módulo de Contabilidad: Asientos contables, cierres de período
  - Módulo de Almacenes: Movimientos de stock, ajustes

**Acción recomendada:**
```bash
# Buscar componentes que usen Calendar o Popover para fechas
grep -r "Calendar.*date\|Popover.*date" src/modules/accounting
grep -r "Calendar.*date\|Popover.*date" src/modules/commercial/warehouses
```

---

### 📄 2. Descarga de PDF

**Tarea:** Implementar descarga de PDF para:
- Órdenes de Pago
- Recibos de Cobro

**Referencia:** Ver implementación existente en facturas de venta:
```typescript
// Ejemplo de estructura
export async function generatePaymentOrderPDF(id: string) {
  const paymentOrder = await getPaymentOrder(id);

  // Usar librería existente de PDF (verificar cual usa el proyecto)
  // Generar PDF con:
  // - Encabezado con datos de la empresa
  // - Número de orden
  // - Proveedor/Cliente
  // - Facturas incluidas
  // - Formas de pago
  // - Totales
}
```

**Archivos a crear:**
- `src/modules/commercial/treasury/features/payment-orders/pdf/generatePDF.ts`
- `src/modules/commercial/treasury/features/receipts/pdf/generatePDF.ts`

**Archivos a modificar:**
- Agregar botón "Descargar PDF" en tablas
- Agregar acción en dropdown menu

---

## Archivos Modificados - Resumen

### Recibos de Cobro
1. `src/modules/commercial/treasury/features/receipts/list/components/_CreateReceiptModal.tsx`
   - ➕ Import de `getContractorsForSelect`
   - ➕ Import de `useQueryClient`
   - ➕ Query para cargar clientes
   - ❌ Eliminado useEffect + useState obsoleto
   - ✏️ Select actualizado para usar `customersData`
   - ➕ Botón "Total" para tomar monto completo
   - ✏️ onSubmit con invalidación de queries

### Órdenes de Pago
2. `src/modules/commercial/treasury/features/payment-orders/list/components/_CreatePaymentOrderModal.tsx`
   - ➕ Import de `useQueryClient`
   - ➕ Botón "Total" para tomar monto completo
   - ✏️ onSubmit con invalidación de queries

---

## Testing Recomendado

### Test 1: Clientes en Recibos de Cobro
1. Ir a `/dashboard/commercial/treasury/receipts`
2. Click "Nuevo Recibo"
3. Abrir select de "Cliente"
4. ✅ Debe mostrar lista de clientes (contractors activos)
5. Seleccionar cliente
6. ✅ Debe cargar facturas pendientes del cliente

### Test 2: Botón "Total" en Órdenes de Pago
1. Ir a `/dashboard/commercial/treasury/payment-orders`
2. Click "Nueva Orden de Pago"
3. Seleccionar proveedor
4. Agregar factura pendiente
5. ✅ Debe aparecer botón "Total" al lado del input de monto
6. Click en "Total"
7. ✅ El input debe llenarse con el monto pendiente completo

### Test 3: Botón "Total" en Recibos de Cobro
1. Ir a `/dashboard/commercial/treasury/receipts`
2. Click "Nuevo Recibo"
3. Seleccionar cliente
4. Agregar factura pendiente
5. ✅ Debe aparecer botón "Total" al lado del input de monto
6. Click en "Total"
7. ✅ El input debe llenarse con el monto pendiente completo

### Test 4: Actualización de Tabla - Órdenes de Pago
1. Ir a `/dashboard/commercial/treasury/payment-orders`
2. Contar número de órdenes en la tabla
3. Click "Nueva Orden de Pago"
4. Completar y crear orden
5. ✅ Toast de éxito
6. ✅ La tabla debe actualizarse automáticamente mostrando la nueva orden
7. ✅ El contador de "Borradores" debe incrementarse

### Test 5: Actualización de Tabla - Recibos de Cobro
1. Ir a `/dashboard/commercial/treasury/receipts`
2. Contar número de recibos en la tabla
3. Click "Nuevo Recibo"
4. Completar y crear recibo
5. ✅ Toast de éxito
6. ✅ La tabla debe actualizarse automáticamente mostrando el nuevo recibo
7. ✅ Los KPIs deben actualizarse

---

## Patrón Establecido

### Para Invalidación de Cache de React Query

Siempre que se cree, actualice o elimine un registro desde un modal o formulario:

```typescript
// 1. Importar useQueryClient
import { useQuery, useQueryClient } from '@tanstack/react-query';

// 2. Declarar en el componente
const queryClient = useQueryClient();

// 3. En onSubmit, después de la operación exitosa
await createRecord(data);
toast.success('Registro creado');

// 4. Invalidar queries relacionadas
queryClient.invalidateQueries({ queryKey: ['mainList'] });
queryClient.invalidateQueries({ queryKey: ['relatedData'] });

// 5. Cerrar modal y resetear form
setOpen(false);
form.reset();
onSuccess(); // Llama refetch() pero ya no es estrictamente necesario
```

**Queries a invalidar:**
- Query principal de la lista (ej: `['paymentOrders']`, `['receipts']`)
- Queries relacionadas que puedan cambiar (ej: facturas pendientes)
- Queries de estadísticas/KPIs si existen

---

## Beneficios de las Mejoras

### UX Mejorada
- ✅ Clientes cargan correctamente en recibos
- ✅ Botón "Total" reduce errores y tiempo de carga
- ✅ Tabla se actualiza automáticamente (feedback inmediato)

### Código Más Robusto
- ✅ Patrón consistente de React Query
- ✅ Invalidación explícita del cache
- ✅ Menos bugs por datos desactualizados

### Mantenibilidad
- ✅ Código más predecible
- ✅ Patrón documentado para futuros casos
- ✅ Menos dependencia de `refetch()` manual

---

## Próximos Pasos

1. **Inmediato:** Probar las funcionalidades implementadas
2. **Corto plazo:**
   - Revisar selectores de fecha en contabilidad/almacenes
   - Implementar PDFs para órdenes de pago y recibos
3. **Mediano plazo:**
   - Considerar agregar validaciones adicionales
   - Implementar vistas de detalle para órdenes y recibos

---

## Notas Técnicas

### Librería de PDF

El proyecto probablemente usa una de estas librerías para PDF:
- `jspdf`
- `pdfmake`
- `react-pdf`

**Acción:** Verificar en `package.json` cuál está instalada y seguir ese patrón para nuevos PDFs.

```bash
grep -E "pdf|PDF" package.json
```

### Selectores de Fecha

**Input Type="date" vs Calendar Component:**
- ✅ **Usar:** `<Input type="date">` (nativo del navegador)
  - Más simple
  - Mejor UX en móviles
  - Menos código
  - Menos dependencias

- ❌ **Evitar:** `Popover + Calendar` personalizado
  - Solo usar si se necesita funcionalidad avanzada
  - Requiere más código
  - Más dependencias
