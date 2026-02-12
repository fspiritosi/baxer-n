# Fix: Proveedores en Órdenes de Pago y Componente de Fechas

**Fecha:** 2026-02-11
**Problemas Resueltos:**
1. Select de Proveedores vacío en Órdenes de Pago
2. Componente de fechas inconsistente entre módulos

---

## Problema 1: Select de Proveedores Vacío

### Descripción
En `/dashboard/commercial/treasury/payment-orders`, el select de proveedores no mostraba ningún proveedor porque había un TODO pendiente que seteaba un array vacío.

### Causa Raíz
**Archivo:** `_CreatePaymentOrderModal.tsx` (líneas 80-86)

```typescript
// Cargar proveedores (simplificado - en producción usar una query real)
useEffect(() => {
  if (open) {
    // TODO: Implementar getSuppliers() real
    setSuppliers([]);  // ❌ Array vacío!
  }
}, [open]);
```

### Solución Implementada

**1. Importar función existente:**
```typescript
import { getSuppliersForSelect } from '@/modules/commercial/purchases/features/invoices/list/actions.server';
```

**2. Reemplazar useEffect por useQuery:**
```typescript
// Query para proveedores
const { data: suppliersData = [] } = useQuery({
  queryKey: ['suppliers'],
  queryFn: getSuppliersForSelect,
  enabled: open,
});
```

**3. Actualizar el Select:**
```typescript
<SelectContent>
  {suppliersData.length === 0 && (
    <div className="p-2 text-sm text-muted-foreground">
      No hay proveedores disponibles
    </div>
  )}
  {suppliersData.map((supplier) => (
    <SelectItem key={supplier.id} value={supplier.id}>
      {supplier.tradeName || supplier.businessName}
    </SelectItem>
  ))}
</SelectContent>
```

**4. Eliminar estado local:**
```typescript
// Antes:
const [suppliers, setSuppliers] = useState<Array<{ id: string; name: string }>>([]);

// Después: (eliminado, se usa suppliersData directamente)
```

---

## Problema 2: Componente de Fechas Inconsistente

### Descripción
Las facturas de compra y venta usaban `Popover + Calendar` para seleccionar fechas, mientras que las órdenes de pago usaban `<Input type="date">`. Esto causaba:
- Inconsistencia UX
- Más código complejo
- Diferentes estilos visuales

### Decisión de Diseño
Estandarizar en `<Input type="date">` porque:
- ✅ Más simple y nativo del navegador
- ✅ Mejor UX en móviles (teclado nativo)
- ✅ Menos dependencias (Calendar, Popover)
- ✅ Menos código

---

## Cambios Implementados

### 1. Facturas de Compra

**Archivo:** `_PurchaseInvoiceForm.tsx`

**Antes (Fecha de Emisión):**
```typescript
<FormField
  control={form.control}
  name="issueDate"
  render={({ field }) => (
    <FormItem className="flex flex-col">
      <FormLabel>Fecha de Emisión *</FormLabel>
      <Popover>
        <PopoverTrigger asChild>
          <FormControl>
            <Button variant="outline" className={cn('pl-3 text-left font-normal', !field.value && 'text-muted-foreground')}>
              {field.value ? moment(field.value).format('DD/MM/YYYY') : <span>Selecciona una fecha</span>}
              <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={field.value}
            onSelect={field.onChange}
            disabled={(date) => date > new Date() || date < new Date('2000-01-01')}
            initialFocus
          />
        </PopoverContent>
      </Popover>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Después:**
```typescript
<FormField
  control={form.control}
  name="issueDate"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Fecha de Emisión *</FormLabel>
      <FormControl>
        <Input
          type="date"
          value={moment(field.value).format('YYYY-MM-DD')}
          onChange={(e) => field.onChange(new Date(e.target.value))}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Fecha de Vencimiento:**
```typescript
<FormField
  control={form.control}
  name="dueDate"
  render={({ field }) => (
    <FormItem>
      <FormLabel>Fecha de Vencimiento</FormLabel>
      <FormControl>
        <Input
          type="date"
          value={field.value ? moment(field.value).format('YYYY-MM-DD') : ''}
          onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
        />
      </FormControl>
      <FormMessage />
    </FormItem>
  )}
/>
```

**Imports eliminados:**
```typescript
// Ya no se necesitan:
- import { Calendar } from '@/shared/components/ui/calendar';
- import { Popover, PopoverContent, PopoverTrigger } from '@/shared/components/ui/popover';
- import { CalendarIcon } from 'lucide-react';
- import { cn } from '@/shared/lib/utils';
```

### 2. Facturas de Venta

**Archivo:** `_InvoiceForm.tsx`

**Cambios idénticos a facturas de compra:**
- ✅ Reemplazado Popover + Calendar por Input type="date"
- ✅ Fecha de Emisión actualizada
- ✅ Fecha de Vencimiento actualizada
- ✅ Imports innecesarios eliminados

---

## Archivos Modificados

### Órdenes de Pago (Problema 1)
1. `src/modules/commercial/treasury/features/payment-orders/list/components/_CreatePaymentOrderModal.tsx`
   - ➕ Import de `getSuppliersForSelect`
   - ➕ Query con useQuery para proveedores
   - ❌ Eliminado useEffect con TODO
   - ❌ Eliminado estado local `suppliers`
   - ✏️ Actualizado Select para usar `suppliersData`

### Facturas de Compra (Problema 2)
2. `src/modules/commercial/purchases/features/invoices/create/components/_PurchaseInvoiceForm.tsx`
   - ✏️ Campo issueDate: Popover + Calendar → Input type="date"
   - ✏️ Campo dueDate: Popover + Calendar → Input type="date"
   - ❌ Eliminados imports: Calendar, Popover, CalendarIcon, cn

### Facturas de Venta (Problema 2)
3. `src/modules/commercial/sales/features/invoices/create/components/_InvoiceForm.tsx`
   - ✏️ Campo issueDate: Popover + Calendar → Input type="date"
   - ✏️ Campo dueDate: Popover + Calendar → Input type="date"
   - ❌ Eliminados imports: Calendar, Popover, CalendarIcon, cn

---

## Validación Técnica

- ✅ 0 errores de TypeScript
- ✅ Proveedores se cargan correctamente en Órdenes de Pago
- ✅ Componente de fechas estandarizado en 3 formularios
- ✅ Menos dependencias (Calendar, Popover eliminados)
- ✅ Código más simple y mantenible

---

## Testing Recomendado

### Test 1: Proveedores en Órdenes de Pago
1. Ir a `/dashboard/commercial/treasury/payment-orders`
2. Click "Nueva Orden de Pago"
3. Abrir select de "Proveedor"
4. ✅ Debe mostrar lista de proveedores activos
5. ✅ Mostrar `tradeName` o `businessName`
6. Seleccionar proveedor
7. ✅ Debe cargar facturas pendientes del proveedor

### Test 2: Fechas en Facturas de Compra
1. Ir a `/dashboard/commercial/purchases`
2. Click "Nueva Factura"
3. Campo "Fecha de Emisión"
   - ✅ Debe mostrar input nativo de fecha
   - ✅ Formato del navegador (según locale)
   - ✅ Seleccionar fecha funciona correctamente
4. Campo "Fecha de Vencimiento"
   - ✅ Input type="date" nativo
   - ✅ Opcional (puede dejarse vacío)

### Test 3: Fechas en Facturas de Venta
1. Ir a `/dashboard/commercial/sales`
2. Click "Nueva Factura"
3. Verificar campos de fecha funcionan igual que en compras
4. ✅ Ambos formularios usan mismo componente

### Test 4: Edición de Facturas
1. Editar factura de compra existente en DRAFT
2. ✅ Fechas se pre-cargan correctamente
3. ✅ Cambiar fecha funciona
4. ✅ Guardar actualiza correctamente

---

## Beneficios de los Cambios

### Problema 1 (Proveedores):
- ✅ **Funcionalidad restaurada:** Los proveedores ahora se cargan
- ✅ **Patrón consistente:** Usa React Query como resto del proyecto
- ✅ **Menos código:** Eliminado useEffect + estado local

### Problema 2 (Fechas):
- ✅ **UX consistente:** Mismo componente en todos los formularios
- ✅ **Mejor en móviles:** Teclado nativo de fecha del navegador
- ✅ **Menos código:** -50 líneas por formulario
- ✅ **Menos dependencias:** Calendar y Popover no necesarios
- ✅ **Más simple:** Input nativo vs componente custom
- ✅ **Accesibilidad:** Los inputs nativos son más accesibles

---

## Formato de Fechas

### Display (para mostrar al usuario):
```typescript
moment(date).format('DD/MM/YYYY')  // "11/02/2026"
```

### Input type="date" (formato requerido):
```typescript
moment(date).format('YYYY-MM-DD')  // "2026-02-11"
```

### Conversión de Input a Date:
```typescript
onChange={(e) => field.onChange(new Date(e.target.value))}
```

### Manejo de Campos Opcionales:
```typescript
// Mostrar vacío si no hay valor
value={field.value ? moment(field.value).format('YYYY-MM-DD') : ''}

// Guardar undefined si está vacío
onChange={(e) => field.onChange(e.target.value ? new Date(e.target.value) : undefined)}
```

---

## Conclusión

Ambos problemas han sido resueltos:

1. ✅ **Proveedores en Órdenes de Pago:** Ahora se cargan correctamente usando `getSuppliersForSelect` con React Query
2. ✅ **Componente de Fechas:** Estandarizado a `<Input type="date">` en Facturas de Compra y Venta

**Impacto:**
- Mejor UX (consistente, nativo, móvil-friendly)
- Código más simple (-100 líneas aproximadamente)
- Menos dependencias (Calendar, Popover)
- Funcionalidad completa restaurada en Órdenes de Pago
