'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus } from 'lucide-react';

import { Button } from '@/shared/components/ui/button';
import { _CreateBankMovementDialog } from './_CreateBankMovementDialog';

interface Props {
  bankAccountId: string;
}

export function _BankAccountDetailActions({ bankAccountId }: Props) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter();

  return (
    <>
      <Button onClick={() => setIsDialogOpen(true)}>
        <Plus className="h-4 w-4 mr-2" />
        Nuevo Movimiento
      </Button>

      <_CreateBankMovementDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        bankAccountId={bankAccountId}
        onSuccess={() => {
          setIsDialogOpen(false);
          router.refresh();
        }}
      />
    </>
  );
}
