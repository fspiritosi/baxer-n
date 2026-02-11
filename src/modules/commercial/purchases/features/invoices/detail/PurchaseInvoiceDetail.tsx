import { getPurchaseInvoiceById } from '../list/actions.server';
import { Button } from '@/shared/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import moment from 'moment';
import { PURCHASE_INVOICE_STATUS_LABELS, VOUCHER_TYPE_LABELS } from '../shared/validators';
import type { PurchaseInvoiceStatus } from '@/generated/prisma/enums';
import { Separator } from '@/shared/components/ui/separator';
import { cn } from '@/shared/lib/utils';

interface Props {
  invoiceId: string;
}

export async function PurchaseInvoiceDetail({ invoiceId }: Props) {
  const invoice = await getPurchaseInvoiceById(invoiceId);

  const statusVariant:
    | 'default'
    | 'secondary'
    | 'destructive'
    | 'outline' =
    invoice.status === 'CONFIRMED'
      ? 'default'
      : invoice.status === 'PAID'
      ? 'default'
      : invoice.status === 'CANCELLED'
      ? 'destructive'
      : 'secondary';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link href="/dashboard/commercial/purchases">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              Factura {invoice.fullNumber}
            </h1>
            <p className="text-muted-foreground">
              {VOUCHER_TYPE_LABELS[invoice.voucherType] || invoice.voucherType}
            </p>
          </div>
        </div>
        <Badge
          variant={statusVariant}
          className={cn(
            'text-sm px-3 py-1',
            invoice.status === 'CONFIRMED' && 'bg-green-600 hover:bg-green-700'
          )}
        >
          {PURCHASE_INVOICE_STATUS_LABELS[invoice.status as PurchaseInvoiceStatus]}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Columna Principal */}
        <div className="lg:col-span-2 space-y-6">
          {/* Datos del Proveedor */}
          <Card>
            <CardHeader>
              <CardTitle>Proveedor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-muted-foreground">Razón Social</p>
                  <p className="font-medium">{invoice.supplier.businessName}</p>
                </div>
                {invoice.supplier.tradeName && (
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre de Fantasía</p>
                    <p className="font-medium">{invoice.supplier.tradeName}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">CUIT</p>
                  <p className="font-mono">{invoice.supplier.taxId}</p>
                </div>
                {invoice.supplier.email && (
                  <div>
                    <p className="text-sm text-muted-foreground">Email</p>
                    <p>{invoice.supplier.email}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Líneas de la Factura */}
          <Card>
            <CardHeader>
              <CardTitle>Detalle de la Factura</CardTitle>
              <CardDescription>Líneas de productos/servicios</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b">
                    <tr className="text-left">
                      <th className="pb-3">Descripción</th>
                      <th className="pb-3 text-right">Cantidad</th>
                      <th className="pb-3 text-right">Costo Unit.</th>
                      <th className="pb-3 text-right">IVA %</th>
                      <th className="pb-3 text-right">Subtotal</th>
                      <th className="pb-3 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {invoice.lines.map((line) => (
                      <tr key={line.id}>
                        <td className="py-3">
                          <div>
                            <p className="font-medium">{line.description}</p>
                            {line.product && (
                              <p className="text-xs text-muted-foreground">
                                {line.product.code} - {line.product.name}
                              </p>
                            )}
                          </div>
                        </td>
                        <td className="py-3 text-right font-mono">
                          {Number(line.quantity).toFixed(3)}{' '}
                          {line.product?.unitOfMeasure || 'UN'}
                        </td>
                        <td className="py-3 text-right font-mono">
                          ${Number(line.unitCost).toFixed(2)}
                        </td>
                        <td className="py-3 text-right">
                          {Number(line.vatRate).toFixed(2)}%
                        </td>
                        <td className="py-3 text-right font-mono">
                          ${Number(line.subtotal).toFixed(2)}
                        </td>
                        <td className="py-3 text-right font-mono font-semibold">
                          ${Number(line.total).toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="border-t-2">
                    <tr className="font-semibold">
                      <td className="pt-3" colSpan={4}>
                        TOTALES
                      </td>
                      <td className="pt-3 text-right">
                        ${Number(invoice.subtotal).toFixed(2)}
                      </td>
                      <td className="pt-3 text-right">
                        ${Number(invoice.total).toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            </CardContent>
          </Card>

          {/* Observaciones */}
          {invoice.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Observaciones</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Columna Lateral */}
        <div className="space-y-6">
          {/* Información del Comprobante */}
          <Card>
            <CardHeader>
              <CardTitle>Información</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">Tipo</p>
                <p className="font-medium">
                  {VOUCHER_TYPE_LABELS[invoice.voucherType] || invoice.voucherType}
                </p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Número Completo</p>
                <p className="font-mono font-medium">{invoice.fullNumber}</p>
              </div>
              <Separator />
              <div>
                <p className="text-sm text-muted-foreground">Fecha de Emisión</p>
                <p className="font-medium">
                  {moment(invoice.issueDate).format('DD/MM/YYYY')}
                </p>
              </div>
              {invoice.dueDate && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
                    <p className="font-medium">
                      {moment(invoice.dueDate).format('DD/MM/YYYY')}
                    </p>
                  </div>
                </>
              )}
              {invoice.cae && (
                <>
                  <Separator />
                  <div>
                    <p className="text-sm text-muted-foreground">CAE</p>
                    <p className="font-mono text-xs break-all">{invoice.cae}</p>
                    {invoice.validated && (
                      <Badge variant="default" className="mt-1 bg-green-600 hover:bg-green-700">
                        Validado
                      </Badge>
                    )}
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Totales */}
          <Card>
            <CardHeader>
              <CardTitle>Totales</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Subtotal</span>
                <span className="font-mono">${Number(invoice.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">IVA</span>
                <span className="font-mono">${Number(invoice.vatAmount).toFixed(2)}</span>
              </div>
              {Number(invoice.otherTaxes) > 0 && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted-foreground">Otros Impuestos</span>
                  <span className="font-mono">
                    ${Number(invoice.otherTaxes).toFixed(2)}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between text-lg font-semibold">
                <span>Total</span>
                <span className="font-mono">${Number(invoice.total).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Auditoría */}
          <Card>
            <CardHeader>
              <CardTitle>Auditoría</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <p className="text-muted-foreground">Creado por</p>
                <p className="font-medium">{invoice.createdBy}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">Fecha de Creación</p>
                <p>{moment(invoice.createdAt).format('DD/MM/YYYY HH:mm')}</p>
              </div>
              <Separator />
              <div>
                <p className="text-muted-foreground">Última Actualización</p>
                <p>{moment(invoice.updatedAt).format('DD/MM/YYYY HH:mm')}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
