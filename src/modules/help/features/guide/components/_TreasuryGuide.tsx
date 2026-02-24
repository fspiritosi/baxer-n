'use client';

import {
  ArrowDownUp,
  BadgeDollarSign,
  Building2,
  CheckSquare,
  CreditCard,
  Info,
  Landmark,
  Receipt,
} from 'lucide-react';

import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { Badge } from '@/shared/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';

export function _TreasuryGuide() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Tesorería</h2>
        <p className="text-muted-foreground">
          Gestión de cuentas bancarias, cobros, pagos y conciliación
        </p>
      </div>

      {/* Cuentas Bancarias */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Landmark className="h-5 w-5" />
            Cuentas Bancarias
          </CardTitle>
          <CardDescription>
            Registra y gestiona tus cuentas en bancos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            <strong>Crear una cuenta bancaria:</strong>
          </p>
          <ol className="list-decimal pl-6 space-y-1 text-muted-foreground">
            <li>
              Ve a <strong>Tesorería → Cuentas Bancarias</strong>
            </li>
            <li>
              Haz clic en <strong>Nueva Cuenta</strong>
            </li>
            <li>
              Completa:
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Nombre del banco</li>
                <li>Número de cuenta</li>
                <li>Tipo: Cuenta Corriente, Caja de Ahorro o Crédito</li>
                <li>CBU (22 dígitos) y Alias</li>
                <li>Moneda (por defecto ARS)</li>
                <li>Saldo inicial</li>
                <li>Cuenta contable asociada (opcional, para integración)</li>
              </ul>
            </li>
          </ol>

          <p className="mt-3">
            <strong>KPIs de la lista:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Total en bancos (suma de cuentas activas)</li>
            <li>Cantidad de cuentas activas</li>
            <li>Total de movimientos registrados</li>
          </ul>

          <p className="mt-3">
            <strong>Detalle de cuenta:</strong> tiene dos pestañas:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>
              <strong>Movimientos</strong>: historial completo con filtros por
              tipo y fecha
            </li>
            <li>
              <strong>Conciliación</strong>: movimientos pendientes de conciliar
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Movimientos Bancarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ArrowDownUp className="h-5 w-5" />
            Movimientos Bancarios
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            Los movimientos se crean automáticamente al confirmar recibos y
            órdenes de pago, o se pueden registrar manualmente:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>
              <strong>Depósito</strong>: ingreso de dinero
            </li>
            <li>
              <strong>Extracción</strong>: retiro de dinero
            </li>
            <li>
              <strong>Transferencia</strong>: envío o recepción entre cuentas
            </li>
            <li>
              <strong>Cheque</strong>: pago con cheque
            </li>
            <li>
              <strong>Débito Automático</strong>: cargos recurrentes
            </li>
            <li>
              <strong>Comisión / Interés</strong>: cargos o créditos bancarios
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Recibos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Recibos de Cobro
          </CardTitle>
          <CardDescription>
            Registra los cobros de facturas a clientes
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            <strong>Crear un recibo:</strong>
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
            <li>
              Ve a <strong>Tesorería → Recibos</strong> y haz clic en{' '}
              <strong>Nuevo Recibo</strong>
            </li>
            <li>Selecciona el <strong>cliente</strong></li>
            <li>
              Agrega las <strong>facturas a cobrar</strong>: se muestran las
              facturas confirmadas pendientes de cobro con su saldo
            </li>
            <li>Indica el monto a cobrar de cada factura</li>
            <li>
              Agrega las <strong>formas de pago</strong>:
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Efectivo (asociar caja)</li>
                <li>Transferencia (asociar cuenta bancaria)</li>
                <li>Cheque (indicar número)</li>
                <li>Tarjeta de débito/crédito (últimos 4 dígitos)</li>
              </ul>
            </li>
            <li>
              Agrega <strong>retenciones</strong> si corresponde (IVA,
              Ganancias, IIBB, SUSS) con alícuota y monto
            </li>
            <li>
              El total de pagos + retenciones debe igualar el total de facturas
            </li>
          </ol>

          <p className="mt-3">
            <strong>Estados:</strong>
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Borrador</Badge>
            <span>→</span>
            <Badge>Confirmado</Badge>
          </div>
          <p className="text-sm text-muted-foreground mt-1">
            Al confirmar, se actualiza el saldo de las facturas y se genera el
            asiento contable.
          </p>
        </CardContent>
      </Card>

      {/* Órdenes de Pago */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BadgeDollarSign className="h-5 w-5" />
            Órdenes de Pago
          </CardTitle>
          <CardDescription>
            Registra los pagos a proveedores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            Funcionan de manera similar a los recibos pero para pagos a
            proveedores:
          </p>
          <ol className="list-decimal pl-6 space-y-1 text-muted-foreground">
            <li>Selecciona el <strong>proveedor</strong></li>
            <li>
              Agrega las <strong>facturas o gastos a pagar</strong>
            </li>
            <li>
              Indica las <strong>formas de pago</strong> (mismas opciones que
              recibos)
            </li>
            <li>
              Agrega <strong>retenciones</strong> si corresponde
            </li>
            <li>
              Al confirmar, se registra el pago y se genera el asiento
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Conciliación */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5" />
            Conciliación Bancaria
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            La conciliación permite verificar que los movimientos registrados
            coincidan con el extracto bancario:
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
            <li>
              Ve al <strong>detalle de la cuenta bancaria</strong>
            </li>
            <li>
              Selecciona la pestaña <strong>Conciliación</strong>
            </li>
            <li>
              Se muestran los movimientos <strong>no conciliados</strong>
            </li>
            <li>
              Marca como conciliado cada movimiento que coincida con el extracto
            </li>
          </ol>
          <p className="text-sm text-muted-foreground">
            La pestaña muestra un badge con la cantidad de movimientos pendientes
            de conciliar.
          </p>
        </CardContent>
      </Card>

      <Separator />

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Relación con otros módulos:</strong>
          <ul className="list-disc pl-6 mt-1 space-y-1">
            <li>
              <strong>Comercial → Facturas</strong>: los recibos se aplican a
              facturas de venta; las órdenes de pago a facturas de compra
            </li>
            <li>
              <strong>Contabilidad</strong>: al confirmar recibos y órdenes de
              pago se generan asientos contables automáticos
            </li>
            <li>
              <strong>Dashboard</strong>: los saldos bancarios y totales de
              cobros/pagos alimentan los KPIs del dashboard
            </li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
