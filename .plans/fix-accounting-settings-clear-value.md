# Fix: Error UUID "__clear__" en Configuración de Cuentas Contables

**Fecha:** 2026-02-11
**Módulo:** `src/modules/accounting/features/settings`
**Archivo afectado:** `components/_CommercialIntegrationForm.tsx`

---

## Problema

Al intentar guardar la configuración de integración comercial con cuentas contables, ocurría el siguiente error cuando se deseleccionaba una cuenta (seleccionando "Sin asignar"):

```
Invalid input value: invalid input syntax for type uuid: "__clear__"
```

### Causa Raíz

El componente `Select` enviaba el valor `"__clear__"` como string cuando el usuario seleccionaba "Sin asignar", pero Prisma esperaba un UUID válido o `null`. El valor `"__clear__"` llegaba sin transformar hasta el `upsert()` de Prisma, causando el error de validación.

---

## Solución Implementada

Se aplicaron **dos niveles de protección** para asegurar que `"__clear__"` siempre se convierta a `null`:

### 1. Helper Function (Línea 97-99)

```typescript
const handleSelectChange = (field: keyof FormValues, value: string) => {
  form.setValue(field, value === '__clear__' ? null : value);
};
```

Este helper intercepta el valor antes de guardarlo en el formulario.

### 2. Transformación en Schema Zod (Líneas 23-33)

```typescript
const commercialIntegrationSchema = z.object({
  salesAccountId: z.string().nullable().transform((val) => val === '__clear__' ? null : val),
  purchasesAccountId: z.string().nullable().transform((val) => val === '__clear__' ? null : val),
  receivablesAccountId: z.string().nullable().transform((val) => val === '__clear__' ? null : val),
  payablesAccountId: z.string().nullable().transform((val) => val === '__clear__' ? null : val),
  vatDebitAccountId: z.string().nullable().transform((val) => val === '__clear__' ? null : val),
  vatCreditAccountId: z.string().nullable().transform((val) => val === '__clear__' ? null : val),
  defaultCashAccountId: z.string().nullable().transform((val) => val === '__clear__' ? null : val),
  defaultBankAccountId: z.string().nullable().transform((val) => val === '__clear__' ? null : val),
});
```

Esta transformación asegura que cualquier `"__clear__"` que llegue a la validación se convierta a `null`.

### 3. Actualización de todos los Select (8 campos)

Todos los `onValueChange` ahora usan el helper:

```typescript
// Antes:
onValueChange={(value) => form.setValue('salesAccountId', value || null)}

// Después:
onValueChange={(value) => handleSelectChange('salesAccountId', value)}
```

---

## Validación

✅ **TypeScript:** 0 errores en `src/modules/accounting/features/settings`
✅ **Doble protección:** Helper + Zod transform
✅ **8 campos actualizados:** Todas las cuentas contables

---

## Campos Afectados

1. `salesAccountId` - Cuenta de Ventas
2. `purchasesAccountId` - Cuenta de Compras
3. `receivablesAccountId` - Cuentas por Cobrar
4. `payablesAccountId` - Cuentas por Pagar
5. `vatDebitAccountId` - IVA Débito Fiscal
6. `vatCreditAccountId` - IVA Crédito Fiscal
7. `defaultCashAccountId` - Caja por Defecto
8. `defaultBankAccountId` - Banco por Defecto

---

## Testing Recomendado

1. **Configurar cuenta:** Seleccionar una cuenta válida → Guardar → ✓ Debe guardar el UUID
2. **Desseleccionar cuenta:** Seleccionar "Sin asignar" → Guardar → ✓ Debe guardar `null`
3. **Cambiar cuenta:** Cambiar de una cuenta a otra → Guardar → ✓ Debe actualizar el UUID
4. **Limpiar cuenta:** Cambiar de cuenta válida a "Sin asignar" → Guardar → ✓ Debe cambiar a `null`

---

## Conclusión

El error ha sido corregido con una solución robusta de doble protección. El valor `"__clear__"` ahora se transforma correctamente a `null` tanto en el formulario como en la validación de Zod, evitando que llegue al server action y cause errores de UUID en Prisma.
