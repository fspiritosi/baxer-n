'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/shared/components/ui/alert-dialog';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { type AccountWithChildren } from '../../../shared/types';
import { deleteAccount } from '../actions.server';
import { Loader2 } from 'lucide-react';

interface DeleteAccountDialogProps {
  account: AccountWithChildren;
  companyId: string;
  onClose: () => void;
}

export function _DeleteAccountDialog({ account, companyId, onClose }: DeleteAccountDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleDelete = async () => {
    setIsLoading(true);
    try {
      await deleteAccount(companyId, account.id);
      toast.success('Cuenta eliminada correctamente');
      router.refresh();
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Error al eliminar la cuenta');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Eliminar cuenta contable?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás por eliminar la cuenta <strong>{account.code} - {account.name}</strong>.
            <br /><br />
            Esta acción no se puede deshacer. La cuenta solo se podrá eliminar si no tiene
            subcuentas ni movimientos asociados.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleDelete}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
