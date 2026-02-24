'use client';

import {
  AlertTriangle,
  BarChart3,
  Calendar,
  DollarSign,
  Info,
  Package,
  TrendingUp,
} from 'lucide-react';

import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';

export function _DashboardGuide() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <p className="text-muted-foreground">
          Panel principal con indicadores clave y alertas de tu negocio
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Indicadores Clave (KPIs)
          </CardTitle>
          <CardDescription>
            Resumen financiero del período seleccionado
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>El dashboard muestra 6 indicadores principales:</p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>
              <strong>Ventas del período</strong>: total facturado a clientes
            </li>
            <li>
              <strong>Compras del período</strong>: total facturado por
              proveedores
            </li>
            <li>
              <strong>Cobros realizados</strong>: total de recibos confirmados
            </li>
            <li>
              <strong>Pagos realizados</strong>: total de órdenes de pago
              confirmadas
            </li>
            <li>
              <strong>Stock crítico</strong>: productos con stock bajo mínimo
            </li>
            <li>
              <strong>Saldo bancario</strong>: suma de todas las cuentas activas
            </li>
          </ul>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Filtro de Período
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>Puedes filtrar los datos del dashboard por mes y año:</p>
          <ol className="list-decimal pl-6 space-y-1 text-muted-foreground">
            <li>Selecciona el <strong>mes</strong> en el selector superior</li>
            <li>Selecciona el <strong>año</strong> junto al mes</li>
            <li>Los KPIs y gráficos se actualizan automáticamente</li>
          </ol>
          <p className="text-sm text-muted-foreground">
            Por defecto muestra el mes y año actual.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Gráficos de Tendencia
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            Debajo de los KPIs se muestran gráficos de barras con la evolución
            de los últimos 6 meses:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>
              <strong>Ventas vs Compras</strong>: comparativa mensual
            </li>
            <li>
              <strong>Cobros vs Pagos</strong>: flujo de caja mensual
            </li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Pasa el cursor sobre las barras para ver el detalle de cada mes.
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            Alertas Automáticas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>El sistema genera alertas cuando detecta situaciones que requieren atención:</p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>
              <strong>Facturas vencidas</strong>: facturas de venta con fecha de
              vencimiento pasada sin cobrar
            </li>
            <li>
              <strong>Stock bajo</strong>: productos cuyo stock está por debajo
              del mínimo configurado
            </li>
          </ul>
        </CardContent>
      </Card>

      <Separator />

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Relación con otros módulos:</strong> Los datos del dashboard se
          alimentan automáticamente de los módulos{' '}
          <strong>Comercial</strong> (ventas/compras),{' '}
          <strong>Tesorería</strong> (cobros/pagos/saldos bancarios) y{' '}
          <strong>Almacenes</strong> (stock). Cuanto más completa sea tu
          información en esos módulos, más útil será el dashboard.
        </AlertDescription>
      </Alert>
    </div>
  );
}
