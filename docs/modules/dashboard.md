# Modulo Dashboard

**Ruta:** `/dashboard`
**Archivos:** `src/modules/dashboard/`

---

## KPIs

El dashboard muestra 6 tarjetas KPI para el mes seleccionado:

| KPI | Descripcion | Color |
|-----|-------------|-------|
| Ventas del Mes | Total facturado + cantidad de facturas (excluye NC) | Verde |
| Compras del Mes | Total comprado + cantidad de facturas (excluye NC) | Azul |
| Pendiente de Cobro | Facturas de venta pendientes de pago | Naranja |
| Pendiente de Pago | Facturas de compra + gastos pendientes | Rojo |
| Stock Critico | Productos debajo del minimo configurado | Amarillo |
| Saldo Bancario | Saldo consolidado de todas las cuentas bancarias | Verde/Rojo |

## Graficos

- **Tendencia de Ventas** - Bar chart de los ultimos 6 meses (Recharts)
- **Tendencia de Compras** - Bar chart de los ultimos 6 meses (Recharts)

Ambos excluyen notas de credito y solo consideran facturas CONFIRMED/PAID/PARTIAL_PAID.

## Secciones Inferiores

- **Stock Critico** - Top 10 productos con stock por debajo del minimo, ordenados por % de stock (peor primero). Siempre muestra datos actuales independientemente del periodo.
- **Alertas** - Hasta 8 alertas: facturas de venta vencidas, facturas de compra vencidas, gastos vencidos.

## Filtro de Periodo

El dashboard acepta un parametro `?month=YYYY-MM` en la URL para ver datos historicos.

- Selector con mes y ano
- Botones de navegacion (mes anterior/siguiente)
- Boton "Hoy" para volver al mes actual
- Componente: `_PeriodSelector.tsx`

Para periodos historicos, el corte es al fin del mes seleccionado. Para el mes actual, el corte es hoy.

## Server Actions

| Funcion | Parametros | Descripcion |
|---------|-----------|-------------|
| `getDashboardKPIs` | `period?: string` | 6 KPIs del mes |
| `getSalesTrend` | `period?: string` | 6 meses de ventas |
| `getPurchasesTrend` | `period?: string` | 6 meses de compras |
| `getCriticalStockProducts` | - | Top 10 stock critico (siempre actual) |
| `getRecentAlerts` | `period?: string` | Hasta 8 alertas de vencimiento |
