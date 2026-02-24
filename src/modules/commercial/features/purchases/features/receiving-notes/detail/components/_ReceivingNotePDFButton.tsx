'use client';

import { FileText, ShoppingCart } from 'lucide-react';
import type { getReceivingNoteById } from '../../list/actions.server';
import {
  _PDFOptionsDialog,
  type LinkedRecordGroup,
} from '@/modules/commercial/shared/components/_PDFOptionsDialog';
import type { ReactNode } from 'react';

type Note = Awaited<ReturnType<typeof getReceivingNoteById>>;

interface Props {
  note: Note;
  trigger?: ReactNode;
}

export function _ReceivingNotePDFButton({ note, trigger }: Props) {
  const groups: LinkedRecordGroup[] = [];

  // Orden de compra vinculada
  if (note.purchaseOrder) {
    groups.push({
      key: 'purchaseOrder',
      label: 'Orden de Compra',
      icon: ShoppingCart,
      items: [
        {
          label: `OC ${note.purchaseOrder.fullNumber}`,
          detail: '',
          status: note.purchaseOrder.status === 'APPROVED' ? 'Aprobada' : note.purchaseOrder.status,
          statusVariant: 'outline' as const,
        },
      ],
    });
  }

  // Factura vinculada
  if (note.purchaseInvoice) {
    groups.push({
      key: 'purchaseInvoice',
      label: 'Factura de Compra',
      icon: FileText,
      items: [
        {
          label: `FC ${note.purchaseInvoice.fullNumber}`,
          detail: '',
          status:
            note.purchaseInvoice.status === 'CONFIRMED'
              ? 'Confirmada'
              : note.purchaseInvoice.status === 'PAID'
                ? 'Pagada'
                : note.purchaseInvoice.status,
          statusVariant: 'outline' as const,
        },
      ],
    });
  }

  return (
    <_PDFOptionsDialog
      documentLabel={`Remito ${note.fullNumber}`}
      pdfUrl={`/api/receiving-notes/${note.id}/pdf`}
      linkedGroups={groups}
      trigger={trigger}
    />
  );
}
