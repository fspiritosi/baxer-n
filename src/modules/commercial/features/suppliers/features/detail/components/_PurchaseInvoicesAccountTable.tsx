'use client';

import moment from 'moment';
import { Badge } from '@/shared/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { SupplierInvoiceWithBalance } from '../actions.server';

interface PurchaseInvoicesAccountTableProps {
  invoices: SupplierInvoiceWithBalance[];
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

export function _PurchaseInvoicesAccountTable({ invoices }: PurchaseInvoicesAccountTableProps) {
  if (invoices.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Facturas de Compra</CardTitle>
          <CardDescription>No hay facturas registradas</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Facturas de Compra</CardTitle>
        <CardDescription>
          Detalle de facturas confirmadas y su estado de pago
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Número</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Fecha Emisión</TableHead>
                <TableHead>Vencimiento</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead className="text-right">Pagado</TableHead>
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
                const isPaid = invoice.balance === 0;

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
                      ${invoice.paid.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={invoice.balance > 0 ? 'text-red-600 font-medium' : 'text-muted-foreground'}>
                        ${invoice.balance.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                    </TableCell>
                    <TableCell className="text-center">
                      {isPaid ? (
                        <Badge variant="default">Pagada</Badge>
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
      </CardContent>
    </Card>
  );
}
