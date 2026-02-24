'use client';

import { Package, FileText } from 'lucide-react';
import moment from 'moment';
import type { getPurchaseOrderById } from '../../list/actions.server';
import {
  _PDFOptionsDialog,
  type LinkedRecordGroup,
} from '@/modules/commercial/shared/components/_PDFOptionsDialog';
import type { ReactNode } from 'react';
import { formatCurrency } from '@/shared/utils/formatters';

type Order = Awaited<ReturnType<typeof getPurchaseOrderById>>;

interface Props {
  order: Order;
  trigger?: ReactNode;
}

function getReceivingNoteStatusLabel(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return 'Confirmado';
    case 'CANCELLED':
      return 'Anulado';
    default:
      return 'Borrador';
  }
}

function getReceivingNoteStatusVariant(status: string) {
  switch (status) {
    case 'CONFIRMED':
      return 'default' as const;
    case 'CANCELLED':
      return 'destructive' as const;
    default:
      return 'outline' as const;
  }
}

export function _PurchaseOrderPDFButton({ order, trigger }: Props) {
  const groups: LinkedRecordGroup[] = [];

  // Remitos de recepción
  if (order.receivingNotes.length > 0) {
    groups.push({
      key: 'receivingNotes',
      label: 'Remitos de Recepción',
      icon: Package,
      items: order.receivingNotes.map((rn) => ({
        label: `${rn.fullNumber} - ${rn.warehouse.name}`,
        detail: moment.utc(rn.receptionDate).format('DD/MM/YYYY'),
        status: getReceivingNoteStatusLabel(rn.status),
        statusVariant: getReceivingNoteStatusVariant(rn.status),
      })),
    });
  }

  // Facturas vinculadas
  if (order.purchaseInvoices.length > 0) {
    groups.push({
      key: 'purchaseInvoices',
      label: 'Facturas de Compra',
      icon: FileText,
      items: order.purchaseInvoices.map((inv) => ({
        label: `${inv.fullNumber} - ${moment.utc(inv.issueDate).format('DD/MM/YYYY')}`,
        detail: formatCurrency(inv.total),
        status:
          inv.status === 'CONFIRMED'
            ? 'Confirmada'
            : inv.status === 'PAID'
              ? 'Pagada'
              : inv.status === 'CANCELLED'
                ? 'Anulada'
                : 'Borrador',
        statusVariant:
          inv.status === 'CONFIRMED' || inv.status === 'PAID'
            ? ('default' as const)
            : inv.status === 'CANCELLED'
              ? ('destructive' as const)
              : ('outline' as const),
      })),
    });
  }

  return (
    <_PDFOptionsDialog
      documentLabel={`Orden de Compra ${order.fullNumber}`}
      pdfUrl={`/api/purchase-orders/${order.id}/pdf`}
      linkedGroups={groups}
      trigger={trigger}
    />
  );
}
