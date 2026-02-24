# Plan: Retenciones Impositivas

## Contexto

Se necesita implementar retenciones impositivas en el sistema comercial argentino. Las retenciones son deducciones fiscales que se aplican al momento del pago/cobro:
- **Emisor** (al pagar a proveedores via Orden de Pago): la empresa retiene y deposita a AFIP
- **Receptor** (al cobrar de clientes via Recibo): el cliente retiene y la empresa registra el crédito fiscal

Se implementan ambos roles. Tipos soportados: IVA, Ganancias, IIBB, SUSS. Cálculo manual (usuario ingresa tipo, alícuota y monto). Integradas dentro del flujo existente de Recibos y Órdenes de Pago.

**Ecuación clave:** `totalFacturas = totalPagos + totalRetenciones`

---

## Fase 1: Schema Prisma

**Archivo:** `prisma/schema.prisma`

### 1.1 Nuevo enum `WithholdingTaxType`
```prisma
enum WithholdingTaxType {
  IVA
  GANANCIAS
  IIBB
  SUSS
  @@map("withholding_tax_type")
}
```

### 1.2 Nuevo modelo `ReceiptWithholding`
```prisma
model ReceiptWithholding {
  id                String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  receiptId         String              @map("receipt_id") @db.Uuid
  taxType           WithholdingTaxType  @map("tax_type")
  rate              Decimal             @db.Decimal(5, 2)
  amount            Decimal             @db.Decimal(15, 2)
  certificateNumber String?             @map("certificate_number")
  receipt           Receipt             @relation(fields: [receiptId], references: [id], onDelete: Cascade)
  @@map("receipt_withholdings")
}
```

### 1.3 Nuevo modelo `PaymentOrderWithholding`
```prisma
model PaymentOrderWithholding {
  id                String              @id @default(dbgenerated("gen_random_uuid()")) @db.Uuid
  paymentOrderId    String              @map("payment_order_id") @db.Uuid
  taxType           WithholdingTaxType  @map("tax_type")
  rate              Decimal             @db.Decimal(5, 2)
  amount            Decimal             @db.Decimal(15, 2)
  certificateNumber String?             @map("certificate_number")
  paymentOrder      PaymentOrder        @relation(fields: [paymentOrderId], references: [id], onDelete: Cascade)
  @@map("payment_order_withholdings")
}
```

### 1.4 Agregar relación en `Receipt` (línea 2396)
```prisma
withholdings    ReceiptWithholding[]
```

### 1.5 Agregar relación en `PaymentOrder` (línea 2473)
```prisma
withholdings    PaymentOrderWithholding[]
```

### 1.6 Agregar 8 cuentas contables en `AccountingSettings` (después de línea 310)

Emitidas (pasivo - por pagar a AFIP):
- `withholdingIvaEmittedAccountId`
- `withholdingGananciasEmittedAccountId`
- `withholdingIibbEmittedAccountId`
- `withholdingSussEmittedAccountId`

Sufridas (activo - crédito fiscal):
- `withholdingIvaSufferedAccountId`
- `withholdingGananciasSufferedAccountId`
- `withholdingIibbSufferedAccountId`
- `withholdingSussSufferedAccountId`

Con sus 8 relaciones a `Account` y las 8 relaciones inversas en el modelo `Account`.

### Comandos post-schema
```bash
npm run db:generate
npm run db:migrate -- --name add_withholdings
```

---

## Fase 2: Validators y Types

### 2.1 Validators — `src/modules/commercial/features/treasury/shared/validators.ts`

Agregar schema de retención:
```typescript
export const withholdingSchema = z.object({
  taxType: z.enum(['IVA', 'GANANCIAS', 'IIBB', 'SUSS']),
  rate: z.string().regex(/^\d+(\.\d{1,2})?$/).refine(v => parseFloat(v) >= 0 && parseFloat(v) <= 100),
  amount: z.string().regex(/^\d+(\.\d{1,2})?$/).refine(v => parseFloat(v) > 0),
  certificateNumber: z.string().max(50).optional().nullable(),
});

export const WITHHOLDING_TAX_TYPE_LABELS = {
  IVA: 'Ret. IVA',
  GANANCIAS: 'Ret. Ganancias',
  IIBB: 'Ret. IIBB',
  SUSS: 'Ret. SUSS',
} as const;
```

Actualizar `createReceiptSchema` y `createPaymentOrderSchema`:
- Agregar campo `withholdings: z.array(withholdingSchema).default([])`
- Actualizar `.refine()`: `totalItems = totalPayments + totalWithholdings`
- Sin pagos ni retenciones → válido. Con alguno → deben sumar igual a items.

### 2.2 Types — `src/modules/commercial/features/treasury/shared/types.ts`

- Exportar `WithholdingTaxType` del enum generado
- Agregar `withholdings` array a `ReceiptWithDetails` y `PaymentOrderWithDetails`

---

## Fase 3: Server Actions

### 3.1 Recibos — `src/modules/commercial/features/treasury/features/receipts/actions.server.ts`

**`createReceipt()`:** Después de crear payments, crear withholdings:
```typescript
if (data.withholdings?.length > 0) {
  await tx.receiptWithholding.createMany({
    data: data.withholdings.map(w => ({
      receiptId: newReceipt.id,
      taxType: w.taxType,
      rate: new Prisma.Decimal(w.rate),
      amount: new Prisma.Decimal(w.amount),
      certificateNumber: w.certificateNumber || null,
    })),
  });
}
```

**`confirmReceipt()`:** Agregar `withholdings: true` al include del receipt.

**`getReceipt()`:** Agregar withholdings al select y mapear Decimals a Number.

**`deleteReceipt()`:** No requiere cambios (onDelete: Cascade en el modelo).

### 3.2 Órdenes de Pago — `src/modules/commercial/features/treasury/features/payment-orders/actions.server.ts`

Mismos cambios que 3.1 pero para `PaymentOrderWithholding` y `paymentOrderId`.

---

## Fase 4: Integración Contable

**Archivo:** `src/modules/accounting/features/integrations/commercial/index.ts`

### 4.1 Helper para obtener cuenta de retención
```typescript
function getWithholdingAccountId(settings, taxType: string, role: 'emitted' | 'suffered'): string | null
```
Mapea `taxType` + `role` a la cuenta configurada en AccountingSettings.

### 4.2 `createJournalEntryForReceipt()` — Rol Receptor
Agregar `withholdings` al select del receipt. Después del loop de payments, agregar líneas:
```
Debe: Retención X Sufrida (activo)  →  por cada retención
```
Esto complementa el Haber de Clientes, que ya es por el total de facturas.

### 4.3 `createJournalEntryForPaymentOrder()` — Rol Emisor
Agregar `withholdings` al select. Después del loop de payments, agregar líneas:
```
Haber: Retención X por Pagar (pasivo)  →  por cada retención
```
Esto complementa el Debe de Proveedores.

### 4.4 Configuración contable

**`src/modules/accounting/features/settings/actions.server.ts`:**
- Agregar 8 campos opcionales al input de `saveAccountingSettings()`

**`src/modules/accounting/features/settings/components/_CommercialIntegrationForm.tsx`:**
- Nueva sección "Cuentas de Retenciones" con 2 subsecciones:
  - "Retenciones Emitidas (por Pagar)" — 4 selects (LIABILITY accounts)
  - "Retenciones Sufridas (Crédito Fiscal)" — 4 selects (ASSET accounts)
- Agregar los 8 campos al schema del formulario

---

## Fase 5: UI Formularios de Creación

### 5.1 Recibos — `_CreateReceiptModal.tsx`

- Agregar `useFieldArray` para `withholdings`
- Nueva sección "Retenciones Sufridas" entre pagos y resumen:
  - Botón "Agregar Retención"
  - Por cada retención: Select tipo (IVA/Ganancias/IIBB/SUSS), input alícuota (%), input monto ($), input N° certificado
  - Botón eliminar por fila
- Actualizar cálculo de totales: `diferencia = totalItems - totalPayments - totalWithholdings`
- Mostrar "Total Retenciones" en el resumen

### 5.2 Órdenes de Pago — `_CreatePaymentOrderModal.tsx`

Misma estructura pero título "Retenciones Emitidas".

---

## Fase 6: UI Detalle (Modales)

### 6.1 Recibos — `_ReceiptDetailModal.tsx`

Card "Retenciones Sufridas" (solo si hay retenciones):
- Tabla: Tipo | Alícuota | Monto | N° Certificado
- Fila total al final

### 6.2 Órdenes de Pago — `_PaymentOrderDetailModal.tsx`

Card "Retenciones Emitidas" con misma estructura.

---

## Fase 7: Cuenta Corriente (Opcional/Enhancement)

### 7.1 Cliente — `src/modules/commercial/features/clients/detail/actions.server.ts`
Incluir withholdings en query de receipts, calcular `withholdingsTotal` por recibo.

### 7.2 Proveedor — `src/modules/commercial/features/suppliers/features/detail/actions.server.ts`
Incluir withholdings en query de paymentOrders, calcular `withholdingsTotal`.

### 7.3 UI Account Statement tabs
Mostrar total de retenciones junto a cada recibo/OP en la tabla.

---

## Archivos a modificar

| Fase | Archivo | Cambio |
|------|---------|--------|
| 1 | `prisma/schema.prisma` | Enum + 2 modelos + relaciones en Receipt/PaymentOrder + 8 campos AccountingSettings + relaciones Account |
| 2 | `treasury/shared/validators.ts` | `withholdingSchema` + labels + actualizar refines de receipt/paymentOrder |
| 2 | `treasury/shared/types.ts` | Export `WithholdingTaxType` + withholdings en interfaces |
| 3 | `treasury/receipts/actions.server.ts` | createReceipt, confirmReceipt, getReceipt |
| 3 | `treasury/payment-orders/actions.server.ts` | createPaymentOrder, confirmPaymentOrder, getPaymentOrder |
| 4 | `accounting/integrations/commercial/index.ts` | Helper + líneas de retención en journal entries |
| 4 | `accounting/settings/actions.server.ts` | 8 campos nuevos en input |
| 4 | `accounting/settings/components/_CommercialIntegrationForm.tsx` | Sección de cuentas de retenciones |
| 5 | `treasury/receipts/list/components/_CreateReceiptModal.tsx` | Sección retenciones sufridas |
| 5 | `treasury/payment-orders/list/components/_CreatePaymentOrderModal.tsx` | Sección retenciones emitidas |
| 6 | `treasury/receipts/list/components/_ReceiptDetailModal.tsx` | Card retenciones |
| 6 | `treasury/payment-orders/list/components/_PaymentOrderDetailModal.tsx` | Card retenciones |
| 7 | `clients/detail/actions.server.ts` | Withholdings en cuenta corriente |
| 7 | `suppliers/features/detail/actions.server.ts` | Withholdings en cuenta corriente |

---

## Verificación

1. `npm run db:generate && npm run db:push` sin errores
2. `npm run check-types` sin errores nuevos
3. Crear OP con retenciones → se guarda correctamente → confirmar → asiento contable incluye líneas de retención
4. Crear Recibo con retenciones → misma verificación
5. Crear OP/Recibo sin retenciones → funciona igual que antes (backward compatible)
6. Configurar cuentas de retenciones en Settings → se guardan
7. Detalle de OP/Recibo muestra retenciones correctamente
