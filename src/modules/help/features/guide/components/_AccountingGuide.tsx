'use client';

import {
  BarChart3,
  BookOpen,
  Calculator,
  CalendarCheck,
  Info,
  Link2,
  RefreshCcw,
  Settings,
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

export function _AccountingGuide() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Contabilidad</h2>
        <p className="text-muted-foreground">
          Plan de cuentas, asientos contables, reportes e integración comercial
        </p>
      </div>

      {/* Plan de Cuentas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Plan de Cuentas
          </CardTitle>
          <CardDescription>
            Estructura jerárquica de cuentas contables
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            El plan de cuentas organiza las cuentas contables en un árbol
            jerárquico:
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
            <li>
              Ve a <strong>Contabilidad → Plan de Cuentas</strong>
            </li>
            <li>
              Haz clic en <strong>Nueva Cuenta</strong>
            </li>
            <li>
              Completa:
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>
                  <strong>Código</strong>: formato X.X.X (ej: 1.1.1)
                </li>
                <li>
                  <strong>Nombre</strong> de la cuenta
                </li>
                <li>
                  <strong>Tipo</strong>: Activo (1), Pasivo (2), Patrimonio (3),
                  Ingresos (4), Gastos (5)
                </li>
                <li>
                  <strong>Naturaleza</strong>: se asigna automáticamente según
                  el tipo (deudora o acreedora)
                </li>
                <li>
                  <strong>Cuenta padre</strong>: para crear subcuentas
                </li>
              </ul>
            </li>
          </ol>
          <p className="text-sm text-muted-foreground mt-2">
            Puedes <strong>importar</strong> un plan de cuentas desde Excel o{' '}
            <strong>exportar</strong> el actual.
          </p>
        </CardContent>
      </Card>

      {/* Asientos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calculator className="h-5 w-5" />
            Asientos Contables (Libro Diario)
          </CardTitle>
          <CardDescription>
            Registro de movimientos contables
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            <strong>Crear un asiento manual:</strong>
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
            <li>
              Ve a <strong>Contabilidad → Libro Diario</strong>
            </li>
            <li>
              Haz clic en <strong>Nuevo Asiento</strong>
            </li>
            <li>Indica la <strong>fecha</strong> y <strong>descripción</strong></li>
            <li>
              Agrega <strong>líneas</strong> (mínimo 2):
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Selecciona la cuenta contable</li>
                <li>Indica el monto en Debe o Haber (no ambos)</li>
              </ul>
            </li>
            <li>
              El total del Debe debe ser igual al total del Haber
            </li>
            <li>
              Haz clic en <strong>Guardar</strong> (queda en Borrador)
            </li>
          </ol>

          <p className="mt-3">
            <strong>Estados del asiento:</strong>
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Borrador</Badge>
            <span>→</span>
            <Badge>Registrado</Badge>
            <span>→</span>
            <Badge variant="destructive">Reversado</Badge>
          </div>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground mt-2">
            <li>
              <strong>Registrar</strong>: confirma el asiento (irreversible)
            </li>
            <li>
              <strong>Reversar</strong>: crea un asiento inverso que anula el
              original
            </li>
          </ul>

          <p className="mt-3 text-sm text-muted-foreground">
            Los asientos muestran su <strong>origen</strong>: Manual, Fact.
            Venta, Fact. Compra, Recibo, Orden de Pago o Reversión.
          </p>
        </CardContent>
      </Card>

      {/* Integración Comercial */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Link2 className="h-5 w-5" />
            Integración Comercial
          </CardTitle>
          <CardDescription>
            Generación automática de asientos desde el módulo comercial
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            El sistema puede generar asientos contables automáticamente al
            confirmar documentos comerciales:
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
            <li>
              Ve a <strong>Contabilidad → Configuración</strong>
            </li>
            <li>
              En la sección <strong>Integración Comercial</strong>, mapea las
              cuentas contables:
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Cuenta de Ventas</li>
                <li>Cuenta de Compras</li>
                <li>Deudores por Ventas</li>
                <li>Proveedores</li>
                <li>IVA Débito Fiscal e IVA Crédito Fiscal</li>
                <li>Caja y Banco</li>
                <li>Gastos</li>
                <li>
                  Retenciones (IVA, Ganancias, IIBB, SUSS - emitidas y
                  sufridas)
                </li>
              </ul>
            </li>
            <li>
              Una vez configurado, cada factura, recibo u orden de pago
              confirmado genera su asiento automáticamente
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Asientos Recurrentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <RefreshCcw className="h-5 w-5" />
            Asientos Recurrentes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            Para asientos que se repiten periódicamente (amortizaciones,
            alquileres, etc.):
          </p>
          <ol className="list-decimal pl-6 space-y-1 text-muted-foreground">
            <li>
              Ve a <strong>Contabilidad → Asientos Recurrentes</strong>
            </li>
            <li>Crea una <strong>plantilla</strong> con nombre, descripción y líneas</li>
            <li>
              Selecciona la <strong>frecuencia</strong>: mensual, bimestral,
              trimestral, semestral o anual
            </li>
            <li>Indica fecha de inicio y opcionalmente fecha de fin</li>
            <li>
              El sistema te notifica cuando hay asientos{' '}
              <strong>pendientes de generar</strong>
            </li>
            <li>
              Puedes generar uno a uno o todos los pendientes de una vez
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Reportes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Reportes Contables
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            <strong>Reportes financieros:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>
              <strong>Balance de Sumas y Saldos</strong>: resumen de débitos,
              créditos y saldos por cuenta
            </li>
            <li>
              <strong>Balance General</strong>: Activo, Pasivo y Patrimonio
            </li>
            <li>
              <strong>Estado de Resultados</strong>: Ingresos menos Gastos =
              Resultado neto
            </li>
            <li>
              <strong>Libro Diario</strong>: todos los asientos en orden
              cronológico
            </li>
            <li>
              <strong>Libro Mayor</strong>: movimientos agrupados por cuenta
            </li>
          </ul>

          <p className="mt-3">
            <strong>Reportes de auditoría:</strong>
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>
              <strong>Asientos sin respaldo</strong>: asientos manuales no
              vinculados a documentos
            </li>
            <li>
              <strong>Registro de reversiones</strong>: historial de asientos
              reversados
            </li>
            <li>
              <strong>Trazabilidad</strong>: vínculo entre documentos
              comerciales y asientos
            </li>
          </ul>

          <p className="text-sm text-muted-foreground mt-2">
            Todos los reportes permiten filtrar por rango de fechas y exportar a
            Excel.
          </p>
        </CardContent>
      </Card>

      {/* Cierre de Ejercicio */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CalendarCheck className="h-5 w-5" />
            Cierre de Ejercicio Fiscal
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
            <li>
              Configura las fechas del ejercicio en{' '}
              <strong>Contabilidad → Configuración</strong>
            </li>
            <li>
              Asegúrate de que la <strong>cuenta de resultado</strong> esté
              configurada
            </li>
            <li>
              Ve a <strong>Contabilidad → Cierre de Ejercicio</strong>
            </li>
            <li>
              Revisa la vista previa del asiento de cierre (cancela cuentas de
              resultado)
            </li>
            <li>
              Confirma el cierre: se genera el asiento y el ejercicio queda{' '}
              <strong>cerrado</strong>
            </li>
          </ol>
        </CardContent>
      </Card>

      {/* Configuración */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configuración Contable
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            En <strong>Contabilidad → Configuración</strong> se establecen:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>
              <strong>Ejercicio fiscal</strong>: fecha de inicio y fin
            </li>
            <li>
              <strong>Cuentas de integración</strong>: mapeo de cuentas para
              asientos automáticos desde el módulo comercial
            </li>
          </ul>
        </CardContent>
      </Card>

      <Separator />

      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Relación con otros módulos:</strong>
          <ul className="list-disc pl-6 mt-1 space-y-1">
            <li>
              <strong>Comercial</strong>: las facturas de venta y compra generan
              asientos automáticos al confirmarse
            </li>
            <li>
              <strong>Tesorería</strong>: los recibos y órdenes de pago generan
              asientos automáticos al confirmarse
            </li>
            <li>
              <strong>Dashboard</strong>: los reportes contables alimentan
              indicadores financieros
            </li>
          </ul>
          <p className="mt-2">
            <strong>Requisito previo</strong>: para que la integración funcione,
            debes configurar las cuentas contables de integración en
            Contabilidad → Configuración.
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
