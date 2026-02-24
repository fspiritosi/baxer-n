# Tesorería - Cheques

## Descripción
Gestión de cartera de cheques propios y de terceros con ciclo de vida completo.

## Modelos de Datos

### Check
- `type`: OWN (propio) | THIRD_PARTY (tercero)
- `status`: PORTFOLIO | DEPOSITED | CLEARED | REJECTED | ENDORSED | DELIVERED | CASHED | VOIDED

### Máquina de Estados
**Cheques de Terceros:**
- PORTFOLIO → DEPOSITED → CLEARED
- PORTFOLIO → ENDORSED
- DEPOSITED → REJECTED
- * → VOIDED (excepto CLEARED, CASHED)

**Cheques Propios:**
- DELIVERED → CASHED
- DELIVERED → VOIDED

## Estructura de Archivos
```
src/modules/commercial/features/treasury/features/checks/
├── index.ts
├── actions.server.ts          # CRUD + ciclo de vida
└── list/
    ├── index.ts
    ├── ChecksList.tsx          # Server Component con KPIs
    ├── columns.tsx             # Columnas DataTable
    └── components/
        ├── _ChecksTable.tsx
        ├── _CreateCheckModal.tsx
        ├── _CheckDetailModal.tsx
        ├── _DepositCheckModal.tsx
        └── _EndorseCheckModal.tsx
```

## Server Actions
| Acción | Descripción |
|--------|-------------|
| getChecksPaginated | Lista paginada con búsqueda |
| getCheckById | Detalle completo |
| createCheck | Crear cheque manual |
| depositCheck | PORTFOLIO → DEPOSITED + crea BankMovement |
| clearCheck | DEPOSITED → CLEARED + actualiza saldo banco |
| rejectCheck | DEPOSITED → REJECTED + elimina BankMovement |
| endorseCheck | PORTFOLIO → ENDORSED |
| voidCheck | → VOIDED (revierte movimientos si aplica) |
| deleteCheck | Solo PORTFOLIO/DELIVERED sin operaciones |
| getActiveBankAccounts | Cuentas activas para deposit modal |
| getChecksForCashflow | Cheques pendientes para dashboard cashflow |

## Integración con Recibos y Órdenes de Pago
- Al confirmar un recibo con pago CHECK → crea Check THIRD_PARTY en PORTFOLIO
- Al confirmar una OP con pago CHECK → crea Check OWN en DELIVERED

## Permisos
- `commercial.treasury.checks` — Ver, Crear, Editar, Eliminar

## Ruta
`/dashboard/commercial/treasury/checks`
