'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/shared/components/ui/dialog';
import { Button } from '@/shared/components/ui/button';
import { toast } from 'sonner';
import { getReceipt } from '../../actions.server';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { Alert, AlertDescription } from '@/shared/components/ui/alert';
import { AlertCircle } from 'lucide-react';

interface EditReceiptModalProps {
  receiptId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EditReceiptModal({ receiptId, open, onOpenChange }: EditReceiptModalProps) {
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && receiptId) {
      loadReceipt();
    }
  }, [open, receiptId]);

  const loadReceipt = async () => {
    if (!receiptId) return;

    setLoading(true);
    try {
      await getReceipt(receiptId);
      // Datos cargados, pero no implementamos edición aún
    } catch (error) {
      toast.error('Error al cargar el recibo');
      onOpenChange(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button variant="ghost" className="hidden" />
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Recibo de Cobro</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              La funcionalidad de edición estará disponible próximamente. Por ahora, puedes eliminar este recibo y crear uno nuevo.
            </AlertDescription>
          </Alert>
        )}
      </DialogContent>
    </Dialog>
  );
}
