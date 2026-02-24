'use client';

import {
  FileText,
  Info,
  Package,
  Receipt,
  ShoppingBag,
  ShoppingCart,
  Users,
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

export function _CommercialGuide() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold">Comercial</h2>
        <p className="text-muted-foreground">
          CRM, productos, facturación de ventas y compras
        </p>
      </div>

      {/* Clientes y Proveedores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Clientes y Proveedores
          </CardTitle>
          <CardDescription>Gestión de tu cartera comercial</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            <strong>Clientes</strong> y <strong>Proveedores</strong> comparten
            una estructura similar:
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
            <li>
              Ve a <strong>Comercial → Clientes</strong> o{' '}
              <strong>Proveedores</strong>
            </li>
            <li>
              Haz clic en <strong>Nuevo</strong>
            </li>
            <li>
              Completa los datos:
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Razón social / nombre (obligatorio)</li>
                <li>CUIT</li>
                <li>Condición ante IVA</li>
                <li>Email, teléfono, dirección</li>
                <li>Plazo de pago (días)</li>
                <li>Límite de crédito</li>
                <li>Lista de precios (clientes)</li>
              </ul>
            </li>
          </ol>
          <p className="mt-2">
            El <strong>detalle</strong> del cliente incluye pestañas:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>
              <strong>General</strong>: datos de contacto y persona de contacto
            </li>
            <li>
              <strong>Vehículos</strong>: equipos asignados al cliente
            </li>
            <li>
              <strong>Empleados</strong>: personal asignado al cliente
            </li>
            <li>
              <strong>Cuenta Corriente</strong>: facturas, cobros/pagos, saldo
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Productos */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Productos
          </CardTitle>
          <CardDescription>
            Catálogo de productos y servicios
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
            <li>
              Ve a <strong>Comercial → Productos</strong>
            </li>
            <li>
              Haz clic en <strong>Nuevo Producto</strong>
            </li>
            <li>
              Completa:
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Código (único)</li>
                <li>Nombre y descripción</li>
                <li>Categoría (estructura de árbol)</li>
                <li>Unidad de medida</li>
                <li>Precio de venta (sin IVA y con IVA)</li>
                <li>Alícuota de IVA</li>
                <li>Código de barras (opcional)</li>
                <li>¿Controla stock?: activa seguimiento en almacenes</li>
              </ul>
            </li>
          </ol>
          <p className="text-sm text-muted-foreground">
            Si activas el control de stock, el producto se gestiona desde{' '}
            <strong>Almacenes</strong>.
          </p>
        </CardContent>
      </Card>

      {/* Facturas de Venta */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingBag className="h-5 w-5" />
            Facturas de Venta
          </CardTitle>
          <CardDescription>
            Emisión y gestión de comprobantes de venta
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            <strong>Crear una factura:</strong>
          </p>
          <ol className="list-decimal pl-6 space-y-2 text-muted-foreground">
            <li>
              Ve a <strong>Comercial → Facturas</strong> y haz clic en{' '}
              <strong>Nueva Factura</strong>
            </li>
            <li>Selecciona el <strong>cliente</strong></li>
            <li>
              Selecciona el <strong>punto de venta</strong> y{' '}
              <strong>tipo de comprobante</strong>:
              <ul className="list-disc pl-6 mt-1 space-y-1">
                <li>Factura A, B o C</li>
                <li>Nota de Crédito A, B o C</li>
                <li>Nota de Débito A, B o C</li>
              </ul>
            </li>
            <li>Indica la <strong>fecha de emisión</strong> y opcionalmente el <strong>vencimiento</strong></li>
            <li>
              Agrega <strong>líneas de productos</strong>: producto, cantidad,
              precio unitario, alícuota IVA
            </li>
            <li>
              El sistema calcula automáticamente subtotal, IVA y total
            </li>
            <li>
              Haz clic en <strong>Guardar</strong> (queda en Borrador)
            </li>
          </ol>

          <p className="mt-3">
            <strong>Estados de la factura:</strong>
          </p>
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">Borrador</Badge>
            <span>→</span>
            <Badge>Confirmada</Badge>
            <span>→</span>
            <Badge variant="outline">Cobrada / Parcial</Badge>
          </div>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground mt-2">
            <li>
              <strong>Borrador</strong>: se puede editar y modificar
            </li>
            <li>
              <strong>Confirmada</strong>: ya no se puede editar, genera asiento
              contable automático
            </li>
            <li>
              <strong>Cobrada / Parcialmente cobrada</strong>: según los recibos
              aplicados
            </li>
            <li>
              Se puede <strong>cancelar</strong> una factura confirmada
            </li>
          </ul>

          <p className="mt-3 text-sm text-muted-foreground">
            Para notas de crédito/débito, al seleccionar el tipo se habilita el
            campo <strong>Factura original</strong> que vincula ambos
            comprobantes.
          </p>
        </CardContent>
      </Card>

      {/* Facturas de Compra */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShoppingCart className="h-5 w-5" />
            Facturas de Compra
          </CardTitle>
          <CardDescription>
            Registro de comprobantes de proveedores
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            Las facturas de compra funcionan de manera similar a las de venta:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>Se vinculan a un <strong>proveedor</strong></li>
            <li>Mismos tipos de comprobante (A, B, C, NC, ND)</li>
            <li>Mismo flujo: Borrador → Confirmada → Pagada</li>
            <li>Se puede indicar el <strong>número de comprobante</strong> del proveedor</li>
            <li>Al confirmar, genera asiento contable automático</li>
          </ul>
          <p className="text-sm text-muted-foreground mt-2">
            Los pagos se registran desde <strong>Tesorería → Órdenes de
            Pago</strong>.
          </p>
        </CardContent>
      </Card>

      {/* Cuenta Corriente */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Receipt className="h-5 w-5" />
            Cuenta Corriente
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>
            La cuenta corriente muestra el resumen financiero de un cliente o
            proveedor:
          </p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>
              <strong>Total facturado</strong>: suma de todas las facturas
              confirmadas
            </li>
            <li>
              <strong>Total cobrado/pagado</strong>: suma de recibos/órdenes de
              pago
            </li>
            <li>
              <strong>Saldo</strong>: diferencia (lo que se debe o nos deben)
            </li>
            <li>Detalle de cada factura con su estado de cobro/pago</li>
            <li>
              Links directos a recibos y notas de crédito aplicadas
            </li>
          </ul>
        </CardContent>
      </Card>

      {/* Reportes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Reportes de Ventas y Compras
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p>Desde la sección de reportes puedes:</p>
          <ul className="list-disc pl-6 space-y-1 text-muted-foreground">
            <li>
              <strong>Reporte de Ventas</strong>: facturas emitidas por período,
              con totales y filtros
            </li>
            <li>
              <strong>Reporte de Compras</strong>: facturas de compra por
              período
            </li>
            <li>Exportar ambos reportes a Excel</li>
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
              <strong>Tesorería</strong>: los cobros (recibos) y pagos (órdenes
              de pago) se gestionan desde Tesorería
            </li>
            <li>
              <strong>Contabilidad</strong>: al confirmar facturas, recibos y
              órdenes de pago se generan asientos contables automáticamente
              (requiere configurar la integración en Contabilidad → Configuración)
            </li>
            <li>
              <strong>Almacenes</strong>: al confirmar una factura de compra de
              productos con control de stock, se actualiza el inventario
            </li>
            <li>
              <strong>Empleados / Equipamiento</strong>: se pueden asignar a
              clientes
            </li>
          </ul>
        </AlertDescription>
      </Alert>
    </div>
  );
}
