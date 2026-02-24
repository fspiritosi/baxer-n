'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Badge } from '@/shared/components/ui/badge';
import { Separator } from '@/shared/components/ui/separator';
import { FileText, Receipt, CreditCard } from 'lucide-react';
import Link from 'next/link';
import moment from 'moment';
import type { getInvoiceById } from '../../list/actions.server';
import { VOUCHER_TYPE_LABELS, INVOICE_STATUS_LABELS } from '../../shared/validators';
import { isCreditNote } from '@/modules/commercial/shared/voucher-utils';
import type { SalesInvoiceStatus } from '@/generated/prisma/enums';

type Invoice = Awaited<ReturnType<typeof getInvoiceById>>;

interface Props {
  invoice: Invoice;
}

export function _InvoiceLinkedDocuments({ invoice }: Props) {
  const isNC = isCreditNote(invoice.voucherType);

  const totalReceipts = invoice.receiptItems.reduce((sum, item) => sum + item.amount, 0);

  // NC aplicadas explícitamente (tabla SalesCreditNoteApplication)
  const totalCNAppliedExplicit = invoice.creditNoteApplicationsReceived.reduce(
    (sum, app) => sum + app.amount,
    0
  );

  // NC vinculadas por originalInvoiceId (datos históricos sin registro de aplicación)
  // Solo contar NC confirmadas/pagadas que NO tengan ya un registro explícito
  const explicitCNIds = new Set(
    invoice.creditNoteApplicationsReceived.map((app) => app.creditNote.id)
  );
  const totalCNLinkedRaw = !isNC
    ? invoice.creditDebitNotes
        .filter(
          (doc) =>
            isCreditNote(doc.voucherType) &&
            doc.status !== 'DRAFT' &&
            doc.status !== 'CANCELLED' &&
            !explicitCNIds.has(doc.id)
        )
        .reduce((sum, doc) => sum + doc.total, 0)
    : 0;
  // Capear fallback para que cobrado no supere el total
  const maxFallbackCN = Math.max(0, invoice.total - totalReceipts - totalCNAppliedExplicit);
  const totalCNLinked = Math.min(totalCNLinkedRaw, maxFallbackCN);

  const totalCNApplied = totalCNAppliedExplicit + totalCNLinked;

  const totalCNGiven = invoice.creditNoteApplicationsGiven.reduce(
    (sum, app) => sum + app.amount,
    0
  );

  const hasLinkedDocuments =
    invoice.creditDebitNotes.length > 0 ||
    invoice.originalInvoice ||
    invoice.receiptItems.length > 0 ||
    invoice.creditNoteApplicationsReceived.length > 0 ||
    invoice.creditNoteApplicationsGiven.length > 0;

  if (!hasLinkedDocuments && invoice.status === 'DRAFT') return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Documentos Vinculados y Saldo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Factura Original (si es NC/ND) */}
        {invoice.originalInvoice && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Comprobante Original</h4>
            <Link
              href={`/dashboard/commercial/invoices/${invoice.originalInvoice.id}`}
              className="text-sm text-primary hover:underline font-mono"
            >
              {VOUCHER_TYPE_LABELS[invoice.originalInvoice.voucherType as keyof typeof VOUCHER_TYPE_LABELS]}{' '}
              {invoice.originalInvoice.fullNumber}
            </Link>
          </div>
        )}

        {/* NC/ND vinculadas */}
        {invoice.creditDebitNotes.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Notas de Crédito / Débito
            </h4>
            <div className="space-y-2">
              {invoice.creditDebitNotes.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Link
                      href={`/dashboard/commercial/invoices/${doc.id}`}
                      className="text-primary hover:underline font-mono"
                    >
                      {VOUCHER_TYPE_LABELS[doc.voucherType as keyof typeof VOUCHER_TYPE_LABELS]}{' '}
                      {doc.fullNumber}
                    </Link>
                    <span className="text-muted-foreground">
                      {moment(doc.issueDate).format('DD/MM/YYYY')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge
                      variant={doc.status === 'PAID' ? 'default' : 'outline'}
                      className={doc.status === 'PAID' ? 'bg-green-600' : ''}
                    >
                      {INVOICE_STATUS_LABELS[doc.status as SalesInvoiceStatus]}
                    </Badge>
                    <span className="font-mono font-medium">
                      ${doc.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Cobros (recibos) - solo para facturas/ND */}
        {!isNC && invoice.receiptItems.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Cobros</h4>
            <div className="space-y-2">
              {invoice.receiptItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <Receipt className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono">{item.receipt.fullNumber}</span>
                    <span className="text-muted-foreground">
                      {moment(item.receipt.date).format('DD/MM/YYYY')}
                    </span>
                    <Badge
                      variant={item.receipt.status === 'CONFIRMED' ? 'default' : 'outline'}
                      className={item.receipt.status === 'CONFIRMED' ? 'bg-green-600' : ''}
                    >
                      {item.receipt.status === 'CONFIRMED' ? 'Confirmado' : 'Borrador'}
                    </Badge>
                  </div>
                  <span className="font-mono font-medium text-green-600">
                    ${item.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* NC aplicadas a esta factura */}
        {!isNC && invoice.creditNoteApplicationsReceived.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">
              Notas de Crédito Aplicadas
            </h4>
            <div className="space-y-2">
              {invoice.creditNoteApplicationsReceived.map((app, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-muted-foreground" />
                    <Link
                      href={`/dashboard/commercial/invoices/${app.creditNote.id}`}
                      className="text-primary hover:underline font-mono"
                    >
                      {VOUCHER_TYPE_LABELS[app.creditNote.voucherType as keyof typeof VOUCHER_TYPE_LABELS]}{' '}
                      {app.creditNote.fullNumber}
                    </Link>
                    <span className="text-muted-foreground">
                      {moment(app.appliedAt).format('DD/MM/YYYY')}
                    </span>
                  </div>
                  <span className="font-mono font-medium text-blue-600">
                    ${app.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Si es NC: facturas donde se aplicó */}
        {isNC && invoice.creditNoteApplicationsGiven.length > 0 && (
          <div>
            <h4 className="text-sm font-medium text-muted-foreground mb-2">Aplicada a</h4>
            <div className="space-y-2">
              {invoice.creditNoteApplicationsGiven.map((app, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <Link
                      href={`/dashboard/commercial/invoices/${app.invoice.id}`}
                      className="text-primary hover:underline font-mono"
                    >
                      {VOUCHER_TYPE_LABELS[app.invoice.voucherType as keyof typeof VOUCHER_TYPE_LABELS]}{' '}
                      {app.invoice.fullNumber}
                    </Link>
                    <span className="text-muted-foreground">
                      {moment(app.appliedAt).format('DD/MM/YYYY')}
                    </span>
                  </div>
                  <span className="font-mono font-medium">
                    ${app.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Resumen de saldo */}
        {invoice.status !== 'DRAFT' && (
          <>
            <Separator />
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total del comprobante:</span>
                <span className="font-mono">
                  ${invoice.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              {!isNC && totalReceipts > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Cobrado (recibos):</span>
                  <span className="font-mono text-green-600">
                    -${totalReceipts.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              {!isNC && totalCNApplied > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">NC aplicadas:</span>
                  <span className="font-mono text-blue-600">
                    -${totalCNApplied.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              {isNC && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Aplicado a facturas:</span>
                  <span className="font-mono">
                    ${totalCNGiven.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              <Separator />
              <div className="flex justify-between font-semibold">
                <span>{isNC ? 'Saldo sin aplicar:' : 'Saldo pendiente:'}</span>
                <span className="font-mono">
                  $
                  {isNC
                    ? (invoice.total - totalCNGiven).toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                      })
                    : (invoice.total - totalReceipts - totalCNApplied).toLocaleString('es-AR', {
                        minimumFractionDigits: 2,
                      })}
                </span>
              </div>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
