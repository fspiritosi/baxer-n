# UI de Configuración de Integración Comercial

**Fecha:** 2026-02-11
**Estado:** ✅ **COMPLETADO**
**Tiempo:** ~1 hora

---

## Objetivo

Crear la interfaz de usuario para que los administradores configuren las cuentas contables por defecto utilizadas en la integración automática entre los módulos comercial y contable.

---

## Archivos Modificados

### 1. Server Actions (`actions.server.ts`)

**Modificaciones:**
- ✅ Extendido `saveAccountingSettings()` para incluir 8 nuevos campos de cuentas
- ✅ Agregada función `getActiveAccounts()` para obtener cuentas para los selectores

```typescript
export async function saveAccountingSettings(
  companyId: string,
  input: {
    fiscalYearStart: Date;
    fiscalYearEnd: Date;
    salesAccountId?: string | null;
    purchasesAccountId?: string | null;
    receivablesAccountId?: string | null;
    payablesAccountId?: string | null;
    vatDebitAccountId?: string | null;
    vatCreditAccountId?: string | null;
    defaultCashAccountId?: string | null;
    defaultBankAccountId?: string | null;
  }
)

export async function getActiveAccounts(companyId: string)
```

### 2. Componente Principal (`AccountingSettings.tsx`)

**Modificaciones:**
- ✅ Agregado segundo Card para "Integración Comercial"
- ✅ Importado `getActiveAccounts` y `_CommercialIntegrationForm`
- ✅ Pasados accounts y defaultValues al nuevo formulario

### 3. Nuevo Componente (`_CommercialIntegrationForm.tsx`)

**Características:**
- ✅ Formulario completo con 8 selectores de cuentas
- ✅ Agrupación lógica en 4 secciones:
  1. **Cuentas de Resultado**: Ventas, Compras
  2. **Cuentas de Crédito y Deuda**: Cuentas por Cobrar, Cuentas por Pagar
  3. **Cuentas de IVA**: IVA Débito Fiscal, IVA Crédito Fiscal
  4. **Cuentas de Tesorería**: Caja por Defecto, Banco por Defecto

- ✅ Filtrado inteligente de cuentas por tipo:
  - Ventas: Solo cuentas de tipo `INCOME`
  - Compras: Solo cuentas de tipo `EXPENSE`
  - Cuentas por Cobrar: Solo cuentas de tipo `ASSET`
  - Cuentas por Pagar: Solo cuentas de tipo `LIABILITY`
  - IVA Débito: Solo cuentas de tipo `LIABILITY`
  - IVA Crédito: Solo cuentas de tipo `ASSET`
  - Caja/Banco: Solo cuentas de tipo `ASSET`

- ✅ Formato de opciones: `código - nombre` (ej: "1.1.2.01 - Caja General")
- ✅ Opción "Sin asignar" en todos los selectores
- ✅ Descripciones explicativas bajo cada selector
- ✅ Validación con Zod schema
- ✅ Loading states y error handling
- ✅ Preservación de fechas del ejercicio fiscal al guardar

---

## Estructura del Formulario

```
┌─────────────────────────────────────────────────────────────┐
│ Configuración Contable                                      │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│ [Card: Ejercicio Fiscal]                                    │
│   - Inicio del Ejercicio                                    │
│   - Fin del Ejercicio                                       │
│   [Guardar Cambios]                                         │
│                                                             │
│ [Card: Integración Comercial]                               │
│                                                             │
│   Cuentas de Resultado                                      │
│   ┌──────────────────┬──────────────────┐                  │
│   │ Ventas (INCOME)  │ Compras (EXPENSE)│                  │
│   └──────────────────┴──────────────────┘                  │
│                                                             │
│   Cuentas de Crédito y Deuda                                │
│   ┌──────────────────────┬────────────────────┐            │
│   │ Cuentas por Cobrar   │ Cuentas por Pagar  │            │
│   │ (ASSET)              │ (LIABILITY)        │            │
│   └──────────────────────┴────────────────────┘            │
│                                                             │
│   Cuentas de IVA                                            │
│   ┌──────────────────────┬────────────────────┐            │
│   │ IVA Débito Fiscal    │ IVA Crédito Fiscal │            │
│   │ (LIABILITY)          │ (ASSET)            │            │
│   └──────────────────────┴────────────────────┘            │
│                                                             │
│   Cuentas de Tesorería (Opcional)                           │
│   ┌──────────────────────┬────────────────────┐            │
│   │ Caja por Defecto     │ Banco por Defecto  │            │
│   │ (ASSET)              │ (ASSET)            │            │
│   └──────────────────────┴────────────────────┘            │
│                                                             │
│   [Guardar Configuración]                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Flujo de Uso

1. **Acceder a Configuración**
   - Usuario navega a `/dashboard/accounting/settings`
   - Se cargan las cuentas activas de la empresa
   - Se cargan los valores actuales de configuración

2. **Seleccionar Cuentas**
   - Para cada tipo de cuenta, el usuario selecciona de una lista filtrada
   - Solo se muestran cuentas del tipo apropiado (INCOME, EXPENSE, etc.)
   - Formato legible: "código - nombre"

3. **Guardar Configuración**
   - Se valida el formulario con Zod
   - Se preservan las fechas del ejercicio fiscal
   - Se actualizan las 8 cuentas en AccountingSettings
   - Toast de confirmación
   - Refresh automático de la página

---

## Validaciones

### Frontend (Zod)
```typescript
const commercialIntegrationSchema = z.object({
  salesAccountId: z.string().nullable(),
  purchasesAccountId: z.string().nullable(),
  receivablesAccountId: z.string().nullable(),
  payablesAccountId: z.string().nullable(),
  vatDebitAccountId: z.string().nullable(),
  vatCreditAccountId: z.string().nullable(),
  defaultCashAccountId: z.string().nullable(),
  defaultBankAccountId: z.string().nullable(),
});
```

### Backend
- ✅ Autenticación requerida
- ✅ Validación de ejercicio fiscal (preservado)
- ✅ Upsert atómico (create o update)
- ✅ Logging de auditoría
- ✅ Revalidación de rutas

---

## Características UX

1. **Agrupación Semántica**
   - Cuentas agrupadas por función contable
   - Headers descriptivos para cada sección

2. **Filtrado Inteligente**
   - Solo muestra cuentas del tipo correcto
   - Evita errores de configuración

3. **Descripciones Inline**
   - Cada selector tiene un hint explicativo
   - Indica dónde se usa la cuenta (Debe/Haber)

4. **Responsive Design**
   - Grid de 2 columnas en desktop
   - Columna única en mobile

5. **Loading States**
   - Deshabilitación de campos durante guardado
   - Spinner en botón de guardar

6. **Feedback Visual**
   - Toast de éxito/error
   - Mensajes claros de error

---

## Próximos Pasos (Opcional)

1. **Validación Avanzada:**
   - Verificar que las cuentas seleccionadas sean de hoja (no tengan hijos)
   - Advertencia si faltan cuentas críticas configuradas

2. **Asistente de Configuración:**
   - Wizard guiado para primera configuración
   - Sugerencias basadas en nombres de cuentas

3. **Vinculación de Cajas/Bancos:**
   - UI para asignar cuenta contable a cada caja
   - UI para asignar cuenta contable a cada banco

4. **Vista de Asientos Generados:**
   - Enlace desde cada documento comercial a su asiento
   - Vista previa de asiento antes de confirmar

---

## Testing

### Compilación
```bash
✓ TypeScript: 0 errores en módulo de settings
✓ ESLint: Sin errores
```

### Funcionalidad
- ✓ Carga de cuentas activas
- ✓ Filtrado por tipo de cuenta
- ✓ Guardado de configuración
- ✓ Preservación de fechas fiscales
- ✓ Validación de formulario
- ✓ Manejo de errores
- ✓ Estados de loading

---

## Conclusión

La UI de configuración de integración comercial ha sido implementada exitosamente. Los administradores ahora pueden configurar fácilmente las cuentas contables por defecto que se usarán en la generación automática de asientos desde el módulo comercial.

**Beneficios:**
- ✅ Interfaz intuitiva y agrupada semánticamente
- ✅ Filtrado automático de cuentas por tipo
- ✅ Validación robusta front y backend
- ✅ Feedback visual claro
- ✅ Diseño responsive
- ✅ Experiencia de usuario optimizada
