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
import { type JournalEntryWithLines } from '../../../shared/types';
import { reverseJournalEntry } from '../actions.server';
import { Loader2 } from 'lucide-react';

interface ReverseEntryDialogProps {
  entry: JournalEntryWithLines;
  onClose: () => void;
}

export function _ReverseEntryDialog({ entry, onClose }: ReverseEntryDialogProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleReverse = async () => {
    setIsLoading(true);
    try {
      await reverseJournalEntry(entry.companyId, entry.id);
      toast.success('Asiento anulado correctamente');
      router.refresh();
      onClose();
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Error al anular el asiento');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AlertDialog open onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Anular asiento contable?</AlertDialogTitle>
          <AlertDialogDescription>
            Estás por anular el asiento N° {entry.number}.
            <br /><br />
            Se creará automáticamente un asiento de reversión con los importes
            invertidos para anular el efecto del asiento original.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={handleReverse}
            disabled={isLoading}
          >
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Anular
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
