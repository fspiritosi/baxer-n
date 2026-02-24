'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import moment from 'moment';

import { Button } from '@/shared/components/ui/button';
import { Badge } from '@/shared/components/ui/badge';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { logger } from '@/shared/lib/logger';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';

import {
  getUnlinkedReceipts,
  getUnlinkedPaymentOrders,
  linkBankMovementToDocument,
} from '../../../bank-movements/actions.server';
import { BANK_MOVEMENT_TYPE_LABELS } from '../../../../shared/validators';

interface LinkDocumentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  movement: {
    id: string;
    type: string;
    amount: number;
    date: Date;
    description: string;
  } | null;
  bankAccountId: string;
}

type DocumentItem = {
  id: string;
  fullNumber: string;
  date: Date;
  totalAmount: number;
  customerName?: string;
  supplierName?: string;
  bankPaymentAmount: number;
  hasPayments: boolean;
};

export function _LinkDocumentDialog({ open, onOpenChange, movement, bankAccountId }: LinkDocumentDialogProps) {
  const router = useRouter();
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [linking, setLinking] = useState(false);

  // Determinar si es un ingreso (recibo) o egreso (orden de pago)
  const isIncome = movement && ['DEPOSIT', 'TRANSFER_IN'].includes(movement.type);
  const documentType = isIncome ? 'RECEIPT' : 'PAYMENT_ORDER';
  const documentLabel = isIncome ? 'Recibos de Cobro Disponibles' : 'Órdenes de Pago Disponibles';

  useEffect(() => {
    if (open && movement) {
      loadDocuments();
    } else {
      // Reset al cerrar
      setDocuments([]);
      setSelectedDocumentId(null);
    }
  }, [open, movement]);

  const loadDocuments = async () => {
    if (!movement) return;

    setLoading(true);
    try {
      if (isIncome) {
        const receipts = await getUnlinkedReceipts(bankAccountId);
        setDocuments(receipts);
      } else {
        const paymentOrders = await getUnlinkedPaymentOrders(bankAccountId);
        setDocuments(paymentOrders);
      }
    } catch (error) {
      toast.error('Error al cargar documentos');
      logger.error('Error al cargar documentos', { data: { error } });
    } finally {
      setLoading(false);
    }
  };

  const handleLink = async () => {
    if (!selectedDocumentId || !movement) return;

    setLinking(true);
    try {
      await linkBankMovementToDocument(movement.id, documentType, selectedDocumentId);
      toast.success('Movimiento vinculado correctamente');
      router.refresh();
      onOpenChange(false);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Error al vincular movimiento');
    } finally {
      setLinking(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return `$${amount.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Vincular Movimiento Bancario</DialogTitle>
          <DialogDescription>
            Selecciona el documento al que quieres vincular este movimiento para conciliarlo
          </DialogDescription>
        </DialogHeader>

        {movement && (
          <div className="space-y-4">
            {/* Información del movimiento */}
            <div className="rounded-lg border bg-muted/50 p-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div>
                  <p className="text-muted-foreground">Fecha</p>
                  <p className="font-medium">{moment(movement.date).format('DD/MM/YYYY')}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Tipo</p>
                  <p className="font-medium">
                    {BANK_MOVEMENT_TYPE_LABELS[movement.type as keyof typeof BANK_MOVEMENT_TYPE_LABELS]}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground">Monto</p>
                  <p className="font-semibold text-lg">{formatCurrency(movement.amount)}</p>
                </div>
                <div>
                  <p className="text-muted-foreground">Descripción</p>
                  <p className="font-medium">{movement.description}</p>
                </div>
              </div>
            </div>

            {/* Lista de documentos */}
            <div>
              <h4 className="text-sm font-semibold mb-3">{documentLabel}</h4>
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                {loading ? (
                  <>
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                    <Skeleton className="h-20 w-full" />
                  </>
                ) : documents.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No hay documentos disponibles para vincular</p>
                  </div>
                ) : (
                  documents.map((doc) => (
                    <button
                      key={doc.id}
                      type="button"
                      onClick={() => setSelectedDocumentId(doc.id)}
                      className={`w-full flex items-start gap-3 p-3 border rounded-lg text-left transition-all hover:bg-muted/50 cursor-pointer ${
                        selectedDocumentId === doc.id
                          ? 'ring-2 ring-primary bg-primary/5'
                          : ''
                      }`}
                    >
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="outline">{doc.fullNumber}</Badge>
                          {!doc.hasPayments && (
                            <Badge variant="secondary">Sin pago registrado</Badge>
                          )}
                          <span className="text-sm text-muted-foreground">
                            {moment(doc.date).format('DD/MM/YYYY')}
                          </span>
                        </div>
                        <p className="font-medium truncate">
                          {doc.customerName || doc.supplierName}
                        </p>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-sm text-muted-foreground">
                            {doc.hasPayments ? 'Monto bancario:' : 'Total documento:'}
                          </span>
                          <span className="font-semibold">
                            {formatCurrency(doc.hasPayments ? doc.bankPaymentAmount : doc.totalAmount)}
                          </span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={linking}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            onClick={handleLink}
            disabled={!selectedDocumentId || linking}
          >
            {linking ? 'Vinculando...' : 'Vincular'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
