'use client';

import moment from 'moment';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import type { ClientAccountStatement, ClientInvoiceWithBalance, ClientReceipt } from '../actions.server';

interface AccountStatementTabProps {
  accountStatement: ClientAccountStatement;
}

const VOUCHER_TYPE_LABELS: Record<string, string> = {
  FACTURA_A: 'Factura A',
  FACTURA_B: 'Factura B',
  FACTURA_C: 'Factura C',
  FACTURA_X: 'Factura X',
  NOTA_DEBITO_A: 'ND A',
  NOTA_DEBITO_B: 'ND B',
  NOTA_DEBITO_C: 'ND C',
  NOTA_CREDITO_A: 'NC A',
  NOTA_CREDITO_B: 'NC B',
  NOTA_CREDITO_C: 'NC C',
};

export function _AccountStatementTab({ accountStatement }: AccountStatementTabProps) {
  const { invoices, receipts, summary } = accountStatement;

  return (
    <div className="space-y-6">
      {/* Resumen de Saldos */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Facturado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${summary.totalInvoiced.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Facturas confirmadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Cobrado</CardTitle>
            <TrendingDown className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${summary.totalCollected.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">Cobros confirmados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Saldo Pendiente</CardTitle>
            <TrendingUp className={`h-4 w-4 ${summary.totalBalance > 0 ? 'text-red-600' : 'text-muted-foreground'}`} />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${summary.totalBalance > 0 ? 'text-red-600' : 'text-muted-foreground'}`}>
              ${summary.totalBalance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </div>
            <p className="text-xs text-muted-foreground">
              {summary.totalBalance > 0 ? 'A cobrar del cliente' : 'Sin saldo pendiente'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Facturas de Venta */}
      <Card>
        <CardHeader>
          <CardTitle>Facturas de Venta</CardTitle>
          <CardDescription>Detalle de facturas confirmadas y su estado de cobro</CardDescription>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay facturas registradas</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Fecha Emisión</TableHead>
                    <TableHead>Vencimiento</TableHead>
                    <TableHead className="text-right">Total</TableHead>
                    <TableHead className="text-right">Cobrado</TableHead>
                    <TableHead className="text-right">Saldo</TableHead>
                    <TableHead className="text-center">Estado</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => {
                    const isOverdue =
                      invoice.balance > 0 &&
                      invoice.dueDate &&
                      moment(invoice.dueDate).isBefore(moment(), 'day');
                    const isCollected = invoice.balance === 0;

                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="font-medium">{invoice.fullNumber}</TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground">
                            {VOUCHER_TYPE_LABELS[invoice.voucherType] || invoice.voucherType}
                          </span>
                        </TableCell>
                        <TableCell>{moment(invoice.issueDate).format('DD/MM/YYYY')}</TableCell>
                        <TableCell>
                          {invoice.dueDate ? (
                            <span className={isOverdue ? 'text-red-600 font-medium' : ''}>
                              {moment(invoice.dueDate).format('DD/MM/YYYY')}
                            </span>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell className="text-right font-medium">
                          ${invoice.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right text-green-600">
                          ${invoice.collected.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell className="text-right">
                          <span className={invoice.balance > 0 ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                            ${invoice.balance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </span>
                        </TableCell>
                        <TableCell className="text-center">
                          {isCollected ? (
                            <Badge variant="default">Cobrada</Badge>
                          ) : isOverdue ? (
                            <Badge variant="destructive">Vencida</Badge>
                          ) : (
                            <Badge variant="secondary">Pendiente</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recibos de Cobro */}
      <Card>
        <CardHeader>
          <CardTitle>Recibos de Cobro</CardTitle>
          <CardDescription>Detalle de cobros confirmados realizados del cliente</CardDescription>
        </CardHeader>
        <CardContent>
          {receipts.length === 0 ? (
            <p className="text-sm text-muted-foreground">No hay recibos registrados</p>
          ) : (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Número</TableHead>
                    <TableHead>Fecha</TableHead>
                    <TableHead>Facturas Aplicadas</TableHead>
                    <TableHead className="text-right">Monto Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {receipts.map((receipt) => (
                    <TableRow key={receipt.id}>
                      <TableCell className="font-medium">{receipt.fullNumber}</TableCell>
                      <TableCell>{moment(receipt.date).format('DD/MM/YYYY')}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {receipt.invoices.map((invoice, index) => (
                            <div key={index} className="text-sm">
                              <span className="text-muted-foreground">{invoice.invoiceNumber}</span>
                              <span className="ml-2 text-green-600 font-medium">
                                ${invoice.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                              </span>
                            </div>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell className="text-right font-bold text-green-600">
                        ${receipt.totalAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
