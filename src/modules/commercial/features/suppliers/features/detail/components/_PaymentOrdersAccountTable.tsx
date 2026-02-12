'use client';

import moment from 'moment';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/shared/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/components/ui/card';
import type { SupplierPayment } from '../actions.server';

interface PaymentOrdersAccountTableProps {
  payments: SupplierPayment[];
}

export function _PaymentOrdersAccountTable({ payments }: PaymentOrdersAccountTableProps) {
  if (payments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Órdenes de Pago</CardTitle>
          <CardDescription>No hay órdenes de pago registradas</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Órdenes de Pago</CardTitle>
        <CardDescription>
          Detalle de pagos confirmados realizados al proveedor
        </CardDescription>
      </CardHeader>
      <CardContent>
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
              {payments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.fullNumber}</TableCell>
                  <TableCell>{moment(payment.date).format('DD/MM/YYYY')}</TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      {payment.invoices.map((invoice, index) => (
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
                    ${payment.totalAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
