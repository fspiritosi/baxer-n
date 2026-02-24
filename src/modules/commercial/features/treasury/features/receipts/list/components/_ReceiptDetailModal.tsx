'use client';

import { useEffect, useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/shared/components/ui/dialog';
import { Badge } from '@/shared/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';
import { Skeleton } from '@/shared/components/ui/skeleton';
import { ArrowDown } from 'lucide-react';
import { getReceipt } from '../../actions.server';
import { RECEIPT_STATUS_LABELS, RECEIPT_STATUS_BADGES, PAYMENT_METHOD_LABELS, BANK_MOVEMENT_TYPE_LABELS, WITHHOLDING_TAX_TYPE_LABELS } from '../../../../shared/validators';
import type { ReceiptWithDetails } from '../../../../shared/types';
import moment from 'moment';
import { logger } from '@/shared/lib/logger';
import { _DocumentAttachment } from '@/modules/commercial/shared/components/_DocumentAttachment';

interface ReceiptDetailModalProps {
  receiptId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReceiptDetailModal({ receiptId, open, onOpenChange }: ReceiptDetailModalProps) {
  const [receipt, setReceipt] = useState<ReceiptWithDetails | null>(null);
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
      const data = await getReceipt(receiptId);
      setReceipt(data);
    } catch (error) {
      logger.error('Error al cargar recibo', { data: { error } });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Detalle de Recibo de Cobro</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-40 w-full" />
            <Skeleton className="h-40 w-full" />
          </div>
        ) : receipt ? (
          <div className="space-y-6">
            {/* Información General */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Número</p>
                    <p className="font-medium">{receipt.fullNumber}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estado</p>
                    <Badge variant={RECEIPT_STATUS_BADGES[receipt.status]}>
                      {RECEIPT_STATUS_LABELS[receipt.status]}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha</p>
                    <p className="font-medium">{moment(receipt.date).format('DD/MM/YYYY')}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total</p>
                    <p className="font-medium text-lg">
                      ${receipt.totalAmount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                </div>

                <div>
                  <p className="text-sm text-muted-foreground">Cliente</p>
                  <p className="font-medium">{receipt.customer.name}</p>
                  {receipt.customer.taxId && (
                    <p className="text-sm text-muted-foreground">CUIT: {receipt.customer.taxId}</p>
                  )}
                </div>

                {receipt.notes && (
                  <div>
                    <p className="text-sm text-muted-foreground">Observaciones</p>
                    <p className="text-sm">{receipt.notes}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Facturas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Facturas a Cobrar</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {receipt.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{item.invoice.fullNumber}</p>
                        <p className="text-sm text-muted-foreground">
                          Total: ${item.invoice.total.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Monto a cobrar</p>
                        <p className="font-medium">
                          ${item.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Formas de Pago */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Formas de Pago</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {receipt.payments.map((payment) => {
                    let detail = '';
                    if (payment.cashRegister) {
                      detail = `Caja: ${payment.cashRegister.code} - ${payment.cashRegister.name}`;
                    } else if (payment.bankAccount) {
                      detail = `${payment.bankAccount.bankName} - ${payment.bankAccount.accountNumber}`;
                    } else if (payment.checkNumber) {
                      detail = `Cheque N° ${payment.checkNumber}`;
                    } else if (payment.cardLast4) {
                      detail = `Tarjeta **** ${payment.cardLast4}`;
                    } else if (payment.reference) {
                      detail = payment.reference;
                    }

                    return (
                      <div key={payment.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">
                            {PAYMENT_METHOD_LABELS[payment.paymentMethod as keyof typeof PAYMENT_METHOD_LABELS]}
                          </p>
                          {detail && <p className="text-sm text-muted-foreground">{detail}</p>}
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${payment.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Retenciones Sufridas */}
            {receipt.withholdings && receipt.withholdings.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Retenciones Sufridas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {receipt.withholdings.map((w) => (
                      <div key={w.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">
                            {WITHHOLDING_TAX_TYPE_LABELS[w.taxType as keyof typeof WITHHOLDING_TAX_TYPE_LABELS]}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Alícuota: {w.rate}%
                            {w.certificateNumber && ` | Cert. N° ${w.certificateNumber}`}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">
                            ${w.amount.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                      <p className="font-medium">Total Retenciones</p>
                      <p className="font-bold">
                        ${receipt.withholdings.reduce((sum, w) => sum + w.amount, 0).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Movimientos Bancarios Vinculados */}
            {receipt.bankMovements && receipt.bankMovements.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Movimientos Bancarios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {receipt.bankMovements.map((mov) => (
                      <div key={mov.id} className="flex justify-between items-center p-3 border rounded-lg">
                        <div className="flex items-center gap-2">
                          <ArrowDown className="h-4 w-4 text-green-600" />
                          <div>
                            <p className="font-medium">
                              {BANK_MOVEMENT_TYPE_LABELS[mov.type as keyof typeof BANK_MOVEMENT_TYPE_LABELS] || mov.type}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {mov.bankAccount.bankName} - {mov.bankAccount.accountNumber}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {moment(mov.date).format('DD/MM/YYYY')}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-green-600">
                            +${Number(mov.amount).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Documento Adjunto */}
            <_DocumentAttachment
              documentType="receipt"
              documentId={receipt.id}
              companyId={receipt.companyId}
              companyName={receipt.company.name}
              documentNumber={receipt.fullNumber}
              hasDocument={!!receipt.documentUrl}
              documentUrl={receipt.documentUrl}
            />
          </div>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
