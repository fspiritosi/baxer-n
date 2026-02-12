# Fix: Error Unique Constraint en Barcode de Productos

**Fecha:** 2026-02-11
**Módulo:** `src/modules/commercial/products`
**Archivo afectado:** `shared/validators.ts`

---

## Problema

Al intentar crear un servicio o producto sin barcode, ocurría el siguiente error:

```
Unique constraint failed on the fields: (`barcode`)
```

### Causa Raíz

El campo `barcode` tiene un constraint de unicidad en Prisma. Cuando el usuario dejaba el campo vacío en el formulario, se guardaba como string vacío `""` en lugar de `null` o `undefined`. Como solo puede haber un registro con el mismo valor en un campo único, al intentar crear un segundo producto sin barcode, fallaba el constraint.

**Problema similar aplicaba a otros campos opcionales:**
- `barcode`
- `internalCode`
- `brand`
- `model`
- `description`
- `categoryId`
- `unitOfMeasure`
- `parentId` (en categorías)

---

## Solución Implementada

### 1. Helper Function para Transformación

Creé un helper de Zod que transforma automáticamente strings vacíos a `undefined`:

```typescript
/**
 * Helper para transformar strings vacíos a undefined (para campos opcionales)
 */
const emptyStringToUndefined = z
  .string()
  .optional()
  .transform((val) => (val === '' ? undefined : val));
```

### 2. Actualización del Schema de Producto

Apliqué el helper a todos los campos opcionales que pueden estar vacíos:

```typescript
export const createProductSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(200),
  description: emptyStringToUndefined.pipe(z.string().max(1000).optional()),
  type: z.nativeEnum(ProductType),
  categoryId: emptyStringToUndefined.pipe(z.string().uuid().optional()),
  unitOfMeasure: emptyStringToUndefined.pipe(z.string().max(20).optional()),
  costPrice: z.coerce.number().min(0, 'El precio de costo debe ser mayor o igual a 0'),
  salePrice: z.coerce.number().min(0, 'El precio de venta debe ser mayor o igual a 0'),
  vatRate: z.coerce.number().min(0).max(100).optional(),
  trackStock: z.boolean().optional(),
  minStock: z.coerce.number().min(0).optional().or(z.literal('')),
  maxStock: z.coerce.number().min(0).optional().or(z.literal('')),
  barcode: emptyStringToUndefined.pipe(z.string().max(50).optional()),
  internalCode: emptyStringToUndefined.pipe(z.string().max(50).optional()),
  brand: emptyStringToUndefined.pipe(z.string().max(100).optional()),
  model: emptyStringToUndefined.pipe(z.string().max(100).optional()),
});
```

### 3. Actualización del Schema de Categoría

También apliqué el fix a las categorías:

```typescript
export const createCategorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido').max(100),
  description: emptyStringToUndefined.pipe(z.string().max(500).optional()),
  parentId: emptyStringToUndefined.pipe(z.string().uuid().optional()),
});
```

### 4. Bonus: Fix en Schemas de PriceList

Corregí errores de TypeScript preexistentes en los schemas de PriceList:

```typescript
// Antes (error de sintaxis):
price: z.coerce.number({ invalid_type_error: 'El precio debe ser un número' })

// Después (correcto):
price: z.coerce.number().min(0, 'El precio debe ser mayor o igual a 0')
```

---

## Comportamiento

### Antes del Fix

- Usuario crea Producto A sin barcode → Se guarda `barcode: ""`
- Usuario crea Producto B sin barcode → **ERROR**: Unique constraint failed

### Después del Fix

- Usuario crea Producto A sin barcode → Se guarda `barcode: undefined` (que Prisma convierte a `null`)
- Usuario crea Producto B sin barcode → ✅ Se guarda `barcode: null`
- Usuario crea Producto C sin barcode → ✅ Se guarda `barcode: null`
- Múltiples productos pueden tener `barcode: null` sin violar el constraint de unicidad

---

## Validación

✅ **TypeScript:** 0 errores en `shared/validators.ts`
✅ **Campos protegidos:**
  - `barcode` (crítico)
  - `internalCode`
  - `brand`
  - `model`
  - `description`
  - `categoryId`
  - `unitOfMeasure`
  - `parentId` (categorías)

---

## Testing Recomendado

1. **Crear servicio sin barcode:** Ir a Productos → Crear → Tipo: SERVICE → No llenar barcode → Guardar → ✓ Debe funcionar
2. **Crear múltiples productos sin barcode:** Crear Producto 1, 2, 3 sin barcode → ✓ Todos deben crearse exitosamente
3. **Crear producto con barcode:** Llenar barcode → Guardar → ✓ Debe guardar el valor
4. **Crear producto con barcode duplicado:** Usar mismo barcode de producto existente → ✗ Debe fallar (correcto)
5. **Editar producto:** Cambiar barcode a vacío → ✓ Debe cambiar a `null`

---

## Archivos Modificados

- `src/modules/commercial/products/shared/validators.ts`
  - Agregado helper `emptyStringToUndefined`
  - Actualizado `createProductSchema` (8 campos)
  - Actualizado `createCategorySchema` (2 campos)
  - Corregido `createPriceListItemSchema` (sintaxis)
  - Corregido `updatePriceListItemSchema` (sintaxis)

---

## Notas Técnicas

### ¿Por qué `undefined` y no `null`?

En Zod, `undefined` indica que el campo está ausente, lo cual es más idiomático para campos opcionales. Prisma automáticamente convierte `undefined` a `null` en la base de datos.

### ¿Por qué `.pipe()` en lugar de solo `.transform()`?

El pattern `.pipe()` permite encadenar transformaciones y validaciones de forma más clara:
```typescript
emptyStringToUndefined.pipe(z.string().max(50).optional())
```

Esto primero transforma `"" → undefined`, luego valida que si existe sea un string de máximo 50 caracteres.

---

## Conclusión

El error de unique constraint en `barcode` ha sido solucionado transformando strings vacíos a `undefined` en la validación de Zod. Ahora es posible crear múltiples productos/servicios sin barcode sin violar el constraint de unicidad en la base de datos. 🎉
