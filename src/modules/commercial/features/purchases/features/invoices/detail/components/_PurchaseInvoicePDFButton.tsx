'use client';

import { FileText, CreditCard, Truck, ShoppingCart, BookOpen } from 'lucide-react';
import moment from 'moment';
import type { getPurchaseInvoiceById } from '../../list/actions.server';
import { VOUCHER_TYPE_LABELS, PURCHASE_INVOICE_STATUS_LABELS } from '../../shared/validators';
import { isCreditNote } from '@/modules/commercial/shared/voucher-utils';
import {
  _PDFOptionsDialog,
  type LinkedRecordGroup,
} from '@/modules/commercial/shared/components/_PDFOptionsDialog';
import type { ReactNode } from 'react';
import type { PurchaseInvoiceStatus } from '@/generated/prisma/enums';

type Invoice = Awaited<ReturnType<typeof getPurchaseInvoiceById>>;

interface Props {
  invoice: Invoice;
  trigger?: ReactNode;
}

export function _PurchaseInvoicePDFButton({ invoice, trigger }: Props) {
  const isNC = isCreditNote(invoice.voucherType);
  const groups: LinkedRecordGroup[] = [];

  // NC/ND vinculadas
  if (invoice.creditDebitNotes.length > 0) {
    groups.push({
      key: 'creditNotes',
      label: 'Notas de Crédito / Débito',
      icon: FileText,
      items: invoice.creditDebitNotes.map((doc) => ({
        label: `${VOUCHER_TYPE_LABELS[doc.voucherType as keyof typeof VOUCHER_TYPE_LABELS]} ${doc.fullNumber}`,
        detail: `$${doc.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
        status: PURCHASE_INVOICE_STATUS_LABELS[doc.status as PurchaseInvoiceStatus],
      })),
    });
  }

  // Órdenes de pago - solo para facturas/ND
  if (!isNC && invoice.paymentOrderItems.length > 0) {
    groups.push({
      key: 'paymentOrders',
      label: 'Órdenes de Pago',
      icon: CreditCard,
      items: invoice.paymentOrderItems.map((item) => ({
        label: `OP ${item.paymentOrder.fullNumber} - ${moment(item.paymentOrder.date).format('DD/MM/YYYY')}`,
        detail: `$${item.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
        status: item.paymentOrder.status === 'CONFIRMED' ? 'Confirmada' : 'Borrador',
      })),
    });
  }

  // NC aplicadas a esta factura
  if (!isNC && invoice.creditNoteApplicationsReceived.length > 0) {
    groups.push({
      key: 'creditNoteApplications',
      label: 'Notas de Crédito Aplicadas',
      icon: CreditCard,
      items: invoice.creditNoteApplicationsReceived.map((app) => ({
        label: `${VOUCHER_TYPE_LABELS[app.creditNote.voucherType as keyof typeof VOUCHER_TYPE_LABELS]} ${app.creditNote.fullNumber}`,
        detail: `$${app.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
      })),
    });
  }

  // Si es NC: facturas donde se aplicó
  if (isNC && invoice.creditNoteApplicationsGiven.length > 0) {
    groups.push({
      key: 'creditNoteApplications',
      label: 'Aplicada a Facturas',
      icon: CreditCard,
      items: invoice.creditNoteApplicationsGiven.map((app) => ({
        label: `${VOUCHER_TYPE_LABELS[app.invoice.voucherType as keyof typeof VOUCHER_TYPE_LABELS]} ${app.invoice.fullNumber}`,
        detail: `$${app.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
      })),
    });
  }

  // Remitos de recepción
  if (invoice.receivingNotes.length > 0) {
    groups.push({
      key: 'receivingNotes',
      label: 'Remitos de Recepción',
      icon: Truck,
      items: invoice.receivingNotes.map((rn) => ({
        label: `${rn.fullNumber} - ${rn.warehouse.name}`,
        detail: moment.utc(rn.receptionDate).format('DD/MM/YYYY'),
        status: rn.status === 'CONFIRMED' ? 'Confirmado' : rn.status === 'CANCELLED' ? 'Anulado' : 'Borrador',
      })),
    });
  }

  // Orden de compra vinculada
  if (invoice.purchaseOrder) {
    groups.push({
      key: 'purchaseOrder',
      label: 'Orden de Compra',
      icon: ShoppingCart,
      items: [{
        label: `OC ${invoice.purchaseOrder.fullNumber}`,
        detail: '',
      }],
    });
  }

  const documentLabel = `${VOUCHER_TYPE_LABELS[invoice.voucherType as keyof typeof VOUCHER_TYPE_LABELS]} ${invoice.fullNumber}`;

  return (
    <_PDFOptionsDialog
      documentLabel={documentLabel}
      pdfUrl={`/api/purchase-invoices/${invoice.id}/pdf`}
      linkedGroups={groups}
      trigger={trigger}
    />
  );
}
