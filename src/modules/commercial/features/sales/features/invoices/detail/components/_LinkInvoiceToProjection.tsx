'use client';

import { useState } from 'react';
import { Link2 } from 'lucide-react';
import { Button } from '@/shared/components/ui/button';
import { _LinkToProjectionModal } from '@/modules/commercial/shared/components/_LinkToProjectionModal';

interface Props {
  invoiceId: string;
  fullNumber: string;
  total: number;
}

export function _LinkInvoiceToProjection({ invoiceId, fullNumber, total }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Link2 className="mr-2 h-4 w-4" />
        Vincular a Proyección
      </Button>
      <_LinkToProjectionModal
        open={open}
        onOpenChange={setOpen}
        documentType="SALES_INVOICE"
        documentId={invoiceId}
        documentFullNumber={fullNumber}
        documentTotal={total}
      />
    </>
  );
}
