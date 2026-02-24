'use client';

import { FileText, Receipt, CreditCard, BookOpen } from 'lucide-react';
import moment from 'moment';
import type { getInvoiceById } from '../../list/actions.server';
import { VOUCHER_TYPE_LABELS, INVOICE_STATUS_LABELS } from '../../shared/validators';
import { isCreditNote } from '@/modules/commercial/shared/voucher-utils';
import {
  _PDFOptionsDialog,
  type LinkedRecordGroup,
} from '@/modules/commercial/shared/components/_PDFOptionsDialog';
import type { ReactNode } from 'react';
import type { SalesInvoiceStatus } from '@/generated/prisma/enums';

type Invoice = Awaited<ReturnType<typeof getInvoiceById>>;

interface Props {
  invoice: Invoice;
  trigger?: ReactNode;
}

function getStatusVariant(status: string) {
  switch (status) {
    case 'PAID':
      return 'default' as const;
    case 'CONFIRMED':
      return 'default' as const;
    case 'CANCELLED':
      return 'destructive' as const;
    default:
      return 'outline' as const;
  }
}

export function _InvoicePDFButton({ invoice, trigger }: Props) {
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
        status: INVOICE_STATUS_LABELS[doc.status as SalesInvoiceStatus],
        statusVariant: getStatusVariant(doc.status),
      })),
    });
  }

  // Cobros (recibos) - solo para facturas/ND
  if (!isNC && invoice.receiptItems.length > 0) {
    groups.push({
      key: 'receipts',
      label: 'Cobros (Recibos)',
      icon: Receipt,
      items: invoice.receiptItems.map((item) => ({
        label: `Recibo ${item.receipt.fullNumber} - ${moment(item.receipt.date).format('DD/MM/YYYY')}`,
        detail: `$${item.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}`,
        status: item.receipt.status === 'CONFIRMED' ? 'Confirmado' : 'Borrador',
        statusVariant:
          item.receipt.status === 'CONFIRMED'
            ? ('default' as const)
            : ('outline' as const),
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

  // Asiento contable
  if (invoice.journalEntry) {
    groups.push({
      key: 'journalEntry',
      label: 'Asiento Contable',
      icon: BookOpen,
      items: [
        {
          label: `Asiento #${invoice.journalEntry.number}`,
          detail: '',
          status:
            invoice.journalEntry.status === 'POSTED' ? 'Registrado' : 'Borrador',
          statusVariant:
            invoice.journalEntry.status === 'POSTED'
              ? ('default' as const)
              : ('outline' as const),
        },
      ],
    });
  }

  const documentLabel = `${VOUCHER_TYPE_LABELS[invoice.voucherType as keyof typeof VOUCHER_TYPE_LABELS]} ${invoice.fullNumber}`;

  return (
    <_PDFOptionsDialog
      documentLabel={documentLabel}
      pdfUrl={`/api/invoices/${invoice.id}/pdf`}
      linkedGroups={groups}
      trigger={trigger}
    />
  );
}
